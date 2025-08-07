import { type FC, useCallback, useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { clsx } from 'clsx';
import { DropdownMenu } from 'radix-ui';
import { Button } from 'ui';
import { useVoiceRecording } from '_infrastructure/contexts';

type TDictaphoneProps = {
  isKeyDownReady: boolean;
  onStart: () => void;
  onStop: (transcript: string) => void;
};

export const Dictaphone: FC<TDictaphoneProps> = ({ isKeyDownReady, onStart, onStop }) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    browserSupportsContinuousListening,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  const { toggleListening } = useVoiceRecording();

  useEffect(() => {
    toggleListening(listening);
  }, [listening, toggleListening]);

  const availableLanguages = navigator.languages || ['en-US'];
  const [selectedLanguage, setSelectedLanguage] = useState(availableLanguages[0]);

  const handleBeforeVoiceRecord = useCallback(() => {
    if (listening) {
      return;
    }

    onStart();
  }, [listening, onStart]);

  const handleVoiceRecord = useCallback(() => {
    // eslint-disable-next-line no-console
    console.log('browserSupportsSpeechRecognition', browserSupportsSpeechRecognition);

    resetTranscript();
    SpeechRecognition.startListening({
      continuous: browserSupportsContinuousListening,
      language: selectedLanguage,
    });
  }, [
    browserSupportsContinuousListening,
    resetTranscript,
    selectedLanguage,
    browserSupportsSpeechRecognition,
  ]);

  const handleVoiceStop = useCallback(() => {
    SpeechRecognition.stopListening();

    if (transcript.trim()) {
      onStop(transcript);
    }
  }, [onStop, transcript]);

  // Handle keyboard shortcuts for voice recording
  useEffect(() => {
    if (!isMicrophoneAvailable || !isKeyDownReady) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt' && !e.ctrlKey && !e.shiftKey && !e.metaKey && !listening) {
        handleBeforeVoiceRecord();
        handleVoiceRecord();
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt' && listening) {
        handleVoiceStop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    handleBeforeVoiceRecord,
    handleVoiceRecord,
    handleVoiceStop,
    isMicrophoneAvailable,
    isKeyDownReady,
    listening,
  ]);

  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  return (
    <div className="flex items-center mr-4">
      <div className={clsx('recording-dot', { hidden: !listening })} />

      <Button
        onClick={listening ? handleVoiceStop : handleVoiceRecord}
        onMouseDown={handleBeforeVoiceRecord}
        variant="secondary"
        disabled={!isMicrophoneAvailable}
      >
        {listening ? 'Stop recording' : 'Record voice'}
      </Button>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button variant="secondary" type="button">
            {selectedLanguage}
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          className="max-h-60 overflow-y-auto bg-white rounded-custom shadow"
          sideOffset={5}
        >
          {availableLanguages.map((lang) => (
            <DropdownMenu.Item
              key={lang}
              className={clsx('cursor-pointer px-4 py-2 hover:bg-gray3', {
                'bg-gray4': lang === selectedLanguage,
              })}
              onSelect={() => setSelectedLanguage(lang)}
            >
              {lang}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  );
};
