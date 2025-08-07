import type { ReactNode } from 'react';
import { VoiceRecordingProvider } from '../contexts';

type TestVoiceRecordingProviderProps = {
  children: ReactNode;
  initialListeningState?: boolean;
};

export const TestVoiceRecordingProvider = ({
  children,
  initialListeningState = false,
}: TestVoiceRecordingProviderProps) => {
  return (
    <VoiceRecordingProvider initialListeningState={initialListeningState}>
      {children}
    </VoiceRecordingProvider>
  );
};
