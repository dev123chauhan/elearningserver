const express = require("express");
const Course = require("../models/Course");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/courses", async (req, res) => {
  try {
    const { search, tag } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tag: { $regex: search, $options: "i" } },
      ];
    }

    if (tag) {
      query.tag = { $regex: tag, $options: "i" };
    }

    const courses = await Course.find(query).sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    console.error("Error fetching courses:", err);
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

router.get("/tags", async (req, res) => {
  try {
    const tags = await Course.distinct("tag");
    res.json(tags);
  } catch (err) {
    console.error("Error fetching tags:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
