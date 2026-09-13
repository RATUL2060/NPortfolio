// Netlify Serverless Function: /api/chat
// Uses HuggingFace Inference API (free public endpoint)
// Falls back gracefully — client uses local FAQ if this returns { fallback: true }

const SYSTEM_PROMPT = `You are Dhrubo Ratul Basak's personal portfolio assistant.
Answer questions ONLY using the portfolio knowledge base below.
Never invent jobs, companies, publications, metrics, or experience.
If information is unavailable, say: "I don't have that information in Dhrubo's portfolio."
Keep answers concise (2-4 sentences) and professional.
Do not answer questions unrelated to Dhrubo or his portfolio.

PORTFOLIO KNOWLEDGE BASE:
Name: Dhrubo Ratul Basak
Location: Dortmund, Germany (originally from Dhaka, Bangladesh)

EDUCATION:
- M.Sc. Data Science, TU Dortmund University, Germany. April 2026 to present.
- B.E. Computer Engineering, Gujarat Technological University, India. Sept 2020 – June 2024. ICCR International Scholarship from Government of India. Minor in Global Citizenship & Personality Development.

EXPERIENCE:
- Junior Network Engineer (NOC), Agni Systems Limited, Bangladesh. March 2025 – December 2025. Monitored and troubleshot network issues using MikroTik RouterOS and Cisco devices. Diagnosed outages, resolved connectivity issues, worked with VPN, PPPoE, QoS.
- Data Science Intern, Maxgen Technologies Pvt. Ltd., India. January 2024 – April 2024. Data analysis and machine learning projects including Heart Disease Prediction.

PROJECTS:
- CardioSense AI: Full-stack ML healthcare application. React frontend, FastAPI backend, JWT authentication, SQLite database, Scikit-learn ML, SHAP explainable AI, patient management, prediction history, analytics dashboard, nearby hospital search with Leaflet/OpenStreetMap. Docker + Docker Compose deployment. GitHub Actions CI. Educational portfolio project — predictions are not medical diagnoses. GitHub: https://github.com/RATUL2060/CardioSense-AI
- Secure Self-Hosted Jellyfin Server: Docker, WireGuard, Cloudflare Tunnel, Nginx Proxy Manager, MikroTik RouterOS, PPPoE, QoS. GitHub: https://github.com/RATUL2060/Networked-Jellyfin-Lab.git

RESEARCH (in progress, no publications):
- CNN-based network anomaly detection — applying CNNs to network traffic for anomaly/intrusion detection.

SKILLS:
- Programming: Python, SQL
- Data Science: Pandas, NumPy, Scikit-learn
- ML/AI: Classification, Regression, SHAP/Explainable AI, Anomaly Detection, CNN (learning)
- Full-Stack: React, FastAPI, REST API, SQLAlchemy, JWT, SQLite
- DevOps: Docker, Docker Compose, Nginx, Git, GitHub Actions
- Networking: MikroTik RouterOS, WireGuard, VPN, PPPoE, QoS, Cloudflare Tunnel, Cisco

CERTIFICATIONS: MikroTik MTCNA Training (Udemy), Goethe-Zertifikat A1, Network Security (Coursera), Cyber Security Workshop.

LANGUAGES: English C1, German A2 (learning), Bengali Native, Hindi Conversational.

AVAILABILITY: Available for Werkstudent positions and internships in Germany.

CONTACT: basakdhrubo@gmail.com | github.com/RATUL2060`;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { message, history = [] } = body;

  if (!message || typeof message !== 'string' || message.length > 500) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid message' }) };
  }

  try {
    const hfToken = process.env.HF_TOKEN; // Optional — set in Netlify env vars to increase rate limit

    const messages = [
      { role: 'user', content: SYSTEM_PROMPT + '\n\nUser question: ' + message },
    ];

    // Use HuggingFace free inference (Mistral-7B-Instruct)
    const res = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(hfToken ? { 'Authorization': `Bearer ${hfToken}` } : {}),
        },
        body: JSON.stringify({
          model: 'mistralai/Mistral-7B-Instruct-v0.3',
          messages,
          max_tokens: 300,
          temperature: 0.3,
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`HF API returned ${res.status}`);
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) throw new Error('Empty response from model');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply }),
    };

  } catch (err) {
    // Signal client to use local FAQ fallback — graceful degradation
    console.error('Chat function error:', err.message);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ fallback: true }),
    };
  }
};
