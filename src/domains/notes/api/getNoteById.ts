import { notesStorage } from './const.ts'

export async function getNoteById<T>(id: string): Promise<T | null> {
  return notesStorage.get<T>(id)
}