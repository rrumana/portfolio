import type { CollectionEntry } from 'astro:content';

export type ProjectEntry = CollectionEntry<'projects'>;

export function sortProjects(projects: ProjectEntry[]) {
  return [...projects].sort((left, right) => {
    if (left.data.featuredRank !== right.data.featuredRank) {
      return left.data.featuredRank - right.data.featuredRank;
    }

    if (left.data.order !== right.data.order) {
      return left.data.order - right.data.order;
    }

    return right.data.year - left.data.year;
  });
}

export function featuredProjects(projects: ProjectEntry[]) {
  return sortProjects(projects).filter((project) => project.data.featured);
}

export function groupedProjects(projects: ProjectEntry[]) {
  const sorted = sortProjects(projects);

  return {
    featured: sorted.filter((project) => project.data.featured),
    active: sorted.filter((project) => !project.data.featured && project.data.status === 'active'),
    completed: sorted.filter((project) => !project.data.featured && project.data.status === 'completed'),
    incubating: sorted.filter((project) => project.data.status === 'incubating'),
    archive: sorted.filter((project) => project.data.status === 'archive'),
  };
}
