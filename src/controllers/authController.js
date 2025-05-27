const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { sendVerificationEmail } = require('../utils/email');

// Generate tokens
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Signup controller
const signup = async (req, res) => {
  try {
    console.log('Signup request body:', req.body); // Debug log
    const { username, email, password } = req.body;
    if (!email || !password || !username) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = new User({ username, email, password, verificationToken });
    await user.save();

    // Send verification email
    await sendVerificationEmail(user, verificationToken);

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    await new RefreshToken({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    }).save();

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false }); // Set secure: true in production
    res.status(201).json({
      accessToken,
      user: { id: user._id, username, email, isVerified: user.isVerified },
      message: 'Please verify your email to fully activate your account',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email first' });
    }
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    await RefreshToken.deleteMany({ userId: user._id }); // Invalidate old tokens
    await new RefreshToken({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }).save();

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false });
    res.json({ accessToken, user: { id: user._id, username: user.username, email, isVerified: user.isVerified } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Google OAuth callback
const googleCallback = async (req, res) => {
  try {
    const user = req.user;
    const existingUser = await User.findOne({ googleId: user.googleId });
    let newUser;
    if (!existingUser) {
      const verificationToken = crypto.randomBytes(32).toString('hex');
      newUser = new User({
        username: user.displayName.replace(/\s+/g, '').toLowerCase(),
        email: user.emails[0].value,
        googleId: user.googleId,
        isVerified: false, // Require email verification even for Google users
        verificationToken,
      });
      await newUser.save();
      await sendVerificationEmail(newUser, verificationToken);
    } else {
      if (!existingUser.isVerified) {
        return res.redirect('/?error=verify-email');
      }
    }

    const targetUser = existingUser || newUser;
    const accessToken = generateAccessToken(targetUser._id);
    const refreshToken = generateRefreshToken(targetUser._id);
    await RefreshToken.deleteMany({ userId: targetUser._id });
    await new RefreshToken({
      userId: targetUser._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }).save();

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false });
    res.redirect(`/?accessToken=${accessToken}&userId=${targetUser._id}&username=${targetUser.username}&email=${targetUser.email}&isVerified=${targetUser.isVerified}`);
  } catch (error) {
    res.redirect('/?error=server-error');
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }
  try {
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const accessToken = generateAccessToken(decoded.userId);
    const user = await User.findById(decoded.userId);
    res.json({ accessToken, user: { id: user._id, username: user.username, email: user.email, isVerified: user.isVerified } });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    res.redirect('/?verified=true');
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { signup, login, googleCallback, refreshToken, verifyEmail };