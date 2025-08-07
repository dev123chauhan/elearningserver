const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  duration: {
    type: String,
    required: true,
    trim: true
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  }
});

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;