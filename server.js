const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;
const User = require('./models/user');

var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({extended: true})

//app.use(jsonParser);
app.use(urlencodedParser);



const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://lucaskennington_db_user:OIPPYdmML4jFxF6T@cowatch.i8hiekq.mongodb.net/CoWatch?appName=CoWatch');
 
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});


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

  user.save();
  

})


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
})
