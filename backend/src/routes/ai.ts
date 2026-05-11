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
    const { runVisionAgent } = await import('../agents/agentVision');
    
    const result = await runVisionAgent(imageBase64, context, patientProfile);
    res.json(result);
  } catch (error: any) {
    console.error('Vision Analysis Route Error:', error);
    res.status(500).json({ error: error.message || 'Vision analysis failed' });
  }
});

export default router;
