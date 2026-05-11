export const extractFrame = (videoEl: HTMLVideoElement): string => {
  if (!videoEl) return '';
  
  const canvas = document.createElement('canvas');
  canvas.width = videoEl.videoWidth;
  canvas.height = videoEl.videoHeight;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  ctx.drawImage(videoEl, 0, 0);
  
  // Return compressed JPEG for API efficiency as requested (0.7 quality)
  return canvas.toDataURL('image/jpeg', 0.7);
};

export const extractMultipleFrames = async (
  videoEl: HTMLVideoElement,
  count: number = 5,
  intervalMs: number = 2000
): Promise<string[]> => {
  const frames: string[] = [];
  
  for (let i = 0; i < count; i++) {
    frames.push(extractFrame(videoEl));
    if (i < count - 1) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }
  
  return frames;
};
