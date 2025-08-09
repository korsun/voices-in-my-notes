import type { RenderOptions, RenderResult } from '@testing-library/react';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { TestVoiceRecordingProvider } from './TestVoiceRecordingProvider';

type CustomRenderOptions = {
  initialListeningState?: boolean;
} & Omit<RenderOptions, 'wrapper'>;

const customRender = (
  ui: ReactElement,
  { initialListeningState = false, ...options }: CustomRenderOptions = {},
): RenderResult => {
  return render(ui, {
    wrapper: ({ children }) => (
      <TestVoiceRecordingProvider initialListeningState={initialListeningState}>
        {children}
      </TestVoiceRecordingProvider>
    ),
    ...options,
  });
};

export * from '@testing-library/react';

// Override the render method with our custom one
export { customRender as render };
