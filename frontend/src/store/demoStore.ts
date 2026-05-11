import { create } from 'zustand';
import { useSosStore } from './sosStore';
import { useUIStore } from './uiStore';
import { useNetworkStore } from './networkStore';
import { useNotificationStore } from './notificationStore';
import { useAmbulanceStore } from './ambulanceStore';
import { useWearableStore } from './wearableStore';
import { useLeaderboardStore } from './leaderboardStore';
import { generateiRADReport, submitiRADReport } from '../lib/iradReporter';

interface DemoState {
  isDemoControlOpen: boolean;
  currentScenario: 'CRASH' | 'RURAL' | 'MULTI' | null;
  aiThinking: string[];
  decisionExplanations: {
    responder: { id: string; reason: string; confidence: number } | null;
    hospital: { name: string; reason: string; confidence: number } | null;
  };
  livesSaved: number;
  avgResponseReduction: number;
  isOrchestrating: boolean;
  scenarioStep: number;
  scenarioTime: number;
  isPaused: boolean;
  playbackSpeed: number;
  isScreenshotMode: boolean;
  isPresentationMode: boolean;
  showShortcuts: boolean;
  isDemoMode: boolean;
  
  setDemoMode: (val: boolean) => void;
  setDemoControlOpen: (isOpen: boolean) => void;
  startScenario: (scenario: 'CRASH' | 'RURAL' | 'MULTI') => void;
  setOrchestrating: (val: boolean) => void;
  setScenarioStep: (step: number) => void;
  setScenarioTime: (time: number) => void;
  addThinkingStep: (step: string) => void;
  clearThinking: () => void;
  setDecisionExplanation: (type: 'responder' | 'hospital', data: { id?: string; name?: string; reason: string; confidence: number }) => void;
  incrementStats: () => void;
  triggerScenario: (id: number) => void;
  resetAll: () => void;
  setPaused: (val: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  setScreenshotMode: (val: boolean) => void;
  togglePause: () => void;
  setSpeed: (speed: number) => void;
  toggleScreenshot: () => void;
  togglePresentationMode: () => void;
  toggleShortcuts: (val?: boolean) => void;
  vaahanData: {
    plate: string;
    model: string;
    owner: string;
    insurance: string;
    puc: string;
    status: 'IDLE' | 'SEARCHING' | 'FOUND';
  };
  setVaahanStatus: (status: 'IDLE' | 'SEARCHING' | 'FOUND') => void;
}

export const useDemoStore = create<DemoState>((set, get) => ({
  isDemoControlOpen: false,
  currentScenario: null,
  aiThinking: [],
  decisionExplanations: {
    responder: null,
    hospital: null
  },
  livesSaved: JSON.parse(localStorage.getItem('roadsos_operational_stats') || '{}').livesSaved || 1242,
  avgResponseReduction: JSON.parse(localStorage.getItem('roadsos_operational_stats') || '{}').avgResponseReduction || 35,

  isOrchestrating: false,
  scenarioStep: 0,
  scenarioTime: 0,
  isPaused: false,
  playbackSpeed: 1,
  isScreenshotMode: false,
  isPresentationMode: false,
  showShortcuts: false,
  isDemoMode: false,
  
  setDemoMode: (val) => set({ isDemoMode: val }),
  vaahanData: {
    plate: 'TN 09 AZ 4521',
    model: 'Maruti Suzuki Swift VXI (2019)',
    owner: 'RAJESH KUMAR (NAME_WITHHELD)',
    insurance: 'VALID (MAR 2026)',
    puc: 'VALID (NOV 2025)',
    status: 'IDLE'
  },

  setDemoControlOpen: (isOpen) => set({ isDemoControlOpen: isOpen }),
  startScenario: (scenario) => set({ currentScenario: scenario, aiThinking: [], scenarioStep: 0, scenarioTime: 0 }),
  setOrchestrating: (val) => set({ isOrchestrating: val }),
  setScenarioStep: (step) => set({ scenarioStep: step }),
  setScenarioTime: (time) => set({ scenarioTime: time }),
  addThinkingStep: (step) => set((state) => ({ aiThinking: [...state.aiThinking, step] })),
  clearThinking: () => set({ aiThinking: [] }),
  setDecisionExplanation: (type, data) => set((state) => ({
    decisionExplanations: { ...state.decisionExplanations, [type]: data }
  })),
  incrementStats: () => set((state) => ({ 
    livesSaved: state.livesSaved + 1,
    avgResponseReduction: state.avgResponseReduction + 0.1
  })),
  setPaused: (isPaused) => set({ isPaused }),
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
  setScreenshotMode: (isScreenshotMode) => set({ isScreenshotMode }),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  setSpeed: (speed) => set({ playbackSpeed: speed }),
  toggleScreenshot: () => set((state) => ({ isScreenshotMode: !state.isScreenshotMode })),
  togglePresentationMode: () => set((state) => ({ isPresentationMode: !state.isPresentationMode })),
  toggleShortcuts: (val) => set((state) => ({ showShortcuts: val !== undefined ? val : !state.showShortcuts })),
  setVaahanStatus: (status) => set((state) => ({ vaahanData: { ...state.vaahanData, status } })),
  
  resetAll: () => {
    const sosStore = useSosStore.getState();
    sosStore.cancelSos();
    sosStore.setGoldenHourActive(false);
    sosStore.setCrashDetectedAt(null);
    sosStore.setCrashTriggered(false);
    useUIStore.getState().setStressed(false);
    useUIStore.getState().setUxMode('DEFAULT');
    useNetworkStore.getState().setMeshMode(false);
    useNotificationStore.getState().clearAll();
    set({ currentScenario: null, aiThinking: [], isOrchestrating: false, scenarioStep: 0, scenarioTime: 0, isPaused: false });
  },
  
  triggerScenario: (id) => {
    const { resetAll, startScenario, setOrchestrating, setScenarioStep, playbackSpeed } = get();
    resetAll();
    setOrchestrating(true);

    const speedFactor = 1 / playbackSpeed;

    if (id === 1) {
      startScenario('CRASH');
      const sosStore = useSosStore.getState();
      const uiStore = useUIStore.getState();
      const ambulanceStore = useAmbulanceStore.getState();

      // t=0
      sosStore.setGForceData({ x: 12.4, y: 2.1, z: -3.2 });
      useWearableStore.getState().updateHealthData({ spO2: 89 }); 
      sosStore.setCrashTriggered(true);
      sosStore.setCrashDetectedAt(Date.now());
      setScenarioStep(1);

      // t=1: SOS countdown
      setTimeout(() => {
        if (get().isPaused) return;
        sosStore.startCountdown();
        uiStore.setStressed(true);
        setScenarioStep(2);
      }, 1000 * speedFactor);

      // t=11: Dispatch
      setTimeout(() => {
        if (get().isPaused) return;
        sosStore.triggerSos();
        useNotificationStore.getState().addNotification({
          type: 'CRITICAL',
          title: 'AMBULANCE DISPATCHED',
          message: 'Unit MH-108-A47 en route to Urban Crash scene.'
        });

        const incidentLoc = sosStore.location || { lat: 28.6139, lng: 77.2090 };
        const incidentData = { lat: incidentLoc.lat, lng: incidentLoc.lng, roadType: 'NH' as const, nhNumber: 'NH-44', state: 'Karnataka' };
        const triageData = { score: 87, confidence: 91 };
        const report = generateiRADReport(incidentData, triageData);
        submitiRADReport(report).then(ack => {
          sosStore.updateIradReport(report, ack.ackId);
          useNotificationStore.getState().addNotification({
            type: 'HIGH',
            title: 'iRAD REPORT FILED',
            message: `MoRTH iRAD Reference: ${ack.ackId}`
          });
        });

        setScenarioStep(3);
      }, 11000 * speedFactor);

      // t=12: Golden Hour
      setTimeout(() => {
        if (get().isPaused) return;
        useSosStore.getState().setGoldenHourActive(true);
        setScenarioStep(4);
      }, 12000 * speedFactor);

      // t=14: AI Stream
      setTimeout(() => {
        if (get().isPaused) return;
        const thinking = ["Analyzing collision impact...", "Retrieving medical history...", "Calculating optimal trauma center...", "Alerting neurosurgery team..."];
        thinking.forEach((step, i) => setTimeout(() => get().addThinkingStep(step), i * 1000 * speedFactor));
        setScenarioStep(5);
      }, 14000 * speedFactor);

      // t=20: Biometrics erratic
      setTimeout(() => {
        if (get().isPaused) return;
        setScenarioStep(6);
      }, 20000 * speedFactor);

      // t=25: Ambulance moves
      setTimeout(() => {
        if (get().isPaused) return;
        ambulanceStore.dispatchAmbulance("MH-108-A47", [[12.9716, 77.5946], [12.9719, 77.5949], [12.9725, 77.5955]], 120, 1500 * speedFactor);
        setScenarioStep(7);
      }, 25000 * speedFactor);
    }

    if (id === 2) {
      startScenario('RURAL');
      useNetworkStore.getState().setMeshMode(true);
      setScenarioStep(1);
      setTimeout(() => setScenarioStep(2), 4000);
      setTimeout(() => setScenarioStep(3), 8000);
      setTimeout(() => {
        useNetworkStore.getState().setMeshMode(false);
        setScenarioStep(4);
      }, 15000);
    }

    if (id === 3) {
      startScenario('MULTI');
      setScenarioStep(1);
      setTimeout(() => {
        useNotificationStore.getState().addNotification({
          type: 'HIGH',
          title: 'BYSTANDER REPORT',
          message: 'Video feed received from bystander at scene.'
        });
        setScenarioStep(2);
      }, 4000);
      setTimeout(() => setScenarioStep(3), 8000);
      setTimeout(() => setScenarioStep(4), 12000);
    }

    if (id === 4) {
      resetAll();
    }
  }
}));
