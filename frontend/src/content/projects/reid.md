---
title: "Multi-Camera Person Re-identification"
summary: "A distributed computer vision pipeline that tracks subjects across cameras with quantized edge inference and a GitOps deployment."
featured: true
order: 3
techStack:
  - Python
  - PyTorch
  - TensorRT
  - Kubernetes
heroImage: "/images/test2.png"
heroAlt: "Re-identification visualization"
primaryAction:
  label: "View project"
  href: "/projects/multi-camera-reid"
secondaryAction:
  label: "Read paper"
  href: "/assets/EE292D Final Project Report.pdf"
---
## Problem space
Traditional re-identification systems lean on heavy central servers and latency-prone data
collection. Our goal was to push inference out to the edge so multiple cameras could collaborate
without oversaturating the network.

## Approach
- Built a PyTorch pipeline with EfficientNet-based embeddings and distilled the model for Jetson
  devices using TensorRT.
- Coordinated devices via Kubernetes with GitOps tooling so every camera had a reproducible config and
  secure updates.
- Quantized models to fit edge constraints while keeping accuracy high enough for crowded scenes.

## Outcome
The deployment handled multi-camera handoffs smoothly, and the GitOps flow meant rolling out new
model weights was as simple as merging a PR. The academic write-up covers the full evaluation if you
want a deep dive.
