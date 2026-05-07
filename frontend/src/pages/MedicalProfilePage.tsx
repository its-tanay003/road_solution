import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Heart, 
  Phone, 
  ShieldCheck, 
  AlertCircle, 
  Check, 
  Save,
  Globe,
  Plus
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMedicalProfileStore, type MedicalProfile } from '../store/medicalProfileStore';
import { useNavigate } from 'react-router-dom';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
const CONDITIONS = [
  'Diabetic', 
  'Heart Condition', 
  'Epilepsy', 
  'Blood Thinners', 
  'Asthma', 
  'None'
] as const;

export const MedicalProfilePage: React.FC = () => {
  const { i18n } = useTranslation();
  const store = useMedicalProfileStore();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<MedicalProfile>({
    name: store.name,
    age: store.age,
    bloodType: store.bloodType,
    conditions: store.conditions,
    allergies: store.allergies,
    medications: store.medications,
    emergencyContact1Name: store.emergencyContact1Name,
    emergencyContact1Phone: store.emergencyContact1Phone,
    emergencyContact2Name: store.emergencyContact2Name,
    emergencyContact2Phone: store.emergencyContact2Phone,
    language: store.language,
    profileComplete: store.profileComplete
  });

  const [showToast, setShowToast] = useState(false);

  const handleLanguageChange = (lang: 'en' | 'hi' | 'ta') => {
    setFormData(prev => ({ ...prev, language: lang }));
    i18n.changeLanguage(lang);
  };

  const toggleCondition = (condition: string) => {
    setFormData(prev => {
      if (condition === 'None') {
        return { ...prev, conditions: ['None'] };
      }
      const newConditions = prev.conditions.filter(c => c !== 'None');
      if (newConditions.includes(condition)) {
        return { ...prev, conditions: newConditions.filter(c => c !== condition) };
      }
      return { ...prev, conditions: [...newConditions, condition] };
    });
  };

  const handleSave = () => {
    store.setProfile({ ...formData, profileComplete: true });
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      navigate('/');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-[#E8EDF5] p-6 pb-32">
      <div className="max-w-2xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
              Medical <span className="text-[#FF9933]">Profile</span>
            </h1>
            <p className="text-gray-500 text-xs font-bold tracking-widest mt-1 uppercase">
              Zero-Trust Local Storage
            </p>
          </div>
          <div className="w-12 h-12 bg-[#FF9933]/10 border border-[#FF9933]/20 rounded-2xl flex items-center justify-center text-[#FF9933]">
            <ShieldCheck size={24} />
          </div>
        </div>

        {/* Section 1: Personal Info */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-gray-400">
            <User size={18} />
            <h2 className="text-sm font-black uppercase tracking-widest italic">Personal Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
              <input 
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-[#FF9933]/50 focus:bg-[#FF9933]/5 transition-all outline-none"
                placeholder="e.g. John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Age</label>
              <input 
                type="number"
                value={formData.age}
                onChange={e => setFormData(prev => ({ ...prev, age: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-[#FF9933]/50 focus:bg-[#FF9933]/5 transition-all outline-none"
                placeholder="25"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Globe size={12} /> Preferred Language
            </label>
            <div className="flex gap-3">
              {(['en', 'hi', 'ta'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all border ${
                    formData.language === lang 
                    ? 'bg-[#FF9933] border-[#FF9933] text-black shadow-[0_0_20px_rgba(255,153,51,0.3)]' 
                    : 'bg-white/5 border-white/10 text-gray-400'
                  }`}
                >
                  {lang === 'en' ? 'EN' : lang === 'hi' ? 'हि' : 'த'}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: Medical Data */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-gray-400">
            <Heart size={18} />
            <h2 className="text-sm font-black uppercase tracking-widest italic">Medical Data</h2>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Blood Type</label>
            <div className="grid grid-cols-4 gap-3">
              {BLOOD_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setFormData(prev => ({ ...prev, bloodType: type }))}
                  className={`py-4 rounded-2xl font-black transition-all border ${
                    formData.bloodType === type 
                    ? 'bg-[#FF9933]/20 border-[#FF9933] text-[#FF9933]' 
                    : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Medical Conditions</label>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map(condition => (
                <button
                  key={condition}
                  onClick={() => toggleCondition(condition)}
                  className={`px-5 py-3 rounded-full text-xs font-bold transition-all border ${
                    formData.conditions.includes(condition)
                    ? 'bg-[#FF9933] border-[#FF9933] text-black'
                    : 'bg-white/5 border-white/10 text-gray-500'
                  }`}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Allergies</label>
              <textarea 
                rows={3}
                value={formData.allergies}
                onChange={e => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-[#FF9933]/50 focus:bg-[#FF9933]/5 transition-all outline-none resize-none"
                placeholder="e.g. Peanuts, Penicillin..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Current Medications</label>
              <textarea 
                rows={3}
                value={formData.medications}
                onChange={e => setFormData(prev => ({ ...prev, medications: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-[#FF9933]/50 focus:bg-[#FF9933]/5 transition-all outline-none resize-none"
                placeholder="e.g. Metformin 500mg..."
              />
            </div>
          </div>
        </section>

        {/* Section 3: Emergency Contacts */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-gray-400">
            <Phone size={18} />
            <h2 className="text-sm font-black uppercase tracking-widest italic">Emergency Contacts</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-[#FF9933] uppercase tracking-[0.2em] ml-1">Primary Contact</h3>
              <div className="space-y-4">
                <input 
                  type="text"
                  placeholder="Name"
                  value={formData.emergencyContact1Name}
                  onChange={e => setFormData(prev => ({ ...prev, emergencyContact1Name: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-[#FF9933]/50 outline-none"
                />
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-sm">+91</span>
                  <input 
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.emergencyContact1Phone}
                    onChange={e => setFormData(prev => ({ ...prev, emergencyContact1Phone: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-5 py-4 focus:border-[#FF9933]/50 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 opacity-70 focus-within:opacity-100 transition-opacity">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1 italic">Secondary (Optional)</h3>
              <div className="space-y-4">
                <input 
                  type="text"
                  placeholder="Name"
                  value={formData.emergencyContact2Name}
                  onChange={e => setFormData(prev => ({ ...prev, emergencyContact2Name: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-[#FF9933]/50 outline-none"
                />
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-sm">+91</span>
                  <input 
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.emergencyContact2Phone}
                    onChange={e => setFormData(prev => ({ ...prev, emergencyContact2Phone: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-5 py-4 focus:border-[#FF9933]/50 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <button 
          onClick={handleSave}
          className="w-full bg-[#FF9933] text-black font-black py-5 rounded-3xl shadow-[0_20px_40px_rgba(255,153,51,0.2)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
        >
          <Save size={20} className="group-hover:rotate-12 transition-transform" />
          SAVE PROFILE
        </button>

      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-10 left-0 right-0 z-50 flex justify-center px-6 pointer-events-none"
          >
            <div className="bg-[#00C853] text-black px-6 py-4 rounded-2xl flex items-center gap-3 shadow-[0_20px_50px_rgba(0,200,83,0.3)] border border-[#00C853]/20">
              <div className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center">
                <Check size={18} />
              </div>
              <span className="font-black uppercase tracking-widest text-xs">Profile saved securely</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
