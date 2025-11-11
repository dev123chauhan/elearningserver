const mongoose = require('mongoose');
const CourseSchema = new mongoose.Schema({
  name: { type: String },
  image: String,
  title: String, 
  description: String,
  bullets: [String],
  tag: String,
  duration: String,
  price: String
});


module.exports = mongoose.model('Course', CourseSchema);