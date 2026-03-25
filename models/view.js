const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const viewSchema = new Schema({
    user: {
        type: String,
        required: true
    },
    video: {
        type: String,
        required: true
    },
    watchCount: {
        type: Number,
        required: true
    },
    emotions:{
        type: [{timestamp: Number, emotion: String}]
    }
}, {collection: ''});

const View = mongoose.model('View', viewSchema);
module.exports = View;