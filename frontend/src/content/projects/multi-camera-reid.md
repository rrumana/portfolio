---
title: "Multi-Camera Person Re-identification"
summary: "A completed Stanford EE292D project that combined edge person detection and re-identification on Raspberry Pi devices, coauthored with Eric Ye."
summaryShort: "Completed edge-ML prototype for cross-camera person re-identification on Raspberry Pi."
kind: "project"
status: "completed"
year: 2024
featured: true
featuredRank: 4
order: 3
role: "Research coauthor and ML deployment collaborator"
impact: "Demonstrated a distributed edge pipeline that retained 79% ReID mAP after INT8 quantization while reducing measured runtime."
audience: "mixed"
techStack:
  - Python
  - PyTorch
  - YOLOv8 Nano
  - ResNet-50
  - Raspberry Pi
  - Quantization
  - OpenCV
  - HTTP
  - Cosine similarity
heroImage: "/images/test2.png"
heroAlt: "Re-identification visualization"
toc:
  - id: "problem"
    label: "Problem"
  - id: "approach"
    label: "Approach"
  - id: "results"
    label: "Results"
  - id: "limitations-and-ethics"
    label: "Limitations and ethics"
primaryAction:
  label: "Read report"
  href: "/research/multi-camera-reidentification-and-tracking/"
secondaryAction:
  label: "Download PDF"
  href: "/research/multi-camera-reidentification-and-tracking.pdf"
---
## Problem
Person re-identification asks whether observations from different camera views represent the same individual. Centralized systems commonly stream every feed to one server, so this project explored whether edge devices could exchange compact embeddings instead of continuous raw video.

The course project and report were completed with Eric Ye for Stanford EE292D, Machine Learning on Embedded Systems.

## Approach
Each Raspberry Pi used YOLOv8 Nano for person detection and a ResNet-50 model trained on Market-1501 for re-identification. The devices exposed frames, bounding boxes, crops, and embeddings over HTTP; a monitor compared embeddings using cosine similarity.

Both models were quantized from FP32 to INT8 to test the accuracy and runtime tradeoff on constrained hardware.

## Results
The ResNet-50 model retained 79% mean average precision after quantization. In the reported measurements, quantization reduced object-detection runtime by approximately 49% and re-identification runtime by approximately 37%.

## Limitations and ethics
The prototype did not provide stable cross-frame association and remained sensitive to occlusion and viewpoint changes. The report proposes stronger temporal matching, camera calibration, and more efficient model families as follow-on work.

The report also discusses the surveillance risk directly: reducing raw-video transfer does not remove the privacy consequences of making cross-camera identification cheaper or easier to deploy.
