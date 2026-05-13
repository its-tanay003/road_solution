import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MedicalProfileState {
  name:            string;
  bloodType:       string;
  conditions:      string[];
  medications:     string[];
  allergies:       string[];
  profileComplete: boolean;
  setProfile: (data: Partial<Omit<MedicalProfileState, 'profileComplete' | 'setProfile'>>) => void;
}

export const useMedicalProfileStore = create<MedicalProfileState>()(
  persist(
    (set, get) => ({
      name:        '',
      bloodType:   '',
      conditions:  [],
      medications: [],
      allergies:   [],
      profileComplete: false,

      setProfile: (data) => {
        set({ ...data });
        const s = get();
        const complete = Boolean(s.name && s.bloodType);
        set({ profileComplete: complete });
      },
    }),
    { name: 'roadsosMediacalProfile' }
  )
);
