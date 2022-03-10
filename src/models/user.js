const mongoose = require('mongoose');
const { schemaOptions } = require('./modelOptions');

const userSchema = new mongoose.Schema({
  idNumber: {
    type: String,
    require: true,
    unique: true
  },
  phoneNumber: {
    type: String,
    require: true,
    unique: true
  },
  fullName: {
    type: String,
    require: true
  },
  address: {
    type: String,
    require: true,
  },
}, schemaOptions);

module.exports = mongoose.model('User', userSchema);
