const axios = require('axios');
const pool = require('../config/db');

// Map categories to recommended staff roles
const STAFF_MAPPING = {
  'electrical': 'Maintenance Staff',
  'plumbing': 'Plumber',
  'noise': 'Security Supervisor',
  'clean': 'Housekeeping Lead',
  'internet': 'Wi-Fi Desk Technician',
  'maint': 'Maintenance Staff',
  'other': 'Warden Assistant'
};

const localNlpAnalyze = (title, description, category) => {
  const text = (title + ' ' + description).toLowerCase();
  let subTag = 'General';
  let predictedHours = 24;

  const normalizedCategory = (category || 'other').toLowerCase();

  if (normalizedCategory === 'electrical' || text.includes('fan') || text.includes('light') || text.includes('ac')) {
    if (text.includes('fan')) { subTag = 'Fan Issue'; predictedHours = 4; }
    else if (text.includes('ac') || text.includes('air conditioner')) { subTag = 'AC Issue'; predictedHours = 6; }
    else if (text.includes('light') || text.includes('bulb') || text.includes('tube')) { subTag = 'Lighting Issue'; predictedHours = 2; }
    else { subTag = 'General Electrical'; predictedHours = 12; }
  } else if (normalizedCategory === 'plumbing' || text.includes('leak') || text.includes('water') || text.includes('clog')) {
    if (text.includes('leak') || text.includes('faucet')) { subTag = 'Water/Leak Issue'; predictedHours = 3; }
    else if (text.includes('clog') || text.includes('drain') || text.includes('choke')) { subTag = 'Clogged Drain'; predictedHours = 2; }
    else { subTag = 'General Plumbing'; predictedHours = 8; }
  } else if (normalizedCategory === 'internet' || text.includes('wifi') || text.includes('router') || text.includes('net')) {
    subTag = 'Internet Speed/Connectivity';
    predictedHours = 2;
  } else if (normalizedCategory === 'clean' || text.includes('dirty') || text.includes('messy') || text.includes('dust')) {
    subTag = 'Corridor/Room Cleaning';
    predictedHours = 12;
  } else if (normalizedCategory === 'noise' || text.includes('loud') || text.includes('music') || text.includes('shout')) {
    subTag = 'Noise/Disturbance';
    predictedHours = 1;
  }

  const staffRole = STAFF_MAPPING[normalizedCategory] || 'Warden Assistant';

  return {
    ai_tag: `${category.toUpperCase()} > ${subTag}`,
    assigned_staff_role: staffRole,
    predicted_resolution_time: `${predictedHours} Hours`
  };
};

const analyzeComplaint = async (title, description, category) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const prompt = `
        You are an AI-powered hostel complaint routing system.
        Analyze the following student complaint and classify it.
        
        Hostel Staff Available Roles:
        - "Maintenance Staff" (for general & electrical issues)
        - "Plumber" (for water, tap, bathroom issues)
        - "Housekeeping Lead" (for cleanliness)
        - "Wi-Fi Desk Technician" (for internet issues)
        - "Security Supervisor" (for noise/curfew issues)
        - "Warden Assistant" (for other general queries)

        Complaint details:
        Category: ${category}
        Title: ${title}
        Description: ${description}

        Return a JSON object with:
        {
          "ai_tag": "CATEGORY > Specific Issue (e.g. ELECTRICAL > Fan Issue)",
          "assigned_staff_role": "one of the roles listed above",
          "predicted_resolution_time": "Estimated duration (e.g. '4 Hours' or '24 Hours')"
        }
      `;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        },
        { timeout: 5000 }
      );

      const responseText = response.data.contents[0].parts[0].text;
      const result = JSON.parse(responseText);
      
      if (result.ai_tag && result.assigned_staff_role && result.predicted_resolution_time) {
        return result;
      }
    } catch (err) {
      console.warn('Gemini API query failed, falling back to local NLP:', err.message);
    }
  }

  // Fallback to local rule engine if API key is not present or failed
  return localNlpAnalyze(title, description, category);
};

// Check for duplicate complaints from the same student in the last 24 hours
const checkDuplicateComplaint = async (studentId, title, description) => {
  try {
    const result = await pool.query(
      `SELECT id, created_at FROM complaints 
       WHERE student_id = $1 AND (
         LOWER(title) = LOWER($2) OR 
         SIMILARITY(LOWER(description), LOWER($3)) > 0.7
       ) AND created_at > NOW() - INTERVAL '24 hours'
       LIMIT 1`,
      [studentId, title, description]
    );
    return result.rows.length > 0;
  } catch (err) {
    // If pg_trgm similarity extension is not installed, fallback to direct description match
    try {
      const fallbackResult = await pool.query(
        `SELECT id, created_at FROM complaints 
         WHERE student_id = $1 AND (
           LOWER(title) = LOWER($2) OR 
           LOWER(description) = LOWER($3)
         ) AND created_at > NOW() - INTERVAL '24 hours'
         LIMIT 1`,
        [studentId, title, description]
      );
      return fallbackResult.rows.length > 0;
    } catch (e) {
      console.error('Check duplicate error:', e.message);
      return false;
    }
  }
};

module.exports = {
  analyzeComplaint,
  checkDuplicateComplaint,
  STAFF_MAPPING
};
