const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// schema for users
// id auth-gen
const userSchema = new Schema({
  username: String
})

const userModel = mongoose.model('User', userSchema);

module.exports = userModel