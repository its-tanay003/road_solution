import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, Video, FileText, X, Loader2, Play } from 'lucide-react';
import { extractMultipleFrames } from '../../utils/frameExtractor';
import { useAssistantOrchestrator } from '../../hooks/useAssistantOrchestrator';

export const FileUploadArea: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [processingState, setProcessingState] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const { sendToAI } = useAssistantOrchestrator();

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  }, []);

  const handleFiles = async (newFiles: File[]) => {
    const processed = newFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      type: file.type
    }));
    setFiles(prev => [...prev, ...processed]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter(f => f.id !== id);
    });
  };

  const analyseFiles = async () => {
    setProcessingState('Extracting context...');
    setProgress(10);
    
    try {
      for (const fileObj of files) {
        if (fileObj.type.startsWith('video/')) {
          setProcessingState('Extracting video frames...');
          const video = document.createElement('video');
          video.src = URL.createObjectURL(fileObj.file);
          video.muted = true;
          await new Promise(resolve => video.onloadedmetadata = resolve);
          
          const frames = await extractMultipleFrames(video, 5, 1000);
          setProgress(60);
          
          if (frames.length > 0) {
            await sendToAI(`Analyzing video: ${fileObj.file.name}`, frames[0]);
          }
        } else if (fileObj.type.startsWith('image/')) {
          setProcessingState(`Analyzing ${fileObj.file.name}...`);
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(fileObj.file);
          });
          await sendToAI(`Analyzing image: ${fileObj.file.name}`, base64);
        }
      }
      setProcessingState('Finalizing report...');
      setProgress(100);
    } catch (err) {
      console.error('File analysis failed:', err);
    } finally {
      setTimeout(() => {
        setProcessingState(null);
        setProgress(0);
        setFiles([]);
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#080C14] p-6">
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`flex-1 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 transition-all ${
          isDragging ? 'border-[#FF9933] bg-[#FF9933]/5 scale-[0.99]' : 'border-slate-800 bg-slate-900/30'
        }`}
      >
        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-gray-400">
          <FileUp size={32} />
        </div>
        <div className="text-center">
          <h3 className="text-white font-bold">Upload Medical Evidence</h3>
          <p className="text-gray-500 text-sm mt-1">Drag and drop images, videos or documents</p>
        </div>
        <input 
          type="file" 
          multiple 
          className="hidden" 
          id="file-upload" 
          onChange={(e) => handleFiles(Array.from(e.target.files || []))}
        />
        <label 
          htmlFor="file-upload"
          className="px-6 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold cursor-pointer hover:bg-slate-700 transition-colors"
        >
          BROWSE FILES
        </label>
        <p className="text-[10px] text-gray-600 uppercase tracking-widest">Max file size: 50MB</p>
      </div>

      <div className="mt-6 space-y-3 max-h-60 overflow-y-auto no-scrollbar">
        <AnimatePresence>
          {files.map((f) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-4 bg-slate-900 p-3 rounded-2xl border border-slate-800"
            >
              <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                {f.preview ? (
                  <img src={f.preview} alt={`Preview of ${f.file.name}`} className="w-full h-full object-cover" />
                ) : f.type.startsWith('video/') ? (
                  <Video size={20} className="text-blue-400" />
                ) : (
                  <FileText size={20} className="text-amber-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{f.file.name}</p>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-tight">
                  {(f.file.size / 1024 / 1024).toFixed(2)} MB • {f.type.split('/')[1] || 'FILE'}
                </p>
              </div>
              <button 
                onClick={() => removeFile(f.id)}
                className="p-2 text-gray-500 hover:text-white transition-colors"
                title="Remove file"
              >
                <X size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {files.length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={analyseFiles}
          disabled={!!processingState}
          className="mt-6 w-full h-14 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {processingState ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>{processingState} ({progress}%)</span>
            </>
          ) : (
            <>
              <Play size={18} />
              <span>ANALYSE THIS EVIDENCE</span>
            </>
          )}
        </motion.button>
      )}
    </div>
  );
};
