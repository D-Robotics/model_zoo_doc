---
sidebar_position: 4
sidebar_products: "RDK S100, RDK S600"
---

# 4.1.4 使用说明

## 获取代码与系统要求

RDK S 系列（S100 / S100P / S600）使用 `main` 分支统一的 `samples/` 目录。推荐系统版本 RDK OS >= 4.0.5。Python sample 统一使用 `hbm_runtime` 推理接口，并通过 `--target s100` / `--target s100p` / `--target s600` 或对应的 `--platform` 参数选择板卡目标。

```bash
git clone https://github.com/D-Robotics/rdk_model_zoo.git
cd rdk_model_zoo
```

:::tip

`main` 是默认分支，克隆后无需切换分支。RDK S 系列与 RDK X5 共用同一套 `samples/` 目录，目标板卡由命令行参数选择。

RDK S 系列的历史 demo 保留在 [RDK Model Zoo S](https://github.com/d-Robotics/rdk_model_zoo_s) 仓库。

:::

## 仓库目录结构

`main` 分支按领域和模型组织 `samples/` 目录：

```bash
rdk_model_zoo/
|-- samples/
|   |-- vision/                    # 视觉模型示例
|   |   |-- 3dresnet/              # 视频动作分类
|   |   |-- bytetrack/             # 多目标跟踪
|   |   |-- depth_anything_v2/     # 单目深度估计
|   |   |-- diffusiondrive/        # 端到端驾驶规划
|   |   |-- dinov2/                # 视觉特征编码器
|   |   |-- efficient_sam/         # 提示词分割
|   |   |-- efficientnet/          # 图像分类
|   |   |-- fasterrcnn/            # 行人检测与跟踪
|   |   |-- hobot_mot/             # 多目标跟踪（CPU IOU 2.0）
|   |   |-- lanenet/               # 车道线检测
|   |   |-- lite_avatar/           # 音频驱动数字人
|   |   |-- mobile_sam/            # 提示词分割
|   |   |-- mobilenetv1/           # 图像分类
|   |   |-- mobilenetv2/           # 图像分类
|   |   |-- mobilenetv3/           # 图像分类
|   |   |-- mobilenetv4/           # 图像分类
|   |   |-- paddle_ocr/            # OCR 文字检测与识别
|   |   |-- pointnet/              # 点云部件分割
|   |   |-- resnet/                # 图像分类（18/34/50/101/152）
|   |   |-- siglip/                # 视觉-语言编码器
|   |   |-- ultralytics_yolo/      # 检测、分割、姿态、分类、OBB（YOLOv5u~YOLO26）
|   |   |-- unetmobilenet/         # 语义分割
|   |   |-- vit/                   # 图像分类
|   |   |-- yolo26_depth/          # 单目深度估计
|   |   |-- yoloe/                 # 实例分割（prompt-free）
|   |   `-- yolov5/                # 目标检测
|   |-- speech/                    # 语音模型示例
|   |   |-- asr/                   # 语音识别
|   |   |-- kws/                   # 关键词检测
|   |   `-- paraformer/            # Paraformer 语音识别
|   |-- llm/                       # 端侧文本生成（原生 C++）
|   |   |-- gemma4-e2b/            # VLM 对话（原生 C++）
|   |   `-- minicpm5-2b/           # 文本生成（原生 C++）
|   |-- robotics/                  # 机器人策略
|   `-- vla/                       # 具身智能 / 机器人策略（ACT / Pi0）
|-- datasets/                      # 数据集与下载脚本
|-- docs/                          # 项目规范、平台清单与参考文档
`-- utils/                         # 公共 Python / C++ 工具
```

## 单个 Sample 结构

典型 sample 目录结构（以 `samples/vision/resnet` 为例）：

```bash
sample_name/
|-- README.md              # 英文说明文档
|-- README_cn.md           # 中文说明文档
|-- conversion/            # ONNX → HBM 转换配置
|-- evaluator/             # 精度与性能评测
|-- model/                 # 模型下载脚本与清单
|-- runtime/
|   |-- python/            # Python 推理（main.py, cli.py, <task>.py, run.sh）
|   `-- cpp/               # C++ 推理（src/main.cc, CMakeLists.txt, run.sh）
|-- tests/                 # 自动化测试
`-- test_data/             # 测试图片与推理结果
```

Python runtime 采用 `main.py + cli.py` 布局：`main.py` 是精简入口（解析参数、构建模型、调用 `predict`），`cli.py` 负责参数声明、模型清单解析与结果展示，各任务模块实现完整的预处理、推理和后处理流程。

并非所有 sample 都同时提供 Python 和 C++ runtime：LLM sample 仅提供原生 C++ runtime，VLA sample（ACT / Pi0）以固定 commit 的 Git 子模块形式提供，目录结构与上述典型布局略有差异，以各 sample README 为准。

## 推理接口

RDK S 系列的 Python sample 统一使用 `hbm_runtime` 推理接口，与 RDK X5 的 `hbm_runtime` 接口名称一致，底层依赖不同：RDK S 系列基于 `libhbucp`，RDK X5 基于 `libdnn`。

完整接口参考 👉 [RDK S hbm_runtime Python API 文档](https://developer.d-robotics.cc/rdk_s_doc/Algorithm_Application/python-api)

C/C++ 推理接口文档：**UCP（`hb_ucp`）接口文档** 👉 [UCP Overview](https://toolchain.d-robotics.cc/guide/ucp/ucp_overview.html)

### hbm_runtime 基础调用流程

#### 加载模型

```python
import hbm_runtime

model = hbm_runtime.HB_HBMRuntime("../../model/nash-e/yolov8n_detect_nashe_640x640_nv12.hbm")
model_name = model.model_names[0]
input_names = model.input_names[model_name]
output_names = model.output_names[model_name]
input_shapes = model.input_shapes[model_name]
```

#### 配置调度参数

`hbm_runtime` 支持指定推理优先级和 BPU 核心：

```python
model.set_scheduling_params(
    priority={model_name: 0},
    bpu_cores={model_name: [0]},
)
```

命令行参数对应：

```bash
--priority 0 --bpu-cores 0
```

#### 准备输入

RDK S 视觉 sample 常见输入为分离的 NV12 格式（Y 平面和 UV 平面分别作为两个输入），与 RDK X5 的 packed NV12 单输入不同：

```python
inputs = {
    model_name: {
        input_names[0]: y_plane,    # Y 平面
        input_names[1]: uv_plane,   # UV 平面
    }
}
```

#### 执行推理

```python
outputs = model.run(inputs)
raw_outputs = outputs[model_name]
output_tensor = raw_outputs[output_names[0]]
```

### Model Zoo wrapper 流程

Sample 中的模型类按 `preprocess → infer → postprocess` 组织，并由 `predict()` 串联。以 ResNet 分类 sample（`samples/vision/resnet/runtime/python/classify.py`）为例：

```python
model = ResNetClassifier(
    model_path,                # 编译后的模型文件路径
    target="s100",             # 板卡目标：s100 / s100p / s600
    input_size=(224, 224),
    class_count=1000,
    top_k=5,
    labels=labels,             # 类别名表
)

model.set_scheduling_params(priority=0, bpu_cores=[0])
result = model.predict("test_img.jpg")
```

`predict()` 内部按以下顺序执行：

1. `preprocess()`：生成模型输入（resize、BGR 转 NV12 并分离 Y/UV 平面）
2. `infer()`：调用 `hbm_runtime` 执行推理
3. `postprocess()`：解析检测框、分类结果、分割 mask 或姿态点

## 快速上手

### 运行 Ultralytics YOLOv8n 检测 sample

在仓库根目录执行：

```bash
# 1. 下载模型（按平台、模型族、任务和规模选择）
bash samples/vision/ultralytics_yolo/model/download_model.sh \
  --platform s100 --family yolov8 --task detect --model-size n

# 2. 运行推理
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

说明：

- `--target` 与 `--platform` 等价；推理入口会校验板卡与目标一致，未知目标会直接报错
- 不指定 `--model-path` 时，入口在板端自动下载缺失的默认模型；显式指定 `--model-path` 时不会触发下载
- 无板卡时可在主机上查看模型清单或预演参数解析：

```bash
python3 samples/vision/ultralytics_yolo/runtime/python/main.py --platform s100 --list-models
python3 samples/vision/ultralytics_yolo/runtime/python/main.py --platform s600 --family yolo26 --task cls --dry-run
```

### 使用 run.sh 一键运行

多数 sample 在 `runtime/python/` 目录、部分 sample 在 `runtime/cpp/` 目录提供 `run.sh` 脚本，转发参数到对应入口。以下子 shell 示例均在仓库根目录独立执行，互不影响当前目录：

```bash
# Python 推理（首个参数为任务）
(cd samples/vision/ultralytics_yolo/runtime/python && \
  bash run.sh detect --platform s100 --family yolov8 --model-size n)

# C++ 推理（在目标板上构建并运行，需板端 DNN SDK；
# 需从 sample 根目录运行以解析默认 test_data 资产，按位置传入模型、图片和结果路径）
(cd samples/vision/ultralytics_yolo && \
  bash model/download_model.sh --platform s100 --family yolo26 --task detect --model-size n && \
  YOLO_TARGET=s100 bash runtime/cpp/run.sh --task detect \
  model/nash-e/yolo26n_detect_nashe_640x640_nv12.hbm \
  test_data/bus.jpg /tmp/cpp-result.jpg)
```

说明：

- Python `run.sh` 的首个参数为任务（`detect` / `seg` / `pose` / `cls` / `obb`），其余参数转发给 `main.py`
- C++ `run.sh` 先用 CMake 完成 out-of-tree 构建，再运行可执行文件；构建目标默认自动探测板端 SDK，也可用 `YOLO_TARGET=x5|s100|s100p|s600` 显式指定
- C++ 各任务的参数与默认模型路径见 `runtime/cpp/README.md`；S 系列使用与板卡配套的 `.hbm` 模型（如上例的 S100 `nash-e` 产物）

## 模型支持范围

RDK S 系列 sample 如下（各 sample README 提供完整的变体与支持矩阵）：

### 视觉（Vision）

| 类别 | 模型 | Sample 目录 | 支持平台 |
| :--- | :--- | :--- | :--- |
| 视觉多任务 | Ultralytics YOLO（YOLOv5u / YOLOv8 / YOLOv9 / YOLOv10 / YOLO11 / YOLO12 / YOLO26） | `samples/vision/ultralytics_yolo` | S100 / S100P / S600 |
| 目标检测 | YOLOv5 | `samples/vision/yolov5` | S100 / S600 |
| 行人检测与跟踪 | Faster R-CNN | `samples/vision/fasterrcnn` | S100 / S100P / S600 |
| 多目标跟踪 | ByteTrack | `samples/vision/bytetrack` | S100 / S100P / S600 |
| 多目标跟踪 | HobotMot（CPU IOU 2.0） | `samples/vision/hobot_mot` | S100 / S100P / S600 |
| 实例分割 | YOLOE（prompt-free） | `samples/vision/yoloe` | S100 / S100P |
| 提示词分割 | EfficientSAM-Tiny | `samples/vision/efficient_sam` | S100 / S100P / S600 |
| 提示词分割 | MobileSAM | `samples/vision/mobile_sam` | S100 / S100P / S600 |
| 图像分类 | EfficientNet-Lite0~4 | `samples/vision/efficientnet` | S100 / S600 |
| 图像分类 | MobileNetV1 | `samples/vision/mobilenetv1` | S100 / S100P / S600 |
| 图像分类 | MobileNetV2 | `samples/vision/mobilenetv2` | S100 / S100P / S600 |
| 图像分类 | MobileNetV3 | `samples/vision/mobilenetv3` | S100 / S100P / S600 |
| 图像分类 | MobileNetV4 | `samples/vision/mobilenetv4` | S100 / S100P / S600 |
| 图像分类 | ResNet（18 / 34 / 50 / 101 / 152） | `samples/vision/resnet` | S100 / S100P / S600 |
| 图像分类 | ViT | `samples/vision/vit` | S100 |
| 视频动作分类 | 3D ResNet | `samples/vision/3dresnet` | S100 |
| 语义分割 | UNetMobileNet | `samples/vision/unetmobilenet` | S100 / S600 |
| 单目深度估计 | Depth Anything V2 | `samples/vision/depth_anything_v2` | S100 |
| 单目深度估计 | YOLO26 Depth | `samples/vision/yolo26_depth` | S100 / S100P / S600 |
| 视觉特征编码器 | DINOv2 | `samples/vision/dinov2` | S100 / S100P / S600 |
| 视觉-语言编码器 | SigLIP | `samples/vision/siglip` | S100 / S100P |
| 车道线检测 | LaneNet | `samples/vision/lanenet` | S100 |
| 点云部件分割 | PointNet | `samples/vision/pointnet` | S100 |
| 文字识别 | PaddleOCR | `samples/vision/paddle_ocr` | S100（Python）/ S600（C++） |
| 音频驱动数字人 | LiteAvatar | `samples/vision/lite_avatar` | S100 / S100P / S600 |
| 端到端驾驶规划 | DiffusionDrive | `samples/vision/diffusiondrive` | S100P / S600 |

### 语音（Speech）

| 类别 | 模型 | Sample 目录 | 支持平台 |
| :--- | :--- | :--- | :--- |
| 语音识别 | ASR（Wav2Vec2） | `samples/speech/asr` | S100 / S600 |
| 语音识别 | Paraformer（中文 ASR，WAV 输入，三段 INT16 HBM） | `samples/speech/paraformer` | S100 |
| 关键词检测 | KWS（MDTC） | `samples/speech/kws` | S100 |

### 端侧文本生成（LLM，原生 C++）

| 类别 | 模型 | Sample 目录 | 支持平台 |
| :--- | :--- | :--- | :--- |
| 视觉-语言模型 | Gemma4-E2B | `samples/llm/gemma4-e2b` | S100（用户自备模型）/ S100P / S600 |
| 文本生成 | MiniCPM5-2B | `samples/llm/minicpm5-2b` | S100 / S100P / S600 |

### 具身智能 / 机器人策略（VLA）

ACT 与 Pi0 以固定 commit 的 Git 子模块形式提供，集成范围参见 `samples/vla/README.md`：

| 类别 | 模型 | Sample 目录 |
| :--- | :--- | :--- |
| 动作策略 | ACT（Action Chunking Transformer） | `samples/vla/act` |
| 动作策略 | Pi0 | `samples/vla/pi0` |

## 共享工具（utils/）

`main` 分支提供以下共享 Python 工具（`utils/py_utils/`）：

| 工具模块 | 功能 |
| :--- | :--- |
| `file_io` | 模型下载、图片加载、类别名加载 |
| `preprocess` | BGR 转 NV12（分离 Y/UV 平面）、resize（direct/letterbox） |
| `postprocess` | NMS、YOLO 检测框/分割/姿态解码、坐标缩放 |
| `visualize` | 检测框、分割 mask、姿态点、分类结果绘制 |
| `inspect` | SoC 名称检测、模型信息打印 |
| `nn_math` | sigmoid、z-score 归一化 |
