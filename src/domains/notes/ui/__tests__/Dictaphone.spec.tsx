import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '_infrastructure/test-utils/voiceRecordingTestUtils';
import { useSpeechRecognition } from 'react-speech-recognition';
import type { Mocked } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Dictaphone } from '../Dictaphone/Dictaphone';

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
  const mockStartListening = vi.mocked(
    mockSpeechRecognition.default.startListening,
  );
  const mockStopListening = vi.mocked(
    mockSpeechRecognition.default.stopListening,
  );

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
      <Dictaphone
        isKeyDownReady={true}
        onStart={mockOnStart}
        onStop={mockOnStop}
        {...props}
      />,
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

    expect(
      screen.getByRole('button', { name: /record voice/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /en-US/i })).toBeInTheDocument();
  });

  it('should start recording when record button is clicked', async () => {
    renderComponent();

    const recordButton = screen.getByRole('button', { name: /record voice/i });

    await userEvent.click(recordButton);

    expect(mockOnStart).toHaveBeenCalled();
    expect(mockStartListening).toHaveBeenCalledWith({
      continuous: true,
      interimResults: true,
      language: 'en-US',
    });
  });

  it('should initiate soft stop when stop button is clicked', async () => {
    // Mock the initial state with listening true and initial transcript
    mockUseSpeechRecognition.mockReturnValue({
      ...defaultSpeechRecognitionState,
      listening: true,
      transcript: 'test',
    });

    renderComponent();

    // Simulate a change in transcript
    mockUseSpeechRecognition.mockReturnValue({
      ...defaultSpeechRecognitionState,
      listening: true,
      transcript: 'test transcript',
    });

    // Find and click the stop button
    const stopButton = await screen.findByRole('button', {
      name: /stop recording/i,
    });

    await userEvent.click(stopButton);

    // Verify the soft stop was initiated (but don't expect stopListening to be called directly yet)
    expect(mockStopListening).not.toHaveBeenCalled();

    // Simulate the transcript becoming stable (no change for idle period)
    mockUseSpeechRecognition.mockReturnValue({
      ...defaultSpeechRecognitionState,
      listening: false,
      transcript: 'test transcript',
    });

    // Wait for the idle timeout (700ms) to trigger the commit
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
    });

    // Verify the final transcript was committed
    expect(mockOnStop).toHaveBeenCalledWith('test transcript');

    // Verify stopListening was eventually called
    expect(mockStopListening).toHaveBeenCalled();
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
      interimResults: true,
      language: 'fr-FR',
    });
  });

  it('should handle keyboard events for starting and stopping recording', async () => {
    // Initial state - not listening
    mockUseSpeechRecognition.mockReturnValue({
      ...defaultSpeechRecognitionState,
      listening: false,
      transcript: '',
    });

    const { rerender } = renderComponent();

    // Simulate Alt key down to start recording
    await act(async () => {
      fireEvent.keyDown(window, { key: 'Alt' });
    });

    // Update to show we're now listening with initial transcript
    mockUseSpeechRecognition.mockReturnValue({
      ...defaultSpeechRecognitionState,
      listening: true,
      transcript: 'test',
    });
    rerender(
      <Dictaphone
        isKeyDownReady={true}
        onStart={mockOnStart}
        onStop={mockOnStop}
      />,
    );

    // Simulate transcript update while recording
    mockUseSpeechRecognition.mockReturnValue({
      ...defaultSpeechRecognitionState,
      listening: true,
      transcript: 'test transcript',
    });
    rerender(
      <Dictaphone
        isKeyDownReady={true}
        onStart={mockOnStart}
        onStop={mockOnStop}
      />,
    );

    expect(mockOnStart).toHaveBeenCalledTimes(1);
    expect(mockStartListening).toHaveBeenCalledTimes(1);

    // Simulate Alt key up to stop recording
    await act(async () => {
      fireEvent.keyUp(window, { key: 'Alt' });
    });

    // Verify soft stop was initiated
    expect(mockStopListening).not.toHaveBeenCalled();

    // Simulate transcript becoming stable (no changes for idle period)
    mockUseSpeechRecognition.mockReturnValue({
      ...defaultSpeechRecognitionState,
      listening: false,
      transcript: 'test transcript',
    });
    rerender(
      <Dictaphone
        isKeyDownReady={true}
        onStart={mockOnStart}
        onStop={mockOnStop}
      />,
    );

    // Wait for idle timeout to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
    });

    // Verify the final transcript was committed
    expect(mockOnStop).toHaveBeenCalledWith('test transcript');

    // Verify stopListening was called after soft stop completes
    expect(mockStopListening).toHaveBeenCalledTimes(1);
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
