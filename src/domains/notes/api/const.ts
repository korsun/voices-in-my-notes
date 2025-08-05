import { createStorage } from '../../../_infrastructure/services/storage/storage';
import { createStore } from 'idb-keyval';

export const notesStorage = createStorage(createStore('notes', 'notes'));
