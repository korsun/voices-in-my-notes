import { notesStorage } from './const.ts';

export async function getNoteById<TNote>(id: string): Promise<TNote | undefined> {
  return notesStorage.get<TNote>(id);
}
