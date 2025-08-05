import { describe, it, expect, vi, afterEach } from 'vitest';
import { withStorageFallback } from '../helpers';

type AnyFn<T = unknown> = () => T;

describe('withStorageFallback', () => {
  const originalIndexedDB = globalThis.indexedDB;
  const originalLocalStorage = globalThis.localStorage;

  afterEach(() => {
    // restore globals after each test
    globalThis.indexedDB = originalIndexedDB;
    if (originalLocalStorage) {
      Object.defineProperty(globalThis, 'localStorage', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: originalLocalStorage,
      });
    } else {
      // delete if it was originally undefined
      delete (globalThis as Record<string, unknown>).localStorage;
    }
    vi.restoreAllMocks();
  });

  it('prefers IndexedDB when available', async () => {
    // make indexedDB available
    globalThis.indexedDB = {} as unknown as IDBFactory;

    const idbFn = vi.fn<AnyFn<Promise<string>>>().mockResolvedValue('from-idb');
    const lsFn = vi.fn<AnyFn<string>>().mockReturnValue('from-ls');

    const result = await withStorageFallback<string>(idbFn, lsFn);

    expect(result).toBe('from-idb');
    expect(idbFn).toHaveBeenCalledTimes(1);
    expect(lsFn).not.toHaveBeenCalled();
  });

  it('falls back to localStorage when IndexedDB unavailable', async () => {
    // ensure indexedDB is unavailable
    delete (globalThis as Record<string, unknown>).indexedDB;

    const idbFn = vi.fn<AnyFn<Promise<string>>>().mockResolvedValue('from-idb');
    const lsFn = vi.fn<AnyFn<string>>().mockReturnValue('from-ls');

    const result = await withStorageFallback<string>(idbFn, lsFn);

    expect(result).toBe('from-ls');
    expect(lsFn).toHaveBeenCalledTimes(1);
    // idbFn might be called but should throw; ensure not called for safety
    expect(idbFn).not.toHaveBeenCalled();
  });

  it('throws when neither storage is available', async () => {
    // remove indexedDB and localStorage
    delete (globalThis as Record<string, unknown>).indexedDB;
    // make localStorage accessors throw to simulate unavailability
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('localStorage unavailable');
      },
    });

    await expect(withStorageFallback<string>(undefined, undefined)).rejects.toThrowError(
      'No IndexedDB and no localStorage.'
    );
  });
});
