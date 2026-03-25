const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
const port = 3000;
const User = require('./database/models/user');
const Video = require('./database/models/video');
const View = require('./database/models/view');

var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({extended: true})

app.use(jsonParser);
app.use(urlencodedParser);
app.use(express.json())


// MongoDB node.js connection sourced from [1]
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://lucaskennington_db_user:OIPPYdmML4jFxF6T@cowatch.i8hiekq.mongodb.net/CoWatch?appName=CoWatch');
 // and modified with help from [2]
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Find mode from array
// Function sourced from GeeksForGeeks at [3]
function calcMode(emotionList){
  const freq = {};
  emotionList.forEach(emotion => { // calculate frequency of emotions
    freq[emotion] = (freq[emotion] || 0) + 1;
  });

  let modes = [];
  let highest = 0;


  for(const emotion in freq){ // find highest frequency
    const thisFreq = freq[emotion];
    if (thisFreq > highest){
      highest = thisFreq;
      modes = [emotion];
    }
    else if (thisFreq === highest){
      modes.push(emotion);
    }
  }
  if (modes.length > 1){
    return modes[Math.floor(Math.random() * modes.length)]; // choose random mode to display
  }
  else {
    return modes[0];
  }
}

// Database save from GeeksForGeeks [3]
app.post('/logEmotion', async(req, res) => {
  const viewData = req.body;


  const viewUser = viewData.user;
  const viewVideo = viewData.video;
  const viewEmotions = viewData.emotions;
  var viewWatchCount = 0

  // create emotion list from JSON data
  emotionList = [];
  JSON.parse(viewEmotions).forEach((entry) => {
    emotionList.push({timestamp:entry["timestamp"], emotion:entry["emotion"]})
  });

  // create entry from model
  db.collection("views").countDocuments({user: viewUser, video: viewVideo})
  .then(result =>
    {
      viewWatchCount = result;
      
      const view = new View({
        user: viewUser,
        video: viewVideo,
        watchCount: viewWatchCount,
        emotions: emotionList
      })
      // save to database
      view.save()
      .then(result => res.send({success: true, title: title}))
      .catch(error => res.send({success: false, title: error}))
  })
  .catch(error => console.log(error));
})

// save video to database
// Database save from GeeksForGeeks [3]
app.post('/newVideo', async(req, res) => {
  const videoData = req.body;
  const vidUrl = videoData.url;
  const vidTitle = videoData.title;
  const vidRuntimeSec = videoData.runtimeSec;

  const video = new Video({
    url: vidUrl,
    title: vidTitle,
    runtimeSec: vidRuntimeSec
  })
  video.save()
  .then(result => res.send({success: true, title: title}))
  .catch(error => res.send({success: false, title: error}))
})


// save user to database
// Database save from GeeksForGeeks [4]
app.post('/newUsers', async (req, res) => {
  const userData = req.body;
  const firstname = userData.firstname;
  const username = userData.username;
  // hash password
  const password = await bcrypt.hash(userData.password, 8);

  const user = new User({
    displayName: firstname,
    userName: username,
    password:password
  })
  console.log(db.collection("users").find({userName: username}))
  user.save()
  .then(result => res.send({success: true, currentUser: username}))
  .catch(error => res.send({success: false, errorDetail: error}))
})


app.post('/existingViews', async (req, res) => {
  const videoData = req.body;
  const videoTitle = videoData.videoTitle;

  // find all views for given video
  // find function from MongoDB docs [5]
  dbSearch = db.collection("views").find({video: videoTitle}, {user: 0, video: 0, watchCount: 0, emotions: 1})
  dbSearch.toArray().then(allEmotions => {

    if (allEmotions.length > 0){

      justEmotions = [];
      for (i = 0; i < allEmotions.length; i++){
        justEmotions.push(allEmotions[i]['emotions']);
      }

      // sort into list of emotions organised by timestamp
      emotionByTime = [];
      for(i = 0; i < justEmotions[0].length; i++){
        emotionByTime.push([]);
        for (j = 0; j < justEmotions.length; j++){
          if(i < justEmotions[j].length){
            emotionByTime[i].push(justEmotions[j][i]['emotion']);
          } else {
            emotionByTime[i].push(emotionByTime[i - 1]);
          }
        }
      }

      // find modal average emotions
      avgEmotions = [];
      for (i = 0; i < emotionByTime.length; i++){
        avgEmotions.push(calcMode(emotionByTime[i]));
      }

      res.send(JSON.stringify(avgEmotions));
    } else {

      res.send(JSON.stringify("none"));
    }
    
    console.log("b");
    if (allEmotions.length > 0){
      listLength = allEmotions[0].length
      for (let i = 0; i < listLength; i++){
        finalEmotions.push([]);
        allEmotions.forEach((elt) =>
          finalEmotions[i].push(elt[i]));
        }
      console.log(finalEmotions);
      res.send(JSON.stringify(finalEmotions));
  }
  
  }
  )
  
})


// find existing user
app.post('/existingUsers', async (req, res) => {
  const userData = req.body;
  const username = userData.username;
  const password = userData.password;

  db.collection("users").findOne({userName: username})
  .then(result =>
    {
      console.log(username);
      // hash password
      bcrypt.compare(password, result.password, (err, succ) => {
        if (err) {
          res.send({success: false, errorDetail: "Error comparing passwords"});
          return;
        }
        if (succ) {
          res.send({success: true, currentUser: username})
        }
        else {
          res.send({success: false, errorDetail: "Wrong Password"})
        }
      })
  })
  .catch(error => res.send({success: false, errorDetail: "User not found"}));
})


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
})

// ---------------------------------------------------------------------------------------------------
// **CODE BIBLIOGRAPHY**

// [1] Wu, MJ (2025) - "How to Build a Google Chrome Extension with React, Next.js, and MongoDB", Medium.com
// Available at https://medium.com/@JordanWuInTheHouse/how-to-build-a-google-chrome-extension-with-react-next-js-and-mongodb-912e1d46f49e

// [2] User 'robertklep' (2013) - "Mongoose Connection", StackOverflow
// Available at https://stackoverflow.com/questions/20360531/mongoose-connection

// [3] GeeksForGeeks - "Find Mode of an Array using JavaScript" - last updated 2025-07-23
// Available at https://www.geeksforgeeks.org/javascript/find-mode-of-an-array-using-javascript/

// [4] GeeksForGeeks - "Mongoose save() Method" - last updated 2025-10-01
// Available at https://www.geeksforgeeks.org/mongodb/mongoose-save-function/

// [5] MongoDB Docs - "db.collection.find() (mongosh method)"
// Available at https://www.mongodb.com/docs/manual/reference/method/db.collection.find/?msockid=149ffc818964650a3443ea74880064f3