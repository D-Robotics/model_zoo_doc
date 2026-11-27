---
sidebar_position: 1
---

# 4.1.1 Model Zoo 概述

## 产品介绍

**RDK Model Zoo** 是 D-Robotics（地瓜机器人）官方维护的 BPU（Brain Processing Unit）模型示例库与全链路量化部署参考集合，面向 RDK 系列开发板，帮助开发者以最小成本把常见的视觉、大语言模型、语音、具身 VLA 和机器人运控模型直接跑在 BPU 上。

仓库内所有示例都遵循统一且透明的四步落地链路：**导出 ONNX → OpenExplorer 定点量化编译（`.bin` / `.hbm`）→ 板端 Python（`hbm_runtime`）/ C++ 推理运行 → 数据集精度与性能评估**，每个示例均提供预编译模型下载脚本、可直接运行的推理代码和完整的量化转换指南。

:::tip

- **在线模型目录（推荐）**：[https://d-robotics.github.io/rdk_model_zoo/](https://d-robotics.github.io/rdk_model_zoo/) — 按板卡或任务快速检索全部模型、查看实测 FPS 与精度、一键复制运行命令
- **GitHub 仓库地址**：[https://github.com/D-Robotics/rdk_model_zoo](https://github.com/D-Robotics/rdk_model_zoo)

:::

:::info

RDK Model Zoo 是一个社区开源共建项目。我们非常欢迎开发者贡献新的模型示例、优化现有代码或完善文档。如果您有任何改进建议，欢迎通过 [GitHub Issues](https://github.com/D-Robotics/rdk_model_zoo/issues) 或 Pull Request（PR）参与共建！

:::

## 支持板卡与系统

| 目标板卡 | Target ID | CPU | BPU（INT8） | 推荐系统 | 发布制品 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **[RDK X5](https://www.d-robotics.cc/rdkX5)** | `x5` | 8× Cortex-A55 | 1× Bayes-E，10 TOPS | RDK OS >= 3.5.0 | [`docs/release/x5/`](https://github.com/D-Robotics/rdk_model_zoo/tree/main/docs/release/x5) |
| **[RDK S100](https://www.d-robotics.cc/rdkS100)** | `s100` | 6× Cortex-A78AE | 1× Nash-E，80 TOPS | RDK OS >= 4.0.5 | [`docs/release/s/`](https://github.com/D-Robotics/rdk_model_zoo/tree/main/docs/release/s) |
| **[RDK S100P](https://www.d-robotics.cc/rdkS100)** | `s100p` | 6× Cortex-A78AE | 1× Nash-M，128 TOPS | 匹配发布制品 | [`docs/release/s/`](https://github.com/D-Robotics/rdk_model_zoo/tree/main/docs/release/s) |
| **[RDK S600](https://www.d-robotics.cc/rdkS600)** | `s600` | 18× Cortex-A78AE | 4× Nash-P，560 TOPS | RDK OS >= 5.1.0 | [`docs/release/s/`](https://github.com/D-Robotics/rdk_model_zoo/tree/main/docs/release/s) |

## 分支与硬件平台对应关系

自 **v2.0.0（统一源码架构）** 起，RDK X5 与 RDK S 系列（S100 / S100P / S600）共用主交付分支 [`main`](https://github.com/D-Robotics/rdk_model_zoo/tree/main) 下的同一份 `samples/` 目录，通过 `--target` 或 `--platform` 参数切换目标板卡；历史分板卡分支和 RDK X3 分支保留用于兼容和归档：

| 目标硬件 | 推荐分支 | 推理接口 | 使用入口 |
| :--- | :--- | :--- | :--- |
| **RDK X5 / S 系列** | [`main`](https://github.com/D-Robotics/rdk_model_zoo/tree/main) / [`develop`](https://github.com/D-Robotics/rdk_model_zoo/tree/develop) | Python `hbm_runtime`；C++ `hb_dnn` / `hb_ucp` / OELLM | `samples/<domain>/<sample>/` |
| RDK X5（历史分支） | [`rdk_x5`](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x5) | `hbm_runtime` / `hb_dnn` | `samples/vision/<sample>/` |
| RDK X5（历史 demo） | [`rdk_x5_legacy`](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x5_legacy) | `bpu_infer_lib_x5` / `hobot_dnn.pyeasy_dnn` | `demos/<task>/<demo>/` |
| RDK S 系列（历史分支） | [`rdk_s`](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_s) | `hbm_runtime` / `hb_ucp` | `samples/<domain>/<sample>/` |
| RDK X3（归档） | [`rdk_x3`](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x3) | `bpu_infer_lib_x3` / `hobot_dnn.pyeasy_dnn` | `demos/<task>/<demo>/` |

## 涵盖领域（统一 `main` 分支）

| 领域 | 示例数 | 代表模型 | 索引入口 |
| :--- | :---: | :--- | :--- |
| **计算机视觉** | 49 | Ultralytics YOLO（`YOLOv5u–YOLO26`）、MobileSAM、EfficientSAM、Depth Anything V2、YOLO26 Depth、PaddleOCR、ByteTrack、CLIP、DINOv2、SigLIP、LiteAvatar、DiffusionDrive 等 | [`samples/README_cn.md`](https://github.com/D-Robotics/rdk_model_zoo/blob/main/samples/README_cn.md) |
| **大语言模型 / 多模态** | 4 | 官方 OELLM S600 套件（32 配置）、Gemma4（E2B / E4B）、Gemma4-E2B VLM（原生 C++）、MiniCPM5-2B（原生 C++） | [`samples/llm/`](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/llm) |
| **语音处理** | 3 | ASR（Wav2Vec2 / XLSR53）、Paraformer、关键词检测（KWS） | [`samples/speech/`](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/speech) |
| **具身 VLA** | 2 | 上游 ACT 与 Pi0 机械臂策略集成（固定 Git 子模块） | [`samples/vla/README_cn.md`](https://github.com/D-Robotics/rdk_model_zoo/blob/main/samples/vla/README_cn.md) |
| **机器人运控** | 1 | HIMLoco 足式机器人运动控制策略（Unitree Go2） | [`samples/robotics/himloco`](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/robotics/himloco) |

此外，仓库还内置 [`skills/`](https://github.com/D-Robotics/rdk_model_zoo/tree/main/skills)（RDK Model Zoo Agent Skills 技能包），提供 7 个面向 BPU 示例查询、开发、校验、评审与发布的可复用工作流技能。

## 分支说明

<DocScope versions=">=3.5.0" products="RDK X5">

### RDK X5：main（推荐）与历史分支

RDK X5 推荐直接使用统一交付分支 **`main`**（要求系统版本 RDK OS >= 3.5.0）：

- 一套 `samples/` 目录同时适配 RDK X5 与 S 系列，支持 `--target auto|x5`（或 `--platform x5`）自动识别或显式指定硬件
- Python sample 统一使用 `hbm_runtime` 接口，遵循清晰的 `preprocess → infer → postprocess`（`predict`）结构；C++ sample 使用 `hb_dnn` 接口
- 除 37 个视觉 sample 外，还包含足式机器人运控示例 `samples/robotics/himloco`
- 所有已发布制品清单与基准数据统一维护在 `docs/release/x5/models.yaml` 与 `docs/release/x5/benchmarks.yaml`

历史分支说明：

- **`rdk_x5`**：统一架构前的 RDK X5 分板卡交付分支，仅作历史版本保留
- **`rdk_x5_legacy`**：原 RDK X5 历史 demo 归档分支，按 `demos/<task>/<demo>` 组织，不同 demo 使用 `bpu_infer_lib_x5` 或 `hobot_dnn.pyeasy_dnn`

:::caution

`bpu_infer_lib_x5` 和 `hobot_dnn.pyeasy_dnn` 对 featuremap 输入模型支持不佳。新项目与 featuremap 输入模型请统一使用 `main` 分支的 `hbm_runtime`。

:::

</DocScope>

<DocScope versions=">=3.0.0" products="RDK X3">

### rdk_x3

RDK X3 设备专用归档分支（不再作为新模型适配目标）。

- 目录按 `demos/<task>/<demo>` 组织
- 包含图像分类、目标检测、实例分割与 OCR 等示例
- 推理接口按目标目录 README 选择，包含 `bpu_infer_lib_x3` 与板端自带的 `hobot_dnn.pyeasy_dnn`

:::caution

`bpu_infer_lib_x3` 和 `hobot_dnn.pyeasy_dnn` 对 featuremap 输入模型支持不佳。

:::

部分 demo 支持 Jupyter Notebook 交互式体验。

</DocScope>

<DocScope versions=">=4.0.5" products="RDK-S100,RDK-S600">

### RDK S 系列：main（推荐）与历史分支

RDK S100 / S100P / S600 系列板卡推荐直接使用统一交付分支 **`main`**（S100 推荐 RDK OS >= 4.0.5，S600 推荐 RDK OS >= 5.1.0，或使用与已发布制品匹配的板端镜像与运行时）：

- 一套 `samples/` 目录按领域组织，覆盖 **Vision（视觉）、LLM / VLM（大模型）、Speech（语音）和 VLA（具身智能）**
- 视觉与语音 Python sample 统一使用 `hbm_runtime` 接口（底层基于 `libhbucp`，与 X5 的 `libdnn` 共享统一 Python API 风格），通过 `--target auto|s100|s100p|s600`（或 `--platform`）选择板卡
- C++ 推理基于 UCP（`hb_ucp` / `hb_dnn`）；端侧 LLM / VLM 示例提供原生 C++ 及官方 OELLM SDK 2.0.0 入口
- 所有已发布制品清单与基准数据统一维护在 `docs/release/s/models.yaml` 与 `docs/release/s/benchmarks.yaml`

历史分支与仓库说明：

- **`rdk_s`**：统一架构前的 RDK S 分板卡交付分支，仅作历史版本保留
- **[RDK Model Zoo S](https://github.com/D-Robotics/rdk_model_zoo_s)**：早期 RDK S 系列历史 demo 归档仓库

</DocScope>

## 详细使用说明

<DocScope products="RDK-X3">

- RDK X3 使用说明请参考 [RDK X3 Model Zoo 使用说明](./rdk_x3_guide.md)

</DocScope>

<DocScope products="RDK-X5">

- RDK X5 使用说明请参考 [RDK X5 Model Zoo 使用说明](./rdk_x5_guide.md)

</DocScope>

<DocScope products="RDK-S100,RDK-S600">

- RDK S 系列使用说明请参考 [RDK S Model Zoo 使用说明](./rdk_s_guide.md)

</DocScope>

- 推理接口参考请查阅 [Model Zoo 推理接口参考](./infer_api_ref.md)
- 在线检索全部模型与实测性能请访问 [RDK Model Zoo 在线模型目录](https://d-robotics.github.io/rdk_model_zoo/)
