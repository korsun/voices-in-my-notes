import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import type { TNote } from 'domains/notes/models';
import { Button, ConfirmDialog } from 'ui';

type TEditorProps = {
  note: TNote | null;
  onUpdateNote: (id: string, updates: Partial<TNote>) => void;
  onDeleteNote: (id: string) => void;
};

export function Editor({ note, onUpdateNote, onDeleteNote }: TEditorProps) {
  const [title, setTitle] = useState(note?.title ?? '');
  const [text, setText] = useState(note?.text ?? '');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    setTitle(note?.title ?? '');
    setText(note?.text ?? '');
  }, [note]);

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
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          className="heading-2 w-full focus:outline-none overflow-hidden text-ellipsis whitespace-nowrap"
          placeholder="Note title"
        />
        <Button onClick={handleDelete} variant="secondary">
          Delete
        </Button>
      </div>
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
}
