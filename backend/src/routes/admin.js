const express = require('express');
const prisma = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');
const router = express.Router();

router.get('/users', authenticate, requireRole(['Admin']), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, created_at: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
