import {
  get as idbGet,
  set as idbSet,
  del as idbDel,
  update as idbUpdate,
  clear as idbClear,
  keys as idbKeys,
  createStore,
} from 'idb-keyval';

import { withStorageFallback } from './helpers';

export const createStorage = (store?: ReturnType<typeof createStore>) => ({
  async get<T = unknown>(key: string): Promise<T | undefined> {
    return withStorageFallback<T | undefined>(
      async () => {
        const value = await idbGet(key, store);
        return value;
      },
      () => {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : undefined;
      }
    );
  },

  async set<T = unknown>(key: string, value: T): Promise<void> {
    return withStorageFallback<void>(
      async () => {
        await idbSet(key, value, store);
      },
      () => {
        localStorage.setItem(key, JSON.stringify(value));
      }
    );
  },

  async update<T = unknown>(
    key: string,
    updater: (oldValue: T | undefined) => T
  ): Promise<T | undefined> {
    return withStorageFallback<T>(
      async () => {
        await idbUpdate(key, updater, store);
        const updated = await idbGet(key, store);
        return updated as T;
      },
      () => {
        const raw = localStorage.getItem(key);
        const oldValue = raw ? (JSON.parse(raw) as T) : undefined;
        const newValue = updater(oldValue);
        localStorage.setItem(key, JSON.stringify(newValue));
        return newValue;
      }
    );
  },

  async remove(key: string): Promise<void> {
    return withStorageFallback<void>(
      async () => {
        await idbDel(key, store);
      },
      () => {
        localStorage.removeItem(key);
      }
    );
  },

  async clear(): Promise<void> {
    return withStorageFallback<void>(
      async () => {
        await idbClear(store);
      },
      () => {
        localStorage.clear();
      }
    );
  },

  async keys(): Promise<string[]> {
    const result = await withStorageFallback<string[]>(
      async () => {
        const dbKeys: IDBValidKey[] = await idbKeys(store);
        return dbKeys ? dbKeys.map((k) => String(k)) : [];
      },
      () => {
        return Object.keys(localStorage);
      }
    );

    return result ?? [];
  },
});
