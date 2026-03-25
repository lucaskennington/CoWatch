const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    displayName: {
        type: String,
    },
    userName: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type:String,
        required: true,
    }
}, {collection: ''});

const User = mongoose.model('User', userSchema);
module.exports = User;