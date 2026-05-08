import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type MedicalContact = {
  name: string
  phone: string
  relationship: string
}

export type MedicalProfile = {
  name: string
  age: string
  bloodType: string
  conditions: string[]
  allergies: string
  medications: string
  contacts: MedicalContact[]
  language: 'en' | 'hi' | 'ta'
  profileComplete: boolean
}

interface MedicalProfileState extends MedicalProfile {
  setProfile: (profile: Partial<MedicalProfile>) => void
  setBloodType: (bloodType: string) => void
  setConditions: (conditions: string[]) => void
  setContacts: (contacts: MedicalContact[]) => void
  syncWithSupabase: () => Promise<void>
  resetProfile: () => void
}

const initialState: MedicalProfile = {
  name: '',
  age: '',
  bloodType: 'Unknown',
  conditions: [],
  allergies: '',
  medications: '',
  contacts: [],
  language: 'en',
  profileComplete: false
}

export const useMedicalProfileStore = create<MedicalProfileState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setProfile: (profile) => set((state) => ({ ...state, ...profile })),
      setBloodType: (bloodType) => set({ bloodType }),
      setConditions: (conditions) => set({ conditions }),
      setContacts: (contacts) => set({ contacts }),
      syncWithSupabase: async () => {
        // Implementation for cloud sync if needed
        console.log('Syncing medical profile...', get());
      },
      resetProfile: () => set(initialState)
    }),
    {
      name: 'roadsos-medical-profile',
      version: 1
    }
  )
)
