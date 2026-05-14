import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { AgentOutputs, MedicalData } from '../store/aiAssistantStore';

// Extend jsPDF type to include autoTable properties
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

export const generateMedicalReport = (
  referenceId: string,
  agentOutputs: AgentOutputs,
  conversationHistory: { role: string; content: string; timestamp: number }[]
) => {
  const doc = (new jsPDF() as unknown) as jsPDFWithAutoTable;
  const timestamp = new Date().toLocaleString();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(220, 38, 38); // red-600
  doc.text('YIRC EMERGENCY MEDICAL REPORT', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Generated on: ${timestamp}`, 14, 30);
  doc.text(`Reference: ${referenceId}`, 14, 35);
  
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 40, 196, 40);

  let currentY = 50;

  // 1. Triage Summary
  if (agentOutputs.triage) {
    const data = agentOutputs.triage as MedicalData;
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text('Triage Assessment', 14, currentY);
    
    const triageRows = [
      ['Estimated Severity', data.estimatedSeverity || 'Unknown'],
      ['Consciousness Level', data.consciousnessLevel || 'Not Assessed'],
      ['Observed Conditions', (data.observedConditions || []).join(', ') || 'None'],
      ['Urgency Indicators', (data.urgencyIndicators || []).join(', ') || 'None'],
    ];

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Field', 'Clinical Finding']],
      body: triageRows,
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38] },
    });

    currentY = doc.lastAutoTable.finalY + 15;
  }

  // 2. Vision Analysis
  if (agentOutputs.vision) {
    const data = agentOutputs.vision as MedicalData;
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text('Visual Trauma Analysis', 14, currentY);
    
    const visionRows = [
      ['Trauma Severity', data.severity || 'Unknown'],
      ['Primary Concerns', (data.primaryConcerns || []).join(', ') || 'None'],
      ['Recommended Unit', data.recommendedUnitType || 'General'],
      ['Immediate Actions', (data.immediateActions || []).join(', ') || 'None'],
    ];

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Field', 'Visual Assessment']],
      body: visionRows,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] }, // blue-600
    });

    currentY = doc.lastAutoTable.finalY + 15;
  }

  // 3. Vitals Report
  if (agentOutputs.vitals) {
    const data = agentOutputs.vitals as MedicalData;
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text('Vital Signs Assessment', 14, currentY);
    
    const vitalsRows = [
      ['Vital Status', data.vitalStatus || 'Unknown'],
      ['Abnormal Vitals', (data.abnormalVitals || []).join(', ') || 'None detected'],
      ['Possible Conditions', (data.possibleConditions || []).join(', ') || 'None identified'],
    ];

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Field', 'Vital Signs']],
      body: vitalsRows,
      theme: 'grid',
      headStyles: { fillColor: [5, 150, 105] }, // emerald-600
    });

    // currentY = doc.lastAutoTable.finalY + 15; // Unused but kept logic if needed
  }

  // 4. Conversation History (Condensed)
  doc.addPage();
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text('Incident Conversation Log', 14, 22);

  const historyRows = conversationHistory.map(msg => [
    new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    msg.role.toUpperCase(),
    msg.content.length > 100 ? msg.content.substring(0, 97) + '...' : msg.content
  ]);

  autoTable(doc, {
    startY: 30,
    head: [['Time', 'Role', 'Content']],
    body: historyRows,
    theme: 'striped',
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 30 },
      2: { cellWidth: 'auto' }
    }
  });

  // Footer on all pages
  const internal = doc.internal as {
    getNumberOfPages: () => number;
    pageSize: { height: number; width: number };
  };
  const pageCount = internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      'CONFIDENTIAL MEDICAL RECORD - YIRC AI ASSISTANT PROTOCOL',
      105,
      internal.pageSize.height - 10,
      { align: 'center' }
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      internal.pageSize.width - 20,
      internal.pageSize.height - 10
    );
  }

  doc.save(`YIRC_Medical_Report_${referenceId.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
};

