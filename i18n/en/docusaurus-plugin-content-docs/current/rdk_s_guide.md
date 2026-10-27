---
sidebar_position: 4
sidebar_products: "RDK S100, RDK S600"
---

# 4.1.4 Usage Guide

## Getting the Code and System Requirements

The RDK S series (S100 / S100P / S600) uses the unified `samples/` directory on the `main` branch. Recommended system version: RDK OS >= 4.0.5. Python samples uniformly use the `hbm_runtime` inference interface, and select the board target with `--target s100` / `--target s100p` / `--target s600` or the equivalent `--platform` argument.

```bash
git clone https://github.com/D-Robotics/rdk_model_zoo.git
cd rdk_model_zoo
```

:::tip

`main` is the default branch — no branch switch is needed after cloning. The RDK S series shares the same `samples/` directory as RDK X5; the board target is selected with command-line arguments.

Legacy demos for the RDK S series are retained in the [RDK Model Zoo S](https://github.com/d-Robotics/rdk_model_zoo_s) repository.

:::

## Repository Directory Structure

On the `main` branch, the `samples/` directory is organized by domain and model:

```bash
rdk_model_zoo/
|-- samples/
|   |-- vision/                    # Vision model samples
|   |   |-- 3dresnet/              # Video action classification
|   |   |-- bytetrack/             # Multi-object tracking
|   |   |-- depth_anything_v2/     # Monocular depth estimation
|   |   |-- diffusiondrive/        # End-to-end driving planning
|   |   |-- dinov2/                # Vision feature encoder
|   |   |-- efficient_sam/         # Promptable segmentation
|   |   |-- efficientnet/          # Image classification
|   |   |-- fasterrcnn/            # Pedestrian detection and tracking
|   |   |-- hobot_mot/             # Multi-object tracking (CPU IOU 2.0)
|   |   |-- lanenet/               # Lane detection
|   |   |-- lite_avatar/           # Audio-driven talking avatar
|   |   |-- mobile_sam/            # Promptable segmentation
|   |   |-- mobilenetv1/           # Image classification
|   |   |-- mobilenetv2/           # Image classification
|   |   |-- mobilenetv3/           # Image classification
|   |   |-- mobilenetv4/           # Image classification
|   |   |-- paddle_ocr/            # OCR text detection and recognition
|   |   |-- pointnet/              # Point cloud part segmentation
|   |   |-- resnet/                # Image classification (18/34/50/101/152)
|   |   |-- siglip/                # Vision-language encoder
|   |   |-- ultralytics_yolo/      # Detection, segmentation, pose, classification, OBB (YOLOv5u~YOLO26)
|   |   |-- unetmobilenet/         # Semantic segmentation
|   |   |-- vit/                   # Image classification
|   |   |-- yolo26_depth/          # Monocular depth estimation
|   |   |-- yoloe/                 # Instance segmentation (prompt-free)
|   |   `-- yolov5/                # Object detection
|   |-- speech/                    # Speech model samples
|   |   |-- asr/                   # Speech recognition
|   |   |-- kws/                   # Keyword spotting
|   |   `-- paraformer/            # Paraformer speech recognition
|   |-- llm/                       # On-device text generation (native C++)
|   |   |-- gemma4-e2b/            # VLM chat runtime (native C++)
|   |   `-- minicpm5-2b/           # Text generation (native C++)
|   |-- robotics/                  # Robot policies
|   `-- vla/                       # Embodied AI / robot policies (ACT / Pi0)
|-- datasets/                      # Datasets and download scripts
|-- docs/                          # Project specs, platform manifests and reference docs
`-- utils/                         # Shared Python / C++ utilities
```

## Individual Sample Structure

Typical sample directory layout (using `samples/vision/resnet` as an example):

```bash
sample_name/
|-- README.md              # English documentation
|-- README_cn.md           # Chinese documentation
|-- conversion/            # ONNX → HBM conversion configs
|-- evaluator/             # Accuracy and performance evaluation
|-- model/                 # Model download scripts and manifests
|-- runtime/
|   |-- python/            # Python inference (main.py, cli.py, <task>.py, run.sh)
|   `-- cpp/               # C++ inference (src/main.cc, CMakeLists.txt, run.sh)
|-- tests/                 # Automated tests
`-- test_data/             # Test images and inference results
```

The Python runtime follows a `main.py + cli.py` layout: `main.py` is the thin entry point (parses arguments, builds the model, calls `predict`), `cli.py` handles argument declaration, model manifest resolution and result display, and the task modules implement the full preprocess, inference and postprocess chain.

Not every sample provides both a Python and a C++ runtime: LLM samples ship a native C++ runtime only, and VLA samples (ACT / Pi0) are pinned Git submodules, so their layout differs slightly from the typical structure above — each sample's README is authoritative.

## Inference Interface

The RDK S series Python samples uniformly use the `hbm_runtime` inference interface, which shares the same interface name as RDK X5's `hbm_runtime`, but with different underlying dependencies: the RDK S series is based on `libhbucp`, while RDK X5 is based on `libdnn`.

For the complete interface reference 👉 [RDK S hbm_runtime Python API Documentation](https://developer.d-robotics.cc/rdk_s_doc/Algorithm_Application/python-api)

C/C++ inference interface documentation: **UCP (`hb_ucp`) Interface Documentation** 👉 [UCP Overview](https://toolchain.d-robotics.cc/guide/ucp/ucp_overview.html)

### hbm_runtime Basic Call Flow

#### Load Model

```python
import hbm_runtime

model = hbm_runtime.HB_HBMRuntime("../../model/nash-e/yolov8n_detect_nashe_640x640_nv12.hbm")
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

RDK S vision samples commonly use separated NV12 format (Y plane and UV plane as two separate inputs), unlike RDK X5's single packed NV12 input:

```python
inputs = {
    model_name: {
        input_names[0]: y_plane,    # Y plane
        input_names[1]: uv_plane,   # UV plane
    }
}
```

#### Run Inference

```python
outputs = model.run(inputs)
raw_outputs = outputs[model_name]
output_tensor = raw_outputs[output_names[0]]
```

### Model Zoo Wrapper Flow

The model classes in each sample are organized around `preprocess → infer → postprocess`, chained by `predict()`. Taking the ResNet classification sample (`samples/vision/resnet/runtime/python/classify.py`) as an example:

```python
model = ResNetClassifier(
    model_path,                # Path to the compiled model file
    target="s100",             # Board target: s100 / s100p / s600
    input_size=(224, 224),
    class_count=1000,
    top_k=5,
    labels=labels,             # Class name list
)

model.set_scheduling_params(priority=0, bpu_cores=[0])
result = model.predict("test_img.jpg")
```

`predict()` executes the following stages in order:

1. `preprocess()`: Generate model inputs (resize, BGR-to-NV12 with separated Y/UV planes)
2. `infer()`: Call `hbm_runtime` to run inference
3. `postprocess()`: Parse detection boxes, classification results, segmentation masks, or pose keypoints

## Quick Start

### Run the Ultralytics YOLOv8n Detection Sample

Run from the repository root:

```bash
# 1. Download the model (select by platform, model family, task and size)
bash samples/vision/ultralytics_yolo/model/download_model.sh \
  --platform s100 --family yolov8 --task detect --model-size n

# 2. Run inference
python3 samples/vision/ultralytics_yolo/runtime/python/main.py \
  --platform s100 \
  --family yolov8 \
  --task detect \
  --model-size n \
  --model-path samples/vision/ultralytics_yolo/model/nash-e/yolov8n_detect_nashe_640x640_nv12.hbm \
  --label-file datasets/coco/coco_classes.names \
  --test-img samples/vision/ultralytics_yolo/test_data/bus.jpg \
  --img-save-path /tmp/yolov8n-s100.jpg
```

Notes:

- `--target` is an alias of `--platform`; the inference entry validates that the board matches the target and raises an error for unknown targets
- When `--model-path` is not specified, the entry downloads the missing default model on the board; explicitly specifying `--model-path` skips the download
- Without a board, you can inspect the model manifest or preview argument resolution on the host:

```bash
python3 samples/vision/ultralytics_yolo/runtime/python/main.py --platform s100 --list-models
python3 samples/vision/ultralytics_yolo/runtime/python/main.py --platform s600 --family yolo26 --task cls --dry-run
```

### Using run.sh for One-Click Execution

Most samples provide a `run.sh` script under `runtime/python/`, and some under `runtime/cpp/`, forwarding arguments to the corresponding entry point. The following subshell examples run independently from the repository root and do not affect each other's working directory:

```bash
# Python inference (first argument is the task)
(cd samples/vision/ultralytics_yolo/runtime/python && \
  bash run.sh detect --platform s100 --family yolov8 --model-size n)

# C++ inference (builds and runs on the target board, requires the board DNN SDK;
# run from the sample root so the default test_data assets resolve; positional
# arguments are model, image and result path)
(cd samples/vision/ultralytics_yolo && \
  bash model/download_model.sh --platform s100 --family yolo26 --task detect --model-size n && \
  YOLO_TARGET=s100 bash runtime/cpp/run.sh --task detect \
  model/nash-e/yolo26n_detect_nashe_640x640_nv12.hbm \
  test_data/bus.jpg /tmp/cpp-result.jpg)
```

Notes:

- The first Python `run.sh` argument is the task (`detect` / `seg` / `pose` / `cls` / `obb`); the remaining arguments are forwarded to `main.py`
- The C++ `run.sh` performs an out-of-tree CMake build first, then executes the binary; the build target is auto-discovered from the board SDK, or pinned with `YOLO_TARGET=x5|s100|s100p|s600`
- C++ task arguments and per-task default model paths are documented in `runtime/cpp/README.md`; the S series uses `.hbm` artifacts matching the board (the S100 `nash-e` artifact above)

## Model Coverage

The samples available for the RDK S series are listed below (each sample's README provides the full variant and support matrix):

### Vision

| Category | Model | Sample Directory | Supported Platforms |
| :--- | :--- | :--- | :--- |
| Vision Multi-task | Ultralytics YOLO (YOLOv5u / YOLOv8 / YOLOv9 / YOLOv10 / YOLO11 / YOLO12 / YOLO26) | `samples/vision/ultralytics_yolo` | S100 / S100P / S600 |
| Object Detection | YOLOv5 | `samples/vision/yolov5` | S100 / S600 |
| Pedestrian Detection & Tracking | Faster R-CNN | `samples/vision/fasterrcnn` | S100 / S100P / S600 |
| Multi-Object Tracking | ByteTrack | `samples/vision/bytetrack` | S100 / S100P / S600 |
| Multi-Object Tracking | HobotMot (CPU IOU 2.0) | `samples/vision/hobot_mot` | S100 / S100P / S600 |
| Instance Segmentation | YOLOE (prompt-free) | `samples/vision/yoloe` | S100 / S100P |
| Promptable Segmentation | EfficientSAM-Tiny | `samples/vision/efficient_sam` | S100 / S100P / S600 |
| Promptable Segmentation | MobileSAM | `samples/vision/mobile_sam` | S100 / S100P / S600 |
| Image Classification | EfficientNet-Lite0~4 | `samples/vision/efficientnet` | S100 / S600 |
| Image Classification | MobileNetV1 | `samples/vision/mobilenetv1` | S100 / S100P / S600 |
| Image Classification | MobileNetV2 | `samples/vision/mobilenetv2` | S100 / S100P / S600 |
| Image Classification | MobileNetV3 | `samples/vision/mobilenetv3` | S100 / S100P / S600 |
| Image Classification | MobileNetV4 | `samples/vision/mobilenetv4` | S100 / S100P / S600 |
| Image Classification | ResNet (18 / 34 / 50 / 101 / 152) | `samples/vision/resnet` | S100 / S100P / S600 |
| Image Classification | ViT | `samples/vision/vit` | S100 |
| Video Action Classification | 3D ResNet | `samples/vision/3dresnet` | S100 |
| Semantic Segmentation | UNetMobileNet | `samples/vision/unetmobilenet` | S100 / S600 |
| Monocular Depth Estimation | Depth Anything V2 | `samples/vision/depth_anything_v2` | S100 |
| Monocular Depth Estimation | YOLO26 Depth | `samples/vision/yolo26_depth` | S100 / S100P / S600 |
| Vision Feature Encoder | DINOv2 | `samples/vision/dinov2` | S100 / S100P / S600 |
| Vision-Language Encoder | SigLIP | `samples/vision/siglip` | S100 / S100P |
| Lane Detection | LaneNet | `samples/vision/lanenet` | S100 |
| Point Cloud Part Segmentation | PointNet | `samples/vision/pointnet` | S100 |
| Text Recognition | PaddleOCR | `samples/vision/paddle_ocr` | S100 (Python) / S600 (C++) |
| Audio-Driven Talking Avatar | LiteAvatar | `samples/vision/lite_avatar` | S100 / S100P / S600 |
| End-to-End Driving Planning | DiffusionDrive | `samples/vision/diffusiondrive` | S100P / S600 |

### Speech

| Category | Model | Sample Directory | Supported Platforms |
| :--- | :--- | :--- | :--- |
| Speech Recognition | ASR (Wav2Vec2) | `samples/speech/asr` | S100 / S600 |
| Speech Recognition | Paraformer (Chinese ASR, WAV input, three-stage INT16 HBM) | `samples/speech/paraformer` | S100 |
| Keyword Spotting | KWS (MDTC) | `samples/speech/kws` | S100 |

### On-Device Text Generation (LLM, native C++)

| Category | Model | Sample Directory | Supported Platforms |
| :--- | :--- | :--- | :--- |
| Vision-Language Model | Gemma4-E2B | `samples/llm/gemma4-e2b` | S100 (user-supplied models) / S100P / S600 |
| Text Generation | MiniCPM5-2B | `samples/llm/minicpm5-2b` | S100 / S100P / S600 |

### Embodied AI / Robot Policy (VLA)

ACT and Pi0 are provided as pinned Git submodules; see `samples/vla/README.md` for their integration scope:

| Category | Model | Sample Directory |
| :--- | :--- | :--- |
| Robot Policy | ACT (Action Chunking Transformer) | `samples/vla/act` |
| Robot Policy | Pi0 | `samples/vla/pi0` |

## Shared Utilities (utils/)

The `main` branch provides the following shared Python utilities (`utils/py_utils/`):

| Utility Module | Function |
| :--- | :--- |
| `file_io` | Model download, image loading, class name loading |
| `preprocess` | BGR to NV12 (separated Y/UV planes), resize (direct/letterbox) |
| `postprocess` | NMS, YOLO box/mask/keypoint decoding, coordinate scaling |
| `visualize` | Detection box, segmentation mask, pose keypoint, classification result rendering |
| `inspect` | SoC name detection, model info printing |
| `nn_math` | Sigmoid, z-score normalization |
