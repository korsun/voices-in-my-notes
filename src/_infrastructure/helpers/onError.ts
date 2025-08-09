import { toast } from 'sonner';

export const onError = (error: unknown, message: string) => {
  // biome-ignore lint/suspicious/noConsole: legit logger
  console.error(error);
  toast.error(message);
};
