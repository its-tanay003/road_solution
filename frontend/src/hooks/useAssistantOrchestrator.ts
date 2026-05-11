import { useCallback, useState } from 'react';
import axios from 'axios';
import { useAIAssistantStore } from '../store/aiAssistantStore';

export const useAssistantOrchestrator = () => {
  const { addMessage, language, incidentId, setIncidentId } = useAIAssistantStore();

  const sendToAI = useCallback(async (text?: string, imageBase64?: string) => {
    try {
      const id = incidentId || `incident_${Date.now()}`;
      if (!incidentId) setIncidentId(id);

      // If user sent text, add to UI immediately
      if (text && text !== "Camera Analysis Request") {
        addMessage({
          id: Date.now().toString(),
          role: 'user',
          content: text,
          timestamp: Date.now(),
        });
      }

      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/analyze`, {
        incidentId: id,
        textMessage: text,
        imageBase64: imageBase64,
        language: language || 'en'
      });

      return response.data;
    } catch (err) {
      console.error('Failed to start analysis:', err);
      throw err;
    }
  }, [incidentId, setIncidentId, addMessage, language]);

  return { sendToAI, incidentId };
};
