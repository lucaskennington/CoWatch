const express = require('express');
const app = express();
const port = 3000;
const User = require('./models/user');

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
})

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://lucaskennington_db_user:OIPPYdmML4jFxF6T@cowatch.i8hiekq.mongodb.net/?appName=CoWatch');
 
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

app.get('/users', async (req, res) => {
  const user = new User({
    id: '4',
    name: 'example'
  })

  user.save()
  .then((result) => {
    res.send("Saved in DB")
  })
  .catch((err) => {
    console.log(err);
  })
})

