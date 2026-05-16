const express = require('express');
const prisma = require('../db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Get all incidents (with optional filters)
router.get('/', authenticate, async (req, res) => {
  try {
    const incidents = await prisma.incident.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100
    });
    res.json(incidents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new incident
router.post('/', authenticate, async (req, res) => {
  const { type, severity, lat, lng, zone_id, status, description } = req.body;
  try {
    const incident = await prisma.incident.create({
      data: {
        type, 
        severity: Number(severity), 
        lat: Number(lat), 
        lng: Number(lng), 
        zone_id, 
        status: status || 'open', 
        description, 
        reported_by: req.user.id
      }
    });
    res.status(201).json(incident);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get heatmap data
router.get('/heatmap', authenticate, async (req, res) => {
  try {
    const incidents = await prisma.incident.findMany({
      select: { lat: true, lng: true, severity: true }
    });
    // Leaflet.heat expects [lat, lng, intensity]
    const heatmapData = incidents.map(inc => [inc.lat, inc.lng, inc.severity]);
    res.json(heatmapData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
