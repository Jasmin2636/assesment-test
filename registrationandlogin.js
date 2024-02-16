// auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Person = require('../models/person');

// User Registration
router.post('/register', async (req, res) => {
  try {
    const { name, id, password } = req.body;

    // Validate input data
    if (!name || !id || !password) {
      return res.render('signup', { message: 'Please enter all fields', type: 'error' });
    }

    // Check if user already exists
    let existingUser = await Person.findOne({ id });
    if (existingUser) {
      return res.render('signup', { message: 'User with this ID already exists. Please choose another ID.', type: 'error' });
    }

    // Create a new user
    const newPerson = new Person({ name, id, password });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    newPerson.password = await bcrypt.hash(password, salt);

    // Save user to database
    await newPerson.save();

    return res.render('signup', { message: 'User registered successfully', type: 'success' });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { id, password } = req.body;

    // Validate input data
    if (!id || !password) {
      return res.render('login', { message: 'Please enter all fields', type: 'error' });
    }

    // Check if user exists
    const user = await Person.findOne({ id });
    if (!user) {
      return res.render('login', { message: 'Invalid credentials', type: 'error' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('login', { message: 'Invalid credentials', type: 'error' });
    }

    // Generate JWT token
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(payload, 'jwtSecret', { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;
      return res.redirect('/'); // Redirect to homepage or dashboard
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

module.exports = router;
