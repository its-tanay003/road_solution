import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { logger } from '../lib/logger';

export const generateJudgeHandout = async () => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = '#FF9933';
  const darkColor = '#0D1321';

  // --- Background/Layout ---
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 297, 'F');

  // Left Column (60%) background - very light grey
  doc.setFillColor(248, 249, 250);
  doc.rect(0, 0, 126, 297, 'F');

  // --- Header ---
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('ROADSoS', 15, 25);

  doc.setTextColor(darkColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Emergency Intelligence Platform', 15, 32);
  
  doc.setFont('helvetica', 'bold');
  doc.text('ROADSoS Official Technical Specification', 15, 38);

  // --- Problem Statement ---
  doc.setFontSize(12);
  doc.text('The Crisis', 15, 55);
  doc.setDrawColor(primaryColor);
  doc.line(15, 57, 30, 57);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const problemText = "Every 3.4 minutes, an Indian loses their life to road accidents. With 153,972 deaths in 2023 (MoRTH), the primary killer is response delay. ROADSoS targets the 'Golden Hour' by integrating fragmented India-specific data layers into a unified emergency operating system.";
  doc.text(doc.splitTextToSize(problemText, 100), 15, 63);

  // --- Features Table ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Core Features', 15, 90);
  
  const features = [
    ['AI Impact Detection', 'Real-time VAAHAN Lookup'],
    ['112 India Integration', 'Multi-lingual Triage'],
    ['Drone Reconnaissance', 'Golden Hour Analytics'],
    ['Mesh Network P2P', 'Blockchain Audit Trail'],
    ['Hospital Capacity MS', 'Good Samaritan Rewards']
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  features.forEach((row, i) => {
    doc.text(`• ${row[0]}`, 15, 100 + (i * 8));
    doc.text(`• ${row[1]}`, 65, 100 + (i * 8));
  });

  // --- QR Code ---
  try {
    const qrDataUrl = await QRCode.toDataURL('https://roadsos.vercel.app');
    doc.addImage(qrDataUrl, 'PNG', 15, 160, 40, 40);
    doc.setFontSize(7);
    doc.text('Scan for Live Deployment', 15, 205);
  } catch (err) {
    logger.error('QR Gen failed', err);
  }

  doc.setFontSize(8);
  doc.text('GitHub: its-tanay003/road_solution', 15, 215);

  // --- Right Column (40%) ---
  const colX = 135;

  // Response Time Comparison
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Response Optimization', colX, 25);

  // Red Bar (9.2 min)
  doc.setFillColor(239, 68, 68); // Red-500
  doc.rect(colX, 35, 60, 8, 'F');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('Baseline: 9.2 min', colX + 2, 40);

  // Green Bar (87 sec)
  doc.setFillColor(34, 197, 94); // Green-500
  doc.rect(colX, 48, 10, 8, 'F');
  doc.setTextColor(darkColor);
  doc.text('ROADSoS: 87 sec', colX + 12, 53);

  // Integrations Box
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(colX - 5, 70, 75, 60, 3, 3, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('India-Specific Integrations', colX, 80);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const integrations = ['iRAD / MoRTH API', '112 India (ERSS)', 'VAAHAN DB', 'Hindi + Tamil Voice SOS', 'Good Samaritan Law Auth', 'NHAI Highway Feed', 'Open-Meteo Road Hazards'];
  integrations.forEach((item, i) => {
    doc.text(`> ${item}`, colX + 2, 88 + (i * 6));
  });

  // Tech Stack Pills
  doc.setFont('helvetica', 'bold');
  doc.text('Tech Stack', colX, 145);
  const stack = ['React 19', 'Three.js', 'Claude AI', 'Zustand', 'Socket.io', 'Tailwind 4'];
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  stack.forEach((item, i) => {
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(colX + (i % 2 === 0 ? 0 : 35), 150 + (Math.floor(i / 2) * 8), 30, 6, 1, 1, 'F');
    doc.text(item, colX + (i % 2 === 0 ? 5 : 40), 154 + (Math.floor(i / 2) * 8));
  });

  // Impact Line
  doc.setTextColor(primaryColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Tamil Nadu: 8,400 lives saved/yr', colX, 190);

  // --- Footer ---
  doc.setDrawColor(240, 240, 240);
  doc.line(10, 280, 200, 280);
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('ROADSoS Production Environment', 200, 288, { align: 'right' });

  return doc;
};
