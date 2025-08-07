import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Button, Card } from 'ui';
import type { TNote } from 'domains/notes/models';
import { useVoiceRecording } from '_infrastructure/contexts';

type TListProps = {
  notes: TNote[];
  selectedNoteId: string | null;
  onSelectNote: (note: TNote) => void;
  onCreateNote: () => void;
  isLoading: boolean;
};

export type TListHandle = {
  scrollToTop: () => void;
};

export const List = forwardRef<TListHandle, TListProps>(
  ({ notes, selectedNoteId, onSelectNote, onCreateNote, isLoading }, ref) => {
    const listRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      scrollToTop: () => {
        if (listRef.current) {
          listRef.current.scrollTop = 0;
        }
      },
    }));

    const { isListening } = useVoiceRecording();

    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray3">
          <Button onClick={onCreateNote} variant="primary" fullWidth disabled={isListening}>
            Create note
          </Button>
        </div>
        <div ref={listRef} className="flex-1 overflow-y-auto p-4">
          {isLoading && <div className="p-4 text-center text-gray3">Loading...</div>}
          {!isLoading && notes.length === 0 ? (
            <div className="text-center text-gray2 heading-3">No notes yet 😔</div>
          ) : (
            <ul className="flex flex-col gap-2">
              {notes.map((note) => (
                <li key={note.id} onClick={() => !isListening && onSelectNote(note)}>
                  <Card
                    title={note.title}
                    text={note.text}
                    isSelected={selectedNoteId === note.id}
                    updatedAt={note.updatedAt}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  },
);

List.displayName = 'List';
