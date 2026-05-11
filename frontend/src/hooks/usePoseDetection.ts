import { useEffect, useRef, useState, useCallback } from 'react';

declare global {
  interface Window {
    Pose: any;
    Camera: any;
  }
}

export const usePoseDetection = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [pose, setPose] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const poseRef = useRef<any>(null);

  useEffect(() => {
    if (!videoRef.current || !window.Pose) return;

    const poseInstance = new window.Pose({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      },
    });

    poseInstance.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    poseInstance.onResults((results: any) => {
      setPose(results);
    });

    poseRef.current = poseInstance;

    const camera = new window.Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await poseInstance.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480,
    });

    camera.start().then(() => setIsReady(true));

    return () => {
      camera.stop();
      poseInstance.close();
    };
  }, [videoRef]);

  return { pose, isReady };
};
