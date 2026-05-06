import React, { useState } from 'react';
import { FileText, Loader2, Download } from 'lucide-react';
import { generateIncidentPDF, type IncidentReportData } from '../utils/generateIncidentPDF';
import { useSosStore } from '../store';
import { logger } from '../lib/logger';

const SYSTEM_INCIDENT_REPORT: IncidentReportData = {
  id: "RS-2026-CH-9921",
  timestamp: new Date().toLocaleString(),
  location: { lat: 13.0067, lng: 80.2206 }, // Near IIT Madras
  detectionMethod: 'G-Force',
  aiTriage: {
    severity: 'CRITICAL',
    confidence: 94,
    recommendedUnit: 'ALS',
    summary: 'High-speed impact detected via smartphone accelerometer. Rapid pulse fluctuation and localized trauma indicated by vision-AI analysis.'
  },
  timeline: [
    { time: '02:14:05', event: 'G-Force Spike (12.4G) Detected', responder: 'System', status: 'INITIATED' },
    { time: '02:14:15', event: 'SOS Broadcast via Mesh + Internet', responder: 'System', status: 'ALERTED' },
    { time: '02:14:30', event: 'AI Triage Completed', responder: 'ROADSoS AI', status: 'PROCESSED' },
    { time: '02:15:10', event: 'Ambulance Alpha-47 Dispatched', responder: 'Chennai EMS', status: 'EN ROUTE' },
    { time: '02:18:45', event: 'On-Scene Arrival', responder: 'Unit A-47', status: 'ON SCENE' },
  ],
  resources: [
    { name: 'MIOT International', type: 'Level 1 Trauma', eta: '6m 20s', actualArrival: '02:22:15', responseTime: '8m 10s' },
    { name: 'Unit Alpha-47', type: 'ALS Ambulance', eta: '4m 30s', actualArrival: '02:18:45', responseTime: '4m 40s' },
  ],
  victimData: {
    ageRange: '25-35',
    injuries: ['Multiple Lacerations', 'Possible Tibia Fracture', 'Concussion'],
    consciousness: 'Semi-Conscious'
  }
};

export const DownloadReportButton: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const isActive = useSosStore(state => state.isActive);

  const handleDownload = async () => {
    setIsGenerating(true);
    // Add small delay to simulate processing and show the cool spinner
    await new Promise(resolve => setTimeout(resolve, 1500));
    try {
      await generateIncidentPDF(SYSTEM_INCIDENT_REPORT);
    } catch (error) {
      logger.error('Failed to generate PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isActive || isGenerating}
      className={`
        relative flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300
        ${isActive 
          ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed border border-gray-700' 
          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-95'
        }
        ${isGenerating ? 'pr-12' : ''}
      `}
    >
      {isGenerating ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <FileText className="w-5 h-5" />
      )}
      <span>{isGenerating ? 'Generating...' : 'Download Incident Report'}</span>
      
      {!isActive && !isGenerating && (
        <Download className="w-4 h-4 opacity-50" />
      )}
      
      {isActive && (
        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-amber-500 text-[10px] text-black font-bold rounded-full animate-pulse">
          INCIDENT ACTIVE
        </div>
      )}
    </button>
  );
};
