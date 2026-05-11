import { useEffect, useState, useCallback, useRef } from 'react';

declare global {
  interface Window {
    faceapi: any;
    jsQR: any;
  }
}

export interface Identity {
  name: string;
  id: string;
  confidence: number;
  isSimulated: boolean;
}

export const useIdentityRecognition = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      const { faceapi } = window;
      if (!faceapi) return;

      const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setIsModelsLoaded(true);
    };

    loadModels();
  }, []);

  const scan = useCallback(async () => {
    if (!videoRef.current || !window.faceapi || !isModelsLoaded) return;

    const { faceapi, jsQR } = window;
    const video = videoRef.current;

    // 1. Face detection
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (detections.length > 0) {
      // Simulate database lookup
      setIdentity({
        name: 'Demo Patient',
        id: 'AID-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        confidence: detections[0].detection.score,
        isSimulated: true,
      });
    } else {
      setIdentity(null);
    }

    // 2. QR Scanning
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) {
        setQrData(code.data);
      }
    }
  }, [isModelsLoaded, videoRef]);

  useEffect(() => {
    if (isModelsLoaded) {
      intervalRef.current = setInterval(scan, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isModelsLoaded, scan]);

  return { identity, qrData, isModelsLoaded };
};
