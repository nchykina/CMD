var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var JobFileSchema = new Schema({
    name: {
      type: String,
      required: false
    },
    store_path: {
      type: String,
      required: true
    },
    filesize: {
      type: Number,
      required: false
    },
    upload_started: {
      type: Date,
      required: false
    },
    upload_ended: {
      type: Date,
      required: false
    }
});



module.exports = {
   model: mongoose.model('JobFile', JobFileSchema),
   schema: JobFileSchema
};

