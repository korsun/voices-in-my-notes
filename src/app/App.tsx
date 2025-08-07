import { Toaster } from 'sonner';
import { Home } from './pages';
import { VoiceRecordingProvider } from '_infrastructure/contexts';

function App() {
  return (
    <VoiceRecordingProvider>
      <Home />
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: '!bg-accent !text-white !border-0 !shadow-lg',
            title: '!text-white',
            description: '!text-white/90',
          },
        }}
      />
    </VoiceRecordingProvider>
  );
}

export default App;
