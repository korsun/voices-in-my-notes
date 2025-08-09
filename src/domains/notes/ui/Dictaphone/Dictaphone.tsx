import { useVoiceRecording } from '_infrastructure/contexts';
import { clsx } from 'clsx';
import { DropdownMenu } from 'radix-ui';
import { type FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from 'ui';
import { useSpeechRecognitionWithSoftStop } from './useSpeechRecognitionWithSoftStop';

type TDictaphoneProps = {
  isKeyDownReady: boolean;
  onStart: () => void;
  onStop: (transcript: string) => void;
};

export const Dictaphone: FC<TDictaphoneProps> = ({
  isKeyDownReady,
  onStart,
  onStop,
}) => {
  const availableLanguages = useMemo(
    () => navigator.languages || ['en-US'],
    [],
  );
  const [selectedLanguage, setSelectedLanguage] = useState(
    availableLanguages[0],
  );

  const {
    listening,
    finishing,
    start,
    requestStop,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognitionWithSoftStop({
    language: selectedLanguage,
    onCommit: onStop,
  });

  const { toggleListening } = useVoiceRecording();

  useEffect(() => {
    toggleListening(listening);
  }, [listening, toggleListening]);

  const handleBeforeVoiceRecord = useCallback(() => {
    if (!listening && !finishing) {
      onStart();
    }
  }, [listening, finishing, onStart]);

  // Visibility/pagehide: request soft stop
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden' && (listening || finishing)) {
        requestStop();
      }
    };
    const onPageHide = () => {
      if (listening || finishing) {
        requestStop();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [listening, finishing, requestStop]);

  // Keyboard push-to-talk: Alt down/up
  useEffect(() => {
    if (!isMicrophoneAvailable || !isKeyDownReady) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'Alt' &&
        !e.ctrlKey &&
        !e.shiftKey &&
        !e.metaKey &&
        !listening &&
        !finishing
      ) {
        handleBeforeVoiceRecord();
        start();
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt' && (listening || finishing)) {
        requestStop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    isMicrophoneAvailable,
    isKeyDownReady,
    listening,
    finishing,
    handleBeforeVoiceRecord,
    start,
    requestStop,
  ]);

  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  return (
    <div className="flex items-center mr-4">
      <Button
        onClick={listening || finishing ? requestStop : start}
        onMouseDown={handleBeforeVoiceRecord}
        variant="secondary"
        disabled={!isMicrophoneAvailable || finishing}
        className="mx-1"
      >
        <div className={clsx('recording-dot mr-4', { hidden: !listening })} />
        {finishing
          ? 'Finishing…'
          : listening
            ? 'Stop recording'
            : 'Record voice'}
      </Button>

      {listening || finishing ? (
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
