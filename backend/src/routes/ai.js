const express = require('express');
const router = express.Router();
const groq = require('../config/groq');
const prisma = require('../db');
const { authenticate } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: { error: 'Too many AI requests. Please wait a minute.' }
});

// AI FEATURE 1: CRIME ANALYST CHATBOT
router.post('/chat', authenticate, aiLimiter, async (req, res) => {
  const { message, context_type } = req.body;
  
  try {
    let context = {};
    if (context_type === "dashboard") {
      context.total_incidents = await prisma.incident.count({
        where: { timestamp: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
      });
      context.top_zone = await prisma.incident.groupBy({
        by: ['zone_id'],
        _count: { _all: true },
        orderBy: { _count: { _all: 'desc' } },
        take: 1
      });
      context.crime_types = await prisma.incident.groupBy({
        by: ['type'],
        _count: { _all: true }
      });
    } else if (context_type === "alerts") {
      context.recent_alerts = await prisma.alert.findMany({
        orderBy: { triggered_at: 'desc' },
        take: 10
      });
    }

    const system = `You are a crime intelligence analyst assistant for a police dashboard system.
    Answer questions using ONLY the data provided. Be concise, factual, and professional.
    If data is insufficient, say so. Never make up statistics.`;

    const userMessage = `Crime data context: ${JSON.stringify(context)}\n\nOfficer question: ${message}`;

    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: system }, { role: "user", content: userMessage }],
      max_tokens: 512,
      temperature: 0.2
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error('AI Chat error:', error);
    res.json({ reply: "AI service temporarily unavailable. Please try again." });
  }
});

// AI FEATURE 2: INCIDENT REPORT ASSISTANT
router.post('/parse-incident', authenticate, aiLimiter, async (req, res) => {
  const { raw_description } = req.body;
  
  try {
    const system = `You are a police incident classifier. Given a rough description of a crime,
    extract structured data. Always respond in valid JSON only. No extra text.
    JSON format:
    {
      "crime_type": "theft | assault | robbery | vandalism | chain_snatching | burglary | other",
      "severity": 1-5 (1=minor, 5=critical),
      "description": "professional rewritten description in 2 sentences",
      "time_of_day": "morning | afternoon | evening | night | unknown",
      "location_hint": "extracted location text or empty string"
    }`;

    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: system }, { role: "user", content: raw_description }],
      max_tokens: 256,
      temperature: 0.1
    });

    const parsed = JSON.parse(response.choices[0].message.content);
    res.json(parsed);
  } catch (error) {
    console.error('AI Parse error:', error);
    res.status(500).json({ error: 'Failed to parse incident' });
  }
});

// AI FEATURE 3: ANOMALY EXPLANATION
router.post('/explain-anomaly', authenticate, aiLimiter, async (req, res) => {
  const { zone_id, zone_name, score, crime_type, triggered_at, recent_count, historical_avg } = req.body;
  
  try {
    const system = `You are a crime pattern analyst. Given anomaly detection data, 
    explain the anomaly in plain English for a police officer.
    Respond in JSON only:
    {
      "explanation": "2-3 sentence explanation of what the anomaly means",
      "recommendation": "1-2 sentence actionable recommendation for the officer"
    }`;

    const userMessage = `Anomaly data:
    Zone: ${zone_name || zone_id} (ID: ${zone_id})
    Anomaly score: ${score} (higher = more unusual)
    Crime type spiking: ${crime_type}
    Time detected: ${triggered_at}
    Recent incident count: ${recent_count}
    Historical average: ${historical_avg}`;

    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: system }, { role: "user", content: userMessage }],
      max_tokens: 300,
      temperature: 0.2
    });

    res.json(JSON.parse(response.choices[0].message.content));
  } catch (error) {
    console.error('AI Explain error:', error);
    res.status(500).json({ error: 'Failed to explain anomaly' });
  }
});

// AI FEATURE 4: WEEKLY AI REPORT
router.post('/weekly-report', authenticate, aiLimiter, async (req, res) => {
  try {
    // CHECK 1: Groq key exists
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        error: "Groq API key not configured. Add GROQ_API_KEY to your .env file."
      });
    }

    const { start_date, end_date } = req.body;

    // CHECK 2: Dates are provided
    if (!start_date || !end_date) {
      return res.status(400).json({ error: "start_date and end_date are required." });
    }

    // Fetch data from DB using Prisma
    const incidents = await prisma.incident.findMany({
      where: {
        timestamp: {
          gte: new Date(start_date),
          lte: new Date(end_date)
        }
      },
      select: {
        type: true,
        zone_id: true,
        severity: true,
        timestamp: true
      }
    });

    const alerts = await prisma.alert.findMany({
      where: {
        triggered_at: {
          gte: new Date(start_date),
          lte: new Date(end_date)
        }
      },
      select: {
        zone_id: true,
        score: true,
        crime_type: true,
        triggered_at: true
      }
    });

    const zoneStats = await prisma.incident.groupBy({
      by: ['zone_id', 'type'],
      where: {
        timestamp: {
          gte: new Date(start_date),
          lte: new Date(end_date)
        }
      },
      _count: {
        _all: true
      }
    });

    // If no data found, return a friendly empty report instead of crashing
    if (incidents.length === 0) {
      return res.json({
        executive_summary: `No incidents were recorded between ${start_date} and ${end_date}.`,
        top_zones: [],
        trend_analysis: "No data available for this period.",
        recommendations: ["Continue regular monitoring.", "Ensure field officers are submitting incident reports."],
        generated_at: new Date()
      });
    }

    const system = `You are a senior crime analyst writing an official weekly intelligence report.
Use specific numbers from the data. Be professional and concise.
Respond ONLY in valid JSON. No extra text, no markdown, no backticks.
JSON format:
{
  "executive_summary": "3-4 sentence overall summary with specific numbers",
  "top_zones": [
    {
      "zone": "Zone name or ID",
      "count": total incident count as number,
      "primary_crime": "most common crime type",
      "trend": "improving or stable or worsening",
      "analysis": "2 sentences about this zone"
    }
  ],
  "trend_analysis": "paragraph about overall crime trends",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}`;

    const userMessage = `Weekly crime data from ${start_date} to ${end_date}:
Total incidents: ${incidents.length}
Total anomaly alerts: ${alerts.length}
Zone and crime breakdown: ${JSON.stringify(zoneStats.slice(0, 20))}
Sample incidents: ${JSON.stringify(incidents.slice(0, 30))}`;

    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: system },
        { role: "user", content: userMessage }
      ],
      max_tokens: 1024,
      temperature: 0.3
    });

    const rawText = response.choices[0].message.content;

    // Safely parse JSON — strip backticks if model added them
    const clean = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return res.json({ ...parsed, generated_at: new Date() });

  } catch (error) {
    console.error("Weekly report error:", error.message || error);

    // Specific error messages for easier debugging
    if (error.message && (error.message.includes("401") || error.message.includes("invalid_api_key"))) {
      return res.status(500).json({ error: "Invalid Groq API key. Check your GROQ_API_KEY in .env" });
    }
    if (error.message && error.message.includes("429")) {
      return res.status(429).json({ error: "Groq rate limit reached. Wait 1 minute and try again." });
    }
    if (error instanceof SyntaxError) {
      return res.status(500).json({ error: "AI returned invalid JSON. Try again." });
    }

    return res.status(500).json({ error: "Failed to generate report. " + (error.message || error) });
  }
});

// AI FEATURE 5: GENERAL DASHBOARD CRIME INTELLIGENCE REPORT
router.post('/analyze', authenticate, aiLimiter, async (req, res) => {
  const { incidents } = req.body;
  
  if (!incidents || !Array.isArray(incidents) || incidents.length === 0) {
    return res.json({ analysis: "No incident records found. Seed some data first to generate a strategic intelligence report." });
  }

  try {
    const totalCount = incidents.length;
    const highSeverityCount = incidents.filter(i => i.severity >= 4).length;
    const openCount = incidents.filter(i => i.status === 'open').length;
    
    // Group incidents by type for context
    const typesMap = {};
    incidents.forEach(i => {
      typesMap[i.type] = (typesMap[i.type] || 0) + 1;
    });

    const system = `You are a high-level crime intelligence officer. Given a JSON summary of recent crime incidents,
    analyze the patterns and provide a premium, highly professional strategic intelligence report.
    Structure your response with:
    1. 🛡️ CRIME PATTERN OVERVIEW (2-3 sentences discussing total incidents and dominant crime categories)
    2. 📍 SEVERITY & RISK HOTSPOTS (2 sentences identifying critical high-severity zones)
    3. 🎯 ACTIONABLE POLICE DIRECTIVES (3 bullet points specifying immediate officer deployment recommendations)
    Keep the tone extremely serious, concise, and structured. Do not output markdown codeblocks, just raw formatted text.`;

    const userMessage = `Recent Crime Stats:
    - Total Incidents: ${totalCount}
    - Open Cases: ${openCount}
    - High-Severity Incidents (Rating >= 4): ${highSeverityCount}
    - Crime Type Breakdown: ${JSON.stringify(typesMap)}
    
    Raw Incident Data Sample (up to 20): ${JSON.stringify(incidents.slice(0, 20))}`;

    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: system }, { role: "user", content: userMessage }],
      max_tokens: 768,
      temperature: 0.25
    });

    res.json({ analysis: response.choices[0].message.content });
  } catch (error) {
    console.error('AI Analyze error:', error);
    res.status(500).json({ error: 'Failed to generate crime analysis' });
  }
});

module.exports = router;
