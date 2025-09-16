import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    summary: z.string(),
    featured: z.boolean().default(false),
    order: z.number().default(0),
    techStack: z.array(z.string()).default([]),
    heroImage: z.string().optional(),
    heroAlt: z.string().optional(),
    primaryAction: z
      .object({
        label: z.string(),
        href: z.string(),
        variant: z.enum(['primary', 'secondary', 'ghost', 'link']).optional(),
      })
      .optional(),
    secondaryAction: z
      .object({
        label: z.string(),
        href: z.string(),
        variant: z.enum(['primary', 'secondary', 'ghost', 'link']).optional(),
      })
      .optional(),
  }),
});

export const collections = {
  projects,
};
