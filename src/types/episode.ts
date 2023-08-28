import { z } from 'zod';

const episodesSchema = z
  .object({
    results: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        duration: z.number(),
        published_at: z.coerce.date(),
        share_url: z.string(),
      })
    ),
  })
  .transform((episodes) =>
    episodes.results.map((episode) => ({
      id: episode.id,
      title: episode.title,
      description: episode.description,
      publishedOn: episode.published_at,
      duration: episode.duration,
      nebulaUrl: episode.share_url,
    }))
  );

type Episode = z.infer<typeof episodesSchema>[number];

export { episodesSchema };
export type { Episode };
