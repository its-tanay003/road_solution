import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { BookOpen, Trophy, Share2, MessageCircle, CheckCircle2, XCircle, Info, ChevronRight, Zap } from 'lucide-react';
import { useAwarenessStore } from '../store/awarenessStore';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What is the legal BAC (Blood Alcohol Content) limit for drivers in India?",
    options: ["0.03%", "0.05%", "0.08%"],
    correct: 0,
    explanation: "The legal limit in India is 0.03% (30mg per 100ml of blood). Any amount higher is a punishable offense."
  },
  {
    id: 2,
    question: "Under the Good Samaritan Act, what is your legal obligation after helping a victim?",
    options: ["Stay at hospital", "Pay medical bills", "Zero legal liability"],
    correct: 2,
    explanation: "Good Samaritans are protected from any civil or criminal liability and are not forced to stay at the hospital or reveal their identity."
  },
  {
    id: 3,
    question: "What is the primary goal during the 'Golden Hour' post-accident?",
    options: ["Call insurance", "Professional medical care", "Move the vehicle"],
    correct: 1,
    explanation: "The first hour (Golden Hour) is critical for trauma patients; receiving professional care within this time increases survival odds by 50%."
  },
  {
    id: 4,
    question: "Which of these is NOT required for a valid two-wheeler helmet in India?",
    options: ["ISI Mark", "Full-face coverage", "Bluetooth Speakers"],
    correct: 2,
    explanation: "ISI certification is mandatory. While speakers are optional, a secure chin strap and impact absorption are essential safety features."
  },
  {
    id: 5,
    question: "What is the maximum speed limit for cars on National Expressways in India?",
    options: ["100 km/h", "120 km/h", "140 km/h"],
    correct: 1,
    explanation: "MoRTH has set the limit at 120 km/h for Expressways, though local stretches might have lower limits for safety."
  }
];

const FACTS = [
  { id: 'f1', text: "70% of India's road deaths are in rural areas", detail: "Slower emergency response times in villages contribute to higher fatality rates." },
  { id: 'f2', text: "Helmets reduce death risk by 42%", detail: "And reduce serious injury risk by over 70%." },
  { id: 'f3', text: "Peak accident time: 6PM-9PM", detail: "Reduced visibility and end-of-day fatigue make this the most dangerous window." },
  { id: 'f4', text: "Two-wheelers account for 44% of all deaths", detail: "They are the most vulnerable road users in the Indian traffic ecosystem." },
  { id: 'f5', text: "Golden Hour survival rate drops 20% with each 10-min delay", detail: "This is why ROADSoS bystander mesh alerts are critical for remote areas." }
];

export const RoadSafetyAwareness: React.FC = () => {
  const { xp, addXP, getLevel, quizCompletedToday, completeQuiz } = useAwarenessStore();
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [quizState, setQuizState] = useState<'IDLE' | 'QUESTION' | 'RESULT'>('IDLE');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [xpAnimation, setXpAnimation] = useState<number | null>(null);

  // Framer Motion for Fact Cards
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  const handleFactSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      addXP(10);
      setXpAnimation(10);
      setTimeout(() => setXpAnimation(null), 1000);
    }
    if (currentFactIndex < FACTS.length - 1) {
      setCurrentFactIndex(prev => prev + 1);
    } else {
      setCurrentFactIndex(0); // Loop back for demo
    }
    x.set(0);
  };

  const handleQuizAnswer = (idx: number) => {
    setSelectedOption(idx);
    const isCorrect = idx === QUIZ_QUESTIONS[currentQuestion].correct;
    if (isCorrect) {
      addXP(25);
      setXpAnimation(25);
      setTimeout(() => setXpAnimation(null), 1000);
    }
    setQuizState('RESULT');
  };

  const nextQuestion = () => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
      setQuizState('QUESTION');
    } else {
      completeQuiz();
      setQuizState('IDLE');
    }
  };

  const generateShareCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#080C14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for(let i=0; i<canvas.width; i+=40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
    }
    for(let i=0; i<canvas.height; i+=40) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }

    // Border Glow
    ctx.strokeStyle = '#FF9933';
    ctx.lineWidth = 20;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Content
    ctx.fillStyle = '#FF9933';
    ctx.font = 'bold 120px "Space Grotesk"';
    ctx.fillText(getLevel().toUpperCase(), 80, 200);

    ctx.fillStyle = '#E8EDF5';
    ctx.font = '40px "JetBrains Mono"';
    ctx.fillText('ROAD SAFETY MASTERY REPORT', 80, 280);

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 300px "Space Grotesk"';
    ctx.fillText(`${xp}`, 80, 550);
    ctx.font = '80px "Space Grotesk"';
    ctx.fillText('XP', 600, 550);

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '30px "JetBrains Mono"';
    ctx.fillText('ROADSoS EMERGENCY PLATFORM', 850, 580);

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `ROADSoS_Score_${xp}.png`;
    link.href = dataUrl;
    link.click();
  };

  const shareScore = () => {
    generateShareCard();
    const text = `I'm a ${getLevel()} on ROADSoS! My Safety IQ is ${xp}. Can you beat me? #ROADSoS`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header IQ Stats */}
      <div className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-(--clr-border) relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Trophy size={80} />
        </div>
        <div className="relative z-10">
          <p className="text-[10px] font-mono text-(--clr-text-2) uppercase tracking-widest mb-1">Current Standing</p>
          <h2 className="text-3xl font-black tracking-tighter text-(--clr-saffron)">{getLevel()}</h2>
          <div className="flex items-center gap-2 mt-2">
            <Zap size={14} className="text-(--clr-amber)" />
            <span className="text-xl font-bold">{xp} <span className="text-sm font-normal text-white/40 italic">XP</span></span>
          </div>
        </div>
        <AnimatePresence>
          {xpAnimation && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: -40, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute right-12 top-12 text-(--clr-green) font-black text-2xl drop-shadow-[0_0_10px_rgba(0,230,118,0.5)]"
            >
              +{xpAnimation} XP
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SECTION 1: Quick Facts */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/60 flex items-center gap-2">
            <BookOpen size={14} /> Knowledge Burst
          </h3>
          <span className="text-[10px] font-mono text-white/40">{currentFactIndex + 1} / {FACTS.length}</span>
        </div>
        
        <div className="relative h-48 w-full flex items-center justify-center">
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentFactIndex}
              style={{ x, rotate, opacity }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x > 100) handleFactSwipe('right');
                else if (info.offset.x < -100) handleFactSwipe('left');
              }}
              className="absolute inset-0 p-6 rounded-2xl bg-linear-to-br from-white/10 to-transparent border border-white/10 flex flex-col justify-center items-center text-center cursor-grab active:cursor-grabbing shadow-xl"
            >
              <h4 className="text-lg font-bold leading-tight mb-3">{FACTS[currentFactIndex].text}</h4>
              <p className="text-xs text-white/40 italic">{FACTS[currentFactIndex].detail}</p>
              
              <div className="absolute bottom-4 left-0 right-0 flex justify-between px-6 text-[8px] font-mono uppercase tracking-tighter opacity-40">
                <span>← SWIPE NEW (+10 XP)</span>
                <span>KNEW THIS →</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* SECTION 2: Quiz */}
      <section className="p-6 rounded-3xl bg-white/5 border border-(--clr-border) space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-(--clr-blue)/20 flex items-center justify-center text-(--clr-blue)">
            <Info size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold">Daily Safety Quiz</h3>
            <p className="text-[10px] font-mono text-(--clr-text-2) uppercase">Earn +25 XP</p>
          </div>
        </div>

        {quizCompletedToday ? (
          <div className="text-center py-4 space-y-3">
            <CheckCircle2 size={40} className="mx-auto text-(--clr-green)" />
            <p className="text-sm font-bold">Daily Quiz Complete!</p>
            <p className="text-[10px] text-white/40 uppercase">Next quiz available in 14 hours</p>
          </div>
        ) : (
          <div className="space-y-4">
            {quizState === 'IDLE' && (
              <button 
                onClick={() => setQuizState('QUESTION')}
                className="w-full py-4 bg-(--clr-blue) rounded-xl font-bold uppercase tracking-widest text-xs"
              >
                Start Quiz
              </button>
            )}

            {quizState === 'QUESTION' && (
              <div className="space-y-4">
                <p className="text-sm font-medium leading-relaxed">{QUIZ_QUESTIONS[currentQuestion].question}</p>
                <div className="grid grid-cols-1 gap-2">
                  {QUIZ_QUESTIONS[currentQuestion].options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuizAnswer(i)}
                      className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-left text-xs hover:bg-white/10 transition-all"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {quizState === 'RESULT' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className={`p-4 rounded-xl flex items-start gap-3 ${selectedOption === QUIZ_QUESTIONS[currentQuestion].correct ? 'bg-(--clr-green)/10 border border-(--clr-green)/30' : 'bg-(--clr-red)/10 border border-(--clr-red)/30'}`}>
                  {selectedOption === QUIZ_QUESTIONS[currentQuestion].correct ? <CheckCircle2 size={18} className="text-(--clr-green)" /> : <XCircle size={18} className="text-(--clr-red)" />}
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono uppercase font-bold">
                      {selectedOption === QUIZ_QUESTIONS[currentQuestion].correct ? 'Correct' : 'Incorrect'}
                    </p>
                    <p className="text-xs text-white/80">{QUIZ_QUESTIONS[currentQuestion].explanation}</p>
                  </div>
                </div>
                <button 
                  onClick={nextQuestion}
                  className="w-full py-3 bg-white/10 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                >
                  {currentQuestion < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'Finish Quiz'} <ChevronRight size={14} />
                </button>
              </motion.div>
            )}
          </div>
        )}
      </section>

      {/* SECTION 3: Score Gauge & Sharing */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-3xl bg-linear-to-br from-(--clr-saffron)/20 to-transparent border border-(--clr-saffron)/20 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90">
              <circle cx="64" cy="64" r="58" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="8" />
              <motion.circle
                cx="64" cy="64" r="58"
                fill="none" stroke="var(--clr-saffron)" strokeWidth="8"
                strokeDasharray={364}
                initial={{ strokeDashoffset: 364 }}
                animate={{ strokeDashoffset: 364 - (364 * Math.min(xp, 500)) / 500 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(255,153,51,0.5)]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black tracking-tighter text-(--clr-saffron)">{Math.round((Math.min(xp, 500) / 500) * 100)}%</span>
              <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">Mastery</span>
            </div>
          </div>
          <p className="text-[10px] text-white/60 font-medium">Progress towards <span className="text-(--clr-saffron) font-bold">Next Level</span></p>
        </div>

        <div className="space-y-3">
          <button 
            onClick={shareScore}
            className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all group"
          >
            <Share2 size={18} className="text-(--clr-blue)" />
            <div className="text-left">
              <p className="text-xs font-bold">Share Performance</p>
              <p className="text-[8px] font-mono text-white/40 uppercase">Generate Report Card</p>
            </div>
          </button>
          <button 
            onClick={shareScore}
            className="w-full py-4 bg-(--clr-green)/10 border border-(--clr-green)/20 rounded-2xl flex items-center justify-center gap-3 hover:bg-(--clr-green)/20 transition-all group"
          >
            <MessageCircle size={18} className="text-(--clr-green)" />
            <div className="text-left">
              <p className="text-xs font-bold">Challenge Friends</p>
              <p className="text-[8px] font-mono text-white/40 uppercase">Invite to ROADSoS</p>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
};
