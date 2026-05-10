import { motion } from 'framer-motion';

const PageLoadingFallback = () => (
  <div className="min-h-screen bg-[#05080F] flex flex-col items-center justify-center relative overflow-hidden font-sans">
    {/* Dynamic Background Elements */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D72638]/5 blur-[120px] rounded-full animate-pulse" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#2979FF]/5 blur-[100px] rounded-full" />

    {/* Floating Data Bits */}
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ 
          x: Math.random() * 100 + "%", 
          y: "110%",
          opacity: 0 
        }}
        animate={{ 
          y: "-10%",
          opacity: [0, 1, 0]
        }}
        transition={{ 
          duration: 2 + Math.random() * 3, 
          repeat: Infinity, 
          delay: Math.random() * 5,
          ease: "linear"
        }}
        className="absolute w-[1px] h-12 bg-gradient-to-b from-transparent via-[#2979FF]/40 to-transparent z-0"
        style={{ left: `${Math.random() * 100}%` }}
      />
    ))}

    <div className="relative flex flex-col items-center z-10">
      {/* Complex SVG Loader */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Outer Ring */}
        <motion.svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="url(#loader-grad)"
            strokeWidth="0.5"
            strokeDasharray="4 8"
            className="opacity-40"
          />
          <defs>
            <linearGradient id="loader-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D72638" />
              <stop offset="100%" stopColor="#2979FF" />
            </linearGradient>
          </defs>
        </motion.svg>

        {/* Middle Rotating Dash */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 border border-dashed border-[#2979FF]/30 rounded-full"
        />

        {/* Inner Tech Element */}
        <motion.div
          animate={{ 
            rotate: 45,
            scale: [1, 1.15, 1],
          }}
          transition={{ 
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="relative w-12 h-12 flex items-center justify-center"
        >
           <div className="absolute inset-0 border border-[#D72638] shadow-[0_0_15px_rgba(215,38,56,0.4)]" />
           <div className="absolute inset-2 border border-[#2979FF]/50 rotate-45" />
           <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_#fff]" />
        </motion.div>
      </div>

      {/* Text Branding */}
      <div className="mt-16 flex flex-col items-center gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-1"
        >
          <span className="text-3xl font-black italic tracking-tighter text-white uppercase">
            ROAD<span className="text-[#D72638]">SoS</span>
          </span>
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-4 bg-[#2979FF]/40" />
            <span className="text-[10px] font-mono tracking-[0.5em] text-[#2979FF] uppercase">
              Intelligence
            </span>
            <div className="h-[1px] w-4 bg-[#2979FF]/40" />
          </div>
        </motion.div>
        
        {/* Progress Simulator */}
        <div className="w-48 h-px bg-white/5 relative overflow-hidden">
          <motion.div
            animate={{ left: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-[#D72638] to-transparent"
          />
        </div>

        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-[9px] font-mono text-white/30 uppercase tracking-[0.3em]"
        >
          Syncing Neural Nodes...
        </motion.div>
      </div>
    </div>

    {/* HUD Borders */}
    <div className="absolute inset-10 border border-white/5 pointer-events-none">
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#D72638]/40" />
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#D72638]/40" />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#D72638]/40" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#D72638]/40" />
    </div>

    {/* Scanning Line Effect */}
    <motion.div 
      animate={{ top: ['0%', '100%'] }}
      transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
      className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#2979FF]/20 to-transparent z-20 pointer-events-none"
    />
  </div>
);

export default PageLoadingFallback;

