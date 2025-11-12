const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const router = express.Router();
const dotenv = require("dotenv");
const multer = require('multer');
const cloudinary = require('../../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

dotenv.config();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile-pictures',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, email });
    await newUser.save();
    res.status(201).json('User registered!');
  } catch (error) {
    res.status(400).json('Error: ' + error);
  } 
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json('Invalid credentials');

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '365d' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (error) {
    res.status(400).json('Error: ' + error);
  }
});

router.get('/user', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(400).json('Error: ' + error);
  }
});

router.post('/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ msg: 'Password changed successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

router.post('/update-profile', authMiddleware, async (req, res) => {
  try {
    const { gender, mobileNumber, dateOfBirth, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { gender, mobileNumber, dateOfBirth, address },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.post('/upload-profile-picture', authMiddleware, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imageUrl = req.file.path;

    const user = await User.findById(req.user.id);
    if (user.profileImage) {
      const urlParts = user.profileImage.split('/');
      const publicId = `profile-pictures/${urlParts[urlParts.length - 1].split('.')[0]}`;
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.log('Error deleting old image:', err);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: imageUrl },
      { new: true }
    ).select('-password');

    res.json({ 
      success: true, 
      message: 'Profile picture uploaded successfully',
      user: updatedUser 
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading profile picture', error: error.message });
  }
});

module.exports = router;