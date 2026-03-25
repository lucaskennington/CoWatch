const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const videoSchema = new Schema({
    url: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    runtimeSec: {
        type: String,
        required: true
    },
    AvgEmotions:{
        type: {String, String}
    },
    genre: {
        type: String
    },
}, {collection: ''});

const Video = mongoose.model('Video', videoSchema);
module.exports = Video;