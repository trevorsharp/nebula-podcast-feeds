import { z } from 'zod';

const channelSchema = z
  .object({
    results: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        images: z.object({
          avatar: z.object({
            src: z.string(),
          }),
        }),
        share_url: z.string(),
      })
    ),
  })
  .transform((channels) => {
    const channel = channels.results.find(() => true);

    if (!channel) return channel;

    return {
      id: channel.id,
      title: channel.title,
      description: channel.description,
      coverUrl: channel.images.avatar.src,
      nebulaUrl: channel.share_url,
    };
  });

type Channel = NonNullable<z.infer<typeof channelSchema>>;

export { channelSchema };
export type { Channel };
