const express = require('express');
const router = express.Router();
const prisma = require('../db');
const authenticateToken = require('../middleware/auth');

// FEATURE 1: CITIZEN CRIME REPORTING PORTAL (Public)
router.post('/report', async (req, res) => {
  const { name, phone, location, type, description, photo_url } = req.body;
  
  try {
    const year = new Date().getFullYear();
    const count = await prisma.citizenReport.count();
    const tracking_id = `CR-${year}-${(count + 1).toString().padStart(5, '0')}`;

    const report = await prisma.citizenReport.create({
      data: {
        tracking_id,
        name,
        phone,
        location,
        type,
        description,
        photo_url,
        status: 'pending'
      }
    });

    res.json({ tracking_id: report.tracking_id, message: 'Report submitted successfully' });
  } catch (error) {
    console.error('Citizen report error:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// Admin Review (Protected)
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    const reports = await prisma.citizenReport.findMany({
      where: { status: 'pending' },
      orderBy: { created_at: 'desc' }
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

router.post('/:id/approve', authenticateToken, async (req, res) => {
  try {
    const report = await prisma.citizenReport.update({
      where: { id: req.params.id },
      data: { status: 'approved' }
    });

    // Auto-create incident
    await prisma.incident.create({
      data: {
        type: report.type,
        severity: 3, // Default
        lat: 0, // Should be extracted from location or manually set
        lng: 0,
        zone_id: 'Zone1',
        status: 'open',
        description: `Approved Citizen Report: ${report.description}`,
        reported_by: 'CITIZEN',
        photo_urls: report.photo_url ? [report.photo_url] : []
      }
    });

    res.json({ message: 'Report approved and incident created' });
  } catch (error) {
    res.status(500).json({ error: 'Approval failed' });
  }
});

module.exports = router;
