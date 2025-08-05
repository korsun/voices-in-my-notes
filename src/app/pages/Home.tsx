import { useCallback, useEffect, useState } from 'react';
import { Editor, Layout, List } from 'domains/notes/ui';
import { createNote, getNotes, removeNote, updateNote } from 'domains/notes/api';
import type { TNote } from 'domains/notes/models';
import { onError } from '_infrastructure/helpers';

const sortByDate = (a: TNote, b: TNote) =>
  new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();

export function Home() {
  const [notes, setNotes] = useState<TNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<TNote | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotes = useCallback(async () => {
    try {
      setIsLoading(true);

      const notesEntries = await getNotes();
      const loadedNotes = notesEntries
        .map(([, note]) => ({
          ...note,
          updatedAt: new Date(note.updatedAt).toISOString(),
        }))
        .sort(sortByDate);

      setNotes(loadedNotes);

      // Select the first note if none is selected
      if (loadedNotes.length > 0 && !selectedNote) {
        setSelectedNote(loadedNotes[0]);
      }
    } catch (error) {
      onError(error, 'Failed to load notes');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleCreateNote = async () => {
    try {
      const newNote = {
        title: 'New note',
        text: '',
        updatedAt: new Date().toISOString(),
      };
      const id = await createNote(newNote);

      await loadNotes();

      const createdNote = { id, ...newNote };

      setSelectedNote(createdNote);
    } catch (error) {
      onError(error, 'Failed to create note');
    }
  };

  const handleUpdateNote = async (id: string, updates: Partial<TNote>) => {
    try {
      const now = new Date().toISOString();

      await updateNote(id, (oldNote?: TNote) => ({
        ...(oldNote || { id, title: '', text: '' }),
        ...updates,
        updatedAt: now,
      }));

      setNotes((prevNotes) =>
        prevNotes
          .map((note) => (note.id === id ? { ...note, ...updates, updatedAt: now } : note))
          .sort(sortByDate),
      );

      if (selectedNote?.id === id) {
        setSelectedNote((prev) => (prev ? { ...prev, ...updates, updatedAt: now } : null));
      }
    } catch (error) {
      onError(error, 'Failed to update note');
    }
  };

  const handleDeleteClick = async (id: string) => {
    try {
      await removeNote(id);

      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));

      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }
    } catch (error) {
      onError(error, 'Failed to delete note');
    }
  };

  const handleSelectNote = (note: TNote) => {
    setSelectedNote(note);
  };

  return (
    <>
      <Layout
        leftPanel={
          <List
            notes={notes}
            selectedNoteId={selectedNote?.id || null}
            onSelectNote={handleSelectNote}
            onCreateNote={handleCreateNote}
            isLoading={isLoading}
          />
        }
        rightPanel={
          <Editor
            note={selectedNote}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteClick}
          />
        }
      />
    </>
  );
}
