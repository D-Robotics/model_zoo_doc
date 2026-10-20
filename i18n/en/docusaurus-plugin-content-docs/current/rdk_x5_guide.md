---
sidebar_position: 3
sidebar_products: "RDK-X5"
---

# 4.1.3 Usage Guide

## Getting the Code and System Requirements

RDK X5 uses the unified `samples/` directory on the `main` branch. Recommended system version: RDK OS >= 3.5.0. Python samples uniformly use the `hbm_runtime` inference interface, and select the board target with `--target x5` or `--platform x5`.

```bash
git clone https://github.com/D-Robotics/rdk_model_zoo.git
cd rdk_model_zoo
```

:::tip

`main` is the default branch — no branch switch is needed after cloning. RDK X5, S100, S100P and S600 share the same `samples/` directory; the board target is selected with command-line arguments.

:::

## Repository Directory Structure

On the `main` branch, the `samples/` directory is organized by domain and model:

```bash
rdk_model_zoo/
|-- samples/
|   |-- vision/                    # Vision model samples
|   |   |-- 3dresnet/              # Video action classification
|   |   |-- bytetrack/             # Multi-object tracking
|   |   |-- clip/                  # Image-text multimodal matching
|   |   |-- convnext/              # Image classification
|   |   |-- depth_anything_v2/     # Monocular depth estimation
|   |   |-- fasterrcnn/            # Object detection / pedestrian tracking
|   |   |-- fcos/                  # Object detection
|   |   |-- googlenet/             # Image classification
|   |   |-- hobot_mot/             # Multi-object tracking (CPU IOU 2.0)
|   |   |-- lprnet/                # License plate recognition
|   |   |-- mobilenetv1/           # Image classification
|   |   |-- mobilenetv2/           # Image classification
|   |   |-- mobilenetv3/           # Image classification
|   |   |-- mobilenetv4/           # Image classification
|   |   |-- mobileone/             # Image classification
|   |   |-- modnet/                # Image matting
|   |   |-- paddle_ocr/            # OCR text detection and recognition
|   |   |-- pp_liteseg/            # Semantic segmentation
|   |   |-- resnet/                # Image classification
|   |   |-- unet/                  # Semantic segmentation
|   |   |-- ultralytics_yolo/      # Detection, segmentation, pose, classification, OBB (YOLOv5u~YOLO26)
|   |   |-- yolo26_depth/          # Monocular depth estimation
|   |   |-- yoloe/                 # Instance segmentation (prompt-free)
|   |   |-- yolov5/                # Object detection
|   |   `-- yoloworld/             # Open-vocabulary object detection
|   |-- speech/                    # Speech model samples
|   |-- llm/                       # On-device text generation (native C++)
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
|-- conversion/            # ONNX → HBM/BIN conversion configs
|-- evaluator/             # Accuracy and performance evaluation
|-- model/                 # Model download scripts and manifests
|-- runtime/
|   |-- python/            # Python inference (main.py, cli.py, <task>.py, run.sh)
|   `-- cpp/               # C++ inference (src/main.cc, CMakeLists.txt, run.sh)
|-- tests/                 # Automated tests
`-- test_data/             # Test images and inference results
```

The Python runtime follows a `main.py + cli.py` layout: `main.py` is the thin entry point (parses arguments, builds the model, calls `predict`), `cli.py` handles argument declaration, model manifest resolution and result display, and the task modules (e.g. `detect.py`, `classify.py`) implement the full preprocess, inference and postprocess chain.

Not every sample provides both a Python and a C++ runtime: LLM samples ship a native C++ runtime only, and VLA samples (ACT / Pi0) are pinned Git submodules, so their layout differs slightly from the typical structure above — each sample's README is authoritative.

## Inference Interface

Python samples for RDK X5 uniformly use the `hbm_runtime` inference interface. For the complete interface reference, see [RDK X5 hbm_runtime Python API Documentation](https://developer.d-robotics.cc/rdk_x_doc/en/Basic_Application/multi_media_sp_dev_api/RDK_X5/pydev_multimedia_api_x5/ai-python-api?v=3.5.0&p=RDK+X5).

C++ inference interface documentation: **`hb_dnn` C/C++ Inference Interface Documentation** 👉 [Runtime Development Docs](https://developer.d-robotics.cc/oe_x5_doc/cn/oe_mapper/source/runtime.html)

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

RDK X5 vision samples commonly use packed NV12 format input. The model class's `preprocess()` handles resize, BGR-to-NV12 conversion, data packing, etc.:

```python
inputs = {
    model_name: {
        input_names[0]: input_array,
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
    target="x5",               # Board target: x5 / s100 / s100p / s600
    input_size=(224, 224),
    class_count=1000,
    top_k=5,
    labels=labels,             # Class name list
)

model.set_scheduling_params(priority=0, bpu_cores=[0])
result = model.predict("test_img.jpg")
```

`predict()` executes the following stages in order:

1. `preprocess()`: Generate model inputs
2. `infer()`: Call `hbm_runtime` to run inference
3. `postprocess()`: Parse detection boxes, classification results, segmentation masks, or pose keypoints

## Quick Start

### Run the Ultralytics YOLO11x Detection Sample

Run from the repository root:

```bash
# 1. Download the model (select by platform, model family, task and size)
bash samples/vision/ultralytics_yolo/model/download_model.sh \
  --platform x5 --family yolo11 --task detect --model-size x

# 2. Run inference
python3 samples/vision/ultralytics_yolo/runtime/python/main.py \
  --platform x5 \
  --family yolo11 \
  --task detect \
  --model-size x \
  --test-img samples/vision/ultralytics_yolo/test_data/bus.jpg \
  --img-save-path samples/vision/ultralytics_yolo/test_data/inference_yolo11x.jpg
```

Notes:

- `--target` is an alias of `--platform`; the inference entry validates that the board matches the target and raises an error for unknown targets
- When `--model-path` is not specified, the entry downloads the missing default model on the board; explicitly specifying `--model-path` skips the download
- Without a board, you can run `--list-models` on the host to inspect the model manifest and `--dry-run` to preview argument resolution

### Using run.sh for One-Click Execution

Most samples provide a `run.sh` script under `runtime/python/`, and some under `runtime/cpp/`, forwarding arguments to the corresponding entry point. The following subshell examples run independently from the repository root and do not affect each other's working directory:

```bash
# Python inference (first argument is the task; the platform is auto-detected when omitted)
(cd samples/vision/ultralytics_yolo/runtime/python && \
  bash run.sh detect --platform x5 --family yolo11 --model-size x)

# C++ inference (builds and runs on the target board, requires the board DNN SDK;
# run from the sample root so the default test_data assets resolve; positional
# arguments are model, image and result path)
(cd samples/vision/ultralytics_yolo && \
  bash runtime/cpp/run.sh --task detect \
  model/yolo26n_detect_bayese_640x640_nv12.bin \
  test_data/bus.jpg /tmp/cpp-result.jpg)
```

Notes:

- The first Python `run.sh` argument is the task (`detect` / `seg` / `pose` / `cls` / `obb`); the remaining arguments are forwarded to `main.py`
- The C++ `run.sh` performs an out-of-tree CMake build first, then executes the binary; the build target is auto-discovered from the board SDK, or pinned with `YOLO_TARGET=x5|s100|s100p|s600`
- C++ task arguments and per-task default model paths are documented in `runtime/cpp/README.md`; the model in the example above must be prepared first (`bash samples/vision/ultralytics_yolo/model/download_model.sh --platform x5 --family yolo26 --task detect --model-size n`)

## Model Coverage

The samples available for RDK X5 are listed below (each sample's README provides the full variant and support matrix):

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
| MobileNetV3 | `samples/vision/mobilenetv3` |
| MobileNetV4 | `samples/vision/mobilenetv4` |
| MobileOne | `samples/vision/mobileone` |
| RepGhost | `samples/vision/repghost` |
| RepVGG | `samples/vision/repvgg` |
| RepViT | `samples/vision/repvit` |
| ResNet | `samples/vision/resnet` |
| ResNeXt | `samples/vision/resnext` |
| VargConvNet | `samples/vision/vargconvnet` |

### Object Detection

| Model | Sample Directory |
| :--- | :--- |
| FCOS | `samples/vision/fcos` |
| Faster R-CNN (pedestrian detection and tracking) | `samples/vision/fasterrcnn` |
| YOLOv5 | `samples/vision/yolov5` |
| Ultralytics YOLO (YOLOv5u / YOLOv8 / YOLOv9 / YOLOv10 / YOLO11 / YOLO12 / YOLO13 / YOLO26) | `samples/vision/ultralytics_yolo` |

### Multi-Object Tracking

| Model | Sample Directory |
| :--- | :--- |
| ByteTrack | `samples/vision/bytetrack` |
| HobotMot (CPU IOU 2.0) | `samples/vision/hobot_mot` |

### Instance Segmentation / Matting

| Model | Sample Directory |
| :--- | :--- |
| YOLOE (prompt-free) | `samples/vision/yoloe` |
| MODNet | `samples/vision/modnet` |

### Promptable Segmentation

| Model | Sample Directory |
| :--- | :--- |
| EfficientSAM-Tiny | `samples/vision/efficient_sam` |
| MobileSAM | `samples/vision/mobile_sam` |

### Semantic Segmentation

| Model | Sample Directory |
| :--- | :--- |
| PP-LiteSeg | `samples/vision/pp_liteseg` |
| UNet (ResNet family) | `samples/vision/unet` |

### Monocular Depth Estimation

| Model | Sample Directory |
| :--- | :--- |
| YOLO26 Depth | `samples/vision/yolo26_depth` |

### OCR / Recognition

| Model | Sample Directory |
| :--- | :--- |
| PaddleOCR | `samples/vision/paddle_ocr` |
| LPRNet | `samples/vision/lprnet` |

### Multimodal

| Model | Sample Directory |
| :--- | :--- |
| CLIP | `samples/vision/clip` |
| YOLOWorld | `samples/vision/yoloworld` |

### Robotics

| Model | Sample Directory |
| :--- | :--- |
| HIMLoco (Unitree Go2 locomotion policy) | `samples/robotics/himloco` |

## rdk_x5_legacy Branch

To consult historical RDK X5 demos, use the `rdk_x5_legacy` branch:

```bash
git clone https://github.com/D-Robotics/rdk_model_zoo.git
cd rdk_model_zoo
git checkout rdk_x5_legacy
```

After switching to `rdk_x5_legacy`, enter the target demo directory, read its README first, then follow the commands in that README.

For demos that use `bpu_infer_lib_x5`, install with:

```bash
wget -nc https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_x5/bpu_infer_lib_x5-1.0.3-py3-none-any.whl
pip install bpu_infer_lib_x5-1.0.3-py3-none-any.whl
```

Demos that use `hobot_dnn.pyeasy_dnn` use the board-builtin interface directly.

:::caution

`rdk_x5_legacy` is a legacy archive branch and is no longer actively maintained. New projects should use the corresponding sample in the `samples/` directory on the `main` branch.

`bpu_infer_lib_x5` and `hobot_dnn.pyeasy_dnn` **have poor support for featuremap input models**. If you need to use featuremap input models, please use the `hbm_runtime` inference interface on the `main` branch.

:::

## Shared Utilities (utils/)

The `main` branch provides the following shared Python utilities (`utils/py_utils/`):

| Utility Module | Function |
| :--- | :--- |
| `file_io` | Model download, image loading, class name loading |
| `preprocess` | BGR to NV12, resize (direct/letterbox), NV12 splitting |
| `postprocess` | NMS, YOLO box/mask/keypoint/OBB decoding, coordinate scaling |
| `visualize` | Detection box, segmentation mask, rotated box, pose keypoint, classification result rendering |
| `inspect` | SoC name detection, model info printing |
| `nn_math` | Sigmoid, z-score normalization |
