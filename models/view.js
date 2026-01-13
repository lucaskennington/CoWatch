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
        type: Int32,
        required: true
    },
    emotions:{
        type: {Int32, Int32}
    }
}, {collection: ''});

const View = mongoose.model('View', viewSchema);
module.exports = View;