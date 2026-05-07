import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type MedicalProfile = {
  name: string
  age: string
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | ''
  conditions: string[]
  allergies: string
  medications: string
  emergencyContact1Name: string
  emergencyContact1Phone: string
  emergencyContact2Name: string
  emergencyContact2Phone: string
  language: 'en' | 'hi' | 'ta'
  profileComplete: boolean
}

interface MedicalProfileState extends MedicalProfile {
  setProfile: (profile: Partial<MedicalProfile>) => void
  resetProfile: () => void
}

const initialState: MedicalProfile = {
  name: '',
  age: '',
  bloodType: '',
  conditions: [],
  allergies: '',
  medications: '',
  emergencyContact1Name: '',
  emergencyContact1Phone: '',
  emergencyContact2Name: '',
  emergencyContact2Phone: '',
  language: 'en',
  profileComplete: false
}

export const useMedicalProfileStore = create<MedicalProfileState>()(
  persist(
    (set) => ({
      ...initialState,
      setProfile: (profile) => set((state) => ({ ...state, ...profile })),
      resetProfile: () => set(initialState)
    }),
    {
      name: 'roadsos-medical-profile',
      version: 1
    }
  )
)
