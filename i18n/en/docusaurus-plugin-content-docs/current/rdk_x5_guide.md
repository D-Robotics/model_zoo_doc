---
sidebar_position: 3
sidebar_products: "RDK-X5"
---

# 4.1.3 Usage Guide

## Branch and System Requirements

Starting from **v2.0.0**, RDK X5 and RDK S series are maintained together on the default **`main`** branch. A single `samples/` directory targets all boards via `--target x5` or `--platform x5` (default `auto` detects board identity). Recommended OS: **RDK OS >= 3.5.0**. Python samples uniformly use the `hbm_runtime` inference interface.

```bash
git clone https://github.com/D-Robotics/rdk_model_zoo.git
cd rdk_model_zoo
```

:::tip

- **`main`** is the stable release delivery branch and is recommended for all new work. Browse all published X5 models and measured benchmarks in the **[Web Model Catalog](https://d-robotics.github.io/rdk_model_zoo/)**.
- Legacy per-board branch `rdk_x5` and early demo branch `rdk_x5_legacy` remain archived for historical compatibility.

:::

## Repository Directory Structure

The unified `main` branch organizes RDK X5 samples by domain and model:

```text
rdk_model_zoo/
├── samples/
│   ├── vision/                   # Computer vision & multimodal samples (unified X5 / S)
│   │   ├── bytetrack/            # Multi-object tracking
│   │   ├── clip/                 # Image-text multimodal matching
│   │   ├── convnext/             # Image classification
│   │   ├── edgenext/             # Image classification
│   │   ├── efficient_sam/        # Promptable segmentation
│   │   ├── efficientformer/      # Image classification
│   │   ├── efficientformerv2/    # Image classification
│   │   ├── efficientnet/         # Image classification
│   │   ├── efficientvit/         # Image classification
│   │   ├── fasterrcnn/           # Object detection & person tracking
│   │   ├── fasternet/            # Image classification
│   │   ├── fastvit/              # Image classification
│   │   ├── fcos/                 # Object detection
│   │   ├── googlenet/            # Image classification
│   │   ├── hgnetv2/              # Image classification
│   │   ├── hobot_mot/            # Multi-object tracking (IOU 2.0)
│   │   ├── lprnet/               # License plate recognition
│   │   ├── mobile_sam/           # Promptable segmentation
│   │   ├── mobilenetv1/          # Image classification
│   │   ├── mobilenetv2/          # Image classification
│   │   ├── mobilenetv4/          # Image classification
│   │   ├── mobileone/            # Image classification
│   │   ├── modnet/               # Image matting
│   │   ├── osnet/                # Person re-identification
│   │   ├── paddle_ocr/           # OCR text detection and recognition
│   │   ├── pp_liteseg/           # Semantic segmentation
│   │   ├── repghost/             # Image classification
│   │   ├── repvgg/               # Image classification
│   │   ├── repvit/               # Image classification
│   │   ├── resnet/               # Image classification (ResNet-18/34/50/101/152)
│   │   ├── resnext/              # Image classification
│   │   ├── ultralytics_yolo/     # Detect / Seg / Pose / Cls / OBB (YOLOv5u–YOLO26)
│   │   ├── unet/                 # Semantic segmentation (UNet ResNet family)
│   │   ├── vargconvnet/          # Image classification
│   │   ├── yolo26_depth/         # Monocular depth estimation
│   │   ├── yoloe/                # Prompt-free instance segmentation
│   │   ├── yolov5/               # Object detection
│   │   └── yoloworld/            # Open-vocabulary object detection
│   └── robotics/
│       └── himloco/              # Unitree Go2 legged locomotion policy
├── datasets/                     # Sample datasets and label files
├── docs/                         # Standards, release manifests (docs/release/x5/) & guides
├── skills/                       # RDK Model Zoo Agent Skills pack
└── utils/                        # Shared Python (py_utils/) and C++ (c_utils/) utilities
```

## Individual Sample Structure

Each standard sample contains the following directories:

```text
sample_name/
├── README.md              # English documentation
├── README_cn.md           # Chinese documentation
├── conversion/            # ONNX export & OpenExplorer quantization recipes
├── evaluator/             # Dataset accuracy and performance evaluation
├── model/                 # Model manifest docs & download scripts (.bin binaries not committed)
├── runtime/
│   ├── python/            # Python inference (main.py, cli.py, <task>.py, run.sh)
│   └── cpp/               # C++ inference (CMakeLists.txt, src/, run.sh)
├── test_data/             # Sample inputs and reference outputs
└── tests/                 # Host unit tests and numerical regression checks
```

## Inference Interface

RDK X5 Python samples uniformly use the `hbm_runtime` inference interface. For full API details, see [RDK X5 hbm_runtime Python API Documentation](https://developer.d-robotics.cc/rdk_x_doc/en/Basic_Application/multi_media_sp_dev_api/RDK_X5/pydev_multimedia_api_x5/ai-python-api?v=3.5.0&p=RDK+X5).

C/C++ inference interface documentation: **`hb_dnn` C/C++ Inference Interface Documentation** 👉 [Runtime Development Docs](https://developer.d-robotics.cc/oe_x5_doc/cn/oe_mapper/source/runtime.html)

### hbm_runtime Basic Call Flow

#### Load Model

```python
import hbm_runtime

model = hbm_runtime.HB_HBMRuntime("../../model/yolo11x_detect_bayese_640x640_nv12.bin")
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

RDK X5 vision samples commonly use packed NV12 input (a single concatenated input tensor). The model class's `preprocess()` handles resize, BGR-to-NV12 conversion, and buffer packing:

```python
inputs = {
    model_name: {
        input_names[0]: packed_nv12,
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

Unified Python samples follow [`docs/sample-standards/runtime-code.md`](https://github.com/D-Robotics/rdk_model_zoo/blob/main/docs/sample-standards/runtime-code.md), separating `main.py`, `cli.py`, and a task-named model file (such as `classify.py`, `detect.py`, or `segment.py`). Each named model class exposes a clean three-stage `preprocess → infer → postprocess` chain wired by `predict()`:

```python
class ResNetClassifier:
    def predict(self, image):
        inputs = self.preprocess(image)
        outputs = self.infer(inputs)
        return self.postprocess(outputs)
```

For example, `samples/vision/resnet/runtime/python/main.py` parses arguments, validates target board identity, instantiates the model, and calls `predict()`:

```python
selection = resolve_selection(args.target, variant=args.variant)
model = ResNetClassifier(selection.model_path, target=selection.target, ...)
model.set_scheduling_params(priority=args.priority, bpu_cores=args.bpu_cores)
result = model.predict(args.test_img)
```

## Quick Start

### Run the Ultralytics YOLO11x Detection Sample

Run in two steps from the repository checkout:

```bash
# 1. Download the precompiled BPU model
cd samples/vision/ultralytics_yolo/model
bash download_model.sh --platform x5 --family yolo11 --task detect --model-size x

# 2. Run on-board inference
cd ../runtime/python
python3 main.py \
  --task detect \
  --platform x5 \
  --family yolo11 \
  --model-size x \
  --test-img ../../test_data/bus.jpg \
  --img-save-path ../../test_data/inference_yolo11x.jpg
```

### Host Preview and Manifest Listing

Most samples support `--list-models` and `--dry-run` on either a development host or board without loading the board SDK or running inference:

```bash
# List published Ultralytics YOLO models for RDK X5
python3 samples/vision/ultralytics_yolo/runtime/python/main.py --platform x5 --list-models

# Preview target resolution and tensor contract without loading a model
python3 samples/vision/resnet/runtime/python/main.py --target x5 --dry-run
```

### Using run.sh and C++ Entry Points

Each sample provides a `run.sh` launcher under `runtime/python/` and `runtime/cpp/` that resolves the entry point and forwards arguments and exit codes verbatim.

:::note

Under the unified runtime contract, `run.sh` does not automatically install dependencies or download models. Prepare the matching model first using the sample's `model/README.md` instructions, then invoke `main.py` or `run.sh`.

:::

```bash
# 1. Download a published model (ResNet-18 example)
bash samples/vision/resnet/model/download.sh x5 18

# 2. Run Python inference
bash samples/vision/resnet/runtime/python/run.sh --target x5 --variant 18
```

## Model Coverage (RDK X5)

The tables below list the main **RDK X5** samples in the unified `main` branch. See each sample's `README.md` or the [Web Model Catalog](https://d-robotics.github.io/rdk_model_zoo/) for variants, checksums, and measured metrics.

### Image Classification

| Model | Sample Directory |
| :--- | :--- |
| ConvNeXt | `samples/vision/convnext` |
| EdgeNeXt | `samples/vision/edgenext` |
| EfficientFormer | `samples/vision/efficientformer` |
| EfficientFormerV2 | `samples/vision/efficientformerv2` |
| EfficientNet | `samples/vision/efficientnet` |
| EfficientViT | `samples/vision/efficientvit` |
| FasterNet | `samples/vision/fasternet` |
| FastViT | `samples/vision/fastvit` |
| GoogLeNet | `samples/vision/googlenet` |
| HGNetV2 | `samples/vision/hgnetv2` |
| MobileNetV1 | `samples/vision/mobilenetv1` |
| MobileNetV2 | `samples/vision/mobilenetv2` |
| MobileNetV4 | `samples/vision/mobilenetv4` |
| MobileOne | `samples/vision/mobileone` |
| RepGhost | `samples/vision/repghost` |
| RepVGG | `samples/vision/repvgg` |
| RepViT | `samples/vision/repvit` |
| ResNet (18 / 34 / 50 / 101 / 152) | `samples/vision/resnet` |
| ResNeXt | `samples/vision/resnext` |
| VargConvNet | `samples/vision/vargconvnet` |

### Object Detection & Multi-Task Vision

| Model | Tasks | Sample Directory |
| :--- | :--- | :--- |
| Ultralytics YOLO (`YOLOv5u–YOLO26`) | Detect / Seg / Pose / Cls / OBB | `samples/vision/ultralytics_yolo` |
| YOLOv5 | Object detection | `samples/vision/yolov5` |
| FCOS | Object detection | `samples/vision/fcos` |
| Faster R-CNN MobileNetV3-Large | Object detection / Person tracking | `samples/vision/fasterrcnn` |

### Multi-Object Tracking & Re-Identification

| Model | Task | Sample Directory |
| :--- | :--- | :--- |
| ByteTrack | Multi-object tracking | `samples/vision/bytetrack` |
| HobotMot (IOU 2.0) | Multi-object tracking | `samples/vision/hobot_mot` |
| OSNet x1.0 | Person re-identification | `samples/vision/osnet` |

### Instance, Promptable, Semantic Segmentation & Matting

| Model | Task | Sample Directory |
| :--- | :--- | :--- |
| YOLOE | Prompt-free instance segmentation | `samples/vision/yoloe` |
| MODNet | Image matting | `samples/vision/modnet` |
| EfficientSAM-Tiny | Promptable segmentation | `samples/vision/efficient_sam` |
| MobileSAM | Promptable segmentation | `samples/vision/mobile_sam` |
| PP-LiteSeg | Semantic segmentation | `samples/vision/pp_liteseg` |
| UNet ResNet Family | Semantic segmentation | `samples/vision/unet` |

### Monocular Depth, OCR & Multimodal

| Model | Task | Sample Directory |
| :--- | :--- | :--- |
| YOLO26 Depth | Monocular depth estimation | `samples/vision/yolo26_depth` |
| PaddleOCR | OCR text detection and recognition | `samples/vision/paddle_ocr` |
| LPRNet | License plate recognition | `samples/vision/lprnet` |
| CLIP | Image-text multimodal matching | `samples/vision/clip` |
| YOLOWorld | Open-vocabulary object detection | `samples/vision/yoloworld` |

### Robotics Locomotion

| Model | Task | Sample Directory |
| :--- | :--- | :--- |
| HIMLoco (Unitree Go2) | Legged locomotion policy | `samples/robotics/himloco` |

## Legacy Branch (rdk_x5_legacy)

To inspect or run early RDK X5 legacy demos, switch to the archived `rdk_x5_legacy` branch:

```bash
git clone https://github.com/D-Robotics/rdk_model_zoo.git
cd rdk_model_zoo
git checkout rdk_x5_legacy
```

After switching to `rdk_x5_legacy`, enter the target demo directory, read its README first, then follow its instructions. For demos that use `bpu_infer_lib_x5`, install with:

```bash
wget -nc https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_x5/bpu_infer_lib_x5-1.0.3-py3-none-any.whl
pip install bpu_infer_lib_x5-1.0.3-py3-none-any.whl
```

Demos that use `hobot_dnn.pyeasy_dnn` use the board-builtin interface directly.

:::caution

`rdk_x5_legacy` is a legacy archive branch and is no longer actively maintained. New projects should use the `main` branch.

`bpu_infer_lib_x5` and `hobot_dnn.pyeasy_dnn` **have poor support for featuremap input models**. If you need to use featuremap input models, please use the `hbm_runtime` inference interface on the `main` branch.

:::

## Shared Utilities (utils/py_utils/)

The unified `main` branch provides shared Python runtime and utility modules under `utils/py_utils/`:

| Utility Module | Function |
| :--- | :--- |
| `runtime`, `model_runner`, `single_array_runner` | Load BPU models via `hbm_runtime`, classification & named-array tensor bindings |
| `platforms`, `platform_profile` | Board identity resolution (`auto`/`x5`/`s100`/`s100p`/`s600`) and platform checks |
| `assets`, `cls_binding`, `sam_binding` | Read `docs/release/{x5,s}/models.yaml` manifests and tensor contracts |
| `image`, `file_io`, `preprocess`, `tensor_io` | Image/file loading, resize (direct/letterbox), and NV12 conversion |
| `labels`, `classification` | Label loading/validation and Top-K classification helpers |
| `runtime_meta`, `quantization`, `nn_math`, `postprocess` | Metadata parsing, dequantization, NMS, and YOLO detect/seg/pose/OBB decoding |
| `sam_runner`, `sam_stages`, `yoloe26_decode` | SAM encoder/decoder runners and YOLOE26 prompt-free decoding |
| `visualize`, `inspect` | Rendering boxes/masks/keypoints/OBBs and inspecting model tensor info |
