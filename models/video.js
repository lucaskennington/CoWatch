const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const videoSchema = new Schema({
    url: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    runtimeSec: {
        type: Int32,
        required: true
    },
    AvgEmotions:{
        type: {Int32, Int32}
    },
    genre: {
        type: String
    },
}, {collection: ''});

const Video = mongoose.model('Video', videoSchema);
module.exports = Video;