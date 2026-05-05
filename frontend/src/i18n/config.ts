import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      sos: {
        trigger: "TAP TO TRIGGER SOS",
        help: "HELP / मदद / உதவி",
        cancel: "CANCEL",
        active: "EMERGENCY ACTIVE"
      },
      dashboard: {
        title: "ROADSoS Neural Triage",
        aiAnalysis: "AI Triage Engine",
        responderRouting: "Responder Routing"
      },
      terms: {
        accident: "Accident",
        injury: "Injury",
        bleeding: "Bleeding",
        unconscious: "Unconscious",
        fire: "Fire",
        police: "Police",
        ambulance: "Ambulance",
        hospital: "Hospital",
        location: "Location",
        vehicle: "Vehicle",
        severity: "Severity",
        critical: "Critical",
        stable: "Stable",
        firstAid: "First Aid",
        nearby: "Nearby",
        alerted: "Alerted"
      }
    }
  },
  hi: {
    translation: {
      sos: {
        trigger: "एसओएस चालू करने के लिए टैप करें",
        help: "HELP / मदद / உதவி",
        cancel: "रद्द करें",
        active: "आपातकाल सक्रिय"
      },
      dashboard: {
        title: "ROADSoS न्यूरल ट्राइएज",
        aiAnalysis: "एआई ट्राइएज इंजन",
        responderRouting: "रिस्पॉन्डर रूटिंग"
      },
      terms: {
        accident: "दुर्घटना",
        injury: "चोट",
        bleeding: "रक्तस्राव",
        unconscious: "बेहोश",
        fire: "आग",
        police: "पुलिस",
        ambulance: "एम्बुलेंस",
        hospital: "अस्पताल",
        location: "स्थान",
        vehicle: "वाहन",
        severity: "गंभीरता",
        critical: "अत्यधिक गंभीर",
        stable: "स्थिर",
        firstAid: "प्राथमिक चिकित्सा",
        nearby: "पास में",
        alerted: "सूचित किया गया"
      }
    }
  },
  ta: {
    translation: {
      sos: {
        trigger: "அவசரநிலையை தூண்ட தட்டவும்",
        help: "HELP / मदद / உதவி",
        cancel: "ரத்து செய்",
        active: "அவசரநிலை செயலில் உள்ளது"
      },
      dashboard: {
        title: "ROADSoS நியூரல் ட்ரேஜ்",
        aiAnalysis: "AI ட்ரேஜ் இயந்திரம்",
        responderRouting: "பதிலளிப்பவர் ரூட்டிங்"
      },
      terms: {
        accident: "விபத்து",
        injury: "காயம்",
        bleeding: "இரத்தப்போக்கு",
        unconscious: "நினைவிழந்த நிலை",
        fire: "தீ",
        police: "காவல்துறை",
        ambulance: "ஆம்புலன்ஸ்",
        hospital: "மருத்துவமனை",
        location: "இடம்",
        vehicle: "வாகனம்",
        severity: "தீவிரம்",
        critical: "மிகவும் மோசம்",
        stable: "நிலையானது",
        firstAid: "முதலுதவி",
        nearby: "அருகிலுள்ள",
        alerted: "எச்சரிக்கப்பட்டது"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
