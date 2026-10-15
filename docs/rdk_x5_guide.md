---
sidebar_position: 3
sidebar_products: "RDK-X5"
---

# 4.1.3 使用说明

## 获取代码与系统要求

RDK X5 使用 `main` 分支统一的 `samples/` 目录。推荐系统版本 RDK OS >= 3.5.0。Python sample 统一使用 `hbm_runtime` 推理接口，并通过 `--target x5` 或 `--platform x5` 选择板卡目标。

```bash
git clone https://github.com/D-Robotics/rdk_model_zoo.git
cd rdk_model_zoo
```

:::tip

`main` 是默认分支，克隆后无需切换分支。X5、S100、S100P、S600 共用同一套 `samples/` 目录，目标板卡由命令行参数选择。

:::

## 仓库目录结构

`main` 分支按领域和模型组织 `samples/` 目录：

```bash
rdk_model_zoo/
|-- samples/
|   |-- vision/                    # 视觉模型示例
|   |   |-- 3dresnet/              # 视频动作分类
|   |   |-- bytetrack/             # 多目标跟踪
|   |   |-- clip/                  # 图文多模态匹配
|   |   |-- convnext/              # 图像分类
|   |   |-- depth_anything_v2/     # 单目深度估计
|   |   |-- fasterrcnn/            # 目标检测 / 行人跟踪
|   |   |-- fcos/                  # 目标检测
|   |   |-- googlenet/             # 图像分类
|   |   |-- hobot_mot/             # 多目标跟踪（CPU IOU 2.0）
|   |   |-- lprnet/                # 车牌识别
|   |   |-- mobilenetv1/           # 图像分类
|   |   |-- mobilenetv2/           # 图像分类
|   |   |-- mobilenetv3/           # 图像分类
|   |   |-- mobilenetv4/           # 图像分类
|   |   |-- mobileone/             # 图像分类
|   |   |-- modnet/                # 图像抠图
|   |   |-- paddle_ocr/            # OCR 文字检测与识别
|   |   |-- pp_liteseg/            # 语义分割
|   |   |-- resnet/                # 图像分类
|   |   |-- unet/                  # 语义分割
|   |   |-- ultralytics_yolo/      # 检测、分割、姿态、分类、OBB（YOLOv5u~YOLO26）
|   |   |-- yolo26_depth/          # 单目深度估计
|   |   |-- yoloe/                 # 实例分割（prompt-free）
|   |   |-- yolov5/                # 目标检测
|   |   `-- yoloworld/             # 开放词表目标检测
|   |-- speech/                    # 语音模型示例
|   |-- llm/                       # 端侧文本生成（原生 C++）
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
|-- conversion/            # ONNX → HBM/BIN 转换配置
|-- evaluator/             # 精度与性能评测
|-- model/                 # 模型下载脚本与清单
|-- runtime/
|   |-- python/            # Python 推理（main.py, cli.py, <task>.py, run.sh）
|   `-- cpp/               # C++ 推理（src/main.cc, CMakeLists.txt, run.sh）
|-- tests/                 # 自动化测试
`-- test_data/             # 测试图片与推理结果
```

Python runtime 采用 `main.py + cli.py` 布局：`main.py` 是精简入口（解析参数、构建模型、调用 `predict`），`cli.py` 负责参数声明、模型清单解析与结果展示，各任务模块（如 `detect.py`、`classify.py`）实现完整的预处理、推理和后处理流程。

并非所有 sample 都同时提供 Python 和 C++ runtime：LLM sample 仅提供原生 C++ runtime，VLA sample（ACT / Pi0）以固定 commit 的 Git 子模块形式提供，目录结构与上述典型布局略有差异，以各 sample README 为准。

## 推理接口

RDK X5 的 Python sample 统一使用 `hbm_runtime` 推理接口。完整接口参考 [RDK X5 hbm_runtime Python API 文档](https://developer.d-robotics.cc/rdk_x_doc/Basic_Application/multi_media_sp_dev_api/RDK_X5/pydev_multimedia_api_x5/ai-python-api?v=3.5.0&p=RDK+X5)。

C++ 推理接口文档：**`hb_dnn` C/C++ 推理接口文档** 👉 [Runtime 开发文档](https://developer.d-robotics.cc/oe_x5_doc/cn/oe_mapper/source/runtime.html)

### hbm_runtime 基础调用流程

#### 加载模型

```python
import hbm_runtime

model = hbm_runtime.HB_HBMRuntime("../../model/yolo11x_detect_bayese_640x640_nv12.bin")
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

RDK X5 视觉 sample 常见输入为 packed NV12 格式。模型类的 `preprocess()` 会完成 resize、BGR 转 NV12、数据打包等步骤：

```python
inputs = {
    model_name: {
        input_names[0]: input_array,
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
    target="x5",               # 板卡目标：x5 / s100 / s100p / s600
    input_size=(224, 224),
    class_count=1000,
    top_k=5,
    labels=labels,             # 类别名表
)

model.set_scheduling_params(priority=0, bpu_cores=[0])
result = model.predict("test_img.jpg")
```

`predict()` 内部按以下顺序执行：

1. `preprocess()`：生成模型输入
2. `infer()`：调用 `hbm_runtime` 执行推理
3. `postprocess()`：解析检测框、分类结果、分割 mask 或姿态点

## 快速上手

### 运行 Ultralytics YOLO11x 检测 sample

在仓库根目录执行：

```bash
# 1. 下载模型（按平台、模型族、任务和规模选择）
bash samples/vision/ultralytics_yolo/model/download_model.sh \
  --platform x5 --family yolo11 --task detect --model-size x

# 2. 运行推理
python3 samples/vision/ultralytics_yolo/runtime/python/main.py \
  --platform x5 \
  --family yolo11 \
  --task detect \
  --model-size x \
  --test-img samples/vision/ultralytics_yolo/test_data/bus.jpg \
  --img-save-path samples/vision/ultralytics_yolo/test_data/inference_yolo11x.jpg
```

说明：

- `--target` 与 `--platform` 等价；推理入口会校验板卡与目标一致，未知目标会直接报错
- 不指定 `--model-path` 时，入口在板端自动下载缺失的默认模型；显式指定 `--model-path` 时不会触发下载
- 无板卡时可在主机上用 `--list-models` 查看模型清单、用 `--dry-run` 预演解析结果

### 使用 run.sh 一键运行

多数 sample 在 `runtime/python/` 目录、部分 sample 在 `runtime/cpp/` 目录提供 `run.sh` 脚本，转发参数到对应入口。以下子 shell 示例均在仓库根目录独立执行，互不影响当前目录：

```bash
# Python 推理（首个参数为任务；platform 缺省时自动检测板卡）
(cd samples/vision/ultralytics_yolo/runtime/python && \
  bash run.sh detect --platform x5 --family yolo11 --model-size x)

# C++ 推理（在目标板上构建并运行，需板端 DNN SDK；
# 需从 sample 根目录运行以解析默认 test_data 资产，按位置传入模型、图片和结果路径）
(cd samples/vision/ultralytics_yolo && \
  bash runtime/cpp/run.sh --task detect \
  model/yolo26n_detect_bayese_640x640_nv12.bin \
  test_data/bus.jpg /tmp/cpp-result.jpg)
```

说明：

- Python `run.sh` 的首个参数为任务（`detect` / `seg` / `pose` / `cls` / `obb`），其余参数转发给 `main.py`
- C++ `run.sh` 先用 CMake 完成 out-of-tree 构建，再运行可执行文件；构建目标默认自动探测板端 SDK，也可用 `YOLO_TARGET=x5|s100|s100p|s600` 显式指定
- C++ 各任务的参数与默认模型路径见 `runtime/cpp/README.md`；上例模型需提前准备（`bash samples/vision/ultralytics_yolo/model/download_model.sh --platform x5 --family yolo26 --task detect --model-size n`）

## 模型支持范围

RDK X5 相关 sample 如下（各 sample README 提供完整的变体与支持矩阵）：

### 图像分类

| 模型 | Sample 目录 |
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

### 目标检测

| 模型 | Sample 目录 |
| :--- | :--- |
| FCOS | `samples/vision/fcos` |
| Faster R-CNN（行人检测与跟踪） | `samples/vision/fasterrcnn` |
| YOLOv5 | `samples/vision/yolov5` |
| Ultralytics YOLO（YOLOv5u / YOLOv8 / YOLOv9 / YOLOv10 / YOLO11 / YOLO12 / YOLO13 / YOLO26） | `samples/vision/ultralytics_yolo` |

### 多目标跟踪

| 模型 | Sample 目录 |
| :--- | :--- |
| ByteTrack | `samples/vision/bytetrack` |
| HobotMot（CPU IOU 2.0） | `samples/vision/hobot_mot` |

### 实例分割 / 抠图

| 模型 | Sample 目录 |
| :--- | :--- |
| YOLOE（prompt-free） | `samples/vision/yoloe` |
| MODNet | `samples/vision/modnet` |

### 提示词分割

| 模型 | Sample 目录 |
| :--- | :--- |
| EfficientSAM-Tiny | `samples/vision/efficient_sam` |
| MobileSAM | `samples/vision/mobile_sam` |

### 语义分割

| 模型 | Sample 目录 |
| :--- | :--- |
| PP-LiteSeg | `samples/vision/pp_liteseg` |
| UNet（ResNet 系列） | `samples/vision/unet` |

### 单目深度估计

| 模型 | Sample 目录 |
| :--- | :--- |
| YOLO26 Depth | `samples/vision/yolo26_depth` |

### OCR / 识别

| 模型 | Sample 目录 |
| :--- | :--- |
| PaddleOCR | `samples/vision/paddle_ocr` |
| LPRNet | `samples/vision/lprnet` |

### 多模态

| 模型 | Sample 目录 |
| :--- | :--- |
| CLIP | `samples/vision/clip` |
| YOLOWorld | `samples/vision/yoloworld` |

### 机器人

| 模型 | Sample 目录 |
| :--- | :--- |
| HIMLoco（Unitree Go2 运动策略） | `samples/robotics/himloco` |

## rdk_x5_legacy 分支

查询 RDK X5 历史 demo 时使用 `rdk_x5_legacy` 分支：

```bash
git clone https://github.com/D-Robotics/rdk_model_zoo.git
cd rdk_model_zoo
git checkout rdk_x5_legacy
```

切换到 `rdk_x5_legacy` 后，进入目标 demo 目录，先阅读该目录 README，再按 README 中的命令运行。

该分支使用 `bpu_infer_lib_x5` 的 demo，按以下命令安装：

```bash
wget -nc https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_x5/bpu_infer_lib_x5-1.0.3-py3-none-any.whl
pip install bpu_infer_lib_x5-1.0.3-py3-none-any.whl
```

该分支使用 `hobot_dnn.pyeasy_dnn` 的 demo 直接使用板端系统自带接口。

:::caution

`rdk_x5_legacy` 为历史归档分支，不再主动维护。新项目请使用 `main` 分支 `samples/` 目录下的对应 sample。

`bpu_infer_lib_x5` 和 `hobot_dnn.pyeasy_dnn` **对 featuremap 输入模型支持不佳**。如需使用 featuremap 输入模型，请使用 `main` 分支的 `hbm_runtime` 推理接口。

:::

## 共享工具（utils/）

`main` 分支提供以下共享 Python 工具（`utils/py_utils/`）：

| 工具模块 | 功能 |
| :--- | :--- |
| `file_io` | 模型下载、图片加载、类别名加载 |
| `preprocess` | BGR 转 NV12、resize（direct/letterbox）、NV12 分离 |
| `postprocess` | NMS、YOLO 检测框/分割/姿态/OBB 解码、坐标缩放 |
| `visualize` | 检测框、分割 mask、旋转框、姿态点、分类结果绘制 |
| `inspect` | SoC 名称检测、模型信息打印 |
| `nn_math` | sigmoid、z-score 归一化 |
