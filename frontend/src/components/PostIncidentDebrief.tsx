import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';
import { Panel } from './ui/Panel';
import { useDebriefStore } from '../store';
import ReactMarkdown from 'react-markdown';
import { InsuranceClaimButton } from './InsuranceClaimButton';

interface PostIncidentDebriefProps {
  incident: {
    id: string;
    crashType: string;
    address: string;
    timestamp: string;
    responseTime: string;
    units: string;
    triageScore: number;
    outcome: string;
    weather: string;
    aiComplianceScore: number;
  };
  onClose: () => void;
}

export const PostIncidentDebrief: React.FC<PostIncidentDebriefProps> = ({ incident, onClose }) => {
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const saveDebrief = useDebriefStore(state => state.saveDebrief);

  useEffect(() => {
    let isMounted = true;
    const generateDebrief = async () => {
      setIsGenerating(true);
      try {
        const prompt = `You are an emergency response analyst. Generate a comprehensive post-incident debrief for the following incident:

Incident ID: ${incident.id}
Type: Road collision, ${incident.crashType}
Location: ${incident.address}
Time of incident: ${incident.timestamp}
Response time: ${incident.responseTime}
Units dispatched: ${incident.units}
AI triage score: ${incident.triageScore}
Patient outcome: ${incident.outcome}
Weather at time: ${incident.weather}
AI recommendations followed: ${incident.aiComplianceScore}%

Generate a structured debrief with these sections:
1. INCIDENT SUMMARY (2 sentences)
2. RESPONSE TIMELINE ANALYSIS (what happened when, in order)
3. AI PERFORMANCE REVIEW (how well did AI triage perform vs actual outcome)
4. WHAT WENT WELL (3 specific points)
5. AREAS FOR IMPROVEMENT (3 specific points)
6. RECOMMENDATIONS FOR FUTURE INCIDENTS
7. ESTIMATED LIVES IMPACT (quantified)

Be specific, professional, and data-driven. Format in clean sections.`;

        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/debrief/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });

        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            if (isMounted) setIsGenerating(false);
            break;
          }

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'content_block_delta' && data.delta?.text) {
                  if (isMounted) {
                    setContent((prev) => prev + data.delta.text);
                  }
                } else if (data.type === 'error') {
                  if (isMounted) setError(data.message);
                }
              } catch (e) {
                console.debug('Incomplete chunk parsed', e);
              }
            }
          }
        }
      } catch (err) {
        console.error('Debrief stream error:', err);
        if (isMounted) {
          setError('Failed to connect to debrief service.');
          setIsGenerating(false);
        }
      }
    };

    generateDebrief();
    return () => { isMounted = false; };
  }, [incident]);

  const handleShare = () => {
    const debrief = {
      id: `deb-${Date.now()}`,
      incidentId: incident.id,
      timestamp: new Date().toISOString(),
      content
    };
    saveDebrief(debrief);
    
    // Mock copy link
    const mockLink = `https://roadsos.app/debrief/${debrief.id}`;
    navigator.clipboard.writeText(mockLink);
    alert(`Debrief saved! Shareable link copied to clipboard:\n${mockLink}`);
  };

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:p-0 print:bg-white print:block">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col print:max-h-none print:shadow-none print:w-full print:text-black"
      >
        <Panel className="flex flex-col h-full bg-(--nx-bg-surface) border-(--nx-border) print:border-none print:bg-white">
          <div className="p-6 border-b border-(--nx-border) flex justify-between items-center print:border-b-2 print:border-gray-300">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight print:text-black">Post-Incident Debrief</h2>
              <p className="text-sm text-(--nx-text-tertiary) mt-1 print:text-gray-600">ID: {incident.id} | Generated: {new Date().toLocaleString()}</p>
            </div>
            <div className="flex gap-3 print:hidden">
              <div className="px-3 py-1 bg-(--nx-bg-elevated) border border-(--nx-border) rounded-full text-xs text-(--nx-green-primary) font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-(--nx-green-primary) animate-pulse"></span>
                AI Confidence: 91%
              </div>
              <InsuranceClaimButton incidentId={incident.id} variant="secondary" />
              <Button variant="primary" onClick={handleShare} disabled={isGenerating}>Share</Button>
              <Button variant="danger-outline" onClick={onClose}>Close</Button>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1 prose prose-invert max-w-none print:prose-p:text-black print:prose-headings:text-black">
            {error && <div className="text-red-500">{error}</div>}
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ReactMarkdown>{content}</ReactMarkdown>
            </motion.div>
            
            {isGenerating && (
              <div className="flex items-center gap-3 text-(--nx-text-tertiary) mt-4 animate-pulse print:hidden">
                <div className="w-4 h-4 border-2 border-(--nx-text-tertiary) border-t-transparent rounded-full animate-spin" />
                Claude is analyzing incident data...
              </div>
            )}
          </div>
        </Panel>
      </motion.div>
      
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block, .print\\:block * {
            visibility: visible;
          }
          .print\\:block {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
