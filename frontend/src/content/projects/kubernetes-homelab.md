---
title: "Kubernetes Homelab"
summary: "A six-node bare-metal Kubernetes platform built around GitOps, Ceph-backed storage, eBPF networking, and shared services for public and private workloads."
summaryShort: "Six-node bare-metal Kubernetes platform for GitOps, storage, shared services, and ongoing systems work."
kind: "project"
status: "active"
year: 2024
featured: true
featuredRank: 2
order: 2
role: "Platform engineer and operator"
impact: "Evolved the cluster into a maintainable platform spanning networking, storage, delivery, observability, and shared data services."
audience: "mixed"
techStack:
  - Kubernetes
  - Argo CD
  - Cilium
  - HAProxy
  - Linkerd
  - Rook/Ceph
  - CloudNativePG
  - Valkey
  - Harbor
heroImage: "/images/homelab-cluster.png"
heroAlt: "Cluster dashboard and service overview"
repoUrl: "https://github.com/rrumana/k8s-cluster"
toc:
  - id: "overview"
    label: "Overview"
  - id: "platform-map"
    label: "Platform map"
  - id: "operations"
    label: "Operations"
primaryAction:
  label: "View repo"
  href: "https://github.com/rrumana/k8s-cluster"
---
This six-node bare-metal cluster is my day-to-day platform for shared services, public workloads, personal tools, and machine-learning experiments. Three nodes share control-plane and compute responsibilities, while three dedicated storage nodes provide the Ceph data plane.

The operating model borrows from production environments: changes are declarative, reconciliation is continuous, responsibilities are separated, and observability is part of the platform rather than an afterthought.

## Platform
Argo CD reconciles infrastructure and applications through an app-of-apps GitOps model. Cilium and Hubble provide eBPF networking and flow visibility; MetalLB, HAProxy, cert-manager, and Cloudflare form the edge. Linkerd adds workload identity, mTLS, policy, and service telemetry.

Rook/Ceph supplies replicated block storage and shared filesystems. CloudNativePG and Valkey provide shared data services, while Harbor, Vault, and External Secrets support artifact delivery and secret distribution. Prometheus, Grafana, Fluent Bit, Data Prepper, and OpenSearch cover metrics and logs.

## Operations
I manage the operational side of the stack, not just the application layer. That includes GitOps update flow, image distribution, certificate and ingress changes, storage and database maintenance, networking, observability, and controlled rollouts across staging and production environments.

The cluster runs this site alongside private AI, media, and productivity workloads. Public pages describe the architecture and engineering decisions without exposing internal addressing, hardware identities, secret paths, or a complete inventory of private services.
