const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');
const dotenv = require("dotenv");

dotenv.config();
router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const newContact = new Contact({
      name,
      email,
      message,
    });

    const savedContact = await newContact.save();
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });


    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_USER,
      replyTo: email, 
      subject: 'New Contact Form Submission',
      text: `You have a new contact form submission from ${name} (${email}):\n\n${message}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).send('Error sending email');
      }
      console.log('Email sent:', info.response);
    });

    res.json(savedContact);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;





