import {
  get as idbGet,
  set as idbSet,
  del as idbDel,
  update as idbUpdate,
  clear as idbClear,
  keys as idbKeys,
  createStore,
} from 'idb-keyval';

const localStorageAvailable = (): boolean => {
  try {
    const testKey = '__ls_test';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

const lsAvailable = localStorageAvailable();

export const createStorage = (store?: ReturnType<typeof createStore>) => ({
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const value = await idbGet<T>(key, store);
      if (value !== undefined) return value;
    } catch {}
    if (lsAvailable) {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    }
    throw new Error('No IndexedDB data and localStorage unavailable.');
  },

  async set<T = any>(key: string, value: T): Promise<void> {
    try {
      await idbSet<T>(key, value, store);
      return;
    } catch {}
    if (lsAvailable) {
      localStorage.setItem(key, JSON.stringify(value));
      return;
    }
    throw new Error('Unable to save: no IndexedDB and no localStorage.');
  },

  async update<T = any>(key: string, updater: (oldValue: T | undefined) => T): Promise<T> {
    try {
      await idbUpdate<T>(key, updater, store);
    } catch {}
    if (lsAvailable) {
      const raw = localStorage.getItem(key);
      const oldValue = raw ? (JSON.parse(raw) as T) : undefined;
      const newValue = updater(oldValue);
      localStorage.setItem(key, JSON.stringify(newValue));
      return newValue;
    }
    throw new Error('Unable to update: no IndexedDB and no localStorage.');
  },

  async remove(key: string): Promise<void> {
    try {
      await idbDel(key, store);
      return;
    } catch {}
    if (lsAvailable) {
      localStorage.removeItem(key);
      return;
    }
    throw new Error('Unable to remove: no IndexedDB and no localStorage.');
  },

  async clear(): Promise<void> {
    try {
      await idbClear(store);
      return;
    } catch {}
    if (lsAvailable) {
      localStorage.clear();
      return;
    }
    throw new Error('Unable to clear: no IndexedDB and no localStorage.');
  },

  async keys(): Promise<string[]> {
    try {
      const dbKeys = await idbKeys(store);
      if (dbKeys.length) return dbKeys as string[];
    } catch {}
    if (lsAvailable) {
      return Object.keys(localStorage);
    }
    throw new Error('No IndexedDB and no localStorage.');
  },
});
