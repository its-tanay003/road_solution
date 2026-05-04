import Dexie, { type Table } from 'dexie';

export interface CachedService {
  id: string;
  name: string;
  type: string;
  icon: string;
  lat: number;
  lng: number;
  address: string;
  rating?: number;
  user_ratings_total?: number;
  isOpen?: boolean;
  phone?: string | null;
  website?: string | null;
  photo?: string | null;
  fetchedAt: string;
}

export class RoadSosDatabase extends Dexie {
  nearbyServices!: Table<CachedService>;

  constructor() {
    super('RoadSosDB');
    this.version(1).stores({
      nearbyServices: 'id, type, fetchedAt'
    });
  }
}

export const db = new RoadSosDatabase();
