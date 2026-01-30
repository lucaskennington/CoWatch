const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;
const User = require('./models/user');
const Video = require('./models/video');
const View = require('./models/view');

var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({extended: true})

app.use(jsonParser);
app.use(urlencodedParser);
app.use(express.json())



const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://lucaskennington_db_user:OIPPYdmML4jFxF6T@cowatch.i8hiekq.mongodb.net/CoWatch?appName=CoWatch');
 
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

app.post('/logEmotion', async(req, res) => {
  const viewData = req.body;

  console.log(viewData);

  const viewUser = viewData.user;
  const viewVideo = viewData.video;
  const viewEmotions = viewData.emotions;
  var viewWatchCount = 0

  console.log(viewUser);
  console.log(viewEmotions);
  // console.log(viewEmotions.length)

  emotionList = [];
  JSON.parse(viewEmotions).forEach((entry) => {
    emotionList.push({timestamp:entry["timestamp"], emotion:entry["emotion"]})
  });

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
      view.save()
      .then(result => res.send({success: true, title: title}))
      .catch(error => res.send({success: false, title: error}))
  })
  .catch(error => console.log(error));
})


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


app.post('/newUsers', async (req, res) => {
  const userData = req.body;
  const firstname = userData.firstname;
  const username = userData.username;
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

app.post('/existingUsers', async (req, res) => {
  const userData = req.body;
  const username = userData.username;
  const password = userData.password;

  db.collection("users").findOne({userName: username})
  .then(result =>
    {
      console.log(username);
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
