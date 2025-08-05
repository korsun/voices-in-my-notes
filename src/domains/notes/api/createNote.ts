import { v4 as uuid } from 'uuid';
import { notesStorage } from './const.ts';

export async function createNote<TNote>(data: TNote): Promise<string> {
  const newId = uuid();
  await notesStorage.set<TNote>(newId, data);
  return newId;
}
