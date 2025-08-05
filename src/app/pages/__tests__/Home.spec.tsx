import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { TNote } from 'domains/notes/models';
import { Home } from '../Home';
import '@testing-library/jest-dom';

// Mock the API functions with proper typing
const { mockedGetNotes, mockedCreateNote } = vi.hoisted(() => ({
  mockedGetNotes: vi.fn(),
  mockedCreateNote: vi.fn(),
}));

// Mock the API functions
vi.mock('domains/notes/api', () => ({
  getNotes: mockedGetNotes,
  createNote: mockedCreateNote,
}));

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Load', () => {
    it('should display empty state when no notes exist', async () => {
      // Arrange
      mockedGetNotes.mockResolvedValueOnce([]);

      // Act
      render(<Home />);

      // Assert
      // Check that the List shows 'No notes yet' empty state
      const listEmptyState = await screen.findByText('No notes yet 😔');

      expect(listEmptyState).toBeInTheDocument();

      // Check that the Editor shows the 'Create a note or choose one' message
      const editorEmptyState = await screen.findByText('Create a note or choose one 👋');

      expect(editorEmptyState).toBeInTheDocument();

      expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
      expect(mockedGetNotes).toHaveBeenCalledTimes(1);
    });

    it('should load and display existing notes', async () => {
      // Arrange
      mockedGetNotes.mockResolvedValueOnce([
        [
          '1',
          {
            id: '1',
            title: 'First Note',
            text: 'First note content',
            updatedAt: new Date('2023-01-01').toISOString(),
          },
        ],
        [
          '2',
          {
            id: '2',
            title: 'Second Note',
            text: 'Second note content',
            updatedAt: new Date('2023-01-02').toISOString(),
          },
        ],
      ]);

      // Act
      render(<Home />);

      // Assert

      // Wait for notes to load
      const noteItems = await screen.findAllByRole('listitem');

      // Check that notes are displayed in the correct order (newest first)
      expect(noteItems[0]).toHaveTextContent('Second Note');
      expect(noteItems[1]).toHaveTextContent('First Note');

      // Check that the first note is selected by default
      // The selected class is on the Card's inner div, not the list item
      const firstCard = noteItems[0].querySelector('.bg-gray4');
      const secondCard = noteItems[1].querySelector('.bg-gray4');

      expect(firstCard).toBeInTheDocument();
      expect(secondCard).not.toBeInTheDocument();

      // Check that the note content is displayed in the editor
      const editorTitle = await screen.findAllByDisplayValue('Second Note');
      const editorContent = await screen.findAllByText('Second note content');

      expect(editorTitle[0]).toBeInTheDocument();
      expect(editorContent[0]).toBeInTheDocument();

      // Verify the API was called
      expect(mockedGetNotes).toHaveBeenCalledTimes(1);
    });

    it('should sort notes by updatedAt in descending order', async () => {
      // Arrange
      const unsortedNotes: [
        string,
        { id: string; title: string; text: string; updatedAt: string },
      ][] = [
        [
          '1',
          {
            id: '1',
            title: 'Oldest',
            text: 'Oldest note',
            updatedAt: new Date('2023-01-01').toISOString(),
          },
        ],
        [
          '2',
          {
            id: '2',
            title: 'Newest',
            text: 'Newest note',
            updatedAt: new Date('2023-01-03').toISOString(),
          },
        ],
        [
          '3',
          {
            id: '3',
            title: 'Middle',
            text: 'Middle note',
            updatedAt: new Date('2023-01-02').toISOString(),
          },
        ],
      ];

      mockedGetNotes.mockResolvedValueOnce(unsortedNotes);

      // Act
      render(<Home />);

      // Wait for notes to load
      const noteItems = await screen.findAllByRole('listitem');

      // Assert
      // Check that notes are displayed in correct order (newest first)
      expect(noteItems[0]).toHaveTextContent('Newest');
      expect(noteItems[1]).toHaveTextContent('Middle');
      expect(noteItems[2]).toHaveTextContent('Oldest');

      // Verify the order in the DOM matches our expected order
      const displayedNotes = noteItems.map((item) => item.textContent);

      // Note: The Card component shows both title and date, so we expect them concatenated
      expect(displayedNotes).toEqual([
        'NewestNewest note1/3/2023, 1:00:00 AM',
        'MiddleMiddle note1/2/2023, 1:00:00 AM',
        'OldestOldest note1/1/2023, 1:00:00 AM',
      ]);

      // Verify the newest note's content is displayed in the editor
      const editorTitle = await screen.findByDisplayValue('Newest');

      expect(editorTitle).toBeInTheDocument();
    });
  });

  describe.skip('Note Creation', () => {
    it.skip('should create a new note with default title "New note", add it to the list and select it, should clear the "Create a note or choose one" message after creation', async () => {
      // Arrange
      const mockNotes: [string, TNote][] = [
        [
          '1',
          {
            id: '1',
            title: 'Existing Note',
            text: 'Existing note text',
            updatedAt: new Date('2023-01-01').toISOString(),
          },
        ],
      ];

      const newNote = {
        id: 'new-note-id',
        title: 'New note',
        text: '',
        updatedAt: new Date().toISOString(),
      };

      // Set up the initial mock for getNotes
      mockedGetNotes.mockResolvedValueOnce(mockNotes);

      // Mock createNote to resolve with the new note ID
      mockedCreateNote.mockResolvedValueOnce('new-note-id');

      // Render the component
      render(<Home />);

      // Wait for initial notes to load
      await screen.findByText('Existing Note');

      // Set up the second mock for getNotes that includes the new note
      mockedGetNotes.mockResolvedValueOnce([...mockNotes, ['new-note-id', newNote]]);

      // Act: Click the create note button
      const createButton = screen.getByRole('button', { name: /create note/i });

      fireEvent.click(createButton);

      // Wait for the new note to appear in the list
      const noteItems = await screen.findAllByRole('listitem');

      // Assert
      // 1. Verify createNote was called with the correct parameters
      expect(mockedCreateNote).toHaveBeenCalledWith({
        title: 'New note',
        text: '',
        updatedAt: expect.any(String),
      });

      // 2. Verify getNotes was called twice (initial load and after creation)
      expect(mockedGetNotes).toHaveBeenCalledTimes(2);

      // 3. Verify the new note is added to the list
      expect(noteItems).toHaveLength(2); // Original note + new note

      // 4. Verify the new note is selected (it should be first in the list)
      expect(noteItems[0]).toHaveClass('selected');

      // 5. Verify the new note's content is displayed in the editor
      const editorTitle = await screen.findByDisplayValue('New note');

      expect(editorTitle).toBeInTheDocument();

      // 6. Verify the "Create a note or choose one" message is not shown
      const emptyMessage = screen.queryByText('Create a note or choose one');

      expect(emptyMessage).not.toBeInTheDocument();
    });
  });

  describe.skip('Note Selection', () => {
    it('should update the selected note when clicking on a different note');
    it('should show note title as editable');
    it('should show note text as editable');
  });

  describe.skip('Note Editing', () => {
    it('should update note title when edited');
    it('should update note text when edited');
    it('should debounce text input updates');
    it('should persist changes to storage');
  });

  describe.skip('Note Deletion', () => {
    it('should show confirmation dialog when delete button is clicked');
    it('should delete note when confirmed');
    it('should select next note if available after deletion');
    it('should clear right panel if no notes remain after deletion');
    it('should show empty state when last note is deleted');
    it('should not delete note when deletion is cancelled');
  });

  describe.skip('Empty State', () => {
    it('should show "Create a note or choose one" when no note is selected');
    it('should hide empty state message when a note is selected');
    it('should show empty state again when all notes are deleted');
  });
});
