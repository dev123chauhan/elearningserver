const express = require("express");
const Course = require("../../api/models/Course");
const router = express.Router();
const coursesContent = require("../../courseData");
const mongoose = require("mongoose");

const insertCoursesIfEmpty = async () => {
  const count = await Course.countDocuments();
  if (count === 0) {
    try {
      await Course.insertMany(coursesContent);
      console.log("Courses added successfully");
    } catch (err) {
      console.log("Error inserting courses:", err);
    }
  }
};

insertCoursesIfEmpty();

router.get("/courses", async (req, res) => {
  try {
    const { search } = req.query;
    let courses;

    if (search) {
      courses = await Course.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      });
    } else {
      courses = await Course.find();
    }

    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/courses/:id", async (req, res) => {
  try {
    const courseId = req.params.id;

    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const course = await Course.findById(courseId);

    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ message: "Course not found" });
    }
  } catch (err) {
    console.error("Error fetching course:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
