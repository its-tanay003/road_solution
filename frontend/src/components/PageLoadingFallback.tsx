
const PageLoadingFallback = () => (
  <div className="min-h-screen bg-[#080C14] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-[#D72638] border-t-transparent rounded-full animate-spin" />
      <span className="text-[#A0AEC0] text-sm font-mono">Loading...</span>
    </div>
  </div>
);

export default PageLoadingFallback;
