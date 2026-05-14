import { useEffect, useRef, useState } from 'react';

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface PoseResults {
  poseLandmarks?: Landmark[];
}

declare global {
  interface Window {
    // MediaPipe Pose loaded from CDN — no official type package
    Pose: new (opts: { locateFile: (f: string) => string }) => {
      setOptions(opts: Record<string, unknown>): void;
      onResults(cb: (results: PoseResults) => void): void;
      send(args: { image: HTMLVideoElement }): Promise<void>;
      close(): void;
    };
    Camera: new (
      el: HTMLVideoElement,
      opts: { onFrame: () => Promise<void>; width: number; height: number }
    ) => { start(): Promise<void>; stop(): void };
  }
}

export const usePoseDetection = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
  const [pose, setPose] = useState<PoseResults | null>(null);
  const [isReady, setIsReady] = useState(false);
  const poseRef = useRef<InstanceType<Window['Pose']> | null>(null);

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

    poseInstance.onResults((results: PoseResults) => {
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
