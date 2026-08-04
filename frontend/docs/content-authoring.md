# Content authoring

The portfolio should be factual, concise, and specific enough that a reader can distinguish demonstrated work from plans. Prefer concrete architecture, results, scope, and limitations over promotional language.

## Projects and research

Use a project entry for an engineered system, tool, or course of work. Include the role, problem, approach, outcome, maintenance state, relevant stack, and links that can safely be public.

Use a research entry for a report, whitepaper, working paper, or formal result. Include:

- full and short titles;
- authors in byline order;
- completion or revision date;
- concise summary and self-contained abstract;
- work stage: `in-progress` or `complete`;
- availability: `forthcoming` or `public`;
- document kind without implying peer review;
- scope, assumptions, limitations, and key results;
- stable PDF, code, artifact, and related-project links when available;
- page count, version, citation text, and SHA-256 checksum for a public PDF.

Stage and availability are independent. Useful combinations include “in-progress · forthcoming,” “complete · forthcoming,” and “complete · public.” Avoid “published” unless a recognized venue actually published the work. Public hosting, a repository release, a course submission, and peer-reviewed publication are different claims.

Until every schema and component uses the canonical vocabulary, treat any older internal status value as an implementation compatibility detail; visible copy must use the terms above.

An in-progress entry needs no placeholder PDF. Use this minimum frontmatter and replace every example value with verified copy:

```yaml
title: "Working title"
shortTitle: "Short working title"
summary: "One sentence describing the question and current scope."
format: "working-paper"
stage: "in-progress"
availability: "forthcoming"
lastUpdated: 2026-08-04
displayDate: "Updated August 2026"
authors:
  - name: "Ryan Rumana"
topics: ["Topic one", "Topic two"]
progress:
  question: "The specific question under investigation."
  currentState: "What is established, implemented, or drafted today."
  nextMilestone: "The next concrete result or document milestone."
```

The research index automatically gives in-progress entries their own section and each entry gets a dedicated progress page. Add any later PDF, repository, slides, or video as an `artifacts` item; the page layout does not impose a fixed document count.

## Research copy

- State the exact problem before the result.
- Separate the theorem or measured result from implementation details.
- Preserve qualifications such as board boundary, input encoding, dataset, hardware, and evaluation method.
- Do not generalize a prototype into a production deployment or an invitation into a peer-reviewed acceptance.
- Name collaborators and institutions accurately.
- Include negative results and limitations when they materially frame the work.
- Keep citations reproducible and avoid unsupported superlatives.

## Public infrastructure content

The safe public summary is that the site runs on a six-node kubeadm cluster using GitOps and Rook/Ceph. Discuss architectural choices and lessons, but omit node identities, IP ranges, VLAN maps, internal hostnames, private registry credentials, access paths, recovery secrets, and screenshots containing those details.

Service counts are snapshots, not permanent facts. Date time-sensitive claims or phrase them so normal growth does not immediately make the page false.

## Style and review

- Use plain language and active voice.
- Expand an acronym on first use unless the intended audience universally knows it.
- Use sentence case for headings.
- Use ISO dates in metadata and natural-language dates in display copy.
- Use typographic multiplication signs and units consistently, for example `450 × 450` and `37%`.
- Check names, titles, dates, repository URLs, artifact hashes, and numerical claims against primary material.
- Run the content schema check and production build after every metadata change.

PDFs should have descriptive lowercase filenames, embedded title/author metadata, selectable text, tags where practical, and stable URLs. Replace a file at a stable URL only when it is truly a new version of the same document; otherwise create a versioned record.
