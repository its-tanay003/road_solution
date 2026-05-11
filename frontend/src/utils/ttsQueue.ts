export class TTSQueue {
  private queue: string[] = [];
  private isSpeaking = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  speak(text: string, lang: string = 'en-US') {
    this.queue.push(text);
    if (!this.isSpeaking) {
      this.processQueue(lang);
    }
  }

  private processQueue(lang: string) {
    if (this.queue.length === 0) {
      this.isSpeaking = false;
      return;
    }

    this.isSpeaking = true;
    const text = this.queue.shift()!;
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Voice selection logic
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice: SpeechSynthesisVoice | undefined;

    if (lang.startsWith('hi')) {
      selectedVoice = voices.find(v => v.name.includes('Google हिन्दी') || v.lang.startsWith('hi'));
    } else if (lang.startsWith('ta')) {
      selectedVoice = voices.find(v => v.name.includes('Google தமிழ்') || v.lang.startsWith('ta'));
    } else {
      selectedVoice = voices.find(v => v.name.includes('Google US English') || v.lang.startsWith('en-US'));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.volume = 1.0;

    utterance.onend = () => {
      this.processQueue(lang);
    };

    utterance.onerror = () => {
      this.processQueue(lang);
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  stop() {
    window.speechSynthesis.cancel();
    this.queue = [];
    this.isSpeaking = false;
    this.currentUtterance = null;
  }

  pause() {
    window.speechSynthesis.pause();
  }

  resume() {
    window.speechSynthesis.resume();
  }
}

export const ttsQueue = new TTSQueue();
