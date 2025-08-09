import { useCallback, useEffect, useRef, useState } from 'react';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';

type Options = {
  language: string;
  onCommit: (transcript: string) => void;
  stopIdleMs?: number;
  stopHardCapMs?: number;
  continuous?: boolean;
};

/**
 * In continuous mode, SpeechRecognition can drop the last word if we stop immediately.
 * We implement a "soft stop": request to stop, then actually stop after the transcript
 * goes idle for ~700ms or after a hard cap (~1.8s).
 */
export const useSpeechRecognitionWithSoftStop = ({
  language,
  onCommit,
  stopIdleMs = 700,
  stopHardCapMs = 1800,
  continuous = true,
}: Options) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    browserSupportsContinuousListening,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  const [finishing, setFinishing] = useState(false);
  const transcriptRef = useRef<string>('');

  useEffect(() => {
    transcriptRef.current = transcript ?? '';
  }, [transcript]);

  const idleTimerRef = useRef<number | null>(null);
  const hardCapRef = useRef<number | null>(null);
  const snapshotRef = useRef<string>('');

  const clearTimers = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }

    if (hardCapRef.current) {
      clearTimeout(hardCapRef.current);
      hardCapRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (finishing) {
      return;
    }

    resetTranscript();
    setFinishing(false);
    SpeechRecognition.startListening({
      continuous: continuous && browserSupportsContinuousListening,
      interimResults: true,
      language,
    });
  }, [
    browserSupportsContinuousListening,
    continuous,
    language,
    resetTranscript,
    finishing,
  ]);

  // Request soft stop: wait for idle or hard cap, then stop + commit
  const requestStop = useCallback(() => {
    if (!listening || finishing) {
      return;
    }

    setFinishing(true);

    // Hard cap ensures we don't hang if engine never idles
    hardCapRef.current = window.setTimeout(() => {
      SpeechRecognition.stopListening();

      const t = (transcriptRef.current || '').trim();

      if (t) {
        onCommit(t);
      }

      setFinishing(false);
      clearTimers();
    }, stopHardCapMs);
  }, [listening, finishing, onCommit, stopHardCapMs, clearTimers]);

  // When finishing, if transcript doesn't change for stopIdleMs → stop + commit
  useEffect(() => {
    if (!finishing) {
      return;
    }

    snapshotRef.current = transcriptRef.current;

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    idleTimerRef.current = window.setTimeout(() => {
      if (snapshotRef.current === transcriptRef.current) {
        SpeechRecognition.stopListening();

        const t = (transcriptRef.current || '').trim();

        if (t) {
          onCommit(t);
        }

        setFinishing(false);
        clearTimers();
      }
    }, stopIdleMs);

    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    };
  }, [finishing, stopIdleMs, onCommit, clearTimers]);

  return {
    transcript,
    listening,
    finishing,
    start,
    requestStop,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  };
};
