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

  updateMedicalInfo: (info: Partial<UserState['medicalInfo']>) => void;
  setProfile: (profile: any) => void;
  setBloodType: (type: string) => void;
  setConditions: (conds: string[]) => void;
  resetMedicalInfo: () => void;
  syncMedicalInfo: () => Promise<void>;

  // Responder Mode
  isResponder: boolean;
  toggleResponderMode: () => void;
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

      updateMedicalInfo: (info) => set((state) => {
        const newInfo = { ...state.medicalInfo, ...info };
        return { 
          medicalInfo: newInfo,
          // Sync legacy props
          bloodType: newInfo.bloodGroup,
          age: newInfo.age,
          allergies: newInfo.allergies,
          medications: newInfo.medications,
          profileComplete: newInfo.profileComplete
        };
      }),
      setProfile: (profile) => get().updateMedicalInfo(profile),
      setBloodType: (bloodType) => get().updateMedicalInfo({ bloodGroup: bloodType }),
      setConditions: (conditions) => set({ conditions }),
      
      resetMedicalInfo: () => set((state) => ({
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
      toggleResponderMode: () => set((state) => ({ isResponder: !state.isResponder }))
    }),
    {
      name: 'yirc-user-store'
    }
  )
);

// Backward compatibility aliases
export const useMedicalProfileStore = useUserStore;
