---
title: "Multi-Camera Person Re-identification"
summary: "A completed Stanford EE292D edge-ML prototype that detects and re-identifies people across Raspberry Pi cameras without continuously streaming video to a central server."
summaryShort: "Completed Raspberry Pi prototype for quantized, cross-camera person re-identification at the edge."
kind: "project"
status: "completed"
year: 2024
featured: true
featuredRank: 4
order: 3
role: "Research coauthor and edge-ML engineer"
impact: "Demonstrated a distributed edge pipeline that retained 79% ReID mAP after INT8 quantization while reducing measured runtime."
cardTags: ["PyTorch", "Edge ML", "Quantization"]
accent: "sky"
audience: "mixed"
techStack:
  - Python
  - PyTorch
  - YOLOv8 Nano
  - ResNet-50
  - Raspberry Pi
  - INT8 quantization
  - OpenCV
heroImage: "/images/test2.png"
heroAlt: "Re-identification visualization"
toc:
  - id: "problem"
    label: "Problem"
  - id: "system-design"
    label: "System design"
  - id: "model-optimization"
    label: "Model optimization"
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

The project and report were completed with Eric Ye for Stanford EE292D, Machine Learning on Embedded Systems, and the work was invited for presentation at Stanford's ACT4AERO workshop.

## System design
Each Raspberry Pi captures a 640 × 480 frame and runs a COCO-pretrained YOLOv8 Nano model to find people. Every detected crop then passes through a ResNet-50 model trained and evaluated on Market-1501, producing an embedding that represents the person's visual features.

The device writes the frame, crops, bounding boxes, embeddings, and debugging metadata to a RAM disk. A central monitor retrieves those outputs and associates observations by cosine similarity. The demonstration can fetch images for inspection, but the intended data path moves embeddings and metadata instead of requiring every camera to send a continuous raw-video stream for centralized inference. Heavy detection and re-identification work therefore scales with the number of edge devices rather than accumulating on one server.

## Model optimization
Both neural networks were converted from FP32 to INT8 for CPU inference on constrained hardware. YOLOv8 followed Ultralytics' supported quantization path. ResNet-50 required PyTorch eager-mode quantization, manual fusion of compatible layers, and calibration with 100 Market-1501 training images after the newer graph and export quantization paths proved unsuitable for the model.

ResNet-50 was selected after a YOLOv8 XL classification experiment reached only about 40% mAP on the evaluation set despite nearly perfect training accuracy. The ResNet architecture's bottleneck produced substantially better embeddings and a better accuracy-runtime tradeoff.

## Results
The quantized ResNet-50 retained the full-precision model's 79% mean average precision on Market-1501. In the reported Raspberry Pi measurements, INT8 quantization reduced YOLOv8 object-detection runtime by approximately 49% and ResNet-50 re-identification runtime by approximately 37%.

In the live demonstration, the system correctly associated people seen from cameras facing roughly opposite directions. The increased frame rate made the Raspberry Pi a viable platform for the prototype, while the unchanged ReID mAP showed that its most important optimization did not trade away measured accuracy.

## Limitations and ethics
The prototype treats each frame independently rather than maintaining a durable identity across time. It remains sensitive to occlusion, partial crops, viewpoint and camera-color differences, and ambiguous one-to-many matches. The report proposes persistent embedding histories, per-camera Kalman filtering, camera profiles, stronger association constraints, relative camera localization, and lighter model families as follow-on work.

The report also discusses the surveillance risk directly. Edge inference reduces raw-video transfer, but inexpensive embeddings can be stored and searched for far longer than video. Making cross-camera identification cheaper or easier to deploy therefore requires explicit governance, retention limits, access controls, and a defensible reason to track people across spaces.
