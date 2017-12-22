// Initialize Firebase
var config = {
    apiKey: "AIzaSyANEMLtR30uel9fjUSKLUDibCdP0vEe5iU",
    authDomain: "train-scheduler-ac479.firebaseapp.com",
    databaseURL: "https://train-scheduler-ac479.firebaseio.com",
    projectId: "train-scheduler-ac479",
    storageBucket: "",
    messagingSenderId: "10531061961"
};

// Initialize Firebase
firebase.initializeApp(config);

// Create a variable to reference the database, create a container for all trains added
var database = firebase.database();
var listIndex;
database.ref().on("value", function(snapshot) {
  listIndex = snapshot.numChildren() + 1;
});



//Add new train from form input to trainList container

$("#submit").on("click", function() {
  event.preventDefault();

  database.ref("/newTrain" + listIndex).set({
      trainName: $("#train-name").val().trim(),
      destination: $("#destination").val().trim(),
      firstTrain: $("#first-train-time").val().trim(),
      frequency: $("#frequency").val().trim()
  });

  listIndex++;


  calcNextTrain();
  displayTrains();
});

var nextTrain;

    //Calculate next train arrival
function calcNextTrain(){

  database.ref("/newTrain" + listIndex).on("value", function(snapshot) {
    
    var tFrequency = snapshot.val().frequency;

    var firstTime = snapshot.val().firstTrain;
    console.log("firstTime: " + firstTime);


    // First Time (pushed back 1 year to make sure it comes before current time)
    var firstTimeConverted = moment(firstTime, "hh:mm").subtract(1, "years");
    console.log("firstTimeConverted: " + firstTimeConverted);

    // Current Time
    var currentTime = moment();
    console.log("CURRENT TIME: " + moment(currentTime).format("hh:mm"));

    // Difference between the times
    var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
    console.log("DIFFERENCE IN TIME: " + diffTime);

    // Time apart (remainder)
    var tRemainder = diffTime % tFrequency;
    console.log("tRemainder: " + tRemainder);

    // Minute Until Train
    var tMinutesTillTrain = tFrequency - tRemainder;
    console.log("MINUTES TILL TRAIN: " + tMinutesTillTrain);

    // Next Train
    nextTrain = moment().add(tMinutesTillTrain, "minutes");
    console.log("ARRIVAL TIME: " + moment(nextTrain).format("hh:mm"));
    database.ref("/newTrain" + listIndex).set({ frequency: nextTrain});

  });
};




//Display train schedule from firebase

function displayTrains(){
  $("#tbody").append("<tr id='display'>");
  $("#display").append("<td id='train-name-display'>");
  $("#display").append("<td id='destination-display'>");
  $("#display").append("<td id='first-train-time-display'>");
  $("#display").append("<td id='frequency-display'>");
  $("#display").append("<td id='next-train-display'>");

  database.ref("/newTrain").on("value", function(snapshot) {
    $("#train-name-display").text(snapshot.val().trainName);
    $("#destination-display").text(snapshot.val().destination);
    $("#first-train-time-display").text(snapshot.val().firstTrain);
    $("#frequency-display").text(snapshot.val().frequency);
    $("#next-train-display").text(moment.parseZone(nextTrain).local().format("MM/DD/YYYY, HH:mm"));
    }, function(errorObject) {
      console.log("The read failed: " + errorObject.code);
    });

  database.ref().on("value", function(snapshot) {

    for (i = 1; i < snapshot.numChildren(); i++){

      $("#tbody").append("<tr id='display" + i + "'>");
      $("#display" + i).append("<td id='train-name-display" + i + "'>");
      $("#display" + i).append("<td id='destination-display" + i + "'>");
      $("#display" + i).append("<td id='first-train-time-display" + i + "'>");
      $("#display" + i).append("<td id='frequency-display" + i + "'>");
      $("#display" + i).append("<td id='next-train-display" + i + "'>");

      database.ref("/newTrain" + i).on("value", function(snapshot) {
        $("#train-name-display" + i).text(snapshot.val().trainName);
        $("#destination-display" + i).text(snapshot.val().destination);
        $("#first-train-time-display" + i).text(snapshot.val().firstTrain);
        $("#frequency-display" + i).text(snapshot.val().frequency);
        $("#next-train-display" + i).text(moment.parseZone(nextTrain).local().format("MM/DD/YYYY, HH:mm"));
        }, function(errorObject) {
          console.log("The read failed: " + errorObject.code);
        });
    }
  });
};

calcNextTrain()

displayTrains();