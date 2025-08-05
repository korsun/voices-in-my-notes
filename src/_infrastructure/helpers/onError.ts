import { toast } from 'sonner';

export const onError = (error: unknown, message: string) => {
  // eslint-disable-next-line no-console
  console.error(error);
  toast.error(message);
};
