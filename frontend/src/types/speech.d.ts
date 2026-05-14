/**
 * Web Speech API type declarations.
 * These APIs are vendor-prefixed and not in lib.dom.d.ts by default.
 */

declare global {
  interface SpeechRecognitionResultItem {
    readonly transcript: string;
    readonly confidence: number;
  }

  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionResultItem;
    [index: number]: SpeechRecognitionResultItem;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    onstart: (() => void) | null;
  }

  interface SpeechRecognitionConstructor {
    new (): SpeechRecognition;
  }

  // iOS Safari 13+ DeviceMotionEvent permission API
  interface DeviceMotionEventStatic {
    requestPermission?: () => Promise<'granted' | 'denied'>;
  }

  // PWA BeforeInstallPromptEvent
  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
      outcome: 'accepted' | 'dismissed';
      platform: string;
    }>;
    prompt(): Promise<void>;
  }

  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    deferredPrompt?: BeforeInstallPromptEvent;
  }

  // Network Information API
  interface NetworkInformation extends EventTarget {
    readonly effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
    readonly saveData?: boolean;
    onchange?: (event: Event) => void;
    addEventListener(type: 'change', listener: (this: NetworkInformation, ev: Event) => void, options?: boolean | AddEventListenerOptions): void;
    removeEventListener(type: 'change', listener: (this: NetworkInformation, ev: Event) => void, options?: boolean | EventListenerOptions): void;
  }

  interface Navigator {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
  }

  interface jsPDFInstance {
    setFillColor(r: number, g: number, b: number): void;
    rect(x: number, y: number, w: number, h: number, style?: string): void;
    setTextColor(r: number, g: number, b: number): void;
    setFontSize(size: number): void;
    text(text: string, x: number, y: number): void;
    save(filename: string): void;
    lastAutoTable: {
      finalY: number;
    };
    autoTable(options: object): void;
  }

  interface Window {
    jspdf?: {
      jsPDF: {
        new (): jsPDFInstance;
      };
    };
  }
}

// Ensure this is treated as a module
export {};

