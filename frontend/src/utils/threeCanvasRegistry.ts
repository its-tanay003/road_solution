let activeCanvasCount = 0;
const MAX_CANVASES = 1;

export const threeCanvasRegistry = {
  register: (): boolean => {
    if (activeCanvasCount >= MAX_CANVASES) return false;
    activeCanvasCount++;
    return true;
  },
  unregister: () => {
    activeCanvasCount = Math.max(0, activeCanvasCount - 1);
  },
  canRender: () => activeCanvasCount < MAX_CANVASES,
};
