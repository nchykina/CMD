var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    from: {
        type: String,
        required: false
    },
    to: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: false
    },
    type: {
        type: String, //inbox, draft, sent, trash
        required: true
    },
    sentTime: {
        type: Date,
        default: Date.now,
        required: false
    },
    read: {
        type: Boolean,
        default: true,
        required: false
    },
    owner: {//logic for moving to trash
        type: String,
        required: false
    },
    movedToTrashFrom: {//logic for moving back to folder from trash
        type: String,
        required: false
    }
});


module.exports = mongoose.model('Message', MessageSchema);
