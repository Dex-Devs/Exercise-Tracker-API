const mongoose = require('mongoose')
const Schema = mongoose.Schema

// schema for exercises
// id auto-gen
// exercises must have a User
// user's id requrired
const exercisesSchema = new Schema ({
  userId: {type: String, require: true},
  description: String,
  duration: Number,
  date: Date
});

const exercisesModel = mongoose.model('Exercise', exercisesSchema);

module.exports = exercisesModel;