import { useState, type FC } from 'react';
import { Button } from './ui/Button';
import { FileText, Download, CheckCircle, AlertCircle } from 'lucide-react';
import type { InsuranceClaimData } from '../utils/generateClaimPDF';
import { generateClaimPDF } from '../utils/generateClaimPDF';
import { useSosStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { logger } from '../lib/logger';

interface InsuranceClaimButtonProps {
  incidentId: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger-outline';
}

export const InsuranceClaimButton: FC<InsuranceClaimButtonProps> = ({ 
  incidentId, 
  variant = 'primary' 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const incident = useSosStore(state => 
    state.closedIncidents.find(inc => inc.id === incidentId)
  );
  
  // Localized VAAHAN vehicle analytics fallback data for export capability
  const vaahanData = {
    plate: 'TN 09 AZ 4521',
    model: 'Maruti Suzuki Swift VXI (2019)',
    owner: 'RAJESH KUMAR (NAME_WITHHELD)',
    insurance: 'VALID (MAR 2026)',
    puc: 'VALID (NOV 2025)'
  };

  const handleGenerate = async () => {
    if (!incident) {
      setError("Incident data not found");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Handle location being potentially a string in the store
      const incidentLocation = typeof incident.location === 'string' 
        ? { lat: 0, lng: 0 } 
        : (incident.location || { lat: 0, lng: 0 });

      // Handle weather being a Record or missing
      const weatherString = typeof incident.weather === 'string'
        ? incident.weather
        : (incident.weather as any)?.main || (incident.weather as any)?.description || 'Clear';

      const claimData: InsuranceClaimData = {
        incidentId: incident.id,
        timestamp: incident.timestamp ? new Date(incident.timestamp).getTime() : Date.now(),
        location: incidentLocation,
        vaahan: {
          plate: vaahanData.plate,
          model: vaahanData.model,
          owner: vaahanData.owner,
          insurance: vaahanData.insurance,
          puc: vaahanData.puc
        },
        telemetry: {
          speed: 74, // Simulated impact speed
          gForce: { x: 4.2, y: 1.8, z: 0.5 },
          impactAngle: 'Front-Left (45 deg)',
          weather: weatherString,
          roadType: 'National Highway (NH-48)'
        },
        triage: {
          severity: (incident.triageScore || 0) > 70 ? 'CRITICAL' : 'MODERATE',
          confidence: 94,
          summary: "Automated collision detection triggered. High G-force recorded. Multi-unit dispatch initiated via ROADSoS emergency protocol.",
          injuries: ['Lacerations', 'Potential Concussion'],
          driverBehaviorScore: 88
        },
        evidence: {
          bystanderReports: 3,
          photosTaken: 4,
          witnessCount: 2
        },
        timeline: (incident.timeline || []).map((t: any) => ({
          time: typeof t.time === 'number' ? new Date(t.time).toLocaleTimeString() : String(t.time),
          event: t.event,
          responder: t.responder || 'System',
          status: t.status || 'Completed'
        }))
      };

      await generateClaimPDF(claimData);
      setIsDone(true);
      setTimeout(() => setIsDone(false), 3000);
    } catch (err) {
      logger.error("PDF Generation failed:", err);
      setError("Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative inline-block">
      <Button
        variant={variant}
        onClick={handleGenerate}
        disabled={isGenerating || !incident}
        className="flex items-center gap-2"
      >
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
            />
          ) : isDone ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <CheckCircle className="w-4 h-4 text-green-400" />
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <FileText className="w-4 h-4" />
            </motion.div>
          )}
        </AnimatePresence>
        
        <span>
          {isGenerating ? 'Generating Claim...' : isDone ? 'Claim Exported' : 'Export Insurance Claim'}
        </span>
        {!isGenerating && !isDone && <Download className="w-3 h-3 opacity-50" />}
      </Button>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-2 left-0 right-0 bg-red-500/10 border border-red-500/50 rounded-md p-2 text-[10px] text-red-400 flex items-center gap-2 backdrop-blur-sm z-10"
        >
          <AlertCircle className="w-3 h-3" />
          {error}
        </motion.div>
      )}
    </div>
  );
};
