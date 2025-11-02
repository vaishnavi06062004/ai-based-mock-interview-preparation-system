const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1);

// ✅ Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // serve CSS, JS, images

// ✅ Set multiple views folders
app.set('views', [
  path.join(__dirname, 'views1'),       // src1/views1 -> auth pages
  path.join(__dirname, '../src/views')  // src/views -> home.ejs and others
]);
app.set('view engine', 'ejs');

// ✅ Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// ✅ Verify transporter
transporter.verify(function(error, success) {
  if (error) console.log('❌ Nodemailer Error:', error);
  else console.log('📧 Nodemailer Ready to Send Emails');
});

// ✅ Simulated databases
const users = {};       // { email: { name, password, verified, token } }
const resetTokens = {}; // { email: resetCode }

// ---------------- ROUTES ---------------- //

// SIGNUP
app.get('/signup', (req, res) => res.render('signup'));

app.post('/signup', (req, res) => {
  const { name, email, password } = req.body;
  const verificationToken = Math.floor(100000 + Math.random() * 900000);

  users[email] = { name, password, verified: false, token: verificationToken };

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Email Verification',
    html: `<p>Hello ${name},</p><p>Your verification code is: <b>${verificationToken}</b></p>`
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log('Signup Email Error:', err);
      return res.send('Error sending verification email. Check console.');
    }
    console.log('Verification email sent:', info.response);
    res.render('verification-sent', { email });
  });
});

// VERIFY EMAIL
app.get('/verify', (req, res) => {
  const { email } = req.query;
  res.render('verify', { email });
});

app.post('/verify', (req, res) => {
  const { email, token } = req.body;
  if (users[email] && users[email].token == token) {
    users[email].verified = true;
    res.render('verification-success', { name: users[email].name });
  } else {
    res.render('verification-fail', { email });
  }
});

// LOGIN
app.get('/login', (req, res) => res.render('login'));

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!users[email]) return res.send('Email not registered');
  if (!users[email].verified) return res.send('Email not verified');
  if (users[email].password !== password) return res.send('Incorrect password');

  // ✅ Successful login → redirect to home page
  res.redirect('/home');
});

// FORGOT PASSWORD
app.get('/forgot-password', (req, res) => res.render('forgot-password'));

app.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!users[email]) return res.send('Email not registered');

  const resetCode = Math.floor(100000 + Math.random() * 900000);
  resetTokens[email] = resetCode;

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Password Reset Code',
    html: `<p>Your password reset code is: <b>${resetCode}</b></p>`
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log('Forgot Password Email Error:', err);
      return res.send('Error sending reset email. Check console.');
    }
    console.log('Reset email sent:', info.response);
    res.render('forgot-password-sent', { email });
  });
});

// RESET PASSWORD
app.get('/reset-password', (req, res) => {
  const { email } = req.query;
  res.render('reset-password', { email });
});

app.post('/reset-password', (req, res) => {
  const { email, token, password } = req.body;
  if (resetTokens[email] && resetTokens[email] == token) {
    users[email].password = password;
    delete resetTokens[email];
    res.render('verification-success', { name: users[email].name });
  } else {
    res.render('verification-fail', { email });
  }
});

// ✅ HOME route
app.get('/home', (req, res) => {
  res.render('home');
});

// ✅ ROOT route
app.get('/', (req, res) => {
  res.redirect('/signup');
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
