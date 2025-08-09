import { VoiceRecordingProvider } from '_infrastructure/contexts';
import { Toaster } from 'sonner';
import { Home } from './pages';

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
