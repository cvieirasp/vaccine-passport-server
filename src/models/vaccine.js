const mongoose = require('mongoose');
const { schemaOptions } = require('./modelOptions');

const vaccineSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true
  }
}, schemaOptions);

module.exports = mongoose.model('Vaccine', vaccineSchema);
