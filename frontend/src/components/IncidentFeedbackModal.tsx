import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart,
  Timer,
  Activity,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useMLStore, type TrainingExample } from '../store/mlStore';

interface IncidentFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidentId: string;
  incidentData: {
    gForce: number;
    heartRate: number;
    spO2: number;
    movementScore: number;
    timeOfDay: number;
    roadType: number;
  };
}

export const IncidentFeedbackModal: React.FC<IncidentFeedbackModalProps> = ({ 
  isOpen, 
  onClose, 
  incidentData
}) => {
  const [step, setStep] = useState(1);
  const [feedback, setFeedback] = useState({
    severityCorrect: '',
    firstAidHelpful: '',
    ambulanceOntime: '',
    overallOutcome: ''
  });

  const { addTrainingExample, incrementExamplesSinceRetrain } = useMLStore();

  const handleComplete = () => {
    // Map outcome to ML label
    let label = [0, 0, 0, 0];
    if (feedback.overallOutcome === 'critical') label = [1, 0, 0, 0];
    else if (feedback.overallOutcome === 'hospitalized') label = [0, 1, 0, 0];
    else if (feedback.overallOutcome === 'ok') label = [0, 0, 1, 0];
    else label = [0, 0, 0, 1];

    const example: TrainingExample = {
      features: [
        incidentData.gForce,
        incidentData.heartRate,
        incidentData.spO2,
        incidentData.movementScore,
        incidentData.timeOfDay,
        incidentData.roadType
      ],
      label,
      timestamp: Date.now()
    };

    addTrainingExample(example);
    incrementExamplesSinceRetrain();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="relative bg-[#0F172A] border border-slate-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-500">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter">Incident Feedback</h2>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Help us improve ROADSoS</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                    <Activity size={16} className="text-blue-400" />
                    Was the AI severity assessment correct?
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {['Yes', 'Close', 'No'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setFeedback(f => ({ ...f, severityCorrect: opt.toLowerCase() }))}
                        className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                          feedback.severityCorrect === opt.toLowerCase()
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                        title={`Select assessment correct: ${opt}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                    <Heart size={16} className="text-red-400" />
                    Were the first aid instructions helpful?
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {['Yes', 'Somewhat', 'No'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setFeedback(f => ({ ...f, firstAidHelpful: opt.toLowerCase() }))}
                        className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                          feedback.firstAidHelpful === opt.toLowerCase()
                            ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/20'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                        title={`Select first aid helpful: ${opt}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  disabled={!feedback.severityCorrect || !feedback.firstAidHelpful}
                  onClick={() => setStep(2)}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all mt-4"
                  title="Next Step"
                >
                  Next
                  <ArrowRight size={16} />
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                    <Timer size={16} className="text-amber-400" />
                    Did ambulance arrive within estimated time?
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {['Yes', 'No'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setFeedback(f => ({ ...f, ambulanceOntime: opt.toLowerCase() }))}
                        className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                          feedback.ambulanceOntime === opt.toLowerCase()
                            ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-600/20'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                        title={`Ambulance on time: ${opt}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-300 mb-3">Overall Outcome</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'ok', label: 'Patient OK', color: 'emerald' },
                      { id: 'hospitalized', label: 'Hospitalized', color: 'blue' },
                      { id: 'critical', label: 'Critical', color: 'red' },
                      { id: 'na', label: 'N/A', color: 'slate' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setFeedback(f => ({ ...f, overallOutcome: opt.id }))}
                        className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                          feedback.overallOutcome === opt.id
                            ? `bg-${opt.color}-600 border-${opt.color}-500 text-white shadow-lg`
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                        title={`Select outcome: ${opt.label}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 bg-slate-900 border border-slate-800 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
                    title="Go Back"
                  >
                    Back
                  </button>
                  <button
                    disabled={!feedback.ambulanceOntime || !feedback.overallOutcome}
                    onClick={handleComplete}
                    className="flex-2 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-emerald-600/20"
                    title="Submit Feedback"
                  >
                    Submit Feedback
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
