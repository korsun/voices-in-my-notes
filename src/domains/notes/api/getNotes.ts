import { notesStorage } from './const.ts';

export async function getNotes(): Promise<string[]> {
  return notesStorage.keys();
}
