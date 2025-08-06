import { notesStorage } from './const';

export async function updateNote<TNote>(
  id: string,
  updater: (old: TNote | undefined) => TNote,
): Promise<TNote | undefined> {
  return notesStorage.update<TNote>(id, updater);
}
