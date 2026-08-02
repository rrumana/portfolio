import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    summaryShort: z.string(),
    kind: z.enum(['project', 'article']).default('project'),
    status: z.enum(['active', 'completed', 'incubating', 'archive']).default('active'),
    year: z.number(),
    featured: z.boolean().default(false),
    featuredRank: z.number().default(99),
    order: z.number().default(0),
    role: z.string(),
    impact: z.string(),
    audience: z.enum(['hiring', 'technical', 'mixed']).default('mixed'),
    techStack: z.array(z.string()).default([]),
    heroImage: z.string().optional(),
    heroImageDark: z.string().optional(),
    heroAlt: z.string().optional(),
    repoUrl: z.string().optional(),
    liveUrl: z.string().optional(),
    railTitle: z.string().optional(),
    toc: z
      .array(
        z.object({
          id: z.string(),
          label: z.string(),
        }),
      )
      .default([]),
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

const research = defineCollection({
  loader: glob({ base: './src/content/research', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    shortTitle: z.string(),
    summary: z.string(),
    abstract: z.string(),
    kind: z.enum(['whitepaper', 'academic-report', 'working-paper']),
    status: z.enum(['published', 'in-progress']).default('published'),
    publicationDate: z.coerce.date(),
    displayDate: z.string(),
    authors: z.array(
      z.object({
        name: z.string(),
        url: z.url().optional(),
      }),
    ),
    topics: z.array(z.string()).default([]),
    venue: z.string().optional(),
    citation: z.string(),
    version: z.string().optional(),
    pageCount: z.number().int().positive().optional(),
    sha256: z.string().regex(/^[a-f0-9]{64}$/).optional(),
    license: z.string().optional(),
    pdfUrl: z.string().optional(),
    repoUrl: z.url().optional(),
    artifactUrl: z.url().optional(),
    relatedProjectUrl: z.string().optional(),
    featuredRank: z.number().default(99),
  }),
});

export const collections = {
  projects,
  research,
};
