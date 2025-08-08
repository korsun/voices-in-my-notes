import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Mocked } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSpeechRecognition } from 'react-speech-recognition';
import { Dictaphone } from '../Dictaphone/Dictaphone';
import { render } from '_infrastructure/test-utils/voiceRecordingTestUtils';

// Type definitions for the mocked module
type SpeechRecognitionModule = {
  default: {
    startListening: () => Promise<void>;
    stopListening: () => Promise<void>;
  };
  useSpeechRecognition: typeof useSpeechRecognition;
};

// Mock the react-speech-recognition module
vi.mock('react-speech-recognition', () => ({
  __esModule: true,
  default: {
    startListening: vi.fn(),
    stopListening: vi.fn(),
  },
  useSpeechRecognition: vi.fn(),
}));

// Import the mocked module
const mockSpeechRecognition = (await vi.importMock(
  'react-speech-recognition',
)) as Mocked<SpeechRecognitionModule>;

// Mock the browser's navigator.languages
const mockLanguages = ['en-US', 'fr-FR'];

Object.defineProperty(window.navigator, 'languages', {
  value: mockLanguages,
  configurable: true,
});

describe('Dictaphone', () => {
  const mockOnStart = vi.fn();
  const mockOnStop = vi.fn();
  const mockUseSpeechRecognition = vi.mocked(useSpeechRecognition);
  const mockStartListening = vi.mocked(mockSpeechRecognition.default.startListening);
  const mockStopListening = vi.mocked(mockSpeechRecognition.default.stopListening);

  const defaultSpeechRecognitionState = {
    transcript: '',
    interimTranscript: '',
    finalTranscript: '',
    listening: false,
    resetTranscript: vi.fn(),
    browserSupportsSpeechRecognition: true,
    browserSupportsContinuousListening: true,
    isMicrophoneAvailable: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSpeechRecognition.mockReturnValue(defaultSpeechRecognitionState);
  });

  const renderComponent = (props = {}) => {
    return render(
      <Dictaphone isKeyDownReady={true} onStart={mockOnStart} onStop={mockOnStop} {...props} />,
      { initialListeningState: false },
    );
  };

  it('should not render when browser does not support speech recognition', () => {
    mockUseSpeechRecognition.mockReturnValueOnce({
      ...defaultSpeechRecognitionState,
      browserSupportsSpeechRecognition: false,
    });

    const { container } = renderComponent();

    expect(container.firstChild).toBeNull();
  });

  it('should render record button and language selector', () => {
    renderComponent();

    expect(screen.getByRole('button', { name: /record voice/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /en-US/i })).toBeInTheDocument();
  });

  it('should start recording when record button is clicked', async () => {
    renderComponent();

    const recordButton = screen.getByRole('button', { name: /record voice/i });

    await userEvent.click(recordButton);

    expect(mockOnStart).toHaveBeenCalled();
    expect(mockStartListening).toHaveBeenCalledWith({
      continuous: true,
      language: 'en-US',
    });
  });

  it('should stop recording when stop button is clicked', async () => {
    mockUseSpeechRecognition.mockReturnValue({
      ...defaultSpeechRecognitionState,
      listening: true,
      transcript: 'test transcript',
    });

    renderComponent();

    // Wait for the component to update with the new listening state
    const stopButton = await screen.findByRole('button', { name: /stop recording/i });

    await userEvent.click(stopButton);

    expect(mockStopListening).toHaveBeenCalled();
    expect(mockOnStop).toHaveBeenCalledWith('test transcript');
  });

  it('should change language when a different language is selected', async () => {
    renderComponent();

    // Open the language dropdown
    const languageButton = screen.getByRole('button', { name: /en-US/i });

    await userEvent.click(languageButton);

    // Select French
    const frenchOption = await screen.findByText('fr-FR');

    await userEvent.click(frenchOption);

    // Start recording to verify language was updated
    const recordButton = screen.getByRole('button', { name: /record voice/i });

    await userEvent.click(recordButton);

    expect(mockStartListening).toHaveBeenCalledWith({
      continuous: true,
      language: 'fr-FR',
    });
  });

  it('should handle keyboard events for starting and stopping recording', async () => {
    // Set up the initial state with listening: false
    mockUseSpeechRecognition.mockReturnValue({
      ...defaultSpeechRecognitionState,
      listening: false,
    });

    const { rerender } = renderComponent();

    // Simulate Alt key down to start recording
    await act(async () => {
      fireEvent.keyDown(window, { key: 'Alt' });
    });

    // Update the mock to simulate that we're now listening
    mockUseSpeechRecognition.mockReturnValue({
      ...defaultSpeechRecognitionState,
      listening: true,
    });

    // Rerender with the new listening state
    rerender(<Dictaphone isKeyDownReady={true} onStart={mockOnStart} onStop={mockOnStop} />);

    expect(mockOnStart).toHaveBeenCalled();
    expect(mockStartListening).toHaveBeenCalled();

    // Reset the mocks to track the stop calls
    mockOnStart.mockClear();
    mockStartListening.mockClear();

    // Simulate Alt key up to stop recording
    await act(async () => {
      fireEvent.keyUp(window, { key: 'Alt' });
    });

    // Verify stop was called
    expect(mockStopListening).toHaveBeenCalled();
  });

  it('should not start recording when isKeyDownReady is false', async () => {
    renderComponent({ isKeyDownReady: false });

    await act(async () => {
      fireEvent.keyDown(window, { key: 'Alt' });
    });

    expect(mockOnStart).not.toHaveBeenCalled();
    expect(mockStartListening).not.toHaveBeenCalled();
  });
});
