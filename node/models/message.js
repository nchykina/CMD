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
    }
});

module.exports = mongoose.model('Message', MessageSchema);
