import { type FC, useEffect, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import type { TNote } from 'domains/notes/models';
import { Button, ConfirmDialog } from 'ui';

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
