import * as L from 'leaflet';

/* ── Navigator Augmentation ──────────────────────────────────── */
export interface NetworkInformation extends EventTarget {
  readonly effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  readonly saveData: boolean;
  addEventListener(type: 'change', listener: (this: NetworkInformation, ev: Event) => void, options?: boolean | AddEventListenerOptions): void;
  removeEventListener(type: 'change', listener: (this: NetworkInformation, ev: Event) => void, options?: boolean | AddEventListenerOptions): void;
}

declare global {
  interface Navigator {
    readonly connection?: NetworkInformation;
    readonly mozConnection?: NetworkInformation;
    readonly webkitConnection?: NetworkInformation;
  }

  /* ── Speech Recognition ────────────────────────────────────── */
  interface SpeechRecognitionEvent extends Event {
    results: {
      [key: number]: {
        [key: number]: {
          transcript: string;
        };
      };
      length: number;
    };
  }

  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message?: string;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: any) => void;
    onend: () => void;
  }

  /* ── D3 Global ─────────────────────────────────────────────── */
  interface D3Scale {
    domain(range: number[]): D3Scale;
    range(range: number[]): D3Scale;
    (value: number): number;
  }

  interface D3Transition {
    duration(ms: number): D3Transition;
    delay(ms: number): D3Transition;
    style(name: string, value: string | number): D3Transition;
  }

  interface D3Selection {
    attr(name: string, value: string | number | null): D3Selection;
    style(name: string, value: string | number): D3Selection;
    selectAll(selector: string): D3Selection;
    remove(): D3Selection;
    append(type: string): D3Selection;
    text(value: string): D3Selection;
    transition(): D3Transition;
    data(data: unknown[]): D3Selection;
    enter(): D3Selection;
  }

  interface D3Interface {
    select(element: SVGSVGElement | null | string): D3Selection;
    scaleSqrt(): D3Scale;
  }

  interface Window {
    d3: D3Interface;
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }

  /* ── OSRM Routing ────────────────────────────────────────────── */
  interface OSRMRoute {
    geometry: {
      coordinates: [number, number][];
    };
    duration: number;
    distance: number;
  }

  interface OSRMResponse {
    code: string;
    routes: OSRMRoute[];
  }
}

/* ── Leaflet Augmentation ────────────────────────────────────── */
declare module 'leaflet' {
  export function heatLayer(
    latlngs: L.LatLngExpression[] | [number, number, number][],
    options?: Record<string, unknown>
  ): L.Layer;
}
