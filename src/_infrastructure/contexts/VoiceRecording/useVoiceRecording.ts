import { useContext } from 'react';

import { VoiceRecordingContext } from '.';

export const useVoiceRecording = () => {
  const context = useContext(VoiceRecordingContext);

  if (context === undefined) {
    throw new Error('useVoiceRecording must be used within a VoiceRecordingProvider');
  }

  return context;
};
