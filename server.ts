import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SYSTEM_PROMPT = `You are Rizer Insight, a supportive and non-diagnostic posture companion.

Your only input is a validated aggregate Rizer monitoring summary. Treat all values as observational device data with uncertainty. Do not infer facts that are not present in the input.

Your job is to explain measured posture patterns in brief, practical, friendly language. You may acknowledge sustained posture load, monitoring pauses, recovery breaks, and confidence limitations. You may offer one optional, low-intensity comfort action such as a short breathing, neck-release, chest-opening, or movement-break routine.

You must never:
- diagnose, treat, or name a medical condition;
- state or imply that the user has back pain, spinal damage, muscle fatigue, stress disease, injury, inflammation, or nerve problems;
- predict when pain will happen or assess the severity of pain;
- make claims about anatomical structures such as discs, trapezius, rhomboids, nerves, or vertebrae;
- change calibration, posture score, wear state, ML state, haptic timing, or vibration settings;
- say that the system is accurate, clinically validated, or certain;
- shame, frighten, or pressure the user;
- invent sensor values or trends.

If data_quality is limited, device_ready is false, or eligible_minutes is too low, state that there is not enough reliable monitoring data for a personalised summary and offer a neutral next step such as checking device fit or continuing normal use.

Use language such as:
- “Sustained posture load was detected during monitored time.”
- “Your monitoring summary suggests a brief comfort break may be useful.”
- “The device did not collect enough reliable monitoring time for a detailed summary.”
- “Would you like a short breathing or comfort routine?”

Do not use language such as:
- “Your back will hurt in two hours.”
- “Your trapezius is fatigued.”
- “You have spinal damage.”
- “This is a diagnosis.”

Return only JSON matching the requested output schema. Keep the tone gentle, concise, factual, and optional.`;

const FALLBACK_RESPONSE = {
  headline: "Monitoring summary",
  summary: "Sustained posture load was detected during monitored time.",
  confidence_note: "This is a posture-monitoring summary, not a medical assessment.",
  suggested_action: {
    kind: "comfort_break",
    label: "Try a short comfort routine",
    minutes: 2,
    reason: "A brief break can be chosen whenever it feels useful."
  },
  notification_recommendation: {
    show_in_app_card: true,
    send_push: false,
    reason: "Optional in-app coaching only."
  },
  safety_flags: {
    contains_medical_claim: false,
    requires_fallback: false
  }
};

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    headline: { type: Type.STRING, description: "A short factual, non-medical heading" },
    summary: { type: Type.STRING, description: "One or two sentences based only on the supplied aggregate data." },
    confidence_note: { type: Type.STRING, description: "Data-quality limitation or a short neutral confidence note." },
    suggested_action: {
      type: Type.OBJECT,
      properties: {
        kind: { type: Type.STRING, description: "breathing | comfort_break | movement_break | device_check | none" },
        label: { type: Type.STRING, description: "Optional action label" },
        minutes: { type: Type.INTEGER },
        reason: { type: Type.STRING, description: "Non-diagnostic reason grounded in the input" }
      }
    },
    notification_recommendation: {
      type: Type.OBJECT,
      properties: {
        show_in_app_card: { type: Type.BOOLEAN },
        send_push: { type: Type.BOOLEAN },
        reason: { type: Type.STRING, description: "Never urgent; non-diagnostic explanation" }
      }
    },
    safety_flags: {
      type: Type.OBJECT,
      properties: {
        contains_medical_claim: { type: Type.BOOLEAN },
        requires_fallback: { type: Type.BOOLEAN }
      }
    }
  }
};

function validateInput(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  if (data.schema_version !== 'rizer-insight-input-v1') return false;
  if (!data.period || !data.activity_context) return false;
  if (!data.monitoring || typeof data.monitoring.eligible_minutes !== 'number') return false;
  if (!data.posture || typeof data.posture.time_weighted_score !== 'number') return false;
  if (!data.habits || typeof data.habits.recovery_breaks_completed !== 'number') return false;
  if (!data.safety || typeof data.safety.medical_mode !== 'boolean') return false;

  // Strict check: no raw streams or user ids
  if (data.user_id || data.raw_frames || data.streams) return false;

  return true;
}

function sanitizeInput(data: any) {
  // Return only the expected fields to prevent prompt injection or leaking extra data
  return {
    schema_version: data.schema_version,
    period: data.period,
    activity_context: data.activity_context,
    monitoring: {
      eligible_minutes: data.monitoring.eligible_minutes,
      paused_minutes: data.monitoring.paused_minutes,
      data_quality: data.monitoring.data_quality,
      wear_state_summary: data.monitoring.wear_state_summary
    },
    posture: {
      time_weighted_score: data.posture.time_weighted_score,
      trend: data.posture.trend,
      sustained_load_episodes: data.posture.sustained_load_episodes,
      longest_sustained_load_minutes: data.posture.longest_sustained_load_minutes,
      upright_time_pct: data.posture.upright_time_pct,
      primary_pattern: data.posture.primary_pattern
    },
    habits: {
      recovery_breaks_completed: data.habits.recovery_breaks_completed,
      preferred_coaching_style: data.habits.preferred_coaching_style,
      notifications_enabled: data.habits.notifications_enabled
    },
    safety: {
      medical_mode: data.safety.medical_mode,
      device_ready: data.safety.device_ready,
      ml_mode: data.safety.ml_mode
    }
  };
}

async function createServer() {
  const app = express();
  
  // Use Vite middleware in development
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });

  app.use(express.json());

  app.post('/api/rizer-insights', async (req, res) => {
    try {
      const rawData = req.body;

      if (!validateInput(rawData)) {
        console.warn("Invalid input to /api/rizer-insights");
        return res.json(FALLBACK_RESPONSE);
      }

      const cleanData = sanitizeInput(rawData);

      // Verify AI key exists
      if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY not set");
        return res.json(FALLBACK_RESPONSE);
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

      const response = await ai.models.generateContent({
        model: modelName,
        contents: JSON.stringify(cleanData),
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA as any,
          temperature: 0.2
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from Gemini");
      }

      const parsedResponse = JSON.parse(responseText);

      // Secondary safety check
      if (parsedResponse.safety_flags?.contains_medical_claim || parsedResponse.safety_flags?.requires_fallback) {
        return res.json(FALLBACK_RESPONSE);
      }

      res.json(parsedResponse);

    } catch (error) {
      console.error("Error in /api/rizer-insights:", error);
      res.json(FALLBACK_RESPONSE);
    }
  });

  app.post('/api/rizer-vision', async (req, res) => {
    try {
      const { imageBase64, prompt } = req.body;
      
      if (!imageBase64) {
        return res.status(400).json({ error: "Missing imageBase64 in request body." });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY not set" });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      // gemini-2.5-flash is multimodal and supports images
      const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

      const visionSystemPrompt = `You are Rizer Vision, an advanced AI wellness and ergonomic analyst.
The user has provided an image (e.g., of their workspace, posture, or setup) and potentially a question.
Analyze the image specifically for ergonomic setup, posture, and wellness factors.
Do not provide medical diagnoses (e.g., do not diagnose scoliosis, injury, etc.).
Instead, provide practical, non-diagnostic suggestions on how to improve the setup or relieve tension.
Format your response as a structured JSON object.`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          analysis: { type: Type.STRING, description: "Detailed analysis of the image regarding ergonomics and wellness." },
          identified_issues: { 
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of identified ergonomic or posture issues."
          },
          suggested_actions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Actionable, non-medical steps the user can take to improve."
          }
        }
      };

      // Strip the prefix (e.g., data:image/jpeg;base64,) if present
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt || "Please analyze this setup/posture." },
              {
                inlineData: {
                  data: base64Data,
                  mimeType: "image/jpeg"
                }
              }
            ]
          }
        ],
        config: {
          systemInstruction: visionSystemPrompt,
          responseMimeType: "application/json",
          responseSchema: responseSchema as any,
          temperature: 0.4
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from Gemini");
      }

      res.json(JSON.parse(responseText));

    } catch (error) {
      console.error("Error in /api/rizer-vision:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Use Vite middleware for all other requests
  app.use(vite.middlewares);

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

createServer();
