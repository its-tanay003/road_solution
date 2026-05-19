import express from 'express';
import { runEmergencyAnalysis } from '../services/agentOrchestrator';

const router = express.Router();

router.post('/analyze', async (req, res) => {
  const io = req.app.get('io');
  const input = req.body;

  try {
    if (!input.incidentId) {
      input.incidentId = `incident_${Date.now()}`;
    }

    // Start background processing
    // We run it asynchronously to not block the immediate HTTP response if desired,
    // or we can wait for it. The prompt implies we stream events via socket.io.
    // Let's return a success immediately and let socket handle the rest.
    runEmergencyAnalysis(input, io).catch(err => {
      console.error('Error running emergency analysis:', err);
    });

    res.json({ success: true, incidentId: input.incidentId, message: 'Analysis started. Listen to socket events.' });
  } catch (error: any) {
    console.error('AI Analysis Route Error:', error);
    res.status(500).json({ error: error.message || 'Failed to start AI analysis' });
  }
});

router.post('/vision-analyze', async (req, res) => {
  const { imageBase64, context, patientProfile } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'Image data is required' });
  }

  try {
    const { vision } = await import('../services/hybridAI');
    
    const result = await vision(imageBase64, context, undefined, patientProfile);
    res.json(result);
  } catch (error: any) {
    console.error('Vision Analysis Route Error:', error);
    res.status(500).json({ error: error.message || 'Vision analysis failed' });
  }
});

router.get('/ai-status', (req, res) => {
  res.json({
    status: 'online',
    providers: {
      triage: process.env.TRIAGE_AI || 'claude',
      vision: process.env.VISION_AI || 'claude',
      vitals: process.env.VITALS_AI || 'claude',
      identity: process.env.IDENTITY_AI || 'claude',
      orchestrator: process.env.ORCHESTRATOR_AI || 'claude',
      firstAid: process.env.FIRST_AID_AI || 'claude'
    }
  });
});

router.post('/grounded-search', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  try {
    const { geminiPro } = await import('../lib/gemini');
    // For grounded search, we use the tools array
    const result = await geminiPro.generateContent({
      contents: [{ role: 'user', parts: [{ text: query }] }],
      tools: [{ googleSearch: {} } as any],
    });
    
    const response = result.response;
    res.json({
      text: response.text(),
      groundingMetadata: response.candidates?.[0]?.groundingMetadata || null
    });
  } catch (error: any) {
    console.error('Grounded Search Route Error:', error);
    res.status(500).json({ error: error.message || 'Grounded search failed' });
  }
});

export default router;
