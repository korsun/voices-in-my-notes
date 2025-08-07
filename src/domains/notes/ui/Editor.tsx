import { type FC, useCallback, useEffect, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import type { TNote } from '../models';
import { Button, ConfirmDialog } from 'ui';
import { insertWithSmartSpacing } from '../helpers';
import { Dictaphone } from '.';
import { useVoiceRecording } from '_infrastructure/contexts';

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
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectionRef = useRef<{ start: number; end: number } | null>(null);

  const { isListening } = useVoiceRecording();

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

  const handleTextareaSelect = () => {
    if (textareaRef.current) {
      selectionRef.current = {
        start: textareaRef.current.selectionStart,
        end: textareaRef.current.selectionEnd,
      };
    }
  };

  const handleTextareaFocus = () => {
    setIsTextareaFocused(true);
    handleTextareaSelect();
  };

  const handleTextareaBlur = () => {
    setIsTextareaFocused(false);
  };

  const handleDelete = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = useCallback(() => {
    if (note) {
      onDeleteNote(note.id);
      setIsConfirmOpen(false);
    }
  }, [note, onDeleteNote]);

  const handleBeforeVoiceStart = () => {
    if (textareaRef.current) {
      selectionRef.current = {
        start: textareaRef.current.selectionStart,
        end: textareaRef.current.selectionEnd,
      };
    }
  };

  const handleVoiceStop = useCallback(
    (transcript: string) => {
      if (!transcript.trim() || !note) {
        return;
      }

      setText((prevText) => {
        let newText = prevText;
        let newCursorPos = 0;

        if (selectionRef.current) {
          // Existing text is selected or has custom cursor position
          const { start, end } = selectionRef.current;
          const { text: updatedText, endPosition } = insertWithSmartSpacing({
            original: prevText,
            insertText: transcript,
            position: start,
            endPosition: end,
          });

          newText = updatedText;
          newCursorPos = endPosition;
        } else {
          // If textarea lacks focus, append transcript to the end
          newText = prevText + (prevText ? ' ' : '') + transcript;
          newCursorPos = newText.length;
        }

        // Update the note with the new text
        onUpdateNote(note.id, { text: newText });

        // Set cursor position after transcript is inserted
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
          }
        }, 0);

        return newText;
      });
    },
    [note, onUpdateNote],
  );

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
        <Dictaphone
          isKeyDownReady={isTextareaFocused}
          onStart={handleBeforeVoiceStart}
          onStop={handleVoiceStop}
        />

        <Button onClick={handleDelete} variant="primary" disabled={isListening}>
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
        onSelect={handleTextareaSelect}
        onFocus={handleTextareaFocus}
        onBlur={handleTextareaBlur}
        className="flex-1 w-full resize-none focus:outline-none focus:ring-0 focus:border-transparent"
        placeholder="Start writing your note here... Oh, and press Alt key to start voice recording"
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
