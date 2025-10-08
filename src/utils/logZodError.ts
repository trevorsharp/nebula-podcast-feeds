import type { ZodError } from 'zod';

export default <T>(error: ZodError<T>) =>
  error.issues.forEach((e) => {
    console.error(e.path.join(' '), ':', e.message);
  });
