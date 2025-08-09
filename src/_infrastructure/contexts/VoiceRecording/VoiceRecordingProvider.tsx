import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import { VoiceRecordingContext } from '.';

type VoiceRecordingProviderProps = {
  children: ReactNode;
  initialListeningState?: boolean;
};

export const VoiceRecordingProvider = ({
  children,
  initialListeningState = false,
}: VoiceRecordingProviderProps) => {
  const [isListening, setIsListening] = useState(initialListeningState);

  const toggleListening = useCallback((value: boolean) => {
    setIsListening(value);
  }, []);

  return (
    <VoiceRecordingContext.Provider
      value={{
        isListening,
        toggleListening,
      }}
    >
      {children}
    </VoiceRecordingContext.Provider>
  );
};
