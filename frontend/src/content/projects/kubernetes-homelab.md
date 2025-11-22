---
title: "Kubernetes Homelab"
summary: "Two-node k3s platform with GitOps, Longhorn storage, and a LibreChat + llama.cpp AI stack that keeps my services and experiments online."
featured: true
order: 2
techStack:
  - Kubernetes
  - GitOps
  - Longhorn
  - MetalLB
  - Cloudflare
heroImage: "/images/homelab.png"
heroAlt: "Homelab rack"
primaryAction:
  label: "Read more"
  href: "/projects/kubernetes-homelab"
secondaryAction:
  label: "View repo"
  href: "https://github.com/rrumana/k8s-homelab"
---
## Why it exists
I wanted production-grade reliability at home, not just a bunch of containers. The homelab runs on a declarative two-node k8s cluster with GitOps management, so every change is reviewed, versioned, and self-healing. It keeps my media workflow, password management, AI experiments, and personal sites online.

## Platform architecture
- **GitOps:** Argo CD reconciles infrastructure, platform services, and applications.
- **Networking:** Cloudflare DNS, MetalLB for load balancing, and HAProxy ingress classes for
  public vs. restricted apps, Wireguard tunnels for approved devices.
- **Storage:** Longhorn provides replicated PVCs with hourly snapshots and nightly NAS backups.
- **AI stack:** `llama.cpp` + LibreChat, backed by Postgres and Qdrant so it scales cleanly across nodes.

## Reliability upgrades
Critical services (HAProxy, CoreDNS, cert-manager, LibreChat, Vaultwarden, portfolio) run with anti-affinity, PDBs, and multi-replica deployments. Large changes are tested in staging with blue-green deployments for smooth migrations. When a third node comes online control plane will migreate to high-availability etcd for even better reliability.

## What's next
Finishing the migration to dark-mode aware UI, expanding network policies, and standing up the LGTM
observability stack once HA work settles.
