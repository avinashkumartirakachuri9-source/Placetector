const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema({
  cgpa:Number,
  projects:Number,
  internships:Number,
  probability:Number,
  status:String,
},{
  timestamps:true
});

module.exports = mongoose.model(
  "Prediction",
  predictionSchema
);