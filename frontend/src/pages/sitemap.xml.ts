import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { siteConfig } from '../site.config';

export const GET: APIRoute = async () => {
  const projects = await getCollection('projects');
  const research = await getCollection('research');
  const routes = [
    '/',
    '/about/',
    '/projects/',
    '/research/',
    ...projects.map((project) => `/projects/${project.id}/`),
    ...research.map((paper) => `/research/${paper.id}/`),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes
    .map((route) => {
      const loc = new URL(route, siteConfig.domain).toString();
      return `  <url><loc>${loc}</loc></url>`;
    })
    .join('\n')}\n</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
