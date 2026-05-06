import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  UserX, 
  Gavel, 
  Building2, 
  Download, 
  Printer, 
  Phone, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const GoodSamaritanGuide = () => {

  const rights = [
    {
      id: 1,
      icon: UserX,
      title: "YOU CAN LEAVE",
      body: "After helping, you are free to go. No one can legally detain you at the scene.",
      color: "from-blue-500/20 to-blue-600/20"
    },
    {
      id: 2,
      icon: ShieldCheck,
      title: "YOU CANNOT BE ARRESTED",
      body: "Helping an accident victim in good faith is legally protected. You face no criminal liability.",
      color: "from-emerald-500/20 to-emerald-600/20"
    },
    {
      id: 3,
      icon: Info,
      title: "YOUR IDENTITY IS PROTECTED",
      body: "You are not required to give your name, address, or phone number to police or hospital staff.",
      color: "from-amber-500/20 to-amber-600/20"
    },
    {
      id: 4,
      icon: Gavel,
      title: "YOU CANNOT BE MADE A WITNESS",
      body: "You cannot be forced to testify in court or any legal proceeding against your will.",
      color: "from-purple-500/20 to-purple-600/20"
    },
    {
      id: 5,
      icon: Building2,
      title: "HOSPITALS MUST TREAT",
      body: "Under SC guidelines, hospitals cannot refuse to treat accident victims or demand payment before treatment.",
      color: "from-rose-500/20 to-rose-600/20"
    }
  ];

  const stateAdoption = [
    { name: "Karnataka", status: "Full Adoption", color: "text-emerald-400" },
    { name: "Delhi", status: "Full Adoption", color: "text-emerald-400" },
    { name: "Tamil Nadu", status: "Full Adoption", color: "text-emerald-400" },
    { name: "Maharashtra", status: "Full Adoption", color: "text-emerald-400" },
    { name: "Uttar Pradesh", status: "In Progress", color: "text-amber-400" },
    { name: "West Bengal", status: "In Progress", color: "text-amber-400" },
    { name: "Kerala", status: "Full Adoption", color: "text-emerald-400" },
    { name: "Gujarat", status: "Full Adoption", color: "text-emerald-400" }
  ];

  const handleShare = async () => {
    const cardText = "I am acting as a Good Samaritan under Supreme Court of India guidelines (2016 / WP Civil 235/2012). I am NOT required to give my name. I am legally protected from civil and criminal liability.";
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Good Samaritan Card',
          text: cardText,
          url: window.location.href
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      alert("Sharing not supported on this browser. Text copied to clipboard.");
      navigator.clipboard.writeText(cardText);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 space-y-12 max-w-5xl mx-auto pb-24">
      {/* Header Section */}
      <section className="text-center space-y-4 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-black uppercase tracking-[0.2em]"
        >
          <ShieldCheck size={14} />
          Supreme Court Protected
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase leading-none">
          Good Samaritan <span className="text-emerald-500">Legal Guide</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base font-medium leading-relaxed">
          Addressing the 48% legal fear gap. Helping a victim in good faith is not just a moral duty—it's your legal right, protected by the Supreme Court of India.
        </p>
      </section>

      {/* Rights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {rights.map((right, index) => (
          <motion.div
            key={right.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-6 rounded-4xl border border-white/5 bg-linear-to-br ${right.color} backdrop-blur-xl group hover:border-white/10 transition-all`}
          >
            <div className="absolute top-4 right-6 text-4xl font-black opacity-10 text-white italic">
              {String(right.id).padStart(2, '0')}
            </div>
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <right.icon size={24} className="text-white" />
            </div>
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-2 leading-tight">
              {right.title}
            </h3>
            <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
              {right.body}
            </p>
          </motion.div>
        ))}
      </section>

      {/* State Adoption & Helplines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Adoption Table */}
        <section className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
            <h2 className="text-lg font-black text-white uppercase tracking-widest">State Adoption Status</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stateAdoption.map((state) => (
              <div key={state.name} className="flex items-center justify-between p-4 bg-white/2 border border-white/5 rounded-2xl hover:bg-white/5 transition-colors">
                <span className="text-sm font-bold text-slate-200">{state.name}</span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${state.color}`}>
                  {state.status}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
            <Info size={16} className="text-emerald-400 shrink-0" />
            <p className="text-[10px] text-emerald-400/80 font-bold uppercase leading-relaxed">
              States in green have fully operationalized the 2016 SC Guidelines. Others are in active legislative adoption.
            </p>
          </div>
        </section>

        {/* Helplines & Assistance */}
        <section className="space-y-6">
          <div className="bg-rose-500/5 border border-rose-500/20 rounded-[2.5rem] p-8">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="text-rose-500" size={24} />
              <h2 className="text-lg font-black text-white uppercase tracking-widest">Immediate Assistance</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-6 bg-white/2 border border-white/5 rounded-3xl hover:bg-white/5 transition-all group">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Police Harassment?</p>
                  <p className="text-2xl font-black text-white">Call 112</p>
                </div>
                <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Phone size={24} className="text-white" fill="white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-white/2 border border-white/5 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">National Legal Aid</p>
                  <p className="text-xl font-black text-white">15100</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">NALSA Helpline</p>
                </div>
                <div className="p-5 bg-white/2 border border-white/5 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">MoRTH Portal</p>
                  <p className="text-xl font-black text-white flex items-center gap-2 uppercase">GOV.IN <ExternalLink size={14} /></p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Grievance Portal</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Downloadable Card Section */}
      <section className="bg-linear-to-br from-slate-900 to-black border border-white/5 rounded-[3rem] p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-black text-white uppercase leading-tight">
              The Good Samaritan <span className="text-emerald-500">Digital ID</span>
            </h2>
            <p className="text-slate-400 font-medium">
              Carry this digital proof of your rights. If you are stopped or questioned while helping, present this card to remind authorities of the Supreme Court guidelines.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={handleShare}
                className="flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-lg shadow-emerald-900/20"
              >
                <Download size={18} />
                Save to Phone
              </button>
              <button 
                onClick={handlePrint}
                className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs rounded-2xl border border-white/10 transition-all"
              >
                <Printer size={18} />
                Print Card
              </button>
            </div>
          </div>

          {/* Card Mockup */}
          <div id="samaritan-card" className="w-[350px] aspect-[1.6/1] bg-white text-slate-900 rounded-2xl p-6 shadow-2xl relative overflow-hidden print:shadow-none print:border print:border-slate-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Legal Protection ID</h4>
                <h3 className="text-lg font-black leading-tight">GOOD SAMARITAN</h3>
              </div>
              <ShieldCheck className="text-emerald-500" size={24} />
            </div>
            <div className="space-y-3">
              <p className="text-[11px] font-bold leading-relaxed">
                "I am acting as a Good Samaritan under Supreme Court of India guidelines (2016 / WP Civil 235/2012). I am NOT required to give my name. I am legally protected from civil and criminal liability."
              </p>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-end">
                <div className="space-y-0.5">
                  <p className="text-[7px] font-black text-slate-400 uppercase">Case Reference</p>
                  <p className="text-[9px] font-bold">Writ Petition Civil 235 of 2012</p>
                </div>
                <div className="text-right">
                  <p className="text-[7px] font-black text-slate-400 uppercase">Verified Platform</p>
                  <p className="text-[9px] font-bold tracking-widest">ROADSoS INDIA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Citation */}
      <footer className="text-center space-y-6 pt-12 border-t border-white/5">
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] max-w-3xl mx-auto leading-relaxed">
          Sources: Supreme Court of India — Writ Petition (Civil) No. 235 of 2012 | MoRTH Notification May 2015 | Ministry of Health & Family Welfare Good Samaritan Guidelines
        </p>
      </footer>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #samaritan-card, #samaritan-card * { visibility: visible; }
          #samaritan-card { 
            position: fixed; 
            left: 50%; 
            top: 50%; 
            transform: translate(-50%, -50%); 
            width: 3.5in; 
            height: 2in;
            border: 1px solid #ddd;
          }
        }
      `}</style>
    </div>
  );
};

// Collapsible in-app component
export const GoodSamaritanCollapsible = ({ onDismiss }: { onDismiss: () => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-emerald-500/5 border-2 border-emerald-500/20 rounded-3xl overflow-hidden mb-6">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 hover:bg-emerald-500/10 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">Your Legal Rights</h3>
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Supreme Court Protected (2016)</p>
          </div>
        </div>
        {isExpanded ? <ChevronUp size={20} className="text-emerald-400" /> : <ChevronDown size={20} className="text-emerald-400" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="px-6 pb-6 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {[
                "You can leave the scene after helping",
                "You cannot be arrested for helping",
                "You don't have to share your identity",
                "Hospitals MUST treat victims immediately",
                "You can't be forced to be a witness"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 text-[11px] font-bold text-slate-300 uppercase">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  {text}
                </div>
              ))}
            </div>
            <button 
              onClick={onDismiss}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all"
            >
              I understand my rights — let me help
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
