'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, Heart, Phone, MapPin, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (data: {
    name: string;
    phone: string;
    bloodGroup: string;
    conditions: string;
    address: string;
    contacts: { name: string; phone: string; relation: string }[];
  }) => void;
}

export function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('Unknown');
  const [conditions, setConditions] = useState('');
  const [address, setAddress] = useState('');
  const [contacts, setContacts] = useState<{ name: string; phone: string; relation: string }[]>([
    { name: '', phone: '', relation: '' },
    { name: '', phone: '', relation: '' },
  ]);

  const [error, setError] = useState('');

  // Auto-fill from local profile storage if exists
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('roadsos-sos');
      if (saved) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const parsed = JSON.parse(saved) as any;
          if (parsed.state?.location?.address) {
            setAddress(parsed.state.location.address);
          }
        } catch {}
      }
    }
  }, []);

  const handleContactChange = (index: number, key: string, val: string) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [key]: val };
    setContacts(updated);
    setError('');
  };

  const nextStep = () => {
    setError('');
    if (step === 1) {
      if (!name.trim()) return setError('Please enter your full name.');
      if (!phone.trim()) return setError('Please enter your phone number.');
      setStep(2);
    } else if (step === 2) {
      if (bloodGroup === 'Unknown') return setError('Please specify your blood group.');
      setStep(3);
    } else if (step === 3) {
      // Validate emergency contacts (min 2)
      const valid = contacts.filter((c) => c.name.trim() && c.phone.trim());
      if (valid.length < 2) {
        return setError('Please add at least 2 complete emergency contacts.');
      }
      // Complete!
      onComplete({
        name,
        phone,
        bloodGroup,
        conditions,
        address,
        contacts: valid,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Top Progress bar */}
          <div className="relative h-1.5 w-full bg-gray-800">
            <motion.div
              className="absolute left-0 top-0 bottom-0 bg-red-500"
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="p-6 flex-1 flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
              <Shield size={24} className="text-red-500 shrink-0" />
              <div>
                <h2 className="text-lg font-black tracking-tight text-white">Create Lifeline Profile</h2>
                <p className="text-gray-400 text-xs">Needed to configure SOS alerts & pings</p>
              </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 min-h-[220px]">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <p className="text-gray-300 text-sm font-semibold flex items-center gap-2">
                    <User size={16} className="text-red-400" /> Step 1: Personal Info
                  </p>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Full Name</label>
                    <input
                      value={name}
                      onChange={(e) => { setName(e.target.value); setError(''); }}
                      placeholder="John Doe"
                      className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-red-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Phone Number</label>
                    <input
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setError(''); }}
                      placeholder="+1 (555) 019-2834"
                      type="tel"
                      className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-red-500 transition-colors"
                    />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <p className="text-gray-300 text-sm font-semibold flex items-center gap-2">
                    <Heart size={16} className="text-red-400" /> Step 2: Medical Profile
                  </p>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => { setBloodGroup(e.target.value); setError(''); }}
                      className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-red-500 transition-colors"
                    >
                      <option value="Unknown">Select Blood Group</option>
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Medical Conditions / Allergies</label>
                    <input
                      value={conditions}
                      onChange={(e) => setConditions(e.target.value)}
                      placeholder="e.g. Asthma, Penicillin Allergy"
                      className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-red-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Home Address</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-4 top-3.5 text-gray-500" />
                      <input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="123 Main St, City, Country"
                        className="w-full bg-gray-800 border border-gray-700 rounded-2xl pl-11 pr-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-red-500 transition-colors"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <p className="text-gray-300 text-sm font-semibold flex items-center gap-2">
                    <Phone size={16} className="text-red-400" /> Step 3: SOS Contacts (Min 2)
                  </p>
                  {contacts.map((c, i) => (
                    <div key={i} className="bg-gray-950 p-3 border border-gray-850 rounded-2xl space-y-2">
                      <p className="text-[10px] font-bold text-gray-500 uppercase">Emergency Contact #{i + 1}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={c.name}
                          onChange={(e) => handleContactChange(i, 'name', e.target.value)}
                          placeholder="Contact Name"
                          className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                        />
                        <input
                          value={c.phone}
                          onChange={(e) => handleContactChange(i, 'phone', e.target.value)}
                          placeholder="+1 phone"
                          type="tel"
                          className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                        />
                      </div>
                      <input
                        value={c.relation}
                        onChange={(e) => handleContactChange(i, 'relation', e.target.value)}
                        placeholder="Relation (e.g., Sister, Spouse)"
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                      />
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Error display */}
            {error && (
              <p className="text-red-500 text-xs font-semibold mt-4 text-center">
                ⚠️ {error}
              </p>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between gap-3 mt-6">
              {step > 1 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2.5 rounded-2xl bg-gray-800 text-gray-300 text-sm font-semibold hover:bg-gray-705 transition-colors"
                >
                  Back
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={nextStep}
                className="flex items-center justify-center gap-1.5 bg-red-600 text-white rounded-2xl px-6 py-2.5 text-sm font-black shadow-lg hover:bg-red-500 transition-colors"
              >
                {step === 3 ? (
                  <>
                    <Check size={16} /> Save Profile
                  </>
                ) : (
                  <>
                    Next <ChevronRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
