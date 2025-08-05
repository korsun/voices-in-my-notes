import { notesStorage } from './const.ts';
import type { TNote } from '../models';

export async function getNotes(): Promise<[string, TNote][]> {
  return notesStorage.entries();
}
