---
sidebar_position: 4
sidebar_products: "RDK S100, RDK S600"
---

# 4.1.4 Usage Guide

## Branch and System Requirements

Starting from **v2.0.0**, the RDK S series (**RDK S100 / S100P / S600**) and RDK X5 are maintained together on the default **`main`** branch. A single `samples/` directory targets all boards via `--target` or `--platform` (`auto` / `s100` / `s100p` / `s600`).

- **RDK S100 / S100P**: Recommended OS **RDK OS >= 4.0.5** (or matching board image and runtime for published artifacts)
- **RDK S600**: Recommended OS **RDK OS >= 5.1.0** (LLM / VLM samples also require the matching OELLM SDK Runtime described in each sample's README)

```bash
git clone https://github.com/D-Robotics/rdk_model_zoo.git
cd rdk_model_zoo
```

:::tip

- **`main`** is the stable release delivery branch and is recommended for all new work. Browse models by board (S100 / S100P / S600), compare measured FPS and accuracy, and copy commands in the **[Web Model Catalog](https://d-robotics.github.io/rdk_model_zoo/)**.
- Legacy per-board branch `rdk_s` and early repository [RDK Model Zoo S](https://github.com/D-Robotics/rdk_model_zoo_s) remain archived for historical compatibility.

:::

## Repository Directory Structure

The unified `main` branch organizes RDK S series samples across Vision, LLM / VLM, Speech, and Embodied VLA:

```text
rdk_model_zoo/
├── samples/
│   ├── vision/                   # Computer vision & multimodal samples (unified X5 / S)
│   │   ├── ultralytics_yolo/     # Detect / Seg / Pose / Cls / OBB (YOLOv5u–YOLO26)
│   │   ├── yolov5/               # Object detection
│   │   ├── yoloe/                # Prompt-free instance segmentation
│   │   ├── fasterrcnn/           # Object detection & person tracking
│   │   ├── bytetrack/            # Multi-object tracking
│   │   ├── hobot_mot/            # Multi-object tracking (IOU 2.0)
│   │   ├── osnet/                # Person re-identification
│   │   ├── resnet/               # Image classification (ResNet-18/34/50/101/152)
│   │   ├── mobilenetv1..v4/      # Image classification (v1 / v2 / v3 / v4)
│   │   ├── efficientnet/         # Image classification
│   │   ├── vit/                  # Image classification
│   │   ├── 3dresnet/             # Video action classification
│   │   ├── efficient_sam/        # Promptable segmentation
│   │   ├── mobile_sam/           # Promptable segmentation
│   │   ├── unetmobilenet/        # Semantic segmentation
│   │   ├── depth_anything_v2/    # Monocular depth estimation
│   │   ├── yolo26_depth/         # Monocular depth estimation
│   │   ├── paddle_ocr/           # OCR text detection and recognition
│   │   ├── lanenet/              # Lane detection
│   │   ├── pointnet/             # Point cloud part segmentation
│   │   ├── dinov2/               # Vision feature encoder
│   │   ├── siglip/               # Vision-language encoder
│   │   ├── lite_avatar/          # Audio-driven talking avatar
│   │   └── diffusiondrive/       # End-to-end driving planning
│   ├── llm/                      # On-device LLM & VLM runtimes (native C++ / OELLM SDK)
│   │   ├── oellm/                # Official OELLM SDK 2.0.0 S600 suite (32 profiles)
│   │   ├── gemma4/               # Gemma4 E2B / E4B text generation (OELLM SDK 2.0.0, S600)
│   │   ├── gemma4-e2b/           # Gemma4-E2B VLM chat & HTTP server (native C++)
│   │   └── minicpm5-2b/          # MiniCPM5-2B text generation (native C++)
│   ├── speech/                   # Speech processing samples
│   │   ├── asr/                  # Speech recognition (Wav2Vec2 / XLSR53)
│   │   ├── paraformer/           # Paraformer Chinese ASR
│   │   └── kws/                  # Keyword spotting
│   └── vla/                      # Embodied AI / robot policies (pinned Git submodules)
│       ├── act/                  # S100 ACT (Action Chunking Transformer)
│       └── pi0/                  # S600 ACT / Pi0 integration
├── datasets/                     # Public datasets and label files
├── docs/                         # Standards, release manifests (docs/release/s/) & guides
├── skills/                       # RDK Model Zoo Agent Skills pack
└── utils/                        # Shared Python (py_utils/), C++ (c_utils/) & validation tools
```

## Individual Sample Structure

Each standard sample contains the following directories:

```text
sample_name/
├── README.md              # English documentation
├── README_cn.md           # Chinese documentation
├── conversion/            # ONNX export & OpenExplorer quantization recipes
├── evaluator/             # Dataset accuracy and performance evaluation
├── model/                 # Model manifest docs & download scripts (.hbm binaries not committed)
├── runtime/
│   ├── python/            # Python inference (main.py, cli.py, <task>.py, run.sh)
│   └── cpp/               # C++ inference (CMakeLists.txt, src/, run.sh)
├── test_data/             # Sample inputs and reference outputs
└── tests/                 # Host unit tests and numerical regression checks
```

## Inference Interface

RDK S series vision and speech Python samples uniformly use `hbm_runtime`, sharing the same Python API name as RDK X5 while targeting `libhbucp` underneath (whereas RDK X5 targets `libdnn`).

- Python API: 👉 [RDK S hbm_runtime Python API Documentation](https://developer.d-robotics.cc/rdk_s_doc/en/Algorithm_Application/python-api)
- C/C++ UCP API: **UCP (`hb_ucp`) Interface Documentation** 👉 [Overview](https://developer.d-robotics.cc/oe_s_doc/en/guide/ucp/ucp_overview)
- LLM Toolchains: 👉 [S100 OE LLM Manual](https://developer.d-robotics.cc/oe_llm_s100p_doc/index.html) · [S600 OE LLM Manual](https://developer.d-robotics.cc/oe_llm_doc/index.html)

### hbm_runtime Basic Call Flow

#### Load Model

```python
import hbm_runtime

model = hbm_runtime.HB_HBMRuntime("../../model/s100/yolov5x_672x672_nv12.hbm")
model_name = model.model_names[0]
input_names = model.input_names[model_name]
output_names = model.output_names[model_name]
input_shapes = model.input_shapes[model_name]
```

#### Configure Scheduling Parameters

`hbm_runtime` supports specifying inference priority and BPU core:

```python
model.set_scheduling_params(
    priority={model_name: 0},
    bpu_cores={model_name: [0]},
)
```

Command-line parameter equivalents:

```bash
--priority 0 --bpu-cores 0
```

#### Prepare Inputs

RDK S vision samples commonly use separated NV12 inputs (Y plane and UV plane as two named input tensors), unlike RDK X5's single packed NV12 input:

```python
inputs = {
    model_name: {
        input_names[0]: y_plane,    # Y plane (1, H, W, 1)
        input_names[1]: uv_plane,   # UV plane (1, H/2, W/2, 2)
    }
}
```

#### Run Inference

```python
outputs = model.run(inputs)
raw_outputs = outputs[model_name]
output_tensor = raw_outputs[output_names[0]]
```

### Model Zoo Python Runtime Structure

Unified Python samples follow [`docs/sample-standards/runtime-code.md`](https://github.com/D-Robotics/rdk_model_zoo/blob/main/docs/sample-standards/runtime-code.md), separating `main.py`, `cli.py`, and a task-named model file (such as `classify.py`, `detect.py`, or `segment.py`). Each named model class exposes a clean `preprocess → infer → postprocess` chain wired by `predict()`:

```python
class ResNetClassifier:
    def predict(self, image):
        inputs = self.preprocess(image)
        outputs = self.infer(inputs)
        return self.postprocess(outputs)
```

On-device LLM / VLM samples (`samples/llm/*`) provide native C++ and official OELLM SDK Runtime launchers; follow each sample's `README.md` to prepare models and build.

## Quick Start

### 1. Run the Ultralytics YOLO11x Detection Sample (Python)

Example on **RDK S100** (replace `--platform s100` with `s100p` or `s600` on S100P / S600):

```bash
# 1. Download the precompiled BPU model (.hbm)
cd samples/vision/ultralytics_yolo/model
bash download_model.sh --platform s100 --family yolo11 --task detect --model-size x

# 2. Run on-board inference
cd ../runtime/python
python3 main.py \
  --task detect \
  --platform s100 \
  --family yolo11 \
  --model-size x \
  --test-img ../../test_data/bus.jpg \
  --img-save-path ../../test_data/inference_yolo11x.jpg
```

### 2. Host Preview and Manifest Listing

On a development host or board, use `--list-models` and `--dry-run` to inspect supported artifacts and tensor contracts without loading `hbm_runtime`:

```bash
python3 samples/vision/ultralytics_yolo/runtime/python/main.py --platform s100 --list-models
python3 samples/vision/ultralytics_yolo/runtime/python/main.py --platform s600 --family yolo26 --task cls --dry-run
```

### 3. Using run.sh and C++ Entry Points

Each sample provides a `run.sh` launcher under `runtime/python/` and `runtime/cpp/` that locates the entry point and forwards arguments and exit codes verbatim.

:::note

Under the unified runtime contract, `run.sh` does not automatically install dependencies or download models. Prepare the target board's model first per `model/README.md`, then run inference.

:::

```bash
# Example: download and run YOLOv5x-672 detection on RDK S100
python3 -m samples.vision.yolov5.model.download --target s100 --variant x-672 --output-dir samples/vision/yolov5/model
bash samples/vision/yolov5/runtime/python/run.sh --target s100 --variant x-672
```

### 4. Initialize Embodied VLA Submodules (ACT / Pi0)

ACT and Pi0 are integrated via pinned Git submodules (`act/` for S100 ACT; `pi0/` for S600 ACT and Pi0). Initialize them from the repository root and follow `samples/vla/README.md`:

```bash
git submodule sync -- samples/vla/act samples/vla/pi0
git submodule update --init --checkout samples/vla/act samples/vla/pi0
```

## Model Coverage (RDK S Series)

The tables below list the main **RDK S100 / S100P / S600** samples in the unified `main` branch. See each sample's `README.md`, `docs/release/s/models.yaml`, or the [Web Model Catalog](https://d-robotics.github.io/rdk_model_zoo/) for variants, C++ support, newly converted artifacts, and measured benchmarks.

### Vision

| Category | Model | Sample Directory | Supported Platforms |
| :--- | :--- | :--- | :--- |
| Multi-Task Vision | Ultralytics YOLO (`YOLOv5u–YOLO26`) | `samples/vision/ultralytics_yolo` | S100/S100P/S600 |
| Object Detection | YOLOv5 | `samples/vision/yolov5` | S100/S600 |
| Detection / Tracking | Faster R-CNN MobileNetV3-Large | `samples/vision/fasterrcnn` | S100/S100P/S600 |
| Multi-Object Tracking | ByteTrack | `samples/vision/bytetrack` | S100/S100P/S600 |
| Multi-Object Tracking | HobotMot (IOU 2.0) | `samples/vision/hobot_mot` | S100/S100P/S600 |
| Person Re-ID | OSNet x1.0 | `samples/vision/osnet` | S100/S100P/S600 |
| Prompt-Free Seg | YOLOE | `samples/vision/yoloe` | S100/S100P |
| Promptable Seg | EfficientSAM-Tiny | `samples/vision/efficient_sam` | S100/S100P/S600 |
| Promptable Seg | MobileSAM | `samples/vision/mobile_sam` | S100/S100P/S600 |
| Image Classification | ResNet (18/34/50/101/152) | `samples/vision/resnet` | S100/S100P/S600 |
| Image Classification | MobileNetV1/V2/V3/V4 | `samples/vision/mobilenetv1..v4` | S100/S100P/S600 |
| Image Classification | EfficientNet | `samples/vision/efficientnet` | S100/S600 |
| Image Classification | ViT | `samples/vision/vit` | S100 |
| Video Action | 3D ResNet | `samples/vision/3dresnet` | S100 |
| Semantic Seg | UNetMobileNet | `samples/vision/unetmobilenet` | S100/S600 |
| Monocular Depth | Depth Anything V2 | `samples/vision/depth_anything_v2` | S100 |
| Monocular Depth | YOLO26 Depth | `samples/vision/yolo26_depth` | S100/S100P/S600 |
| OCR | PaddleOCR | `samples/vision/paddle_ocr` | S100/S600 |
| Lane Detection | LaneNet | `samples/vision/lanenet` | S100 |
| Point Cloud Seg | PointNet | `samples/vision/pointnet` | S100 |
| Vision Encoder | DINOv2 | `samples/vision/dinov2` | S100/S100P/S600 |
| Vision-Language | SigLIP | `samples/vision/siglip` | S100/S100P |
| Talking Avatar | LiteAvatar | `samples/vision/lite_avatar` | S100/S100P/S600 |
| End-to-End Driving | DiffusionDrive | `samples/vision/diffusiondrive` | S100P/S600 |

### LLM / VLM

| Category | Model | Sample Directory | Supported Platforms |
| :--- | :--- | :--- | :--- |
| LLM / VLM Suite | Official OELLM Suite (SDK 2.0.0, 32 profiles) | `samples/llm/oellm` | S600 |
| Text Generation | Gemma4 E2B / E4B (SDK 2.0.0) | `samples/llm/gemma4` | S600 |
| Vision-Language | Gemma4-E2B (native C++, chat/HTTP) | `samples/llm/gemma4-e2b` | S100/S100P/S600 |
| Text Generation | MiniCPM5-2B (native C++) | `samples/llm/minicpm5-2b` | S100/S100P/S600 |

### Speech

| Category | Model | Sample Directory | Supported Platforms |
| :--- | :--- | :--- | :--- |
| Speech Recognition | ASR (Wav2Vec2 / XLSR53) | `samples/speech/asr` | S100/S600 |
| Speech Recognition | Paraformer (Chinese ASR, 3-stage INT16 HBM) | `samples/speech/paraformer` | S100 |
| Keyword Spotting | KWS (MDTC) | `samples/speech/kws` | S100 |

### Embodied AI / Robot Policy (VLA)

| Category | Model | Sample Directory | Supported Platforms |
| :--- | :--- | :--- | :--- |
| Action Policy | ACT (Action Chunking Transformer) | `samples/vla/act`, `samples/vla/pi0` | S100/S600 |
| Embodied VLA | Pi0 | `samples/vla/pi0` | S600 |

## Shared Utilities (utils/py_utils/)

The unified `main` branch provides shared Python runtime and utility modules under `utils/py_utils/`:

| Utility Module | Function |
| :--- | :--- |
| `runtime`, `model_runner`, `single_array_runner` | Load BPU models via `hbm_runtime`, classification & named-array tensor bindings |
| `platforms`, `platform_profile` | Board identity resolution (`auto`/`x5`/`s100`/`s100p`/`s600`) and platform checks |
| `assets`, `cls_binding`, `sam_binding` | Read `docs/release/{x5,s}/models.yaml` manifests and tensor contracts |
| `image`, `file_io`, `preprocess`, `tensor_io` | Image/file loading, resize (direct/letterbox), and separated Y/UV NV12 conversion |
| `labels`, `classification` | Label loading/validation and Top-K classification helpers |
| `runtime_meta`, `quantization`, `nn_math`, `postprocess` | Metadata parsing, dequantization, NMS, and YOLO detect/seg/pose/OBB decoding |
| `sam_runner`, `sam_stages`, `yoloe26_decode` | SAM encoder/decoder runners and YOLOE26 prompt-free decoding |
| `text_metrics`, `visualize`, `inspect` | Speech CER / edit distance, detection/segmentation/pose visualization & model inspection |
