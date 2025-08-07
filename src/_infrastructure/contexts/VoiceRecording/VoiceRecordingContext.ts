import { createContext } from 'react';

type VoiceRecordingContextType = {
  isListening: boolean;
  toggleListening: (value: boolean) => void;
};

export const VoiceRecordingContext = createContext<VoiceRecordingContextType | undefined>(
  undefined,
);
