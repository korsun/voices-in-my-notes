import { Button, Card } from 'ui';
import type { TNote } from 'domains/notes/models';

type TListProps = {
  notes: TNote[];
  selectedNoteId: string | null;
  onSelectNote: (note: TNote) => void;
  onCreateNote: () => void;
  isLoading: boolean;
};

export function List({ notes, selectedNoteId, onSelectNote, onCreateNote, isLoading }: TListProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray3">
        <Button onClick={onCreateNote} variant="primary" fullWidth>
          Create note
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 gap-2 flex flex-col">
        {isLoading && <div className="p-4 text-center text-gray3">Loading...</div>}
        {!isLoading && notes.length === 0 ? (
          <div className="text-center text-gray2 heading-3">No notes yet 😔</div>
        ) : (
          <ul>
            {notes.map((note) => (
              <li key={note.id} onClick={() => onSelectNote(note)}>
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
}
