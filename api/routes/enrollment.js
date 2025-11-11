const express = require("express");
const router = express.Router();
const Enrollment = require("../models/Enrollment");

router.post("/enroll", async (req, res) => {
  try {
    const { firstName, lastName, email, courseId, duration } = req.body;

    const existingEnrollment = await Enrollment.findOne({ email, courseId });
    if (existingEnrollment) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You are already enrolled in this course.",
        });
    }

    const enrollment = new Enrollment({
      firstName,
      lastName,
      email,
      courseId,
      duration,
    });

    await enrollment.save();
    res
      .status(201)
      .json({ success: true, message: "Enrollment successful", enrollment });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error enrolling in course",
        error: error.message,
      });
  }
});

router.get("/enrollments/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const enrollments = await Enrollment.find({ email }).populate(
      "courseId",
      "name"
    );
    res.json({ success: true, enrollments });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching enrollments",
        error: error.message,
      });
  }
});
router.get("/enrolled-courses", async (req, res) => {
  try {
    const enrollments = await Enrollment.find().populate("courseId");
    const enrolledCourses = enrollments.map(
      (enrollment) => enrollment.courseId
    );
    res.json(enrolledCourses);
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/enrolled-courses/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;

    const result = await Enrollment.findOneAndDelete({ courseId });

    if (result) {
      res.json({ success: true, message: "Enrollment removed successfully" });
    } else {
      res.status(404).json({ success: false, message: "Enrollment not found" });
    }
  } catch (error) {
    console.error("Error removing enrollment:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error removing enrollment",
        error: error.message,
      });
  }
});

module.exports = router;
