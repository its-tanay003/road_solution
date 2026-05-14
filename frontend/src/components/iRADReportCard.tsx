import React from 'react';
import { motion } from 'framer-motion';
import { FileCheck, Download, Printer, ShieldCheck, Globe, Clock, MapPin } from 'lucide-react';
import type { iRADReport } from '../lib/iradReporter';

interface IRADReportCardProps {
  report: iRADReport;
  ackId: string;
}

export const IRADReportCard: React.FC<IRADReportCardProps> = ({ report, ackId }) => {
  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${report.reportId}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-nx-bg-elevated border border-nx-green-primary/30 rounded-2xl overflow-hidden shadow-2xl max-w-4xl mx-auto my-8"
    >
      {/* Header */}
      <div className="bg-nx-green-primary/10 p-6 border-b border-nx-green-primary/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-nx-green-primary/20 rounded-xl flex items-center justify-center text-nx-green-primary">
            <FileCheck size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tighter uppercase leading-none">iRAD MoRTH Report</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-black text-nx-green-primary uppercase tracking-widest px-2 py-0.5 bg-nx-green-primary/10 rounded-full border border-nx-green-primary/20">Auto Filed</span>
              <span className="text-[10px] font-mono text-slate-400">{ackId}</span>
            </div>
          </div>
        </div>
        
        {/* Ministry Seal Mockup */}
        <div className="flex items-center gap-3 pr-2">
          <svg width="40" height="40" viewBox="0 0 100 100" className="opacity-80">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" className="text-nx-green-primary" />
            <path d="M50 20 L60 40 H40 Z M50 80 L40 60 H60 Z M20 50 L40 40 V60 Z M80 50 L60 60 V40 Z" fill="currentColor" className="text-nx-green-primary" />
            <circle cx="50" cy="50" r="10" fill="currentColor" className="text-nx-green-primary" />
          </svg>
          <div className="text-[8px] font-black text-slate-400 uppercase leading-tight tracking-widest">
            Ministry of Road Transport<br />& Highways (MoRTH)
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Location & Details */}
        <div className="space-y-6">
          <SectionHeader icon={MapPin} title="Accident Location" />
          <div className="grid grid-cols-2 gap-4">
            <DataField label="Road Type" value={report.accidentLocation.roadType} />
            <DataField label="NH Number" value={report.accidentLocation.nhNumber || 'N/A'} />
            <DataField label="District" value={report.accidentLocation.districtName} />
            <DataField label="State" value={report.accidentLocation.stateName} />
            <DataField label="Landmark" value={report.accidentLocation.nearestLandmark || 'N/A'} className="col-span-2" />
          </div>

          <SectionHeader icon={Clock} title="Incident Details" />
          <div className="grid grid-cols-2 gap-4">
            <DataField label="Severity" value={report.accidentDetails.severity} color="text-nx-red-primary" />
            <DataField label="Vehicles" value={report.accidentDetails.vehiclesInvolved.toString()} />
            <DataField label="Injuries" value={report.accidentDetails.personsInjured.toString()} />
            <DataField label="Weather" value={report.accidentDetails.weatherCondition} />
          </div>
        </div>

        {/* Response & AI Meta */}
        <div className="space-y-6">
          <SectionHeader icon={ShieldCheck} title="Response Performance" />
          <div className="grid grid-cols-2 gap-4">
            <DataField label="SOS Trigger" value={new Date(report.responseDetails.sosTriggeredAt).toLocaleTimeString()} />
            <DataField label="Response Time" value={`${report.responseDetails.responseTimeSeconds}s`} />
            <DataField label="Ambulance" value={report.responseDetails.ambulanceService} className="col-span-2" />
            <DataField label="Hospital" value={report.responseDetails.hospitalDestination} className="col-span-2" />
          </div>

          <SectionHeader icon={Globe} title="AI Triage Metadata" />
          <div className="grid grid-cols-2 gap-4">
            <DataField label="Triage Score" value={`${report.responseDetails.aiTriageScore}%`} />
            <DataField label="Confidence" value={`${report.responseDetails.aiConfidenceScore}%`} />
            <DataField label="Model" value={report.aiMetadata.triageModel} className="col-span-2" />
          </div>
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="p-6 bg-white/2 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-nx-green-primary/10 rounded-full flex items-center justify-center text-nx-green-primary">
            <CheckCircleIcon size={16} />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Submitted to iRAD Central Database</span>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={handleDownloadJSON}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-lg border border-white/10 transition-all"
          >
            <Download size={14} /> JSON
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-nx-blue-primary hover:bg-nx-blue-hover text-white font-black uppercase tracking-widest text-[10px] rounded-lg transition-all shadow-lg shadow-nx-blue-primary/20"
          >
            <Printer size={14} /> PDF Report
          </button>
        </div>
      </div>
    </motion.div>
  );
};

interface SectionHeaderProps {
  icon: React.ComponentType<{ size?: number }>;
  title: string;
}

const SectionHeader = ({ icon: Icon, title }: SectionHeaderProps) => (
  <div className="flex items-center gap-2 text-nx-text-dim border-b border-white/5 pb-2">
    <Icon size={14} />
    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{title}</span>
  </div>
);

interface DataFieldProps {
  label: string;
  value: string;
  color?: string;
  className?: string;
}

const DataField = ({ label, value, color, className }: DataFieldProps) => (
  <div className={`space-y-1 ${className}`}>
    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
    <p className={`text-xs font-bold font-mono uppercase truncate ${color || 'text-white'}`}>{value}</p>
  </div>
);

const CheckCircleIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
