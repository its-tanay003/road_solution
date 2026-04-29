import { AlertTriangle, Clock, PlayCircle, Volume2, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const FirstAid = () => {
  const { t, i18n } = useTranslation();
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);

  const stepsText = t('first_aid.steps_tts', "Step 1. Apply Direct Pressure. Press hard and continuously with a clean cloth. Step 2. Elevate the Injury. Raise the injured area above the level of the heart if possible. Step 3. Lay the Person Down. Help them lie down to prevent fainting.");

  const handleReadAloud = () => {
    if (!("speechSynthesis" in window)) return;
    
    if (isPlayingTTS) {
      window.speechSynthesis.cancel();
      setIsPlayingTTS(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(stepsText);
    
    // Map internal i18n language codes to browser BCP-47 Speech Synthesis tags
    const langMap: Record<string, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      ml: 'ml-IN',
      kn: 'kn-IN',
      mr: 'mr-IN',
      pa: 'pa-IN',
      bn: 'bn-IN'
    };
    
    utterance.lang = langMap[i18n.language] || 'en-US';
    utterance.rate = 0.9;
    utterance.onend = () => setIsPlayingTTS(false);
    
    window.speechSynthesis.speak(utterance);
    setIsPlayingTTS(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Active Timer Header */}
      <div className="bg-navy text-white p-4 sticky top-0 z-50 shadow-md flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-emergency rounded-full animate-ping mr-3"></div>
          <span className="font-condensed font-bold text-lg tracking-wide">AMBULANCE DISPATCHED</span>
        </div>
        <div className="flex items-center text-safe font-mono font-bold">
          <Clock size={16} className="mr-1" /> ETA: 6m
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* AI Confidence Badge */}
        <div className="bg-safe/10 border border-safe/30 p-3 rounded-xl flex items-center justify-center shadow-sm">
          <ShieldCheck className="text-safe mr-2" size={20} />
          <span className="text-safe font-mono font-bold text-sm">AI Triage Confidence: 98% Match</span>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-emergency p-4 flex justify-between items-center">
            <div className="flex items-center">
              <AlertTriangle className="text-white mr-3" size={28} />
              <h1 className="text-white font-condensed font-bold text-2xl">Severe Bleeding</h1>
            </div>
            <button 
              onClick={handleReadAloud}
              className={`p-2 rounded-full transition-colors flex items-center justify-center border ${isPlayingTTS ? 'bg-white text-emergency border-white animate-pulse' : 'bg-transparent text-white border-white/50 hover:bg-white/10'}`}
            >
              <Volume2 size={24} />
            </button>
          </div>
          
          <div className="p-5">
            {/* DO NOT DO Section */}
            <div className="bg-red-50 border-l-4 border-emergency p-4 mb-6 rounded-r-lg">
              <h3 className="font-bold text-emergency flex items-center mb-1">
                <AlertTriangle size={16} className="mr-1" /> DO NOT DO
              </h3>
              <ul className="text-sm text-red-900 space-y-1 list-disc ml-4">
                <li>Do not remove any embedded objects.</li>
                <li>Do not remove blood-soaked bandages; add more on top.</li>
              </ul>
            </div>

            {/* Steps */}
            <div className="space-y-6">
              <div className="flex">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center font-bold mr-3">1</div>
                <div>
                  <h4 className="font-bold text-gray-900">Apply Direct Pressure</h4>
                  <p className="text-gray-600 text-sm mt-1">Press hard and continuously with a clean cloth or sterile dressing.</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center font-bold mr-3">2</div>
                <div>
                  <h4 className="font-bold text-gray-900">Elevate the Injury</h4>
                  <p className="text-gray-600 text-sm mt-1">Raise the injured area above the level of the heart if possible.</p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center font-bold mr-3">3</div>
                <div>
                  <h4 className="font-bold text-gray-900">Lay the Person Down</h4>
                  <p className="text-gray-600 text-sm mt-1">Help them lie down to prevent fainting and maintain blood flow to the brain.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Offline Video Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
          <h3 className="font-bold text-gray-900 mb-3">Offline Video Guide</h3>
          <div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-video flex items-center justify-center cursor-pointer">
            <img src="https://via.placeholder.com/600x300/16213e/ffffff?text=First+Aid+Demo" alt="Video Thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-60" />
            <PlayCircle size={48} className="text-white relative z-10" />
            <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-white text-xs font-mono">1:45</div>
          </div>
        </div>
      </div>
    </div>
  );
};
