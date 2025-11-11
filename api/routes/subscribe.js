const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const dotenv = require("dotenv");
const Subscribe = require('../models/Subscribe');

dotenv.config();

router.post('/', async (req, res) => {
  const { email } = req.body;

  try {

    const existingSubscribe = await Subscribe.findOne({ email });
    if (existingSubscribe) {
      return res.status(400).json({ message: 'Email already subscribed' });
    }


    const newSubscribe = new Subscribe({ email });
    const savedSubscribe = await newSubscribe.save();


    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });


    const mailOptions = {
      from: `<${email}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: 'New Newsletter Subscription',
      text: `Thank you for subscribing to our newsletter!`,
    };


    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');

    res.status(201).json(savedSubscribe);
  } catch (err) {
    console.error('Error in subscription process:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;