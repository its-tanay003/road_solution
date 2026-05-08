import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface PhoneOTPModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhoneOTPModal: React.FC<PhoneOTPModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { updateUser } = useAuthStore();

  useEffect(() => {
    if (!isOpen) {
      setStep('phone');
      setPhone('');
      setOtp(['', '', '', '', '', '']);
      setError(null);
    }
  }, [isOpen]);

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${phone}` })
      });
      if (!res.ok) throw new Error('Failed to send OTP');
      setStep('otp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${phone}`, otp: otpString })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      
      updateUser({ phone: `+91${phone}` });
      setStep('success');
      setTimeout(onClose, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm bg-(--clr-bg) border border-(--clr-border) rounded-2xl overflow-hidden shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-white/5 rounded-full text-(--clr-text-2)"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 'phone' && (
              <motion.div
                key="phone"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
              >
                <div className="w-12 h-12 bg-(--clr-blue)/10 rounded-xl flex items-center justify-center text-(--clr-blue) mb-6">
                  <Smartphone size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Connect Phone</h3>
                <p className="text-sm text-(--clr-text-2) mb-8">
                  Enter your mobile number to receive emergency alerts and verify your identity.
                </p>

                <div className="space-y-4">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-(--clr-text-2) font-bold text-sm">+91</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="XXXXXXXXXX"
                      className="w-full pl-14 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-(--clr-blue) focus:ring-1 focus:ring-(--clr-blue) outline-none transition-all"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-500 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                      <AlertCircle size={14} />
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleSendOTP}
                    disabled={loading || phone.length < 10}
                    className="w-full py-4 bg-(--clr-blue) hover:bg-(--clr-blue-hover) disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : 'SEND OTP'}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
              >
                <h3 className="text-xl font-bold mb-2">Verify OTP</h3>
                <p className="text-sm text-(--clr-text-2) mb-8">
                  We've sent a 6-digit code to <span className="text-(--clr-text) font-bold">+91 {phone}</span>
                </p>

                <div className="space-y-6">
                  <div className="flex justify-between gap-2">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => (otpRefs.current[i] = el)}
                        type="text"
                        inputMode="numeric"
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        className="w-11 h-14 text-center bg-white/5 border border-white/10 rounded-xl text-lg font-bold focus:border-(--clr-blue) focus:ring-1 focus:ring-(--clr-blue) outline-none transition-all"
                      />
                    ))}
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-500 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                      <AlertCircle size={14} />
                      {error}
                    </div>
                  )}

                  <div className="space-y-3">
                    <button
                      onClick={handleVerifyOTP}
                      disabled={loading || otp.join('').length < 6}
                      className="w-full py-4 bg-(--clr-blue) hover:bg-(--clr-blue-hover) disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 size={20} className="animate-spin" /> : 'VERIFY & CONNECT'}
                    </button>
                    <button
                      onClick={() => setStep('phone')}
                      className="w-full py-2 text-xs text-(--clr-text-2) hover:text-(--clr-text) transition-colors"
                    >
                      Change Number
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">Phone Connected ✓</h3>
                <p className="text-sm text-(--clr-text-2)">
                  Your account is now verified and linked to +91 {phone}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
