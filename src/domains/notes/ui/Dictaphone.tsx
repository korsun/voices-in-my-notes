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
    resetTranscript();
    SpeechRecognition.startListening({
      continuous: browserSupportsContinuousListening,
      language: selectedLanguage,
    });
  }, [browserSupportsContinuousListening, resetTranscript, selectedLanguage]);

  const handleVoiceStop = useCallback(() => {
    SpeechRecognition.stopListening();

    if (transcript.trim()) {
      onStop(transcript);
    }
  }, [onStop, transcript]);

  // Stop recording and commit transcript when tab becomes hidden
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden' && listening) {
        handleVoiceStop();
      }
    };

    const onPageHide = () => {
      if (listening) {
        handleVoiceStop();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [listening, handleVoiceStop]);

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
      <Button
        onClick={listening ? handleVoiceStop : handleVoiceRecord}
        onMouseDown={handleBeforeVoiceRecord}
        variant="secondary"
        disabled={!isMicrophoneAvailable}
        className="mx-1"
      >
        <div className={clsx('recording-dot mr-4', { hidden: !listening })} />
        {listening ? 'Stop recording' : 'Record voice'}
      </Button>

      {listening ? (
        <Button variant="secondary" type="button" disabled className="mx-1">
          {selectedLanguage}
        </Button>
      ) : (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="secondary" type="button" className="mx-1">
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
      )}
    </div>
  );
};
