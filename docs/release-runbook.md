# Staging, production, and rollback

Releases promote one immutable container digest through GitOps. A mutable tag is useful only as a human convenience; it is not a deployment identity.

## Build and staging handoff

1. Run the required source, content, browser, accessibility, and privacy checks.
2. Let the staging workflow validate frontend, backend, and WASM targets.
3. The workflow pushes a unique image tag to Harbor, records the registry digest, and uploads release metadata.
4. Confirm the digest belongs to the expected source revision and that the workflow’s validation jobs passed.
5. Update the staging image reference in the infrastructure GitOps repository to `repository@sha256:...`.
6. Let Argo CD reconcile the change. Do not use an imperative rollout restart or an out-of-band image change.

## Staging gate

Approve a candidate only after:

- Argo CD reports the intended digest reconciled and the workload is healthy;
- all staging replicas become ready and `/healthz` and `/readyz` succeed;
- Playwright journeys and axe assertions pass against staging;
- content, links, PDFs, responsive layout, themes, 404s, caching, and WASM behavior pass manual review;
- no client ID, tracking request, visitor cookie, browser-log ingestion, or retired public API remains;
- staging returns `noindex, nofollow` for HTML and non-HTML responses and its robots policy discourages crawling;
- the exact candidate digest and the previous known-good production digest are recorded.

Do not proceed merely because the container started.

## Production cutover

1. Freeze content and infrastructure changes that could invalidate the staging result.
2. Confirm DNS/TLS, ingress, probes, capacity, and rollback ownership are ready without recording sensitive details in this repository.
3. Update the production GitOps manifest from any mutable tag to the exact digest validated in staging.
4. Review and merge the infrastructure change through the normal approval path.
5. Let Argo CD reconcile it; monitor readiness and public checks during the rolling update.
6. Run the production smoke, privacy, accessibility, and indexing checks.
7. Confirm production is indexable and staging remains noindex.

Promotion should not rebuild or retag different bytes. Staging and production should run the same digest.

## Rollback

Rollback when health, rendering, navigation, accessibility, privacy, indexing, or critical content checks regress.

1. Identify the last known-good production digest from the previous GitOps revision or release record.
2. Change the production manifest back to that digest through GitOps.
3. Let Argo CD reconcile; avoid direct `kubectl set image`, manual pod deletion, or mutable-tag changes.
4. Verify workload readiness, public routes, privacy headers, production indexing, and the original failure mode.
5. Record the failed digest and reason, then fix forward in a new candidate.

If the GitOps control plane is itself unavailable, follow the cluster’s restricted emergency procedure; do not copy internal access or recovery instructions into this public repository.

## Current cutover blockers

Before production promotion, the remaining environment and release gates are:

- immutable digest pinning rather than a mutable production tag;
- environment-wide staging `noindex, nofollow` verification;
- Playwright, axe, privacy, and security testing against the deployed staging candidate;
- manual content, responsive, theme, PDF, WASM, and keyboard review;
- recording the exact candidate and known-good rollback digests.

Resolve and verify each item before moving the internet-facing hostname.
