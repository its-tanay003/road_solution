import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Trash2, ArrowLeft, Building2, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Section = ({ icon: Icon, title, children }: { icon: any, title: string, children: React.ReactNode }) => (
  <div className="mb-10">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-(--clr-blue)/10 text-(--clr-blue) rounded-lg">
        <Icon size={20} />
      </div>
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
    </div>
    <div className="pl-11 text-(--clr-text-2) leading-relaxed space-y-4 text-sm md:text-base">
      {children}
    </div>
  </div>
);

export const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-(--clr-bg) text-(--clr-text) pb-20">
      <header className="sticky top-0 z-50 bg-(--clr-bg)/80 backdrop-blur-md border-b border-(--clr-border) px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            title="Go back"
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Privacy Policy</h1>
            <p className="text-[10px] font-mono text-(--clr-saffron) tracking-widest">DPDP ACT 2023 COMPLIANT</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-(--clr-blue)/5 border border-(--clr-blue)/20 rounded-2xl p-6 mb-12">
            <p className="text-sm leading-relaxed">
              <strong>ROADSoS</strong> ("we", "us", "our") is committed to protecting the digital personal data of our users in India. 
              This policy outlines how we process data in accordance with the <strong>Digital Personal Data Protection (DPDP) Act 2023</strong>.
            </p>
          </div>

          <Section icon={Building2} title="Data Controller">
            <p>
              The data controller for ROADSoS is <strong>[Team Name / Institute Name]</strong>, participating in the Smart India Hackathon 2026. 
              We act as a Fiduciary for your emergency data.
            </p>
          </Section>

          <Section icon={Eye} title="Data We Collect">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Emergency Location:</strong> Real-time GPS coordinates during SOS triggers.</li>
              <li><strong>Medical Profile:</strong> Blood group, allergies, and chronic conditions (encrypted).</li>
              <li><strong>Incident Data:</strong> Photos, voice notes, and bystander descriptions of road accidents.</li>
              <li><strong>Identity Data:</strong> Name and phone number for emergency contact notification.</li>
            </ul>
          </Section>

          <Section icon={Lock} title="Purpose of Processing">
            <p>
              In accordance with Section 4 of the DPDP Act, we process data only for <strong>specified, lawful purposes</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Facilitating immediate emergency response and dispatch.</li>
              <li>Providing vital medical information to first responders.</li>
              <li>Notifying registered emergency contacts during an incident.</li>
            </ul>
          </Section>

          <Section icon={Shield} title="Data Security">
            <p>
              We implement production-standard technical and organizational measures to prevent data breaches:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>End-to-end encryption for medical profiles.</li>
              <li>Obfuscated local storage and secure API communication (HTTPS/WSS).</li>
              <li>Strict rate limiting and input sanitization to prevent unauthorized access.</li>
            </ul>
          </Section>

          <Section icon={Trash2} title="Retention & Erasure">
            <p>
              <strong>Retention:</strong> Incident logs are retained for 90 days for emergency audit purposes, after which they are permanently deleted.
            </p>
            <p>
              <strong>Right to Erasure:</strong> You have the right to request the deletion of your data. You can trigger a full data wipe through the "Delete my data" option in the Settings panel.
            </p>
          </Section>

          <Section icon={UserCheck} title="Your Rights (DPDP Act 2023)">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Section 12:</strong> Right to access information about your personal data.</li>
              <li><strong>Section 13:</strong> Right to correction and erasure of personal data.</li>
              <li><strong>Section 14:</strong> Right of grievance redressal.</li>
            </ul>
          </Section>

          <div className="mt-20 pt-10 border-t border-(--clr-border) text-center">
            <p className="text-xs text-(--clr-text-2)">
              Last Updated: May 7, 2026<br />
              Grievance Officer: [Team Lead Name] | [Email Address]
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
