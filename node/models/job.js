var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var JobFileSchema = require('../models/jobfile').schema;
 
var JobStepSchema = new Schema({
  name: {
      type: String,
      required: false
    },
  steptype: {      
      type: String,
      required: true
  },
  status: {
      type: String,
      required: true
  },
  date_created: {
        type: Date,
        required: true
    },
  date_updated: {
        type: Date,
        required: true
    },
  date_finished: {
        type: Date,
        required: true
    }
});
 
var JobSchema = new Schema({
  name: {
        type: String,
        required: false
    },
  date_created: {
        type: Date,
        required: true
    },
  date_updated: {
        type: Date,
        required: false
    },
  date_finished: {
        type: Date,
        required: false
    },
  jobtype: {
        type: String,
        required: true
  },
  status: {
        type: String,
        required: true
  },
  seq_species: {
        type: String,
        required: false
  },
  steps: [JobStepSchema],
  owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  filesIn: [JobFileSchema],
  filesOut: [JobFileSchema]
      
});


mongoose.model('JobStep',JobStepSchema);
 
module.exports = {
    model: mongoose.model('Job', JobSchema),
    schema: JobSchema
};


