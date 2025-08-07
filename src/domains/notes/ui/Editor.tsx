import { type FC, useEffect, useRef, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useDebouncedCallback } from 'use-debounce';
import type { TNote } from '../models';
import { Button, ConfirmDialog } from 'ui';
import { insertWithSmartSpacing } from '../helpers';

type TEditorProps = {
  note: TNote | null;
  onUpdateNote: (id: string, updates: Partial<TNote>) => void;
  onDeleteNote: (id: string) => void;
  autoFocusTitle?: boolean;
};

export const Editor: FC<TEditorProps> = ({
  note,
  onUpdateNote,
  onDeleteNote,
  autoFocusTitle = false,
}) => {
  const [title, setTitle] = useState(note?.title ?? '');
  const [text, setText] = useState(note?.text ?? '');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectionRef = useRef<{ start: number; end: number } | null>(null);

  useEffect(() => {
    setTitle(note?.title ?? '');
    setText(note?.text ?? '');
  }, [note]);

  useEffect(() => {
    if (autoFocusTitle && titleRef.current) {
      titleRef.current.focus();
    }
  }, [autoFocusTitle, note?.id]);

  const debouncedUpdate = useDebouncedCallback((id: string, updates: Partial<TNote>) => {
    onUpdateNote(id, updates);
  }, 500);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;

    setTitle(newTitle);

    if (note) {
      debouncedUpdate(note.id, { title: newTitle });
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;

    setText(newText);

    if (note) {
      debouncedUpdate(note.id, { text: newText });
    }
  };

  const handleDelete = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (note) {
      onDeleteNote(note.id);
      setIsConfirmOpen(false);
    }
  };

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  const handleButtonMouseDown = () => {
    if (listening) {
      return;
    }

    const textarea = textareaRef.current;

    // If textarea is focused, save current selection before starting voice recording, otherwise we lose it on button focus
    if (textarea && document.activeElement === textarea) {
      selectionRef.current = {
        start: textarea.selectionStart,
        end: textarea.selectionEnd,
      };
    } else {
      // If textarea is not focused, set selection to the end
      const endPos = text.length;

      selectionRef.current = {
        start: endPos,
        end: endPos,
      };
    }
  };

  const handleVoiceRecord = () => {
    resetTranscript();
    SpeechRecognition.startListening({
      continuous: true,
    });
  };

  const handleVoiceStop = () => {
    SpeechRecognition.stopListening();

    if (!transcript.trim()) {
      return;
    }

    const selection = selectionRef.current;

    selectionRef.current = null;

    setText((prevText) => {
      let newText = prevText;
      let newCursorPos = 0;

      if (selection) {
        // Existing text is selected or has custom cursor position
        const { start, end } = selection;
        const { text, endPosition } = insertWithSmartSpacing({
          original: prevText,
          insertText: transcript,
          position: start,
          endPosition: end,
        });

        newText = text;
        newCursorPos = endPosition;
      } else {
        // If textarea lacks focus, append transcript to the end
        newText = prevText + (prevText ? ' ' : '') + transcript;
        newCursorPos = newText.length;
      }

      // Update the note with the new text
      if (note) {
        onUpdateNote(note.id, { text: newText });
      }

      const textarea = textareaRef.current;

      // Set cursor position after transcript is inserted
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);

      return newText;
    });
  };

  if (!note) {
    return (
      <p className="flex items-center justify-center h-full text-gray2 heading-3">
        Create a note or choose one 👋
      </p>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-end items-center mb-4">
        {browserSupportsSpeechRecognition && (
          <Button
            onClick={listening ? handleVoiceStop : handleVoiceRecord}
            onMouseDown={handleButtonMouseDown}
            variant="secondary"
          >
            {listening ? 'Stop recording' : 'Record voice'}
          </Button>
        )}

        <Button onClick={handleDelete} variant="secondary">
          Delete
        </Button>
      </div>

      <input
        key={`title-${note?.id || 'new'}`}
        type="text"
        value={title}
        onChange={handleTitleChange}
        className="heading-2 w-full focus:outline-none overflow-hidden text-ellipsis whitespace-nowrap mb-6"
        placeholder="Note title"
        ref={titleRef}
        autoFocus={autoFocusTitle}
      />

      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleTextChange}
        className="flex-1 w-full resize-none focus:outline-none focus:ring-0 focus:border-transparent"
        placeholder="Start writing your note here..."
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete Note"
        description="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onOpenChange={(open) => !open && setIsConfirmOpen(false)}
      />
    </div>
  );
};

Editor.displayName = 'Editor';
