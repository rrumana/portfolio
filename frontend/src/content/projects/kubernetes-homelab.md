---
title: "Kubernetes Homelab"
summary: "Two-node k3s platform with GitOps, Longhorn storage, and a LibreChat + llama.cpp AI stack that powers my day-to-day workflows."
featured: true
order: 2
techStack:
  - Kubernetes
  - GitOps
  - Longhorn
  - Rust
heroImage: "/images/homelab.png"
heroAlt: "Homelab rack"
primaryAction:
  label: "View repo"
  href: "https://github.com/rrumana/k8s-homelab"
---
## Why it exists
I wanted production-grade reliability at home, not just a pile of containers. The homelab runs on a
two-node k3s cluster with GitOps from day one, so every change is reviewed, versioned, and self-healing.
It keeps my media workflow, password management, AI experiments, and personal sites online.

## Platform architecture
- **GitOps:** Argo CD app-of-apps reconciles infrastructure, platform services, and applications.
- **Networking:** Cloudflare front door, MetalLB for load balancing, and HAProxy ingress classes for
  public vs. restricted apps.
- **Storage:** Longhorn provides replicated PVCs with hourly snapshots and nightly NAS backups.
- **AI stack:** Migrated from Ollama/OpenWebUI to `llama.cpp` + LibreChat, backed by MongoDB and Qdrant
  so it scales cleanly across nodes.

## Reliability upgrades
Critical services (HAProxy, CoreDNS, cert-manager, LibreChat, Vaultwarden, portfolio) run with
anti-affinity, PDBs, and multi-replica deployments. Test workloads in `platform/test` validate new
nodes and ingress paths before production apps land.

## What's next
Finishing the migration to dark-mode aware UI, expanding network policies, and standing up the LGTM
observability stack once HA work settles.
