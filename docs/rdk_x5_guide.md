---
sidebar_position: 3
sidebar_products: "RDK-X5"
---

# 4.1.3 使用说明

## 分支与系统要求

自 **v2.0.0** 起，RDK X5 与 RDK S 系列统一在默认分支 **`main`** 中维护，一套 `samples/` 目录通过 `--target x5` 或 `--platform x5`（默认 `auto` 自动识别板卡）适配全系板卡。推荐系统版本 **RDK OS >= 3.5.0**，Python sample 统一使用 `hbm_runtime` 推理接口。

```bash
git clone https://github.com/D-Robotics/rdk_model_zoo.git
cd rdk_model_zoo
```

:::tip

- **`main`** 是最新的稳定交付分支，推荐优先使用；可在 **[在线模型目录](https://d-robotics.github.io/rdk_model_zoo/)** 按板卡和任务检索所有 X5 已发布模型与实测性能。
- 原分板卡分支 `rdk_x5` 与早期 demo 分支 `rdk_x5_legacy` 仅作历史归档保留。

:::

## 仓库目录结构

统一 `main` 分支按领域和模型规范化组织，RDK X5 相关目录如下：

```text
rdk_model_zoo/
├── samples/
│   ├── vision/                   # 计算机视觉与多模态示例（X5 / S 统一目录）
│   │   ├── bytetrack/            # 多目标跟踪
│   │   ├── clip/                 # 图文多模态匹配
│   │   ├── convnext/             # 图像分类
│   │   ├── edgenext/             # 图像分类
│   │   ├── efficient_sam/        # 提示式图像分割
│   │   ├── efficientformer/      # 图像分类
│   │   ├── efficientformerv2/    # 图像分类
│   │   ├── efficientnet/         # 图像分类
│   │   ├── efficientvit/         # 图像分类
│   │   ├── fasterrcnn/           # 目标检测与行人跟踪
│   │   ├── fasternet/            # 图像分类
│   │   ├── fastvit/              # 图像分类
│   │   ├── fcos/                 # 目标检测
│   │   ├── googlenet/            # 图像分类
│   │   ├── hgnetv2/              # 图像分类
│   │   ├── hobot_mot/            # 多目标跟踪（IOU 2.0）
│   │   ├── lprnet/               # 车牌识别
│   │   ├── mobile_sam/           # 提示式图像分割
│   │   ├── mobilenetv1/          # 图像分类
│   │   ├── mobilenetv2/          # 图像分类
│   │   ├── mobilenetv4/          # 图像分类
│   │   ├── mobileone/            # 图像分类
│   │   ├── modnet/               # 图像抠图
│   │   ├── osnet/                # 行人重识别
│   │   ├── paddle_ocr/           # OCR 文字检测与识别
│   │   ├── pp_liteseg/           # 语义分割
│   │   ├── repghost/             # 图像分类
│   │   ├── repvgg/               # 图像分类
│   │   ├── repvit/               # 图像分类
│   │   ├── resnet/               # 图像分类（ResNet-18/34/50/101/152）
│   │   ├── resnext/              # 图像分类
│   │   ├── ultralytics_yolo/     # 检测/分割/姿态/分类/旋转框（YOLOv5u–YOLO26）
│   │   ├── unet/                 # 语义分割（UNet ResNet 系列）
│   │   ├── vargconvnet/          # 图像分类
│   │   ├── yolo26_depth/         # 单目深度估计
│   │   ├── yoloe/                # 免提示实例分割
│   │   ├── yolov5/               # 目标检测
│   │   └── yoloworld/            # 开放词表目标检测
│   └── robotics/
│       └── himloco/              # Unitree Go2 足式机器人运动控制策略
├── datasets/                     # 示例数据集与标签文件
├── docs/                         # 工程规范、版本制品清单（docs/release/x5/）与用户指南
├── skills/                       # RDK Model Zoo Agent Skills 技能包
└── utils/                        # 公共 Python（py_utils/）与 C++（c_utils/）工具
```

## 单个 Sample 结构

每个标准 sample 包含以下目录与文件：

```text
sample_name/
├── README.md              # 英文说明文档
├── README_cn.md           # 中文说明文档
├── conversion/            # ONNX 导出与 OpenExplorer 量化编译配置
├── evaluator/             # 数据集精度与性能评测
├── model/                 # 模型清单说明与下载脚本（预编译 .bin 不随仓提交）
├── runtime/
│   ├── python/            # Python 推理（main.py, cli.py, <task>.py, run.sh）
│   └── cpp/               # C++ 推理（CMakeLists.txt, src/, run.sh）
├── test_data/             # 示例输入图片与参考结果
└── tests/                 # 主机单元测试与回归检查
```

## 推理接口

RDK X5 的 Python sample 统一使用 `hbm_runtime` 推理接口。完整接口参考 [RDK X5 hbm_runtime Python API 文档](https://developer.d-robotics.cc/rdk_x_doc/Basic_Application/multi_media_sp_dev_api/RDK_X5/pydev_multimedia_api_x5/ai-python-api?v=3.5.0&p=RDK+X5)。

C/C++ 推理接口文档：**`hb_dnn` C/C++ 推理接口文档** 👉 [Runtime 开发文档](https://developer.d-robotics.cc/oe_x5_doc/cn/oe_mapper/source/runtime.html)

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

RDK X5 视觉 sample 常见输入为 packed NV12 格式（单个输入 tensor）。模型类的 `preprocess()` 会完成图像缩放、BGR 转 NV12 及数据打包：

```python
inputs = {
    model_name: {
        input_names[0]: packed_nv12,
    }
}
```

#### 执行推理

```python
outputs = model.run(inputs)
raw_outputs = outputs[model_name]
output_tensor = raw_outputs[output_names[0]]
```

### Model Zoo Python 推理结构

统一版 Python sample 遵循 [`docs/sample-standards/runtime-code.md`](https://github.com/D-Robotics/rdk_model_zoo/blob/main/docs/sample-standards/runtime-code.md) 规范，由 `main.py`、`cli.py` 与按任务命名的模型文件（如 `classify.py`、`detect.py`、`segment.py`）组成。具名模型类对外提供统一的 `preprocess → infer → postprocess` 三阶段方法，由 `predict()` 串联：

```python
class ResNetClassifier:
    def predict(self, image):
        inputs = self.preprocess(image)
        outputs = self.infer(inputs)
        return self.postprocess(outputs)
```

以 `samples/vision/resnet/runtime/python/main.py` 为例，入口依次完成参数解析、目标板卡校验、模型构造、推理与结果打印：

```python
selection = resolve_selection(args.target, variant=args.variant)
model = ResNetClassifier(selection.model_path, target=selection.target, ...)
model.set_scheduling_params(priority=args.priority, bpu_cores=args.bpu_cores)
result = model.predict(args.test_img)
```

## 快速上手

### 运行 Ultralytics YOLO11x 检测 sample

从仓库目录执行，两步完成预编译模型下载与板端推理：

```bash
# 1. 下载预编译好的 BPU 模型
cd samples/vision/ultralytics_yolo/model
bash download_model.sh --platform x5 --family yolo11 --task detect --model-size x

# 2. 在开发板上运行推理
cd ../runtime/python
python3 main.py \
  --task detect \
  --platform x5 \
  --family yolo11 \
  --model-size x \
  --test-img ../../test_data/bus.jpg \
  --img-save-path ../../test_data/inference_yolo11x.jpg
```

### 无板预览与清单查询

大部分 sample 支持在开发主机或板端使用 `--list-models` 和 `--dry-run` 查看支持的已发布模型与运行契约（不加载板端 SDK，也不执行推理）：

```bash
# 列出 X5 已发布的 Ultralytics YOLO 模型
python3 samples/vision/ultralytics_yolo/runtime/python/main.py --platform x5 --list-models

# 预览目标选择与输入协议（不加载模型）
python3 samples/vision/resnet/runtime/python/main.py --target x5 --dry-run
```

### 使用 run.sh 与 C++ 入口

每个 sample 的 `runtime/python/` 和 `runtime/cpp/` 目录下提供 `run.sh` 脚本，用于定位入口并原样转发参数和退出码。

:::note

遵循统一规范后，`run.sh` 不会自动安装依赖或下载模型。运行前请先阅读目标 sample 的 `model/README_cn.md` 和 `runtime/` 说明，完成模型准备后再执行推理。

:::

```bash
# 1. 先按 sample 说明下载模型（以 ResNet-18 为例）
bash samples/vision/resnet/model/download.sh x5 18

# 2. 运行 Python 推理
bash samples/vision/resnet/runtime/python/run.sh --target x5 --variant 18
```

## 模型支持范围（RDK X5）

下表列出统一 `main` 分支中支持 **RDK X5** 的主要模型示例；详细变体、制品摘要及实测性能请查看对应目录 `README_cn.md` 或 [在线模型目录](https://d-robotics.github.io/rdk_model_zoo/)。

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
| MobileNetV4 | `samples/vision/mobilenetv4` |
| MobileOne | `samples/vision/mobileone` |
| RepGhost | `samples/vision/repghost` |
| RepVGG | `samples/vision/repvgg` |
| RepViT | `samples/vision/repvit` |
| ResNet（18 / 34 / 50 / 101 / 152） | `samples/vision/resnet` |
| ResNeXt | `samples/vision/resnext` |
| VargConvNet | `samples/vision/vargconvnet` |

### 目标检测与视觉多任务

| 模型 | 任务覆盖 | Sample 目录 |
| :--- | :--- | :--- |
| Ultralytics YOLO（`YOLOv5u–YOLO26`） | 检测 / 分割 / 姿态 / 分类 / 旋转框（OBB） | `samples/vision/ultralytics_yolo` |
| YOLOv5 | 目标检测 | `samples/vision/yolov5` |
| FCOS | 目标检测 | `samples/vision/fcos` |
| Faster R-CNN MobileNetV3-Large | 目标检测 / 行人跟踪 | `samples/vision/fasterrcnn` |

### 多目标跟踪与行人重识别

| 模型 | 任务 | Sample 目录 |
| :--- | :--- | :--- |
| ByteTrack | 多目标跟踪 | `samples/vision/bytetrack` |
| HobotMot（IOU 2.0） | 多目标跟踪 | `samples/vision/hobot_mot` |
| OSNet x1.0 | 行人重识别 | `samples/vision/osnet` |

### 实例分割、抠图、提示分割与语义分割

| 模型 | 任务 | Sample 目录 |
| :--- | :--- | :--- |
| YOLOE | 免提示实例分割 | `samples/vision/yoloe` |
| MODNet | 图像抠图 | `samples/vision/modnet` |
| EfficientSAM-Tiny | 提示式图像分割 | `samples/vision/efficient_sam` |
| MobileSAM | 提示式图像分割 | `samples/vision/mobile_sam` |
| PP-LiteSeg | 语义分割 | `samples/vision/pp_liteseg` |
| UNet ResNet 系列 | 语义分割 | `samples/vision/unet` |

### 单目深度估计、OCR 与多模态

| 模型 | 任务 | Sample 目录 |
| :--- | :--- | :--- |
| YOLO26 Depth | 单目深度估计 | `samples/vision/yolo26_depth` |
| PaddleOCR | OCR 文字检测与识别 | `samples/vision/paddle_ocr` |
| LPRNet | 车牌识别 | `samples/vision/lprnet` |
| CLIP | 图文多模态匹配 | `samples/vision/clip` |
| YOLOWorld | 开放词表目标检测 | `samples/vision/yoloworld` |

### 机器人运控

| 模型 | 任务 | Sample 目录 |
| :--- | :--- | :--- |
| HIMLoco（Unitree Go2） | 足式机器人运动控制策略 | `samples/robotics/himloco` |

## 历史分支（rdk_x5_legacy）

如需查看或运行早期 X5 历史 demo，可切换到归档分支 `rdk_x5_legacy`：

```bash
git clone https://github.com/D-Robotics/rdk_model_zoo.git
cd rdk_model_zoo
git checkout rdk_x5_legacy
```

切换到 `rdk_x5_legacy` 后，进入目标 demo 目录，先阅读该目录 README，再按 README 中的命令运行。使用 `bpu_infer_lib_x5` 的 demo 可按以下命令安装：

```bash
wget -nc https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_x5/bpu_infer_lib_x5-1.0.3-py3-none-any.whl
pip install bpu_infer_lib_x5-1.0.3-py3-none-any.whl
```

使用 `hobot_dnn.pyeasy_dnn` 的 demo 直接使用板端系统自带接口。

:::caution

`rdk_x5_legacy` 为历史归档分支，不再主动维护。新项目请使用 `main` 分支。

`bpu_infer_lib_x5` 和 `hobot_dnn.pyeasy_dnn` **对 featuremap 输入模型支持不佳**。如需使用 featuremap 输入模型，请使用 `main` 分支的 `hbm_runtime` 推理接口。

:::

## 共享工具（utils/py_utils/）

统一 `main` 分支在 `utils/py_utils/` 下提供跨平台复用的 Python 推理与工具模块：

| 工具模块 | 功能 |
| :--- | :--- |
| `runtime`、`model_runner`、`single_array_runner` | 加载板端模型、调用 `hbm_runtime`、分类与命名数组输入输出绑定 |
| `platforms`、`platform_profile` | 板卡身份识别（`auto`/`x5`/`s100`/`s100p`/`s600`）与平台能力校验 |
| `assets`、`cls_binding`、`sam_binding` | 读取 `docs/release/{x5,s}/models.yaml` 清单与张量契约 |
| `image`、`file_io`、`preprocess`、`tensor_io` | 图像/文件读取、缩放（direct/letterbox）与 NV12 输入转换 |
| `labels`、`classification` | 标签加载与校验、Top-K 分类结果处理 |
| `runtime_meta`、`quantization`、`nn_math`、`postprocess` | 元数据解析、反量化、NMS 与 YOLO 检测/分割/姿态/OBB 解码 |
| `sam_runner`、`sam_stages`、`yoloe26_decode` | SAM 编解码流程与 YOLOE26 无提示分割解码 |
| `visualize`、`inspect` | 检测框、掩码、姿态点、旋转框绘制与模型信息查看 |
