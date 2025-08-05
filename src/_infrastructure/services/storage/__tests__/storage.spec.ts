import { describe, it, expect, beforeEach } from 'vitest';

import * as idbKeyval from 'idb-keyval';
import { createStorage } from '../storage';

const storage = createStorage();

beforeEach(() => {
  localStorage.clear();
});

describe('createStorage', () => {
  describe('get', () => {
    it('returns value from IndexedDB when present', async () => {
      await idbKeyval.set('key', 'from-idb');

      const result = await storage.get<string>('key');

      expect(result).toBe('from-idb');
    });

    it('falls back to localStorage when IndexedDB returns undefined', async () => {
      // Simulate environment without IndexedDB
      const originalIndexedDB = globalThis.indexedDB;
      delete (globalThis as Record<string, unknown>).indexedDB;

      localStorage.setItem('key', JSON.stringify('from-ls'));

      const result = await storage.get<string>('key');
      expect(result).toBe('from-ls');

      // restore
      globalThis.indexedDB = originalIndexedDB;
    });
  });

  describe('set', () => {
    it('saves to IndexedDB when possible', async () => {
      await storage.set('key', { foo: 'bar' });

      const idbValue = await idbKeyval.get('key');
      expect(idbValue).toEqual({ foo: 'bar' });
      expect(localStorage.getItem('key')).toBeNull();
    });

    it('falls back to localStorage on error', async () => {
      // Simulate no IndexedDB
      const originalIndexedDB = globalThis.indexedDB;
      delete (globalThis as Record<string, unknown>).indexedDB;

      await storage.set('key', 123);

      // restore
      globalThis.indexedDB = originalIndexedDB;

      expect(localStorage.getItem('key')).toBe(JSON.stringify(123));
    });
  });

  describe('update', () => {
    it('updates via IndexedDB when possible', async () => {
      await idbKeyval.set('key', 'old');
      const result = await storage.update('key', () => 'new');
      expect(result).toBe('new');
      const idbVal = await idbKeyval.get('key');
      expect(idbVal).toBe('new');
    });

    it('falls back to localStorage on error', async () => {
      // remove indexedDB
      const originalIndexedDB = globalThis.indexedDB;
      delete (globalThis as Record<string, unknown>).indexedDB;
      localStorage.setItem('key', JSON.stringify('old'));

      const result = await storage.update('key', (old) => (old ? `${old}-updated` : 'updated'));
      expect(result).toBe('old-updated');
      expect(localStorage.getItem('key')).toBe(JSON.stringify('old-updated'));

      globalThis.indexedDB = originalIndexedDB;
    });
  });

  describe('remove', () => {
    it('removes via IndexedDB when possible', async () => {
      await idbKeyval.set('key', 'keep');
      localStorage.setItem('key', 'keep-ls');
      await storage.remove('key');
      const idbVal = await idbKeyval.get('key');
      expect(idbVal).toBeUndefined();
      // localStorage untouched
      expect(localStorage.getItem('key')).toBe('keep-ls');
    });

    it('falls back to localStorage on error', async () => {
      const originalIndexedDB = globalThis.indexedDB;
      delete (globalThis as Record<string, unknown>).indexedDB;
      localStorage.setItem('key', 'value');
      await storage.remove('key');
      expect(localStorage.getItem('key')).toBeNull();
      globalThis.indexedDB = originalIndexedDB;
    });
  });

  describe('clear', () => {
    it('clears IndexedDB when possible', async () => {
      await idbKeyval.set('x', '1');
      localStorage.setItem('a', '1');
      await storage.clear();
      const keys = await idbKeyval.keys();
      expect(keys.length).toBe(0);
      expect(localStorage.getItem('a')).toBe('1');
    });

    it('falls back to localStorage on error', async () => {
      const originalIndexedDB = globalThis.indexedDB;
      delete (globalThis as Record<string, unknown>).indexedDB;
      localStorage.setItem('a', '1');
      await storage.clear();
      expect(localStorage.length).toBe(0);
      globalThis.indexedDB = originalIndexedDB;
    });
  });

  describe('keys', () => {
    it('returns keys from IndexedDB when non-empty', async () => {
      await idbKeyval.set('x', '1');
      await idbKeyval.set('y', '2');
      const keys = await storage.keys();
      expect(keys.sort()).toEqual(['x', 'y']);
    });

    it('falls back to localStorage on error or empty', async () => {
      const originalIndexedDB = globalThis.indexedDB;
      delete (globalThis as Record<string, unknown>).indexedDB;
      localStorage.setItem('foo', '1');
      localStorage.setItem('bar', '2');
      const keys = await storage.keys();
      expect(keys.sort()).toEqual(['bar', 'foo']);
      globalThis.indexedDB = originalIndexedDB;
    });
  });
});
