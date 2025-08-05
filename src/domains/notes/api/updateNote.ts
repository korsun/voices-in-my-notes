import { notesStorage } from './const'

export async function updateNote<T>(
  id: string,
  updater: (old: T | undefined) => T
): Promise<T> {
  return notesStorage.update<T>(id, updater)
}