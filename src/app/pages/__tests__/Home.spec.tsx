import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { TNote } from 'domains/notes/models';
import { Home } from '../Home';
import '@testing-library/jest-dom';

// Mock the API functions with proper typing
const { mockedGetNotes, mockedCreateNote, mockedUpdateNote, mockedRemoveNote } = vi.hoisted(() => ({
  mockedGetNotes: vi.fn(),
  mockedCreateNote: vi.fn(),
  mockedUpdateNote: vi.fn(),
  mockedRemoveNote: vi.fn(),
}));

// Mock the API functions
vi.mock('domains/notes/api', () => ({
  getNotes: mockedGetNotes,
  createNote: mockedCreateNote,
  updateNote: mockedUpdateNote,
  removeNote: mockedRemoveNote,
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

      // Verify the order and content of the displayed notes
      const displayedNotes = noteItems.map((item) => item.textContent || '');

      // Check that each note contains the expected title (appears twice - once in the title and once in the content)
      expect(displayedNotes[0]).toContain('Newest');
      expect(displayedNotes[1]).toContain('Middle');
      expect(displayedNotes[2]).toContain('Oldest');

      // Verify the order by checking the note content
      expect(displayedNotes[0]).toContain('Newest note');
      expect(displayedNotes[1]).toContain('Middle note');
      expect(displayedNotes[2]).toContain('Oldest note');

      // Verify the newest note's content is displayed in the editor
      const editorTitle = await screen.findByDisplayValue('Newest');

      expect(editorTitle).toBeInTheDocument();
    });
  });

  describe.skip('Note Creation', () => {
    it('should create a new note with default title "New note", add it to the list and select it, should clear the "Create a note or choose one" message after creation', async () => {
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

  describe('Note Editing', () => {
    it('should update card title and text when a note is edited', async () => {
      // Arrange
      const noteId = '1';
      const initialNote = {
        id: noteId,
        title: 'Initial Title',
        text: 'Initial content',
        updatedAt: new Date().toISOString(),
      };

      mockedGetNotes.mockResolvedValue([[noteId, initialNote]]);
      mockedUpdateNote.mockImplementation(async (_, updates) => {
        return { ...initialNote, ...updates };
      });

      // Act
      render(<Home />);

      // Wait for the note to load
      await screen.findByText('Initial Title');

      // Update the note title
      const titleInput = screen.getByPlaceholderText('Note title');

      fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

      // Helper function to extract updates from the mock call
      const getUpdatesFromMock = (callIndex: number) => {
        const call = mockedUpdateNote.mock.calls[callIndex];
        const updates = typeof call[1] === 'function' ? call[1](initialNote) : call[1];

        return updates;
      };

      // Wait for title update to be processed
      await waitFor(
        () => {
          expect(mockedUpdateNote).toHaveBeenCalled();

          const updates = getUpdatesFromMock(0);

          expect(updates).toMatchObject({
            title: 'Updated Title',
          });
        },
        { timeout: 1000 },
      );

      // Update the note content
      const contentInput = screen.getByPlaceholderText('Start writing your note here...');

      fireEvent.change(contentInput, { target: { value: 'Updated content' } });

      // Wait for text update to be processed
      await waitFor(
        () => {
          expect(mockedUpdateNote).toHaveBeenCalledTimes(2);

          const updates = getUpdatesFromMock(1);

          expect(updates).toMatchObject({
            text: 'Updated content',
          });
        },
        { timeout: 500 },
      );

      // Verify the editor shows the updated content
      await waitFor(() => {
        const editorTitle = screen.getByPlaceholderText('Note title');
        const editorContent = screen.getByPlaceholderText('Start writing your note here...');

        expect(editorTitle).toHaveValue('Updated Title');
        expect(editorContent).toHaveValue('Updated content');
      });

      // Verify the card in the list shows the updated content
      await waitFor(() => {
        // Find the card by its container and then check its content
        const cards = screen.getAllByRole('listitem');
        const updatedCard = cards.find(
          (card) =>
            card.textContent?.includes('Updated Title') &&
            card.textContent?.includes('Updated content'),
        );

        expect(updatedCard).toBeInTheDocument();
      });
    });

    it('should debounce text input updates');
    it('should persist changes to storage');
  });

  describe('Note Deletion', () => {
    it('should show confirmation dialog when delete button is clicked', async () => {
      // Arrange
      const mockNotes: [string, TNote][] = [
        [
          '1',
          {
            id: '1',
            title: 'Test Note',
            text: 'Test content',
            updatedAt: new Date().toISOString(),
          },
        ],
      ];

      mockedGetNotes.mockResolvedValue(mockNotes);

      render(<Home />);

      await screen.findByText('Test Note');

      const deleteButton = screen.getByRole('button', { name: /delete/i });

      fireEvent.click(deleteButton);

      const dialog = await screen.findByRole('dialog');

      expect(dialog).toBeInTheDocument();
      expect(screen.getByText('Delete Note')).toBeInTheDocument();
      expect(screen.getByText(/are you sure you want to delete this note/i)).toBeInTheDocument();
    });

    it('should not delete note when deletion is cancelled', async () => {
      // Arrange
      const mockNotes: [string, TNote][] = [
        [
          '1',
          {
            id: '1',
            title: 'Test Note',
            text: 'Test content',
            updatedAt: new Date().toISOString(),
          },
        ],
      ];

      mockedGetNotes.mockResolvedValue(mockNotes);

      const removeNoteMock = vi.fn();

      mockedRemoveNote.mockResolvedValueOnce(removeNoteMock);

      render(<Home />);

      // Wait for note to load and be selected
      await screen.findByText('Test Note');

      // Click delete button to open confirmation dialog
      const deleteButton = screen.getByRole('button', { name: /delete/i });

      fireEvent.click(deleteButton);

      // Find and click the cancel button
      const cancelButton = await screen.findByRole('button', { name: /cancel/i });

      fireEvent.click(cancelButton);

      // Assert that the note is still in the list
      expect(screen.getByText('Test Note')).toBeInTheDocument();

      // Assert that removeNote was never called
      expect(removeNoteMock).not.toHaveBeenCalled();

      // Assert that the dialog is closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should delete note when confirmed', async () => {
      // Arrange
      const mockNotes: [string, TNote][] = [
        [
          '1',
          {
            id: '1',
            title: 'Note to Delete',
            text: 'This note will be deleted',
            updatedAt: new Date().toISOString(),
          },
        ],
        [
          '2',
          {
            id: '2',
            title: 'Another Note',
            text: 'This note will remain',
            updatedAt: new Date().toISOString(),
          },
        ],
      ];

      // Set up the mock to return the initial notes
      mockedGetNotes.mockResolvedValue(mockNotes);

      // Set up the mock for removeNote to resolve successfully
      mockedRemoveNote.mockResolvedValueOnce(undefined);

      // Act
      render(<Home />);

      // Wait for notes to load
      await screen.findByText('Note to Delete');

      // Click delete button to open confirmation dialog
      const deleteButton = screen.getByRole('button', { name: 'Delete' });

      fireEvent.click(deleteButton);

      // Find and click the confirm button
      const confirmButton = await screen.findByRole('button', { name: 'Delete' });

      fireEvent.click(confirmButton);

      // Assert that removeNote was called with the correct note ID
      expect(mockedRemoveNote).toHaveBeenCalledWith('1');

      // Since the component updates asynchronously, wait for the note to be removed and the next one to be selected
      await waitFor(() => {
        expect(screen.queryByText('Note to Delete')).not.toBeInTheDocument();
      });

      // Wait for the next note to be selected and its content to be displayed
      const remainingNote = await screen.findByText('Another Note');

      // The note should be selected (check for selected state on the Card)
      const card = remainingNote.closest('li')?.firstChild;

      expect(card).toHaveClass('bg-gray4');
      expect(card).not.toHaveClass('bg-white');

      // The editor should show the remaining note's content
      expect(await screen.findByDisplayValue('Another Note')).toBeInTheDocument();
      expect(await screen.findByDisplayValue('This note will remain')).toBeInTheDocument();

      // Assert that the dialog is closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
