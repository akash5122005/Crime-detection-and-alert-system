const express = require('express');
const router = express.Router();
const prisma = require('../db');
const authenticateToken = require('../middleware/auth');

router.post('/analyze', authenticateToken, async (req, res) => {
  const { incidents } = req.body;
  
  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: 'Groq API Key not configured' });
  }

  try {
    const prompt = `You are a Crime Analyst for SafeZone. Analyze the following incidents and identify hotspots, patterns, and provide safety recommendations. 
    Incidents: ${JSON.stringify(incidents)}
    
    Return the analysis in a professional summary format with:
    1. Overall Assessment
    2. Hotspots Identified
    3. Safety Recommendations`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Groq API error');

    res.json({ analysis: data.choices[0].message.content });
  } catch (error) {
    console.error('AI Analysis error:', error);
    res.status(500).json({ error: 'Failed to generate AI analysis' });
  }
});

module.exports = router;
