import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { AgentOutputs, Message } from '../store/aiAssistantStore';

export const generateMedicalReport = (
  incidentId: string | null,
  agentOutputs: AgentOutputs,
  conversationHistory: Message[]
) => {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();

  // Header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('ROADSoS MEDICAL REPORT', 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Incident ID: ${incidentId || 'N/A'}`, 140, 20);
  doc.text(`Generated: ${timestamp}`, 140, 28);

  let yPos = 50;

  // 1. Triage Section
  if (agentOutputs.triage) {
    const data = agentOutputs.triage as Record<string, any>;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('1. EMERGENCY TRIAGE ASSESSMENT', 20, yPos);
    yPos += 10;

    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: [
        ['Severity Level', String(data.severity || 'UNKNOWN')],
        ['Primary Concerns', Array.isArray(data.primaryConcerns) ? data.primaryConcerns.join(', ') : 'N/A'],
        ['Recommended Transport', String(data.recommendedUnitType || 'N/A')],
        ['Est. Deterioration Time', String(data.estimatedTimeToDeterioration || 'N/A')],
        ['Immediate Actions', Array.isArray(data.immediateActions) ? data.immediateActions.join(', ') : 'N/A'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }, // blue-500
    });
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // 2. Visual Diagnosis Section
  if (agentOutputs.vision) {
    const data = agentOutputs.vision as Record<string, any>;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('2. VISUAL DIAGNOSIS', 20, yPos);
    yPos += 10;

    autoTable(doc, {
      startY: yPos,
      head: [['Observation', 'Details']],
      body: [
        ['Estimated Severity', String(data.estimatedSeverity || 'N/A')],
        ['Observed Conditions', Array.isArray(data.observedConditions) ? data.observedConditions.join(', ') : 'N/A'],
        ['Urgency Indicators', Array.isArray(data.urgencyIndicators) ? data.urgencyIndicators.join(', ') : 'N/A'],
        ['Consciousness Level', String(data.consciousnessLevel || 'N/A')],
        ['Additional Notes', String(data.additionalObservations || 'N/A')],
      ],
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] }, // blue-600
    });
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // 3. Vital Signs Section
  if (agentOutputs.vitals) {
    const data = agentOutputs.vitals as Record<string, any>;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('3. VITAL SIGN ANALYSIS', 20, yPos);
    yPos += 10;

    autoTable(doc, {
      startY: yPos,
      head: [['Category', 'Assessment']],
      body: [
        ['Overall Status', String(data.vitalStatus || 'N/A')],
        ['Abnormal Vitals', Array.isArray(data.abnormalVitals) ? data.abnormalVitals.join(', ') : 'NONE DETECTED'],
        ['Possible Conditions', Array.isArray(data.possibleConditions) ? data.possibleConditions.join(', ') : 'N/A'],
        ['Recommendations', Array.isArray(data.recommendations) ? data.recommendations.join(', ') : 'N/A'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68] }, // red-500
    });
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // 4. Identity Section
  if (agentOutputs.identity) {
    const data = agentOutputs.identity as Record<string, any>;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('4. IDENTITY VERIFICATION', 20, yPos);
    yPos += 10;

    autoTable(doc, {
      startY: yPos,
      head: [['Status', 'Identity Details', 'Confidence']],
      body: [
        [String(data.status || 'UNKNOWN'), String(data.identityDetails || 'N/A'), `${Math.round((Number(data.confidence) || 0) * 100)}%`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [14, 165, 233] }, // sky-500
    });
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // 5. Conversation Summary
  if (yPos > 240) {
    doc.addPage();
    yPos = 30;
  }
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('5. INCIDENT LOG SUMMARY', 20, yPos);
  yPos += 10;

  const logs = conversationHistory
    .filter(m => !m.content.startsWith('{') && !m.content.startsWith('['))
    .slice(-10) // Last 10 relevant messages
    .map(m => [
      new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      m.role === 'user' ? 'USER' : (m.agent?.toUpperCase() || 'AI'),
      m.content.length > 100 ? m.content.substring(0, 100) + '...' : m.content
    ]);

  if (logs.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [['Time', 'Source', 'Message Content']],
      body: logs,
      theme: 'grid',
      headStyles: { fillColor: [71, 85, 105] }, // slate-600
    });
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('No relevant chat logs recorded.', 25, yPos + 5);
  }

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    doc.text('CONFIDENTIAL MEDICAL RECORD - ROADSoS AI ASSISTANT', 105, 285, { align: 'center' });
  }

  doc.save(`ROADSoS_Report_${incidentId || 'Unknown'}_${Date.now()}.pdf`);
};
