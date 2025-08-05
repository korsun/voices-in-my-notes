import { notesStorage } from './const.ts'

export async function removeNote(id: string): Promise<void> {
  return notesStorage.remove(id)
}