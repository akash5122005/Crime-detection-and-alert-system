const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password_hash, role: role || 'Analyst' }
    });

    res.status(201).json({ message: 'User created successfully', user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid password' });

    const secret = process.env.JWT_SECRET || 'supersecretjwt';
    const token = jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: '1d' });
    
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/google', async (req, res) => {
  const { token } = req.body;
  try {
    // Verify Firebase token via Google's tokeninfo endpoint
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    const decoded = await response.json();

    if (!response.ok || !decoded.email) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    const email = decoded.email;
    const name = decoded.name || 'Google User';

    // Find or create user in our database
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Create user if they don't exist with a random password
      const password_hash = await bcrypt.hash(Math.random().toString(36), 10);
      user = await prisma.user.create({
        data: { name, email, password_hash, role: 'Analyst' }
      });
    }

    const secret = process.env.JWT_SECRET || 'supersecretjwt';
    const jwtToken = jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: '1d' });
    
    res.json({ token: jwtToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
