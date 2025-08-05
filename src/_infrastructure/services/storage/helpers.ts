export async function withStorageFallback<T>(
  idbFn: (() => Promise<T>) | undefined,
  lsFn: (() => T) | undefined
): Promise<T | undefined> {
  const idbAvailable = indexedDBAvailable();
  const lsAvailable = localStorageAvailable();

  if (idbAvailable && idbFn) {
    try {
      return await idbFn();
    } catch (err) {
      if (err instanceof Error) throw err;
    }
  } else if (lsAvailable && lsFn) {
    try {
      return lsFn();
    } catch (err) {
      if (err instanceof Error) throw err;
    }
  }

  throw new Error('No IndexedDB and no localStorage.');
}

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

const indexedDBAvailable = (): boolean => {
  try {
    return typeof window !== 'undefined' && !!window.indexedDB;
  } catch {
    return false;
  }
};
