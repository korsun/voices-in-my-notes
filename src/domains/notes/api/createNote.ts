import { v4 as uuid } from 'uuid'
import { notesStorage } from './const.ts'

export async function createNote<T = any>(data: T): Promise<string> {
  const newId = uuid()
  await notesStorage.set<T>(newId, data)
  return newId
}