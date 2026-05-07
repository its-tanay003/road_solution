import { useState } from 'react';
import { useMedicalProfileStore } from '../../store/medicalProfileStore';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'];
const COMMON_ALLERGIES = ['Penicillin', 'Aspirin', 'Latex', 'Iodine', 'Sulfa drugs', 'None'];

export function MedicalProfile() {
  const { 
    bloodType, setBloodType, 
    conditions, setConditions, 
    contacts, setContacts,
    syncWithSupabase 
  } = useMedicalProfileStore();

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localAllergies, setLocalAllergies] = useState<string[]>(conditions);

  const handleSave = async () => {
    setLoading(true);
    try {
      setConditions(localAllergies);
      await syncWithSupabase();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      if (navigator.vibrate) navigator.vibrate(100);
    } catch (error) {
      console.error('Failed to sync medical profile:', error);
      alert('Failed to save to cloud. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAllergy = (a: string) => {
    if (a === 'None') {
      setLocalAllergies(['None']);
      return;
    }
    setLocalAllergies(prev =>
      prev.includes(a)
        ? prev.filter(x => x !== a)
        : [...prev.filter(x => x !== 'None'), a]
    );
  };

  return (
    <div className="p-4 max-w-[480px] mx-auto">
      <h2 className="text-xl font-medium mb-1">Medical profile</h2>
      <p className="text-[13px] opacity-60 mb-6">
        Sent automatically with your SOS. Encrypted on-device (AES-GCM-256).
      </p>

      {/* Blood group selector */}
      <div className="mb-6">
        <label className="text-[13px] opacity-70 block mb-2.5">
          Blood group
        </label>
        <div className="flex flex-wrap gap-2">
          {BLOOD_GROUPS.map(bg => (
            <button
              key={bg}
              onClick={() => setBloodType(bg)}
              className={`px-[18px] py-[10px] rounded-xl text-[15px] font-medium border-2 transition-all min-w-[64px] min-h-[48px] ${
                bloodType === bg 
                  ? 'border-emergency bg-emergency/15 text-sos-red' 
                  : 'border-white/15 bg-transparent hover:border-white/30'
              }`}
            >
              {bg}
            </button>
          ))}
        </div>
      </div>

      {/* Allergy selector */}
      <div className="mb-6">
        <label className="text-[13px] opacity-70 block mb-2.5">
          Known allergies / Conditions
        </label>
        <div className="flex flex-wrap gap-2">
          {COMMON_ALLERGIES.map(a => (
            <button
              key={a}
              onClick={() => toggleAllergy(a)}
              className={`px-[18px] py-[10px] rounded-xl text-sm border-2 transition-all min-h-[48px] ${
                localAllergies.includes(a)
                  ? 'border-warning bg-warning/15 text-orange-400'
                  : 'border-white/15 bg-transparent hover:border-white/30'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Emergency contact */}
      <div className="mb-8">
        <label className="text-[13px] opacity-70 block mb-2.5">
          Emergency contact (gets WhatsApp alert on SOS)
        </label>
        <div className="flex gap-0">
          <div className="px-3 bg-white/10 rounded-l-xl border border-white/15 border-r-0 flex items-center text-[15px] font-medium">
            +91
          </div>
          <input
            type="tel"
            value={contacts[0]?.phone || ''}
            onChange={e => {
              const phone = e.target.value.replace(/\D/g, '').slice(0, 10);
              setContacts([{ name: 'Emergency', phone, relationship: 'Contact' }]);
            }}
            placeholder="10-digit number"
            className="flex-1 h-[54px] px-4 rounded-r-xl border border-white/15 bg-white/5 text-inherit text-base box-border focus:outline-none focus:border-emergency/50 transition-colors"
          />
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={loading}
        className={`w-full h-[58px] rounded-2xl text-[17px] font-semibold transition-all shadow-lg ${
          loading ? 'opacity-70 cursor-not-allowed' : 'opacity-100'
        } ${
          saved ? 'bg-safe text-night' : 'bg-emergency text-white'
        }`}
      >
        {loading ? 'Saving to cloud...' : saved ? '✓ Saved successfully' : 'Save medical profile'}
      </button>

      <p className="text-[12px] opacity-45 text-center mt-4 leading-relaxed">
        Your data is encrypted with AES-GCM-256 before storage.<br />
        Synced securely to your private cloud profile.
      </p>
    </div>
  );
}
