import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('uuid', () => ({ v4: () => 'mock-id' }));

import { createNote, getNoteById, getNotes, removeNote, updateNote } from '..';
import { notesStorage } from '../const';

beforeEach(async () => {
  await notesStorage.clear();
});

describe('notes API', () => {
  describe('createNote', () => {
    it('persists the note to IndexedDB and returns new id', async () => {
      const data = { title: 'Test', body: 'Hello' };
      const id = await createNote<typeof data>(data);

      expect(id).toBe('mock-id');

      const saved = await notesStorage.get<typeof data>(id);

      expect(saved).toEqual({ ...data, id });
    });
  });

  describe('getNoteById', () => {
    it('retrieves a note by id from IndexedDB', async () => {
      const id = await createNote<{ text: string }>({ text: 'hello' });
      const note = await getNoteById<{ text: string }>(id);

      expect(note).toEqual({ id, text: 'hello' });
    });
  });
  describe('getNotes', () => {
    it('returns list of note entries stored in IndexedDB', async () => {
      const note1 = { a: 1 };
      const note2 = { b: 2 };

      await notesStorage.set('id1', note1);
      await notesStorage.set('id2', note2);

      const entries = await getNotes();

      expect(entries.sort((a, b) => a[0].localeCompare(b[0]))).toEqual([
        ['id1', note1],
        ['id2', note2],
      ]);
    });
  });
  describe('removeNote', () => {
    it('deletes a note from IndexedDB', async () => {
      const id = await createNote({ foo: 'bar' });

      await removeNote(id);

      const note = await notesStorage.get(id);

      expect(note).toBeUndefined();
    });
  });
  describe('updateNote', () => {
    it('updates an existing note in IndexedDB and returns the new value', async () => {
      const id = await createNote<{ count: number }>({ count: 1 });
      const updated = await updateNote<{ count: number }>(id, (old) => ({
        count: (old?.count ?? 0) + 1,
      }));

      expect(updated).toEqual({ count: 2 });

      const stored = await notesStorage.get<{ count: number }>(id);

      expect(stored).toEqual({ count: 2 });
    });
  });
});
