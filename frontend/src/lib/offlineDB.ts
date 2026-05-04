import { haversine } from '../utils/geo';

const DB_NAME = 'roadsos_offline';
const DB_VERSION = 2;

interface StoreConfig {
  keyPath: string;
  indexes?: string[];
}

const STORES: Record<string, StoreConfig> = {
  services: { keyPath: 'id', indexes: ['type', 'lat', 'lng', 'savedAt'] },
  emergencyContacts: { keyPath: 'country' },
  mapTiles: { keyPath: 'tileKey' },
  incidentQueue: { keyPath: 'incidentId' },
  userProfile: { keyPath: 'userId' },
  recentCalls: { keyPath: 'id' }
};

export interface OfflineService {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  savedAt: number;
  [key: string]: any;
}

export interface QueuedIncident {
  incidentId: string;
  queuedAt: number;
  type: string;
  lat: number;
  lng: number;
  details?: string;
  [key: string]: any;
}

export interface RecentCall {
  id: string;
  label: string;
  number: string;
  timestamp: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e: IDBVersionChangeEvent) => {
      const db = (e.target as IDBOpenDBRequest).result;
      Object.entries(STORES).forEach(([name, config]) => {
        if (!db.objectStoreNames.contains(name)) {
          const store = db.createObjectStore(name, { keyPath: config.keyPath });
          config.indexes?.forEach(idx => store.createIndex(idx, idx));
        }
      });
    };
    req.onsuccess = (e: Event) => resolve((e.target as IDBOpenDBRequest).result);
    req.onerror = (e: Event) => reject(e);
  });
}

export async function saveServicesForArea(lat: number, lng: number, services: OfflineService[]) {
  const db = await openDB();
  const tx = db.transaction('services', 'readwrite');
  const store = tx.objectStore('services');
  services.forEach(s => store.put({
    ...s, savedAt: Date.now(), forLat: lat, forLng: lng
  }));
  return new Promise(r => tx.oncomplete = r);
}

export async function getCachedServices(lat: number, lng: number, radiusKm = 20) {
  const db = await openDB();
  const all: OfflineService[] = await new Promise((resolve, reject) => {
    const req = db.transaction('services', 'readonly').objectStore('services').getAll();
    req.onsuccess = e => resolve((e.target as IDBRequest).result);
    req.onerror = reject;
  });
  return all.filter(s => haversine(lat, lng, s.lat, s.lng) <= radiusKm)
            .sort((a, b) => haversine(lat, lng, a.lat, a.lng) - haversine(lat, lng, b.lat, b.lng));
}

export async function getCachedServicesCount() {
  const db = await openDB();
  return new Promise<number>((resolve, reject) => {
    const req = db.transaction('services', 'readonly').objectStore('services').count();
    req.onsuccess = e => resolve((e.target as IDBRequest).result);
    req.onerror = reject;
  });
}

export async function queueIncident(incident: QueuedIncident) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('incidentQueue', 'readwrite');
    tx.objectStore('incidentQueue').put({ ...incident, queuedAt: Date.now() });
    tx.oncomplete = resolve;
    tx.onerror = reject;
  });
}

export async function getQueuedIncidents() {
  const db = await openDB();
  return new Promise<QueuedIncident[]>((resolve, reject) => {
    const req = db.transaction('incidentQueue', 'readonly').objectStore('incidentQueue').getAll();
    req.onsuccess = e => resolve((e.target as IDBRequest).result);
    req.onerror = reject;
  });
}

export async function deleteQueuedIncident(incidentId: string) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('incidentQueue', 'readwrite');
    tx.objectStore('incidentQueue').delete(incidentId);
    tx.oncomplete = resolve;
    tx.onerror = reject;
  });
}

export async function syncIncidentQueue(syncFn: (incident: QueuedIncident) => Promise<void>) {
  const queue = await getQueuedIncidents();
  for (const incident of queue) {
    try {
      await syncFn(incident);
      await deleteQueuedIncident(incident.incidentId);
    } catch (err) {
      console.error(`Failed to sync incident ${incident.incidentId}:`, err);
    }
  }
  return queue.length;
}

export async function saveEmergencyNumbers(country: string, data: Record<string, any>) {
  const db = await openDB();
  const tx = db.transaction('emergencyContacts', 'readwrite');
  tx.objectStore('emergencyContacts').put({ country, ...data, savedAt: Date.now() });
  return new Promise(r => tx.oncomplete = r);
}

export async function hasEmergencyNumbers() {
  const db = await openDB();
  const count = await new Promise<number>((r) => {
    const req = db.transaction('emergencyContacts', 'readonly').objectStore('emergencyContacts').count();
    req.onsuccess = e => r((e.target as IDBRequest).result);
  });
  return count > 0;
}

export async function saveRecentCall(label: string, number: string) {
  const db = await openDB();
  const tx = db.transaction('recentCalls', 'readwrite');
  tx.objectStore('recentCalls').put({
    id: `${label}-${Date.now()}`,
    label,
    number,
    timestamp: Date.now()
  });
  return new Promise(r => tx.oncomplete = r);
}

export async function getRecentCalls(): Promise<RecentCall[]> {
  const db = await openDB();
  return new Promise<RecentCall[]>((resolve, reject) => {
    const req = db.transaction('recentCalls', 'readonly').objectStore('recentCalls').getAll();
    req.onsuccess = e => resolve((e.target as IDBRequest).result);
    req.onerror = reject;
  });
}
