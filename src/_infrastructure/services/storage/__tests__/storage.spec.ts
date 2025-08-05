/// <reference types="vitest" />
import { describe, it, expect, beforeEach, vi } from 'vitest'; import { createStorage } from '../storage'; 
import * as idbKeyval from 'idb-keyval';

const storage = createStorage();

beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); });

describe('createStorage - get', () => { it('returns value from IndexedDB when present', async () => { vi.spyOn(idbKeyval, 'get').mockResolvedValue('from-idb'); const result = await storage.get<string>('key'); expect(idbKeyval.get).toHaveBeenCalledWith('key', undefined); expect(result).toBe('from-idb'); });

it('falls back to localStorage when IndexedDB returns undefined', async () => { vi.spyOn(idbKeyval, 'get').mockResolvedValue(undefined); localStorage.setItem('key', JSON.stringify('from-ls')); const result = await storage.get<string>('key'); expect(result).toBe('from-ls'); });

it('throws when neither storage has data', async () => { vi.spyOn(idbKeyval, 'get').mockRejectedValue(new Error('fail'));
await expect(storage.get('key')).rejects.toThrow('No IndexedDB data and localStorage unavailable.'); }); });

describe('createStorage - set', () => { it('saves to IndexedDB when possible', async () => { const spy = vi.spyOn(idbKeyval, 'set').mockResolvedValue(undefined); await storage.set('key', { foo: 'bar' }); expect(spy).toHaveBeenCalledWith('key', { foo: 'bar' }, undefined); expect(localStorage.getItem('key')).toBeNull(); });

it('falls back to localStorage on error', async () => { vi.spyOn(idbKeyval, 'set').mockRejectedValue(new Error('fail')); await storage.set('key', 123); expect(localStorage.getItem('key')).toBe(JSON.stringify(123)); }); });

describe('createStorage - update', () => { it('updates via IndexedDB when possible', async () => { vi.spyOn(idbKeyval, 'update').mockResolvedValue('new'); const result = await storage.update('key', () => 'new'); expect(result).toBe('new'); });

it('falls back to localStorage on error', async () => { vi.spyOn(idbKeyval, 'update').mockRejectedValue(new Error('fail')); localStorage.setItem('key', JSON.stringify('old')); const result = await storage.update('key', old => old ? `${old}-updated` : 'updated'); expect(result).toBe('old-updated'); expect(localStorage.getItem('key')).toBe(JSON.stringify('old-updated')); }); });

describe('createStorage - remove', () => { it('removes via IndexedDB when possible', async () => { const spy = vi.spyOn(idbKeyval, 'del').mockResolvedValue(undefined); localStorage.setItem('key', 'keep'); await storage.remove('key'); expect(spy).toHaveBeenCalledWith('key', undefined); expect(localStorage.getItem('key')).toBe('keep'); });

it('falls back to localStorage on error', async () => { vi.spyOn(idbKeyval, 'del').mockRejectedValue(new Error('fail')); localStorage.setItem('key', 'value'); await storage.remove('key'); expect(localStorage.getItem('key')).toBeNull(); }); });

describe('createStorage - clear', () => { it('clears IndexedDB when possible', async () => { const spy = vi.spyOn(idbKeyval, 'clear').mockResolvedValue(undefined); localStorage.setItem('a', '1'); await storage.clear(); expect(spy).toHaveBeenCalledWith(undefined); expect(localStorage.getItem('a')).toBe('1'); });

it('falls back to localStorage on error', async () => { vi.spyOn(idbKeyval, 'clear').mockRejectedValue(new Error('fail')); localStorage.setItem('a', '1'); await storage.clear(); expect(localStorage.length).toBe(0); }); });

describe('createStorage - keys', () => { it('returns keys from IndexedDB when non-empty', async () => { vi.spyOn(idbKeyval, 'keys').mockResolvedValue(['x', 'y']); const keys = await storage.keys(); expect(keys).toEqual(['x', 'y']); });

it('falls back to localStorage on error or empty', async () => { vi.spyOn(idbKeyval, 'keys').mockResolvedValue([]); localStorage.setItem('foo', '1'); localStorage.setItem('bar', '2'); const keys = await storage.keys(); expect(keys).toEqual(['foo', 'bar']); }); });

