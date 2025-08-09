import { onError } from '_infrastructure/helpers';
import {
  createNote,
  getNotes,
  removeNote,
  updateNote,
} from 'domains/notes/api';
import type { TNote } from 'domains/notes/models';
import { Editor, Layout, List, type TListHandle } from 'domains/notes/ui';
import { useCallback, useEffect, useRef, useState } from 'react';

const sortByDate = (a: TNote, b: TNote) =>
  b.updatedAt.localeCompare(a.updatedAt);

export function Home() {
  const [notes, setNotes] = useState<TNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<TNote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const listRef = useRef<TListHandle>(null);
  const [isNewNote, setIsNewNote] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Card render will break
  const loadNotes = useCallback(async () => {
    try {
      setIsLoading(true);

      const notesEntries = await getNotes();
      const loadedNotes = notesEntries.map(([, note]) => note).sort(sortByDate);

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
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleCreateNote = async () => {
    try {
      const newNote: Omit<TNote, 'id'> = {
        title: 'New note',
        text: '',
        updatedAt: new Date().toISOString(),
      };
      const id = await createNote(newNote);

      await loadNotes();

      const createdNote = { id, ...newNote };

      setIsNewNote(true);
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
          .map((note) =>
            note.id === id ? { ...note, ...updates, updatedAt: now } : note,
          )
          .sort(sortByDate),
      );

      if (selectedNote?.id === id) {
        setSelectedNote((prev) =>
          prev ? { ...prev, ...updates, updatedAt: now } : null,
        );
      }
    } catch (error) {
      onError(error, 'Failed to update note');
    }
  };

  const handleDeleteClick = async (id: string) => {
    try {
      await removeNote(id);

      setNotes((prevNotes) => {
        const updatedNotes = prevNotes.filter((note) => note.id !== id);

        // If we deleted the selected note, select the first remaining note if any
        if (selectedNote?.id === id && updatedNotes.length > 0) {
          setSelectedNote(updatedNotes[0]);
          // Scroll the list to the top after deletion
          listRef.current?.scrollToTop();
        } else if (selectedNote?.id === id) {
          setSelectedNote(null);
        }

        return updatedNotes;
      });
    } catch (error) {
      onError(error, 'Failed to delete note');
    }
  };

  const handleSelectNote = (note: TNote) => {
    setSelectedNote(note);
  };

  return (
    <Layout
      leftPanel={
        <List
          ref={listRef}
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
          autoFocusTitle={isNewNote}
        />
      }
    />
  );
}
