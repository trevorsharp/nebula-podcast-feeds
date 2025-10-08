import { z } from 'zod';

export default z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  imageUrl: z.url(),
  link: z.url(),
});
