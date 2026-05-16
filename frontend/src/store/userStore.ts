import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { COUNTRY_PROFILES, type CountryProfile } from '../data/countries';
import i18n from '../i18n/config';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  notifySms: boolean;
  notifyPush: boolean;
  notifyEmail: boolean;
  alertViaWhatsApp: boolean;
  alertOnSos: boolean;
}

export interface MedicalProfile {
  name:            string;
  age:             string;
  bloodType:       string;
  conditions:      string[];
  medications:     string;
  allergies:       string;
  contacts:        EmergencyContact[];
  language:        'en' | 'hi' | 'ta' | string;
  profileComplete: boolean;
}

interface UserState {
  // Account & Localization
  name: string;
  language: string;
  countryCode: string;
  activeCountry: CountryProfile;
  setLanguage: (lang: string) => void;
  setCountryCode: (code: string) => void;
  switchCountry: (code: string) => void;
  setName: (name: string) => void;

  // Emergency Contacts
  contacts: EmergencyContact[];
  addContact: (contact: EmergencyContact) => void;
  removeContact: (id: string) => void;
  updateContact: (id: string, contact: Partial<EmergencyContact>) => void;
  setContacts: (contacts: EmergencyContact[]) => void;
  primaryEmergencyContact: string | null;
  setPrimaryEmergencyContact: (phone: string) => void;

  // Medical Profile (Merged)
  medicalInfo: {
    bloodGroup: string;
    allergies: string;
    conditions: string;
    age: string;
    medications: string;
    profileComplete: boolean;
  };
  // Legacy aliases for medicalProfileStore compatibility
  bloodType: string;
  age: string;
  allergies: string;
  conditions: string[];
  medications: string;
  profileComplete: boolean;

  updateMedicalInfo: (info: Partial<UserState['medicalInfo'] | MedicalProfile>) => void;
  setProfile: (profile: Partial<UserState['medicalInfo'] | MedicalProfile>) => void;
  setBloodType: (type: string) => void;
  setConditions: (conds: string[]) => void;
  resetMedicalInfo: () => void;
  syncMedicalInfo: () => Promise<void>;

  // Responder Mode
  isResponder: boolean;
  toggleResponderMode: () => void;
  syncWithSupabase: () => Promise<void>; // Alias for syncMedicalInfo
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      name: '',
      language: 'en',
      countryCode: 'IN',
      activeCountry: COUNTRY_PROFILES.IN,
      primaryEmergencyContact: null,
      
      contacts: [],
      medicalInfo: {
        bloodGroup: 'O Positive',
        allergies: 'Penicillin',
        conditions: 'Type 2 Diabetes, Hypertension',
        age: '',
        medications: '',
        profileComplete: false
      },

      // Legacy State Properties
      bloodType: 'O Positive',
      age: '',
      allergies: 'Penicillin',
      conditions: [],
      medications: '',
      profileComplete: false,

      setLanguage: (lang) => {
        i18n.changeLanguage(lang);
        set({ language: lang });
      },
      setCountryCode: (code) => set({ countryCode: code }),
      switchCountry: (code) => {
        const profile = COUNTRY_PROFILES[code];
        if (profile) {
          i18n.changeLanguage(profile.language);
          set({ 
            countryCode: code, 
            activeCountry: profile,
            language: profile.language 
          });
        }
      },
      setName: (name) => set({ name }),
      
      addContact: (contact) => set((state) => ({ 
        contacts: state.contacts.length < 5 ? [...state.contacts, {
          ...contact,
          alertViaWhatsApp: contact.alertViaWhatsApp ?? false,
          alertOnSos: contact.alertOnSos ?? true
        }] : state.contacts 
      })),
      removeContact: (id) => set((state) => ({
        contacts: state.contacts.filter(c => c.id !== id)
      })),
      updateContact: (id, contact) => set((state) => ({
        contacts: state.contacts.map(c => c.id === id ? { ...c, ...contact } : c)
      })),
      setContacts: (contacts) => set({ contacts }),
      setPrimaryEmergencyContact: (phone) => set({ primaryEmergencyContact: phone }),

      updateMedicalInfo: (info: Partial<MedicalProfile | UserState['medicalInfo']>) => set((state) => {
        type UpdateInput = Partial<Omit<MedicalProfile, 'conditions'> & Omit<UserState['medicalInfo'], 'conditions'> & { name?: string; language?: string; conditions?: string | string[] }>;
        const data = info as UpdateInput;
        const medicalInfo = { ...state.medicalInfo };
        
        // Map fields to medicalInfo object
        if (data.bloodType) medicalInfo.bloodGroup = data.bloodType;
        if (data.bloodGroup) medicalInfo.bloodGroup = data.bloodGroup;
        if (data.allergies) medicalInfo.allergies = data.allergies;
        if (data.age) medicalInfo.age = String(data.age);
        if (data.medications) medicalInfo.medications = data.medications;
        if (data.profileComplete !== undefined) medicalInfo.profileComplete = data.profileComplete;
        
        // Sync comma-separated conditions to medicalInfo if array is provided
        if (Array.isArray(data.conditions)) {
          medicalInfo.conditions = data.conditions.join(', ');
        } else if (typeof data.conditions === 'string') {
          medicalInfo.conditions = data.conditions;
        }

        const updates: Partial<UserState> = { medicalInfo };
        
        // Handle top-level fields
        if (data.name) updates.name = data.name;
        if (data.language) updates.language = data.language;
        if (data.contacts) updates.contacts = data.contacts;
        if (data.bloodType) updates.bloodType = data.bloodType;
        if (data.age) updates.age = String(data.age);
        if (data.allergies) updates.allergies = data.allergies;
        if (Array.isArray(data.conditions)) updates.conditions = data.conditions;
        if (data.medications) updates.medications = data.medications;
        if (data.profileComplete !== undefined) updates.profileComplete = data.profileComplete;
        // Sync legacy top-level aliases
        updates.bloodType = medicalInfo.bloodGroup;
        updates.age = medicalInfo.age;
        updates.allergies = medicalInfo.allergies;
        updates.medications = medicalInfo.medications;
        updates.profileComplete = medicalInfo.profileComplete;
        
        if (Array.isArray(info.conditions)) {
          updates.conditions = info.conditions;
        }

        return updates;
      }),
      setProfile: (profile) => get().updateMedicalInfo(profile),
      setBloodType: (bloodType) => get().updateMedicalInfo({ bloodGroup: bloodType }),
      setConditions: (conditions) => set({ conditions }),
      
      resetMedicalInfo: () => set(() => ({
        medicalInfo: {
          bloodGroup: 'Unknown',
          allergies: '',
          conditions: '',
          age: '',
          medications: '',
          profileComplete: false
        },
        bloodType: 'Unknown',
        age: '',
        allergies: '',
        medications: '',
        profileComplete: false,
        conditions: []
      })),
      syncMedicalInfo: async () => {
        console.log('Syncing medical info...', get().medicalInfo);
      },
      
      isResponder: false,
      toggleResponderMode: () => set((state) => ({ isResponder: !state.isResponder })),
      syncWithSupabase: () => get().syncMedicalInfo()
    }),
    {
      name: 'yirc-user-store'
    }
  )
);

// Backward compatibility aliases
export const useMedicalProfileStore = useUserStore;
