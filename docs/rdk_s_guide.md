---
sidebar_position: 4
sidebar_products: "RDK S100, RDK S600"
---

# 4.1.4 使用说明

## 分支与系统要求

自 **v2.0.0** 起，RDK S 系列（**RDK S100 / S100P / S600**）与 RDK X5 统一在默认分支 **`main`** 中维护，一套 `samples/` 目录通过 `--target` 或 `--platform` 参数（`auto` / `s100` / `s100p` / `s600`）切换目标板卡。

- **RDK S100 / S100P**：推荐系统版本 **RDK OS >= 4.0.5**（或与已发布制品匹配的板端镜像与运行时）
- **RDK S600**：推荐系统版本 **RDK OS >= 5.1.0**（LLM / VLM 需按各 sample README 准备配套 OELLM SDK Runtime）

```bash
git clone https://github.com/D-Robotics/rdk_model_zoo.git
cd rdk_model_zoo
```

:::tip

- **`main`** 是最新的稳定交付分支，推荐优先使用；可在 **[在线模型目录](https://d-robotics.github.io/rdk_model_zoo/)** 按板卡（S100 / S100P / S600）与任务筛选模型、查看实测 FPS 与精度并一键复制运行命令。
- 原分板卡分支 `rdk_s` 与早期仓库 [RDK Model Zoo S](https://github.com/D-Robotics/rdk_model_zoo_s) 仅作历史归档保留。

:::

## 仓库目录结构

统一 `main` 分支按领域和模型规范化组织，RDK S 系列涵盖视觉、大模型、语音和具身 VLA 四大领域：

```text
rdk_model_zoo/
├── samples/
│   ├── vision/                   # 计算机视觉与多模态示例（X5 / S 统一目录）
│   │   ├── ultralytics_yolo/     # 检测/分割/姿态/分类/旋转框（YOLOv5u–YOLO26）
│   │   ├── yolov5/               # 目标检测
│   │   ├── yoloe/                # 免提示实例分割
│   │   ├── fasterrcnn/           # 目标检测与行人跟踪
│   │   ├── bytetrack/            # 多目标跟踪
│   │   ├── hobot_mot/            # 多目标跟踪（IOU 2.0）
│   │   ├── osnet/                # 行人重识别
│   │   ├── resnet/               # 图像分类（ResNet-18/34/50/101/152）
│   │   ├── mobilenetv1..v4/      # 图像分类（v1 / v2 / v3 / v4）
│   │   ├── efficientnet/         # 图像分类
│   │   ├── vit/                  # 图像分类
│   │   ├── 3dresnet/             # 视频动作分类
│   │   ├── efficient_sam/        # 提示式图像分割
│   │   ├── mobile_sam/           # 提示式图像分割
│   │   ├── unetmobilenet/        # 语义分割
│   │   ├── depth_anything_v2/    # 单目深度估计
│   │   ├── yolo26_depth/         # 单目深度估计
│   │   ├── paddle_ocr/           # OCR 文字检测与识别
│   │   ├── lanenet/              # 车道线检测
│   │   ├── pointnet/             # 点云部件分割
│   │   ├── dinov2/               # 视觉特征编码
│   │   ├── siglip/               # 视觉-语言编码
│   │   ├── lite_avatar/          # 音频驱动数字人
│   │   └── diffusiondrive/       # 端到端规划驾驶
│   ├── llm/                      # 端侧大语言模型与多模态（原生 C++ / OELLM SDK）
│   │   ├── oellm/                # 官方 OELLM SDK 2.0.0 S600 模型套件（32 配置）
│   │   ├── gemma4/               # Gemma4 E2B / E4B 文本生成（OELLM SDK 2.0.0，S600）
│   │   ├── gemma4-e2b/           # Gemma4-E2B 视觉语言对话与 HTTP 服务（原生 C++）
│   │   └── minicpm5-2b/          # MiniCPM5-2B 文本生成（原生 C++）
│   ├── speech/                   # 语音处理示例
│   │   ├── asr/                  # 语音识别（Wav2Vec2 / XLSR53）
│   │   ├── paraformer/           # Paraformer 中文语音识别
│   │   └── kws/                  # 关键词检测
│   └── vla/                      # 具身智能 / 机械臂策略（固定 Git 子模块）
│       ├── act/                  # S100 ACT（Action Chunking Transformer）
│       └── pi0/                  # S600 ACT / Pi0 集成
├── datasets/                     # 公共数据集与标签文件
├── docs/                         # 工程规范、版本制品清单（docs/release/s/）与用户指南
├── skills/                       # RDK Model Zoo Agent Skills 技能包
└── utils/                        # 公共 Python（py_utils/）、C++（c_utils/）与校验工具
```

## 单个 Sample 结构

每个标准 sample 包含以下目录与文件：

```text
sample_name/
├── README.md              # 英文说明文档
├── README_cn.md           # 中文说明文档
├── conversion/            # ONNX 导出与 OpenExplorer 量化编译配置
├── evaluator/             # 数据集精度与性能评测
├── model/                 # 模型清单说明与下载脚本（预编译 .hbm 不随仓提交）
├── runtime/
│   ├── python/            # Python 推理（main.py, cli.py, <task>.py, run.sh）
│   └── cpp/               # C++ 推理（CMakeLists.txt, src/, run.sh）
├── test_data/             # 示例输入与参考结果
└── tests/                 # 主机单元测试与回归检查
```

## 推理接口

RDK S 系列的视觉与语音 Python sample 统一使用 `hbm_runtime` 推理接口，与 RDK X5 接口名称一致，底层依赖不同：RDK S 系列基于 `libhbucp`，RDK X5 基于 `libdnn`。

- Python 接口文档：👉 [RDK S hbm_runtime Python API 文档](https://developer.d-robotics.cc/rdk_s_doc/Algorithm_Application/python-api)
- C/C++ 接口文档：**UCP（`hb_ucp`）接口文档** 👉 [总览](https://developer.d-robotics.cc/oe_s_doc/guide/ucp/ucp_overview)
- 大模型工具链文档：👉 [S100 OE LLM 手册](https://developer.d-robotics.cc/oe_llm_s100p_doc/index.html) · [S600 OE LLM 手册](https://developer.d-robotics.cc/oe_llm_doc/index.html)

### hbm_runtime 基础调用流程

#### 加载模型

```python
import hbm_runtime

model = hbm_runtime.HB_HBMRuntime("../../model/s100/yolov5x_672x672_nv12.hbm")
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

RDK S 系列视觉 sample 常见输入为分离的 NV12 格式（Y 平面和 UV 平面分别作为两个命名输入 tensor），与 RDK X5 的 packed NV12 单输入不同：

```python
inputs = {
    model_name: {
        input_names[0]: y_plane,    # Y 平面 (1, H, W, 1)
        input_names[1]: uv_plane,   # UV 平面 (1, H/2, W/2, 2)
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

统一版 Python sample 遵循 [`docs/sample-standards/runtime-code.md`](https://github.com/D-Robotics/rdk_model_zoo/blob/main/docs/sample-standards/runtime-code.md) 规范，由 `main.py`、`cli.py` 与按任务命名的模型文件（如 `classify.py`、`detect.py`、`segment.py`）组成。具名模型类对外提供 `preprocess → infer → postprocess` 三阶段方法，由 `predict()` 串联：

```python
class ResNetClassifier:
    def predict(self, image):
        inputs = self.preprocess(image)
        outputs = self.infer(inputs)
        return self.postprocess(outputs)
```

端侧 LLM / VLM 示例（`samples/llm/*`）提供原生 C++ 及官方 OELLM SDK Runtime 入口，请按各目录 `README_cn.md` 的命令准备模型并构建运行。

## 快速上手

### 1. 运行 Ultralytics YOLO11x 检测 sample（Python）

以下以 **RDK S100** 为例（在 S100P 或 S600 上将 `--platform s100` 替换为 `s100p` 或 `s600`）：

```bash
# 1. 下载预编译好的 BPU 模型（.hbm）
cd samples/vision/ultralytics_yolo/model
bash download_model.sh --platform s100 --family yolo11 --task detect --model-size x

# 2. 在开发板上运行推理
cd ../runtime/python
python3 main.py \
  --task detect \
  --platform s100 \
  --family yolo11 \
  --model-size x \
  --test-img ../../test_data/bus.jpg \
  --img-save-path ../../test_data/inference_yolo11x.jpg
```

### 2. 无板预览与清单查询

在开发主机或板端，可使用 `--list-models` 与 `--dry-run` 检查支持制品及张量契约（不加载 `hbm_runtime`，也不执行推理）：

```bash
python3 samples/vision/ultralytics_yolo/runtime/python/main.py --platform s100 --list-models
python3 samples/vision/ultralytics_yolo/runtime/python/main.py --platform s600 --family yolo26 --task cls --dry-run
```

### 3. 使用 run.sh 与 C++ 入口

每个 sample 的 `runtime/python/` 和 `runtime/cpp/` 目录下提供 `run.sh` 脚本，负责定位入口并原样转发参数和退出码。

:::note

遵循统一规范后，`run.sh` 不会自动安装依赖或下载模型。运行前请先按对应 sample 的 `model/README_cn.md` 准备匹配板卡的模型文件。

:::

```bash
# 示例：下载并在 S100 上运行 YOLOv5x-672 检测
python3 -m samples.vision.yolov5.model.download --target s100 --variant x-672 --output-dir samples/vision/yolov5/model
bash samples/vision/yolov5/runtime/python/run.sh --target s100 --variant x-672
```

### 4. 获取具身 VLA 子模块（ACT / Pi0）

ACT 和 Pi0 通过固定 Git 子模块集成（S100 ACT 使用 `act/`；S600 ACT 与 Pi0 使用 `pi0/`），在仓库根目录初始化后按 `samples/vla/README_cn.md` 指南运行：

```bash
git submodule sync -- samples/vla/act samples/vla/pi0
git submodule update --init --checkout samples/vla/act samples/vla/pi0
```

## 模型支持范围（RDK S 系列）

下表列出统一 `main` 分支中面向 **RDK S100 / S100P / S600** 的主要示例；各模型变体、C++ 支持范围、新增转换制品与详细指标请参阅对应目录 `README_cn.md`、`docs/release/s/models.yaml` 或 [在线模型目录](https://d-robotics.github.io/rdk_model_zoo/)。

### 视觉（Vision）

| 类别 | 模型 | Sample 目录 | 支持平台 |
| :--- | :--- | :--- | :--- |
| 视觉多任务 | Ultralytics YOLO（`YOLOv5u–YOLO26`） | `samples/vision/ultralytics_yolo` | S100/S100P/S600 |
| 目标检测 | YOLOv5 | `samples/vision/yolov5` | S100/S600 |
| 目标检测 / 跟踪 | Faster R-CNN MobileNetV3-Large | `samples/vision/fasterrcnn` | S100/S100P/S600 |
| 多目标跟踪 | ByteTrack | `samples/vision/bytetrack` | S100/S100P/S600 |
| 多目标跟踪 | HobotMot（IOU 2.0） | `samples/vision/hobot_mot` | S100/S100P/S600 |
| 行人重识别 | OSNet x1.0 | `samples/vision/osnet` | S100/S100P/S600 |
| 免提示实例分割 | YOLOE | `samples/vision/yoloe` | S100/S100P |
| 提示式图像分割 | EfficientSAM-Tiny | `samples/vision/efficient_sam` | S100/S100P/S600 |
| 提示式图像分割 | MobileSAM | `samples/vision/mobile_sam` | S100/S100P/S600 |
| 图像分类 | ResNet（18/34/50/101/152） | `samples/vision/resnet` | S100/S100P/S600 |
| 图像分类 | MobileNetV1/V2/V3/V4 | `samples/vision/mobilenetv1..v4` | S100/S100P/S600 |
| 图像分类 | EfficientNet | `samples/vision/efficientnet` | S100/S600 |
| 图像分类 | ViT | `samples/vision/vit` | S100 |
| 视频动作分类 | 3D ResNet | `samples/vision/3dresnet` | S100 |
| 语义分割 | UNetMobileNet | `samples/vision/unetmobilenet` | S100/S600 |
| 单目深度估计 | Depth Anything V2 | `samples/vision/depth_anything_v2` | S100 |
| 单目深度估计 | YOLO26 Depth | `samples/vision/yolo26_depth` | S100/S100P/S600 |
| OCR 检测与识别 | PaddleOCR | `samples/vision/paddle_ocr` | S100/S600 |
| 车道线检测 | LaneNet | `samples/vision/lanenet` | S100 |
| 点云分割 | PointNet | `samples/vision/pointnet` | S100 |
| 视觉特征编码 | DINOv2 | `samples/vision/dinov2` | S100/S100P/S600 |
| 视觉-语言编码 | SigLIP | `samples/vision/siglip` | S100/S100P |
| 音频驱动数字人 | LiteAvatar | `samples/vision/lite_avatar` | S100/S100P/S600 |
| 端到端规划驾驶 | DiffusionDrive | `samples/vision/diffusiondrive` | S100P/S600 |

### 大语言模型与多模态（LLM / VLM）

| 类别 | 模型 | Sample 目录 | 支持平台 |
| :--- | :--- | :--- | :--- |
| 多模态大模型 | 官方 OELLM 套件（SDK 2.0.0，32 配置） | `samples/llm/oellm` | S600 |
| 文本生成 | Gemma4 E2B / E4B（SDK 2.0.0） | `samples/llm/gemma4` | S600 |
| 视觉-语言模型 | Gemma4-E2B（原生 C++，对话/HTTP） | `samples/llm/gemma4-e2b` | S100/S100P/S600 |
| 文本生成 | MiniCPM5-2B（原生 C++） | `samples/llm/minicpm5-2b` | S100/S100P/S600 |

### 语音（Speech）

| 类别 | 模型 | Sample 目录 | 支持平台 |
| :--- | :--- | :--- | :--- |
| 语音识别 | ASR（Wav2Vec2 / XLSR53） | `samples/speech/asr` | S100/S600 |
| 语音识别 | Paraformer（中文 ASR，三段 INT16 HBM） | `samples/speech/paraformer` | S100 |
| 关键词检测 | KWS（MDTC） | `samples/speech/kws` | S100 |

### 具身智能 / 机械臂策略（VLA）

| 类别 | 模型 | Sample 目录 | 支持平台 |
| :--- | :--- | :--- | :--- |
| 动作策略 | ACT（Action Chunking Transformer） | `samples/vla/act`、`samples/vla/pi0` | S100/S600 |
| 具身 VLA | Pi0 | `samples/vla/pi0` | S600 |

## 共享工具（utils/py_utils/）

统一 `main` 分支在 `utils/py_utils/` 下提供跨平台复用的 Python 推理与工具模块：

| 工具模块 | 功能 |
| :--- | :--- |
| `runtime`、`model_runner`、`single_array_runner` | 加载板端模型、调用 `hbm_runtime`、分类与命名数组输入输出绑定 |
| `platforms`、`platform_profile` | 板卡身份识别（`auto`/`x5`/`s100`/`s100p`/`s600`）与平台能力校验 |
| `assets`、`cls_binding`、`sam_binding` | 读取 `docs/release/{x5,s}/models.yaml` 清单与张量契约 |
| `image`、`file_io`、`preprocess`、`tensor_io` | 图像/文件读取、缩放（direct/letterbox）与分离 Y/UV NV12 输入转换 |
| `labels`、`classification` | 标签加载与校验、Top-K 分类结果处理 |
| `runtime_meta`、`quantization`、`nn_math`、`postprocess` | 元数据解析、反量化、NMS 与 YOLO 检测/分割/姿态/OBB 解码 |
| `sam_runner`、`sam_stages`、`yoloe26_decode` | SAM 编解码流程与 YOLOE26 无提示分割解码 |
| `text_metrics`、`visualize`、`inspect` | 语音 CER/编辑距离计算、检测/分割/姿态可视化与模型信息查看 |
