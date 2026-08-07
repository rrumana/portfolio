---
title: "Multi-Camera Re-identification and Tracking"
shortTitle: "Multi-Camera Re-identification and Tracking"
summary: "An edge-oriented person detection and re-identification prototype that shares embeddings instead of streaming every camera feed to a central server."
abstract: "This academic project combines YOLOv8 Nano person detection with a ResNet-50 re-identification model on Raspberry Pi devices. Each camera processes video locally and exposes embeddings over HTTP, allowing a central monitor to associate observations using cosine similarity without receiving continuous raw video. The report evaluates quantization, accuracy, runtime, deployment constraints, and the privacy consequences of making cross-camera tracking more accessible."
format: "course-report"
stage: "complete"
availability: "public"
lastUpdated: 2024-06-10
completedDate: 2024-06-10
displayDate: "June 10, 2024"
authors:
  - name: "Eric Ye"
  - name: "Ryan Rumana"
    url: "https://github.com/rrumana"
topics:
  - Person re-identification
  - Edge ML
  - Model quantization
  - Computer vision
venue: "Stanford EE292D — Machine Learning on Embedded Systems"
presentation:
  event: "Stanford ACT4AERO workshop"
citation: "Ye, E., & Rumana, R. (2024). Multi-Camera Re-identification and Tracking. Stanford EE292D final project report."
version: "Final project report"
pageCount: 7
sha256: "e1ae0f4a1c0d75aca1aa14f426963bdd495e89840b03edd68605d9c6de3c449c"
artifacts:
  - kind: "pdf"
    label: "Download PDF"
    url: "/research/multi-camera-reidentification-and-tracking.pdf"
relatedProjectUrl: "/projects/multi-camera-reid/"
featuredRank: 2
---

## Problem

Multi-camera person tracking usually sends every video feed to a central system. That design is straightforward, but bandwidth and centralized compute requirements grow with every camera. This project explored a distributed alternative: perform detection and re-identification on each edge device, then exchange compact model outputs rather than continuous raw video.

## System

Each Raspberry Pi runs YOLOv8 Nano to detect people and a ResNet-50 model trained on Market-1501 to generate re-identification embeddings. Camera frames, crops, bounding boxes, and embeddings are made available over HTTP for a monitoring interface. Cross-camera matches use cosine similarity between embeddings.

Both models were quantized from FP32 to INT8 for constrained hardware. The report found that the ResNet-50 model retained 79% mean average precision after quantization, while measured runtime fell by approximately 49% for object detection and 37% for re-identification.

## Collaboration

This project and report were completed by Eric Ye and Ryan Rumana for Stanford's EE292D course. The work was also invited for presentation at Stanford's ACT4AERO workshop.

## Limitations and ethics

The prototype does not claim production-grade persistent identity tracking. The report identifies future work including stronger temporal association, Kalman filtering, camera-specific calibration, more efficient model families, and relative camera localization.

It also treats privacy as a first-class concern. Moving inference to the edge may reduce raw-video transfer, but accessible person re-identification can still enable pervasive surveillance. Any deployment needs explicit governance, retention limits, access controls, and a clear justification for tracking people across spaces.
