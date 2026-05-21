'use client';

import { VoiceIndicator } from './VoiceIndicator';
import { VoiceCommandsOverlay } from './VoiceCommandsOverlay';

export function VoiceNavigator() {
  return (
    <>
      <VoiceIndicator />
      <VoiceCommandsOverlay />
    </>
  );
}
