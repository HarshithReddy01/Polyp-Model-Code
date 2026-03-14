# PolypVision AI: Real-Time Deep Dilated Segmentation for Colonoscopy

**Live Demo:** https://harshithreddy01.github.io/Polyp-Model-Code/
**API:** https://huggingface.co/spaces/HarshithReddy01/Polyp_Detection

**Technical Lead:** [Debesh Jha](https://debeshjha.com)
**AI/ML Engineer:** [Harshith Reddy Nalla](https://harshithreddy01.github.io/My-Web/)

---

## Overview

PolypVision AI is a deep learning system for automated polyp segmentation in colonoscopy footage. It uses a DilatedSegNet architecture built on a ResNet50 encoder with multi-scale Dilated Convolution Pooling (DCP) blocks to produce pixel-accurate segmentation masks in real time at 33.68 FPS on an NVIDIA RTX 3090. Colorectal cancer is the second leading cause of cancer-related death worldwide — excision of polyps during colonoscopy reduces mortality, and this system enables real-time computer-aided detection to support that process.

## What It Does

Given a colonoscopy frame, the model outputs a binary segmentation mask highlighting polyp regions. The frontend displays three views: the original frame, the binary mask, and a red-highlighted overlay for spatial reference. The backend is a FastAPI service deployed on Hugging Face Spaces, accepting a JPEG or PNG image and returning a base64-encoded PNG mask via a single POST request.

## Key Features

- ResNet50 encoder with ImageNet-pretrained weights
- DCP (Dilated Convolution Pooling) blocks at dilation rates 1, 3, 6, and 9 in parallel
- Channel and spatial attention (CBAM-style) in every decoder block
- 33.68 FPS inference on NVIDIA RTX 3090 — no TensorRT optimization needed
- Dual-dataset support: Kvasir-SEG and BKAI-IGH with separate checkpoints
- REST API via FastAPI, deployed on Hugging Face Spaces
- React + TypeScript frontend with drag-and-drop upload and canvas overlay

---

## Model Performance

| Metric     | Kvasir-SEG | BKAI-IGH  |
|------------|------------|-----------|
| Dice Score | 0.90       | 0.88      |
| mIoU       | 0.83       | 0.81      |
| Inference  | 33.68 FPS  | 33.68 FPS |

### Technical Highlights

- Implemented and benchmarked on NVIDIA RTX 3090 (24 GB VRAM)
- DCP blocks fuse four parallel dilated convolution outputs with a 1x1 conv into a single feature map
- Each decoder block upsamples 2x, concatenates encoder skip connections, then applies CBAM attention
- Input resolution fixed at 256x256; DiceBCE loss, Adam optimizer, lr 1e-4, early stopping patience 50
- Kvasir-SEG split: 880 train / 120 test; BKAI-IGH split: 80/10/10 train/val/test

---

## Models

**Kvasir-SEG**
General-purpose model trained on 1,000 annotated colonoscopy images covering a wide variety of polyp shapes, sizes, and textures. Use this as your default for standard colonoscopy footage.

**BKAI-IGH**
Clinically focused model trained on a dataset distinguishing neoplastic and non-neoplastic polyp categories. Recommended when finer discrimination between polyp types is needed.

Weight files for local use:
- [Kvasir-SEG weights](https://drive.google.com/file/d/1diYckKDMqDWSDD6O5Jm6InCxWEkU0GJC/view?usp=sharing)
- [BKAI-IGH weights](https://drive.google.com/file/d/1ojGaQThD56mRhGQaVoJVpAw0oVwSzX8N/view?usp=sharing)

---

## Quick Start

1. **Upload Image** — Drop or select a colonoscopy JPEG / PNG frame
2. **Select Model** — Choose Kvasir-SEG for general use or BKAI-IGH for clinical differentiation
3. **Run Inference** — DilatedSegNet processes the image via the Hugging Face API
4. **View Overlay** — Inspect the original frame, binary mask, and red-highlighted overlay

---

## API Usage

```bash
curl -X POST "https://harshithreddy01-polyp-detection.hf.space/predict?model=Kvasir-Seg" \
  -F "file=@colonoscopy_image.jpg"
```

Response:
```json
{
  "mask": "<base64-encoded PNG>",
  "size": [256, 256],
  "model": "Kvasir-Seg"
}
```

Available model values: `Kvasir-Seg`, `BKAI-IGH`

---

## Local Development

```bash
# Frontend
npm install
npm run dev

# Backend (separate terminal)
cd ../Polyp_Detection_hf
uvicorn main:app --host 0.0.0.0 --port 7860
```

---

## License

Source code is free for research and education use only. Any commercial use requires formal permission from the first author.

## Contact

**Harshith Reddy Nalla**
- Email: harshithreddynalla01@gmail.com
- Portfolio: https://harshithreddy01.github.io/My-Web/

**Debesh Jha**
- Portfolio: https://debeshjha.com
