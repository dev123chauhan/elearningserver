const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');




passport.use(new GoogleStrategy({
    clientID: 'YOUR_GOOGLE_CLIENT_ID',
    clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
    callbackURL: "http://localhost:8000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {


    return cb(null, profile);
  }
));

router.use(passport.initialize());


router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));


router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {

    const token = jwt.sign({ id: req.user.id }, 'YOUR_JWT_SECRET', { expiresIn: '365d' });

    res.redirect(`http://localhost:3000/login?token=${token}`);
  });


router.post('/auth/google', async (req, res) => {
  const { token } = req.body;
  try {


    const newToken = jwt.sign({ id: 'google_user_id' }, 'YOUR_JWT_SECRET', { expiresIn: '365d' });
    res.json({ token: newToken });
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
});

module.exports = router;