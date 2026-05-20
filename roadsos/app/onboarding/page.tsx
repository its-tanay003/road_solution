'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  User, 
  Phone, 
  Calendar, 
  HeartPulse, 
  Activity, 
  ShieldAlert, 
  Users, 
  MapPin, 
  Bell, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dob: '',
    bloodGroup: 'Unknown',
    conditions: '',
    allergies: '',
    contacts: [
      { name: '', phone: '', relationship: '' },
      { name: '', phone: '', relationship: '' }
    ]
  });

  const [locationStatus, setLocationStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [notificationStatus, setNotificationStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill name from OAuth session
  useEffect(() => {
    const sessionName = session?.user?.name;
    if (sessionName && !formData.name) {
      setFormData(prev => ({ ...prev, name: sessionName }));
    }
  }, [session, formData.name]);

  // Sync initial permission states on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          setNotificationStatus('granted');
        } else if (Notification.permission === 'denied') {
          setNotificationStatus('denied');
        }
      }
      if (navigator.permissions) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          if (result.state === 'granted') {
            setLocationStatus('granted');
          } else if (result.state === 'denied') {
            setLocationStatus('denied');
          }
        });
      }
    }
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setLocationStatus('prompt');
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationStatus('granted');
        toast.success('Location permission granted!');
      },
      (err) => {
        setLocationStatus('denied');
        toast.error('Location permission denied. This may impact instant emergency routing.');
        console.warn('Geolocation error:', err);
      }
    );
  };

  const requestNotifications = () => {
    if (!('Notification' in window)) {
      toast.error('Notifications not supported by your browser');
      return;
    }
    Notification.requestPermission().then((permission) => {
      setLocationStatus('prompt');
      if (permission === 'granted') {
        setNotificationStatus('granted');
        toast.success('Notification permission granted!');
      } else {
        setNotificationStatus('denied');
        toast.error('Notification permission denied.');
      }
    });
  };

  const handleContactChange = (index: number, field: string, value: string) => {
    const updatedContacts = [...formData.contacts];
    updatedContacts[index] = { ...updatedContacts[index], [field]: value };
    setFormData(prev => ({ ...prev, contacts: updatedContacts }));
  };

  const validateStep = () => {
    if (step === 1) {
      // Step 1: Personal info
      if (!formData.name.trim()) {
        toast.error('Please enter your full name');
        return false;
      }
      if (!formData.phone.trim()) {
        toast.error('Please enter your phone number');
        return false;
      }
      if (!formData.dob) {
        toast.error('Please select your date of birth');
        return false;
      }
    } else if (step === 3) {
      // Step 3: Emergency contacts
      const [c1, c2] = formData.contacts;
      if (!c1.name.trim() || !c1.phone.trim() || !c1.relationship.trim()) {
        toast.error('Please complete all details for Contact 1');
        return false;
      }
      if (!c2.name.trim() || !c2.phone.trim() || !c2.relationship.trim()) {
        toast.error('Please complete all details for Contact 2');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const skipStep1 = () => {
    // Advance to step 2 directly without validation on Step 1
    toast.info('Step 1 skipped. You can update these details in settings later.');
    setStep(2);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        throw new Error('Failed to save onboarding details to server');
      }

      toast.success('Onboarding complete! Your profile is secured.');
      
      // Save cache in local storage
      localStorage.setItem('roadsos-profile', JSON.stringify({
        name: formData.name,
        phone: formData.phone,
        bloodGroup: formData.bloodGroup,
        conditions: formData.conditions,
        allergies: formData.allergies,
        dob: formData.dob,
        contacts: formData.contacts.map(c => ({
          name: c.name,
          phone: c.phone,
          relation: c.relationship
        }))
      }));

      // Trigger profile cache event
      window.dispatchEvent(new Event('roadsos-profile-updated'));

      // Redirect to main dashboard
      router.push('/');
    } catch (err) {
      console.error(err);
      toast.error('Could not complete setup. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsInfo = [
    { title: 'Personal', desc: 'Secure profile details' },
    { title: 'Medical', desc: 'Blood group & allergies' },
    { title: 'Contacts', desc: 'Emergency response' },
    { title: 'Access', desc: 'System integrations' }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-between relative overflow-hidden py-8 px-4 md:px-8">
      {/* Dynamic Ambient Background Lights */}
      <div className="absolute top-0 right-1/4 w-[350px] h-[350px] rounded-full bg-red-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full bg-blue-600/5 blur-[100px] pointer-events-none" />

      {/* HEADER WITH PROGRESS BAR */}
      <div className="w-full max-w-2xl mx-auto mb-8 z-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">Setup Lifeline</h2>
            <p className="text-gray-400 text-xs mt-0.5">Let's build your emergency toolkit</p>
          </div>
          <span className="text-xs bg-red-500/10 border border-red-500/20 text-red-500 font-extrabold px-3 py-1.5 rounded-full tracking-wider uppercase">
            Step {step} of 4
          </span>
        </div>

        {/* Breathtaking Glowing Progress Bar */}
        <div className="w-full h-2.5 bg-gray-900 border border-gray-800 rounded-full overflow-hidden relative shadow-inner">
          <motion.div 
            initial={{ width: '0%' }}
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-red-500 relative"
          >
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-pulse" />
          </motion.div>
        </div>

        {/* Step Indicators */}
        <div className="grid grid-cols-4 gap-2 mt-4 text-center">
          {stepsInfo.map((s, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <span className={`text-[10px] font-black uppercase tracking-wider ${idx + 1 <= step ? 'text-red-500' : 'text-gray-600'}`}>
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CENTRAL CARD FOR STEPS */}
      <div className="w-full max-w-2xl mx-auto flex-grow flex items-center justify-center z-10 mb-8">
        <div className="w-full bg-gray-900/60 border border-gray-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl min-h-[420px] flex flex-col justify-between relative">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-grow flex flex-col"
            >
              {/* STEP 1: PERSONAL INFO */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black tracking-tight">Personal Details</h3>
                      <p className="text-gray-400 text-xs">Verify your identification and contact details</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                    <input 
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Tanay Sharma"
                      className="w-full bg-gray-950/80 border border-gray-800/80 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                        <Phone size={16} />
                      </span>
                      <input 
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full bg-gray-950/80 border border-gray-800/80 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Date of Birth</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                        <Calendar size={16} />
                      </span>
                      <input 
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                        className="w-full bg-gray-950/80 border border-gray-800/80 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: MEDICAL INFO */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                      <HeartPulse size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black tracking-tight">Medical Information</h3>
                      <p className="text-gray-400 text-xs">Crucial information for first responders during accidents</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Blood Group</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                        <Activity size={16} />
                      </span>
                      <select
                        value={formData.bloodGroup}
                        onChange={(e) => setFormData(prev => ({ ...prev, bloodGroup: e.target.value }))}
                        className="w-full bg-gray-950/80 border border-gray-800/80 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors appearance-none"
                      >
                        <option value="Unknown">Unknown (Select Blood Type)</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                      {/* Custom dropdown arrow indicator */}
                      <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500 text-xs">▼</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Medical Conditions (Comma separated)</label>
                    <textarea 
                      value={formData.conditions}
                      onChange={(e) => setFormData(prev => ({ ...prev, conditions: e.target.value }))}
                      placeholder="e.g. Asthma, High Blood Pressure, Diabetes (None if clean)"
                      rows={2}
                      className="w-full bg-gray-950/80 border border-gray-800/80 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Allergies (Comma separated)</label>
                    <textarea 
                      value={formData.allergies}
                      onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
                      placeholder="e.g. Penicillin, Peanuts, Pollen (None if clean)"
                      rows={2}
                      className="w-full bg-gray-950/80 border border-gray-800/80 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 transition-colors resize-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: EMERGENCY CONTACTS */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                      <Users size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black tracking-tight">Emergency Contacts</h3>
                      <p className="text-gray-400 text-xs">Configure exactly 2 required emergency contacts for SMS beacons</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact 1 */}
                    <div className="bg-gray-950/40 border border-gray-800/60 rounded-2xl p-4 space-y-3.5">
                      <h4 className="text-xs font-extrabold text-red-500 uppercase tracking-wider">Contact 1</h4>
                      <div>
                        <input 
                          type="text"
                          value={formData.contacts[0].name}
                          onChange={(e) => handleContactChange(0, 'name', e.target.value)}
                          placeholder="Contact Name"
                          className="w-full bg-gray-950/80 border border-gray-800/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500/50 transition-colors"
                        />
                      </div>
                      <div>
                        <input 
                          type="tel"
                          value={formData.contacts[0].phone}
                          onChange={(e) => handleContactChange(0, 'phone', e.target.value)}
                          placeholder="Phone (e.g. +91 99999 88888)"
                          className="w-full bg-gray-950/80 border border-gray-800/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500/50 transition-colors"
                        />
                      </div>
                      <div>
                        <input 
                          type="text"
                          value={formData.contacts[0].relationship}
                          onChange={(e) => handleContactChange(0, 'relationship', e.target.value)}
                          placeholder="Relationship (e.g. Mother, Spouse)"
                          className="w-full bg-gray-950/80 border border-gray-800/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500/50 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Contact 2 */}
                    <div className="bg-gray-950/40 border border-gray-800/60 rounded-2xl p-4 space-y-3.5">
                      <h4 className="text-xs font-extrabold text-red-500 uppercase tracking-wider">Contact 2</h4>
                      <div>
                        <input 
                          type="text"
                          value={formData.contacts[1].name}
                          onChange={(e) => handleContactChange(1, 'name', e.target.value)}
                          placeholder="Contact Name"
                          className="w-full bg-gray-950/80 border border-gray-800/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500/50 transition-colors"
                        />
                      </div>
                      <div>
                        <input 
                          type="tel"
                          value={formData.contacts[1].phone}
                          onChange={(e) => handleContactChange(1, 'phone', e.target.value)}
                          placeholder="Phone (e.g. +91 77777 66666)"
                          className="w-full bg-gray-950/80 border border-gray-800/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500/50 transition-colors"
                        />
                      </div>
                      <div>
                        <input 
                          type="text"
                          value={formData.contacts[1].relationship}
                          onChange={(e) => handleContactChange(1, 'relationship', e.target.value)}
                          placeholder="Relationship (e.g. Father, Friend)"
                          className="w-full bg-gray-950/80 border border-gray-800/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500/50 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: PERMISSIONS */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                      <ShieldAlert size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black tracking-tight">System Integrations</h3>
                      <p className="text-gray-400 text-xs">Give ROADSoS required access for active assistance</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Location Permission Box */}
                    <div className="bg-gray-950/60 border border-gray-800/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <MapPin size={22} className={locationStatus === 'granted' ? 'text-emerald-500' : 'text-gray-500'} />
                        <div>
                          <h4 className="text-sm font-bold">Real-time Geolocation</h4>
                          <p className="text-xs text-gray-500 mt-0.5">Allows active coordinate sync, automated crash detection alerts, and routing services.</p>
                        </div>
                      </div>
                      <button
                        onClick={requestLocation}
                        disabled={locationStatus === 'granted'}
                        className={`text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl border transition-all ${
                          locationStatus === 'granted' 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 cursor-default'
                            : 'bg-red-600/10 border-red-500/20 text-red-500 hover:bg-red-600/20'
                        }`}
                      >
                        {locationStatus === 'granted' ? 'Enabled' : 'Allow access'}
                      </button>
                    </div>

                    {/* Notification Permission Box */}
                    <div className="bg-gray-950/60 border border-gray-800/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <Bell size={22} className={notificationStatus === 'granted' ? 'text-emerald-500' : 'text-gray-500'} />
                        <div>
                          <h4 className="text-sm font-bold">Critical SOS Beacons</h4>
                          <p className="text-xs text-gray-500 mt-0.5">Alerts you about responders, nearby collisions, active voice command overrides, and emergency status updates.</p>
                        </div>
                      </div>
                      <button
                        onClick={requestNotifications}
                        disabled={notificationStatus === 'granted'}
                        className={`text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl border transition-all ${
                          notificationStatus === 'granted' 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 cursor-default'
                            : 'bg-red-600/10 border-red-500/20 text-red-500 hover:bg-red-600/20'
                        }`}
                      >
                        {notificationStatus === 'granted' ? 'Enabled' : 'Allow notifications'}
                      </button>
                    </div>
                  </div>

                  {locationStatus !== 'granted' && (
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-orange-500">
                      <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                      <p>
                        We strongly suggest enabling both services. ROADSoS can broadcast rescue signals without them, but exact ambulance routing requires location sync.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* BOTTOM BUTTON BAR */}
          <div className="flex justify-between items-center gap-3 pt-6 border-t border-gray-800/60 mt-8">
            {/* Back Button */}
            {step > 1 ? (
              <button
                onClick={prevStep}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-gray-950 hover:bg-black text-gray-400 hover:text-white border border-gray-800 font-bold px-4 py-3 rounded-2xl text-xs transition-colors"
              >
                <ArrowLeft size={16} />
                Back
              </button>
            ) : (
              // Skip option - Visible on Step 1 only
              <button
                onClick={skipStep1}
                className="flex items-center gap-1.5 bg-gray-950/20 hover:bg-gray-950/40 text-gray-500 hover:text-gray-400 font-bold px-4 py-3 rounded-2xl text-xs transition-colors"
              >
                Skip personal step
              </button>
            )}

            {/* Next/Submit Button */}
            {step < 4 ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-extrabold px-6 py-3 rounded-2xl text-xs shadow-lg transition-all ml-auto"
              >
                Continue
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-extrabold px-6 py-3 rounded-2xl text-xs shadow-lg transition-all ml-auto disabled:bg-red-600/50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    Complete Setup
                    <CheckCircle size={16} />
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <div className="w-full max-w-2xl mx-auto text-center text-[10px] text-gray-600 z-10">
        By filling out this profile, you grant ROADSoS permission to share this information securely with authorized first responders during active SOS broadcasts.
      </div>
    </div>
  );
}
