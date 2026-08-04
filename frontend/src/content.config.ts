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
    cardTags: z.array(z.string()).max(3).default([]),
    accent: z.enum(['sky', 'ochre', 'pine', 'clay']).default('sky'),
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

const artifactSchema = z.object({
  kind: z.enum(['pdf', 'repository', 'slides', 'video', 'artifact']),
  label: z.string(),
  url: z.string(),
});

const researchSchema = z
  .object({
    title: z.string(),
    shortTitle: z.string(),
    summary: z.string(),
    abstract: z.string().optional(),
    format: z.enum(['independent-paper', 'course-report', 'working-paper']),
    stage: z.enum(['in-progress', 'complete']),
    availability: z.enum(['public', 'forthcoming']),
    lastUpdated: z.coerce.date(),
    completedDate: z.coerce.date().optional(),
    displayDate: z.string(),
    authors: z.array(
      z.object({
        name: z.string(),
        url: z.url().optional(),
      }),
    ),
    topics: z.array(z.string()).default([]),
    venue: z.string().optional(),
    presentation: z
      .object({
        event: z.string(),
        date: z.coerce.date().optional(),
        url: z.url().optional(),
      })
      .optional(),
    citation: z.string().optional(),
    version: z.string().optional(),
    pageCount: z.number().int().positive().optional(),
    sha256: z.string().regex(/^[a-f0-9]{64}$/).optional(),
    license: z.string().optional(),
    artifacts: z.array(artifactSchema).default([]),
    relatedProjectUrl: z.string().optional(),
    featuredRank: z.number().default(99),
    progress: z
      .object({
        question: z.string(),
        currentState: z.string(),
        nextMilestone: z.string(),
      })
      .optional(),
  })
  .superRefine((value, context) => {
    if (value.stage === 'complete' && !value.completedDate) {
      context.addIssue({ code: 'custom', path: ['completedDate'], message: 'Completed work requires a completion date.' });
    }
    if (value.stage === 'in-progress' && !value.progress) {
      context.addIssue({ code: 'custom', path: ['progress'], message: 'In-progress work requires progress details.' });
    }
    if (value.availability === 'public' && value.artifacts.length === 0) {
      context.addIssue({ code: 'custom', path: ['artifacts'], message: 'Public work requires at least one artifact.' });
    }
  });

const research = defineCollection({
  loader: glob({ base: './src/content/research', pattern: '**/*.{md,mdx}' }),
  schema: researchSchema,
});

export const collections = {
  projects,
  research,
};
