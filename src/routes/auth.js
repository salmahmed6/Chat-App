const express = require('express');
const passport = require('passport');
const { signup, login, googleCallback, refreshToken, verifyEmail } = require('../controllers/authController');

const router = express.Router();

// Authentication routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), googleCallback);
router.post('/refresh-token', refreshToken);
router.get('/verify-email', verifyEmail);

module.exports = router;