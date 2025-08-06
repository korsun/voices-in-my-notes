import type { createStore } from 'idb-keyval';
import {
  clear as idbClear,
  del as idbDel,
  get as idbGet,
  keys as idbKeys,
  set as idbSet,
  update as idbUpdate,
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
      },
    );
  },

  async set<T = unknown>(key: string, value: T): Promise<void> {
    return withStorageFallback<void>(
      async () => {
        await idbSet(key, value, store);
      },
      () => {
        localStorage.setItem(key, JSON.stringify(value));
      },
    );
  },

  async update<T = unknown>(
    key: string,
    updater: (oldValue: T | undefined) => T,
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
      },
    );
  },

  async remove(key: string): Promise<void> {
    return withStorageFallback<void>(
      async () => {
        await idbDel(key, store);
      },
      () => {
        localStorage.removeItem(key);
      },
    );
  },

  async clear(): Promise<void> {
    return withStorageFallback<void>(
      async () => {
        await idbClear(store);
      },
      () => {
        localStorage.clear();
      },
    );
  },

  async entries<T = unknown>(): Promise<[string, T][]> {
    const result = await withStorageFallback<[string, T][]>(
      async () => {
        const dbKeys: IDBValidKey[] = await idbKeys(store);

        if (!dbKeys) {
          return [];
        }

        const entries = await Promise.all(
          dbKeys.map(async (key) => {
            const value = await idbGet(key, store);

            return [String(key), value] as [string, T];
          }),
        );

        return entries;
      },
      () => {
        return Object.entries(localStorage).map(([key, value]) => {
          try {
            return [key, JSON.parse(value)] as [string, T];
          } catch {
            return [key, value] as [string, T];
          }
        });
      },
    );

    return result ?? [];
  },
});
