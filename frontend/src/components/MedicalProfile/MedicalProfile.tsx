import { useState } from 'react';
import { useSettingsStore } from '../../store/settingsStore';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'];
const COMMON_ALLERGIES = ['Penicillin', 'Aspirin', 'Latex', 'Iodine', 'Sulfa drugs', 'None'];

export function MedicalProfile() {
  const { bloodGroup, setBloodGroup, allergies, setAllergies, emergencyContact, setEmergencyContact } = useSettingsStore();
  const [saved, setSaved] = useState(false);
  const [localAllergies, setLocalAllergies] = useState<string[]>(allergies);

  const handleSave = () => {
    setAllergies(localAllergies);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    if (navigator.vibrate) navigator.vibrate(100);
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

  const inputStyle: React.CSSProperties = {
    flex: 1, height: 54, padding: '0 16px',
    borderRadius: '0 12px 12px 0',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.05)',
    color: 'inherit', fontSize: 16, boxSizing: 'border-box',
  };

  return (
    <div style={{ padding: '1rem', maxWidth: 480, margin: '0 auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>Medical profile</h2>
      <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 24 }}>
        Sent automatically with your SOS. Encrypted on-device (AES-GCM-256).
      </p>

      {/* Blood group selector */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 13, opacity: 0.7, display: 'block', marginBottom: 10 }}>
          Blood group
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {BLOOD_GROUPS.map(bg => (
            <button
              key={bg}
              onClick={() => setBloodGroup(bg)}
              style={{
                padding: '10px 18px', borderRadius: 12, fontSize: 15, fontWeight: 500,
                border: `2px solid ${bloodGroup === bg ? '#FF1744' : 'rgba(255,255,255,0.15)'}`,
                background: bloodGroup === bg ? 'rgba(255,23,68,0.15)' : 'transparent',
                color: bloodGroup === bg ? '#FF6B7A' : 'inherit',
                cursor: 'pointer', minWidth: 64, minHeight: 48,
                transition: 'all 0.15s ease',
              }}
            >
              {bg}
            </button>
          ))}
        </div>
      </div>

      {/* Allergy selector */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 13, opacity: 0.7, display: 'block', marginBottom: 10 }}>
          Known allergies
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {COMMON_ALLERGIES.map(a => (
            <button
              key={a}
              onClick={() => toggleAllergy(a)}
              style={{
                padding: '10px 18px', borderRadius: 12, fontSize: 14,
                border: `2px solid ${localAllergies.includes(a) ? '#FF9800' : 'rgba(255,255,255,0.15)'}`,
                background: localAllergies.includes(a) ? 'rgba(255,152,0,0.15)' : 'transparent',
                color: localAllergies.includes(a) ? '#FFB74D' : 'inherit',
                cursor: 'pointer', minHeight: 48, transition: 'all 0.15s ease',
              }}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Emergency contact */}
      <div style={{ marginBottom: 32 }}>
        <label style={{ fontSize: 13, opacity: 0.7, display: 'block', marginBottom: 10 }}>
          Emergency contact (gets WhatsApp alert on SOS)
        </label>
        <div style={{ display: 'flex', gap: 0 }}>
          <div style={{
            padding: '0 12px', background: 'rgba(255,255,255,0.08)',
            borderRadius: '12px 0 0 12px',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRight: 'none',
            display: 'flex', alignItems: 'center', fontSize: 15, fontWeight: 500,
          }}>
            +91
          </div>
          <input
            type="tel"
            value={emergencyContact}
            onChange={e => setEmergencyContact(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="10-digit number"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        style={{
          width: '100%', height: 58, borderRadius: 16, fontSize: 17, fontWeight: 600,
          background: saved ? '#1D9E75' : '#FF1744', border: 'none',
          color: '#fff', cursor: 'pointer', transition: 'background 0.3s',
        }}
      >
        {saved ? '✓ Saved successfully' : 'Save medical profile'}
      </button>

      <p style={{ fontSize: 12, opacity: 0.45, textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
        Your data is encrypted with AES-GCM-256 before storage.
        Never uploaded without your active SOS trigger.
      </p>
    </div>
  );
}
