import { create } from 'zustand';

export interface Service {
  id?: string;
  name: string;
  type: string;
  lat?: number;
  lng?: number;
  phone_primary?: string;
  address?: string;
  distance?: number;
  eta?: string;
}

interface ServicesState {
  services: Service[];
  setServices: (services: Service[]) => void;
}

export const useServicesStore = create<ServicesState>((set) => ({
  services: [],
  setServices: (services) => set({ services })
}));
