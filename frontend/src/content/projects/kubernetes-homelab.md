---
title: "Kubernetes Homelab"
summary: "A six-node bare-metal Kubernetes platform with separate compute and storage planes, GitOps delivery, Ceph-backed data services, and a deliberately narrow OPNsense edge."
summaryShort: "Six-node bare-metal Kubernetes platform for GitOps, storage, shared services, and ongoing systems work."
kind: "project"
status: "active"
year: 2024
featured: true
featuredRank: 2
order: 2
role: "Platform engineer and operator"
impact: "Built and operate a two-plane platform with 36 TB of raw NVMe storage, controlled public exposure, shared data services, and reproducible GitOps delivery."
cardTags: ["Kubernetes", "Argo CD", "Rook/Ceph"]
accent: "pine"
audience: "mixed"
techStack:
  - Kubernetes
  - Argo CD
  - Cilium
  - OPNsense
  - MetalLB
  - HAProxy
  - Linkerd
  - Rook/Ceph
  - CloudNativePG
  - Harbor
  - Vault
heroImage: "/images/homelab-cluster.png"
heroAlt: "Cluster dashboard and service overview"
repoUrl: "https://github.com/rrumana/k8s-cluster"
toc:
  - id: "overview"
    label: "Overview"
  - id: "hardware"
    label: "Hardware"
  - id: "edge-and-access"
    label: "Edge and access"
  - id: "storage-and-state"
    label: "Storage and state"
  - id: "operations"
    label: "Operations"
  - id: "platform-map"
    label: "Platform map"
primaryAction:
  label: "View repo"
  href: "https://github.com/rrumana/k8s-cluster"
---
## Overview
This six-node bare-metal cluster is my day-to-day platform for shared services, public workloads, personal tools, and machine-learning experiments. Three nodes share control-plane and compute responsibilities, while three dedicated storage and I/O nodes run the Ceph data plane and storage-adjacent services.

The distinction is enforced through labels, taints, affinities, and tolerations rather than convention alone. Ordinary workloads default to the control/compute nodes; stateful or high-throughput services must explicitly opt into the storage plane.

## Hardware
The two planes are designed for different work:

- **Control and compute:** three AMD Ryzen AI 9 HX 370 systems with Radeon 890M graphics, 96 GiB of physical memory per node split between the operating system and integrated GPU, a 1 TB NVMe system disk, and 2.5 GbE. They run the Kubernetes control plane, general application workloads, and local AI inference.
- **Storage and I/O:** three AMD Ryzen 7 7745HX systems with 64 GiB of memory and 10 GbE. Each has a separate boot disk and four Ceph OSDs: two 4 TB Samsung 990 Pro drives and two 2 TB Crucial P310 drives. That provides roughly 12 TB per node and 36 TB of raw NVMe capacity across the cluster.

## Edge and access
OPNsense is the boundary between the cluster and the internet. The public posture is intentionally small: WAN traffic is forwarded only on TCP 80 and 443 to the HAProxy ingress address. The Kubernetes API, node addresses, Ceph and NFS services, Harbor, and the remaining MetalLB addresses have no WAN forwarding path. Internal clients use split DNS instead of NAT reflection, while Headscale provides private remote access without publishing administrative services.

MetalLB gives HAProxy a stable address on the LAN. Every public ingress must declare whether it is a direct or Cloudflare edge and carry an explicit approval label; a Kubernetes admission policy rejects incomplete exposure metadata, wildcard hosts, and missing TLS configuration. Cloudflare-proxied sites accept origin traffic only from Cloudflare and private networks. Restricted ingresses accept only LAN and Headscale address ranges.

Inside the cluster, Cilium replaces kube-proxy with an eBPF datapath and exposes network flows through Hubble. Linkerd adds workload identity, mTLS, policy, and service telemetry without requiring privileged init containers.

## Storage and state
Rook/Ceph turns the twelve dedicated OSDs into several explicit durability profiles: three-way replicated RBD for critical data, two-way RBD for application-replicated databases, three-way CephFS for critical shared data, and 2+1 erasure-coded CephFS for reconstructible bulk data.

Five three-instance CloudNativePG clusters separate platform, AI, media, productivity, and miscellaneous workloads. Valkey provides distinct replicated cache and persistent queue tiers. CSI snapshots, recovery runbooks, and storage-aware scheduling make data placement an operational choice rather than an incidental consequence of where a pod starts.

## Operations
Argo CD reconciles infrastructure and applications through a root app-of-apps model with pruning and self-healing. First-party images and mirrored dependencies move through Harbor by immutable digest; Vault and External Secrets keep secret authority outside Git; Renovate and an artifact promoter handle dependency updates without allowing manifests to outrun the registry.

Prometheus, Alertmanager, Grafana, Hubble, Fluent Bit, Data Prepper, and OpenSearch cover metrics, alerts, flows, and centralized logs. I handle the full operating surface: node and Kubernetes upgrades, certificate and ingress changes, image distribution, storage and database maintenance, access policy, incident response, and controlled staging-to-production rollouts.

The cluster runs this site alongside private AI, media, and productivity workloads. Public pages describe the architecture and engineering decisions without exposing internal addressing, hardware identities, secret paths, or a complete inventory of private services.
