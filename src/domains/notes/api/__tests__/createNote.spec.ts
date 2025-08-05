/// <reference types="vitest" />
import { createNote } from '../index'

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as uuid from 'uuid'; import { notesStorage } from '../const.ts';

vi.mock('uuid', () => ({ v4: vi.fn(), }));

vi.mock('./storage-service', () => ({ notesStorage: { set: vi.fn(), }, }));

describe('createNote', () => { beforeEach(() => { (uuid.v4 as vi.Mock).mockReset(); (notesStorage.set as vi.Mock).mockReset(); });

it('generates a new UUID, saves the note, and returns the id', async () => { (uuid.v4 as vi.Mock).mockReturnValue('test-id'); (notesStorage.set as vi.Mock).mockResolvedValue(undefined);

const data = { title: 'Hello', content: 'World' };
const id = await createNote(data);

expect(uuid.v4).toHaveBeenCalled();
expect(notesStorage.set).toHaveBeenCalledWith('test-id', data);
expect(id).toBe('test-id');

});

it('propagates errors from storage.set', async () => { (uuid.v4 as vi.Mock).mockReturnValue('error-id'); (notesStorage.set as vi.Mock).mockRejectedValue(new Error('Storage failure'));

await expect(createNote({})).rejects.toThrow('Storage failure');

}); });

