import type { TNote } from '../models';
import { notesStorage } from './const.ts';

export async function getNotes(): Promise<[string, TNote][]> {
  return notesStorage.entries();
}
