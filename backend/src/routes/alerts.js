const express = require('express');
const prisma = require('../db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Get all alerts
router.get('/', authenticate, async (req, res) => {
  try {
    const alerts = await prisma.alert.findMany({
      orderBy: { triggered_at: 'desc' },
      take: 50
    });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Acknowledge alert
router.patch('/:id/acknowledge', authenticate, async (req, res) => {
  try {
    const alert = await prisma.alert.update({
      where: { id: req.params.id },
      data: { acknowledged_by: req.user.id, acknowledged_at: new Date() }
    });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Webhook for ML service
router.post('/webhook', async (req, res) => {
  const { results } = req.body;
  try {
    const alerts = [];
    for (const result of results) {
      if (result.is_anomaly) {
        const alert = await prisma.alert.create({
          data: {
            zone_id: result.zone_id,
            score: result.anomaly_score,
            crime_type: 'Spike Detected'
          }
        });
        alerts.push(alert);
        
        // Emit via Socket.io
        req.app.get('io').emit('anomaly_alert', alert);
      }
    }
    res.json({ success: true, alerts_generated: alerts.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
