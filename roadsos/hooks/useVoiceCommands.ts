'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import { useSOSStore } from '@/lib/store/sosStore';
import { useChatStore } from '@/lib/store/chatStore';
import { useVoiceStore } from '@/lib/store/voiceStore';

const LANGUAGE_LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  hi: 'hi-IN',
  gu: 'gu-IN',
  es: 'es-ES',
  fr: 'fr-FR',
  ar: 'ar-SA',
  pt: 'pt-BR',
  zh: 'zh-CN',
  bn: 'bn-IN',
  ru: 'ru-RU',
};

const CONFIRMATIONS: Record<string, Record<string, string>> = {
  en: {
    sos: 'SOS activated. Broadcasting emergency beacon.',
    map: 'Opening emergency map.',
    hospital: 'Searching for nearest hospital.',
    chat: 'Opening AI chat assistant.',
    dark: 'Switching to dark mode.',
    light: 'Switching to light mode.',
    lang: 'Language changed.',
    help: 'Opening voice commands help.',
    cancel: 'Voice commands deactivated.',
    default: 'Command recognized.'
  },
  hi: {
    sos: 'एसओएस सक्रिय हो गया है। आपातकालीन अलर्ट भेजा जा रहा है।',
    map: 'आपातकालीन मानचित्र खोल रहे हैं।',
    hospital: 'निकटतम अस्पताल की खोज की जा रही है।',
    chat: 'एआई चैट सहायक खोल रहे हैं।',
    dark: 'डार्क मोड पर स्विच कर रहे हैं।',
    light: 'लाइट मोड पर स्विच कर रहे हैं।',
    lang: 'भाषा बदल दी गई है।',
    help: 'आवाज कमांड सहायता खोल रहे हैं।',
    cancel: 'आवाज कमांड निष्क्रिय कर दिए गए हैं।',
    default: 'कमांड स्वीकार किया गया।'
  },
  gu: {
    sos: 'એસઓએસ સક્રિય કરવામાં આવ્યું છે. કટોકટી ચેતવણી મોકલાઈ રહી છે.',
    map: 'કટોકટી નકશો ખોલી રહ્યા છીએ.',
    hospital: 'નજીકની હોસ્પિટલ શોધી રહ્યા છીએ.',
    chat: 'એઆઈ ચેટ સહાયક ખોલી રહ્યા છીએ.',
    dark: 'ડાર્ક મોડ ચાલુ કરી રહ્યા છીએ.',
    light: 'લાઇટ મોડ ચાલુ કરી રહ્યા છીએ.',
    lang: 'ભાષા બદલવામાં આવી છે.',
    help: 'વૉઇસ કમાન્ડ હેલ્પ ખોલી રહ્યા છીએ.',
    cancel: 'વૉઇસ કમાન્ડ નિષ્ક્રિય કરવામાં આવ્યા છે.',
    default: 'કમાન્ડ સ્વીકારવામાં આવ્યો.'
  },
  es: {
    sos: 'SOS activado. Transmitiendo señal de emergencia.',
    map: 'Abriendo mapa de emergencia.',
    hospital: 'Buscando el hospital más cercano.',
    chat: 'Abriendo asistente de chat de inteligencia artificial.',
    dark: 'Cambiando a modo oscuro.',
    light: 'Cambiando a modo claro.',
    lang: 'Idioma cambiado.',
    help: 'Abriendo ayuda de comandos de voz.',
    cancel: 'Comandos de voz desactivados.',
    default: 'Comando reconocido.'
  },
  fr: {
    sos: 'SOS activé. Diffusion de la balise de détresse.',
    map: 'Ouverture de la carte d\'urgence.',
    hospital: 'Recherche de l\'hôpital le plus proche.',
    chat: 'Ouverture de l\'assistant de chat IA.',
    dark: 'Activation du mode sombre.',
    light: 'Activation du mode clair.',
    lang: 'Langue modifiée.',
    help: 'Ouverture de l\'aide aux commandes vocales.',
    cancel: 'Commandes vocales désactivées.',
    default: 'Commande reconnue.'
  },
  ar: {
    sos: 'تم تفعيل طوارئ SOS. جاري بث إشارة الاستغاثة.',
    map: 'جاري فتح خريطة الطوارئ.',
    hospital: 'جاري البحث عن أقرب مستشفى.',
    chat: 'جاري فتح مساعد الدردشة الذكي.',
    dark: 'التحويل إلى الوضع الداكن.',
    light: 'التحويل إلى الوضع الفاتح.',
    lang: 'تم تغيير اللغة.',
    help: 'جاري فتح قائمة أوامر الصوت.',
    cancel: 'تم إلغاء تفعيل الأوامر الصوتية.',
    default: 'تم التعرف على الأمر.'
  },
  pt: {
    sos: 'SOS ativado. Transmitindo alerta de emergência.',
    map: 'Abrindo mapa de emergência.',
    hospital: 'Procurando o hospital mais próximo.',
    chat: 'Abrindo assistente de chat IA.',
    dark: 'Cambiando para modo escuro.',
    light: 'Cambiando para modo claro.',
    lang: 'Idioma alterado.',
    help: 'Abrindo ajuda de comandos de voz.',
    cancel: 'Comandos de voz desativados.',
    default: 'Comando reconhecido.'
  },
  zh: {
    sos: 'SOS已激活。正在广播紧急求救信号。',
    map: '正在打开紧急地图。',
    hospital: '正在寻找最近的医院。',
    chat: '正在打开AI聊天助手。',
    dark: '正在切换到深色模式。',
    light: '正在切换到浅色模式。',
    lang: '语言已更改。',
    help: '正在打开语音命令帮助。',
    cancel: '语音命令已关闭。',
    default: '命令已识别。'
  },
  bn: {
    sos: 'এসওএস সক্রিয় করা হয়েছে। জরুরি সতর্কতা সম্প্রচার করা হচ্ছে।',
    map: 'জরুরি মানচিত্র খোলা হচ্ছে।',
    hospital: 'নিকটস্থ হাসপাতাল খোঁজা হচ্ছে।',
    chat: 'এআই চ্যাট সহকারী খোলা হচ্ছে।',
    dark: 'ডার্ক মোড সক্রিয় করা হচ্ছে।',
    light: 'লাইট মোড সক্রিয় করা হচ্ছে।',
    lang: 'ভাষা পরিবর্তন করা হয়েছে।',
    help: 'কণ্ঠ নির্দেশিকা সহায়তা খোলা হচ্ছে।',
    cancel: 'কণ্ঠ নির্দেশিকা নিষ্ক্রিয় করা হয়েছে।',
    default: 'কমান্ড স্বীকৃত।'
  },
  ru: {
    sos: 'Режим SOS активирован. Передача сигнала бедствия.',
    map: 'Открытие экстренной карты.',
    hospital: 'Поиск ближайшей больницы.',
    chat: 'Открытие ИИ-ассистента.',
    dark: 'Переключение на темную тему.',
    light: 'Переключение на светлую тему.',
    lang: 'Язык изменен.',
    help: 'Открытие справки по голосовым командам.',
    cancel: 'Голосовое управление отключено.',
    default: 'Команда распознана.'
  }
};

const LANG_NAMES: Record<string, string> = {
  hindi: 'hi',
  gujarati: 'gu',
  spanish: 'es',
  french: 'fr',
  arabic: 'ar',
  portuguese: 'pt',
  chinese: 'zh',
  bengali: 'bn',
  russian: 'ru',
  english: 'en',
};

export function useVoiceCommands() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const { setTheme } = useTheme();
  
  // SOS and Chat store triggers
  const armSOS = useSOSStore((s) => s.arm);
  const setChatOpen = useChatStore((s) => s.toggle);
  const isChatOpen = useChatStore((s) => s.isOpen);

  // Voice store getters/setters
  const {
    isListening,
    transcript,
    lastCommand,
    isCommandMode,
    setListening,
    setTranscript,
    setLastCommand,
    setOverlayOpen,
    setCommandMode,
    setCommandText,
    setShowGreenFlash,
  } = useVoiceStore();

  const recognitionRef = useRef<any>(null);
  const commandModeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const greenFlashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.1;
    utter.lang = LANGUAGE_LOCALE_MAP[i18n.language] || 'en-US';
    window.speechSynthesis.speak(utter);
  }, [i18n.language]);

  const speakConfirmation = useCallback((type: string) => {
    const lang = i18n.language || 'en';
    const dict = CONFIRMATIONS[lang] || CONFIRMATIONS['en'];
    const phrase = dict[type] || dict['default'];
    speak(phrase);
  }, [i18n.language, speak]);

  const executeCommand = useCallback((cmd: string): boolean => {
    const cleanCmd = cmd.toLowerCase().trim();
    
    // Brief green flash and text display helper
    const triggerVisualFeedback = (text: string) => {
      setLastCommand(text);
      setCommandText(text);
      setShowGreenFlash(true);
      if (greenFlashTimeoutRef.current) clearTimeout(greenFlashTimeoutRef.current);
      greenFlashTimeoutRef.current = setTimeout(() => {
        setShowGreenFlash(false);
      }, 2000);
    };

    // 1. SOS activation
    if (
      cleanCmd.includes('send sos') ||
      cleanCmd.includes('activate sos') ||
      cleanCmd.includes('emergency')
    ) {
      triggerVisualFeedback('SOS Activated');
      armSOS('voice');
      speakConfirmation('sos');
      return true;
    }

    // 2. Navigation
    if (cleanCmd.includes('open map') || cleanCmd.includes('show map')) {
      triggerVisualFeedback('Open Map');
      router.push('/map');
      speakConfirmation('map');
      return true;
    }

    if (cleanCmd.includes('find hospital') || cleanCmd.includes('nearest hospital')) {
      triggerVisualFeedback('Find Hospital');
      router.push('/map?filter=hospital');
      speakConfirmation('hospital');
      return true;
    }

    // 3. Hotlines
    if (
      cleanCmd.includes('call ambulance') ||
      cleanCmd.includes('call 108') ||
      cleanCmd.includes('call 112')
    ) {
      triggerVisualFeedback('Calling Ambulance');
      speakConfirmation('default');
      window.location.href = 'tel:108';
      return true;
    }

    // 4. Open Chat Widget
    if (cleanCmd.includes('open chat') || cleanCmd.includes('talk to ai')) {
      triggerVisualFeedback('Open AI Chat');
      if (!isChatOpen) {
        setChatOpen();
      }
      speakConfirmation('chat');
      return true;
    }

    // 5. Dark / Light Mode Toggle
    if (cleanCmd.includes('dark mode')) {
      triggerVisualFeedback('Dark Mode');
      setTheme('dark');
      speakConfirmation('dark');
      return true;
    }

    if (cleanCmd.includes('light mode')) {
      triggerVisualFeedback('Light Mode');
      setTheme('light');
      speakConfirmation('light');
      return true;
    }

    // 6. Language Swapping
    for (const [langName, code] of Object.entries(LANG_NAMES)) {
      if (
        cleanCmd.includes(`change language to ${langName}`) ||
        cleanCmd.includes(`switch to ${langName}`) ||
        cleanCmd.includes(`switch language to ${langName}`)
      ) {
        triggerVisualFeedback(`Switching to ${langName}`);
        void i18n.changeLanguage(code);
        speakConfirmation('lang');
        return true;
      }
    }

    // 7. Show Commands Help
    if (cleanCmd.includes('show commands') || cleanCmd.includes('help')) {
      triggerVisualFeedback('Opening Help');
      setOverlayOpen(true);
      speakConfirmation('help');
      return true;
    }

    // 8. Cancel / Deactivate
    if (cleanCmd.includes('cancel') || cleanCmd.includes('stop listening')) {
      triggerVisualFeedback('Deactivating Voice Commands');
      setListening(false);
      speakConfirmation('cancel');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      return true;
    }

    return false;
  }, [router, i18n, setTheme, armSOS, isChatOpen, setChatOpen, setListening, setLastCommand, setCommandText, setShowGreenFlash, setOverlayOpen, speakConfirmation]);

  // Command mode timer handler
  const handleWakeWord = useCallback(() => {
    setCommandMode(true);
    speak(i18n.language === 'hi' ? 'जी, मैं सुन रहा हूँ। आदेश दें।' : 'Command mode active. Speak now.');
    
    if (commandModeTimeoutRef.current) clearTimeout(commandModeTimeoutRef.current);
    commandModeTimeoutRef.current = setTimeout(() => {
      setCommandMode(false);
    }, 5000);
  }, [i18n.language, speak, setCommandMode]);

  const processText = useCallback((text: string) => {
    const cleanText = text.toLowerCase();
    
    // Always detect wake words
    if (cleanText.includes('hey emergency') || cleanText.includes('sos help')) {
      handleWakeWord();
      return;
    }

    // If in command mode OR if standard command matches directly
    if (isCommandMode) {
      const executed = executeCommand(cleanText);
      if (executed) {
        setCommandMode(false);
        if (commandModeTimeoutRef.current) clearTimeout(commandModeTimeoutRef.current);
      }
    } else {
      // Allow direct command execution without wake word as a failsafe/convenience
      executeCommand(cleanText);
    }
  }, [isCommandMode, handleWakeWord, executeCommand, setCommandMode]);

  const startListening = useCallback(() => {
    setListening(true);
    speak(i18n.language === 'hi' ? 'आवाज गाइड सक्रिय' : 'Voice commands enabled');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {}
    }
  }, [setListening, speak, i18n.language]);

  const stopListening = useCallback(() => {
    setListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  }, [setListening]);

  // Setup browser Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const w = window as any;
    const SpeechRecognitionClass = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      console.warn('Speech recognition not supported in this browser.');
      return;
    }

    const rec = new SpeechRecognitionClass();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = LANGUAGE_LOCALE_MAP[i18n.language] || 'en-US';

    rec.onresult = (event: any) => {
      const latest = event.results[event.results.length - 1];
      const text = latest[0].transcript;
      setTranscript(text);

      if (latest.isFinal) {
        processText(text);
        // Clear transcript after processing
        setTimeout(() => setTranscript(''), 1000);
      }
    };

    rec.onerror = (event: any) => {
      if (event.error !== 'no-speech') {
        console.warn('Speech recognition error:', event.error);
      }
    };

    rec.onend = () => {
      // Restart if still set to listening
      if (useVoiceStore.getState().isListening) {
        try {
          rec.start();
        } catch {}
      }
    };

    recognitionRef.current = rec;

    if (isListening) {
      try {
        rec.start();
      } catch {}
    }

    return () => {
      try {
        rec.stop();
      } catch {}
      if (commandModeTimeoutRef.current) clearTimeout(commandModeTimeoutRef.current);
      if (greenFlashTimeoutRef.current) clearTimeout(greenFlashTimeoutRef.current);
    };
  }, [isListening, i18n.language, processText, setTranscript]);

  return {
    isListening,
    transcript,
    lastCommand,
    startListening,
    stopListening
  };
}
