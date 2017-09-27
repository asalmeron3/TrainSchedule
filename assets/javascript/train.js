//-----------------INITIALIZE firebase----------------------//
  // Make a variable to store an object with the authitencation keys
  //needed by Firebase to access the database (From my project Train-92217)
  var config = {
    apiKey: "AIzaSyAjPf9p_nSw90ekzGRBrel96QuBzLBRNxs",
    authDomain: "train-92217.firebaseapp.com",
    databaseURL: "https://train-92217.firebaseio.com",
    projectId: "train-92217",
    storageBucket: "",
    messagingSenderId: "45897908440"
  };

  firebase.initializeApp(config);
  var addToDatabase = firebase.database();



//--------------------Initialize Global variables for train input-------//
  var userTrainInput;
  var userDestination;
  var userFirstTrain;
  var userFrequency;
 var timerToUpdate = setInterval(emptyOrUpdate, 60000); //set a timer to update the train scedule every minute

//Run the emptyOrUpdate function to both empty out the DOM and update the dom based on what is currently in the firebase database---//
emptyOrUpdate();


// Add a click function to the sumbit form on the DOM
$(document).on("click", ".pressToSubmit", function(event){

  //prevent the page from refreshing
  event.preventDefault();
  //clear any pre-existing timer
  clearInterval(timerToUpdate);
  //run a function to get all of the users inputs
  getInputs();

  //if the train-name lenght is empty, alert the user
  if(userTrainInput.length < 1){
    alert("Please Enter a Train Name");

  }
  //if the destination field is empty, alert the use
  else if(userDestination.length < 1){
    alert("Please Enter a Destination");

  }
  //if the time entered in not in the "HH:mm", alert the user
  else if(userFirstTrain.length !=5 || userFirstTrain[2] != ":" || (userFirstTrain[0]+userFirstTrain[1]) > 24 || (userFirstTrain[3]+userFirstTrain[4]) >59  ){
    alert("Please Enter a Valid Time for the First Train");
  }
  //if the frequency entered is not a number, alert the user
  else if(isNaN(parseInt(userFrequency))){
    alert("Please Enter a Number for the Train Frequency");
  }
  //if all inputs are correct, create an object to store the inputs
  else {

    var objForFB = {
      WhichTrain: userTrainInput,
      WhereTo: userDestination,
      HowOften: userFrequency,
      WhenStart: userFirstTrain
      }  
    //update firebase with the object we just created  
    addToDatabase.ref("trains/").push(objForFB);
    //run the function to empty the DOM and update the DOM
    emptyOrUpdate();
    //start the timer so that the DOM is updated every minute
    timerToUpdate = setInterval(emptyOrUpdate, 60000);
  }

})


// this is a function to empty/clear the DOM and then re-create/display the list of trains, based on what is currently in the database
function emptyOrUpdate(){
    //empty/clear the DOM
    $(".trainList").empty();
    //retrieve the train data from firebase
  addToDatabase.ref("trains/").on("child_added",function(snapshot){
    //based on the initial time & frequency stored in fire base, run a function that will tell you when the next train is coming
    var nextOne = tellTime(snapshot.val().WhenStart,snapshot.val().HowOften);
    //make the HTML string that contains the data from firebase. Format of string should be a table
    var trainHTML = "<tr><th>" +snapshot.val().WhichTrain + "</th><th>" +snapshot.val().WhereTo +  "</th><th>" + snapshot.val().HowOften +  "</th><th class = 'timeColumn'>" + nextOne + "</th></tr>";
    //append the html to the DOM so the table is updated
    $(".trainList").append(trainHTML);

  })
}


//making a function that will find the time and update my dispTime variable using moment.js
function tellTime(stringStartTime, stringFrequency){
  //make a variable that will display the time (inintialy, it will be the first-train time) 
  var dispTime = stringStartTime;
  //make a variable for  storing the moment.js string AFTER adding the frequency time to the initial time
  var nextTime;

  //create a while loop. while the dispTime is less that the current time, keep adding
  while(dispTime < moment().format("HH:mm")) {
    //use moment.js to add the frequency in the units minutes
      nextTime = moment(dispTime,"HH:mm").add(parseInt(stringFrequency),"m");
     //based on the returned string from moment, reformat the string to display in "HH:mm"
      dispTime = moment(nextTime,"HH:mm").format("HH:mm");
  }
    //if the dispTime is now, display "NOW"
    if (dispTime == moment().format("HH:mm")){
      return "NOW";
    }
    //else, display the tiem from the loop
    else{
      return dispTime
    }

};

//retrieve all your inputs from the html form
function getInputs(){
   // get the input information from the form and store them in local variables
  userTrainInput = $("#inputTrainName").val().trim();
  userDestination = $("#inputDestination").val().trim();
  userFirstTrain = $("#inputFirstTrain").val().trim();
  userFrequency = $("#inputFreqMin").val().trim();
}

// $(document).on("click", ".pressToEdit", function(event){
//   getInputs();
//   addToDatabase.ref("trains/").update();

// }
