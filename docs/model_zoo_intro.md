---
sidebar_position: 1
---

# 4.1.1 Model Zoo 概述

## 产品介绍

RDK Model Zoo 是 D-Robotics（地瓜机器人）面向 RDK 系列开发板提供的 BPU（智能计算架构 Brain Processing Unit）模型示例与工具集合，面向模型部署和智能应用开发，用于帮助开发者快速上手 BPU、跑通模型推理流程。

仓库中收录了覆盖图像分类、目标检测、实例分割、姿态估计、OCR、多模态等多个智能应用领域的 BPU 可运行模型，并提供从 **原始模型（PyTorch/ONNX）→ 定点量化转换 → 推理运行 → 结果解析 → 示例验证** 的完整参考实现，帮助用户以最小成本理解并使用 BPU 能力。

:::tip

Model Zoo GitHub 仓库地址：https://github.com/D-Robotics/rdk_model_zoo

:::

:::info

RDK Model Zoo 是一个社区开源共建项目。我们非常欢迎开发者贡献新的模型示例、优化现有代码或完善文档。如果您有任何改进建议，欢迎通过 Pull Request (PR) 的方式参与共建！

:::

## 分支与硬件平台对应关系

RDK X5 和 RDK S 系列（S100 / S100P / S600）共用 `main` 分支统一的 `samples/` 目录：在目标板卡上拉取 `main` 分支后，按每个 sample README 的说明用 `--target` / `--platform` 参数选择板卡目标（`x5` / `s100` / `s100p` / `s600`），不同目标对应的模型格式、下载地址和输入协议由 sample 内的平台清单决定。

| 目标硬件 | 代码位置 | Python 推理接口 | 使用入口 |
| :--- | :--- | :--- | :--- |
| RDK X5 | [`main`](https://github.com/D-Robotics/rdk_model_zoo/tree/main) 分支 `samples/` 目录，target `x5` | `hbm_runtime` | `samples/vision/<sample>/README.md` |
| RDK S100 | [`main`](https://github.com/D-Robotics/rdk_model_zoo/tree/main) 分支 `samples/` 目录，target `s100` | `hbm_runtime` | `samples/<domain>/<sample>/README.md` |
| RDK S100P | [`main`](https://github.com/D-Robotics/rdk_model_zoo/tree/main) 分支 `samples/` 目录，target `s100p` | `hbm_runtime` | `samples/<domain>/<sample>/README.md` |
| RDK S600 | [`main`](https://github.com/D-Robotics/rdk_model_zoo/tree/main) 分支 `samples/` 目录，target `s600` | `hbm_runtime` | `samples/<domain>/<sample>/README.md` |
| RDK X3 | [`rdk_x3`](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x3) 分支 | `bpu_infer_lib_x3` / `hobot_dnn.pyeasy_dnn` | `demos/<task>/<demo>/README.md` |

## 分支说明

`main` 是交付分支（默认分支），`develop` 是统一开发分支；`rdk_x5`、`rdk_s` 为保留的历史板卡交付分支，`rdk_x3` 仅作历史归档。

<DocScope versions=">=3.5.0" products="RDK X5">

### main（RDK X5）

RDK X5 从 `main` 分支的统一 `samples/` 目录获取示例，需系统版本 RDK OS >= 3.5.0。

- Python sample 使用 `hbm_runtime` 接口，并以 `--target x5` / `--platform x5` 选择板卡目标；C++ sample 使用 `hb_dnn` 接口
- 目录按 `samples/<domain>/<sample>` 规范化组织
- 每个 sample 包含模型下载、转换配置、Python/C++ runtime、评测工具和测试数据

### 历史分支与归档

- [`rdk_x5`](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x5)：RDK X5 历史交付分支，仅用于查询历史版本
- [`rdk_x5_legacy`](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x5_legacy)：RDK X5 历史 demo 归档（`demos/<task>/<demo>`；旧接口对 featuremap 输入模型支持不佳，新项目请使用 `main` 分支）

</DocScope>

<DocScope versions=">=3.0.0" products="RDK X3">
### rdk_x3

RDK X3 设备专用归档分支。

- 目录按 `demos/<task>/<demo>` 组织
- 包含图像分类、目标检测、实例分割等示例
- 推理接口按目标目录 README 选择，包含 `bpu_infer_lib_x3` 与板端自带的 `hobot_dnn.pyeasy_dnn`

:::caution

`bpu_infer_lib_x3` 和 `hobot_dnn.pyeasy_dnn` 对 featuremap 输入模型支持不佳。

:::

部分 demo 支持 Jupyter Notebook 交互式体验。

</DocScope>

<DocScope versions=">=4.0.5" products="RDK-S100,RDK-S600">
### main（RDK S 系列）

RDK S100 / S100P / S600 与 RDK X5 共用 `main` 分支的统一 `samples/` 目录，需系统版本 RDK OS >= 4.0.5。

- Python sample 使用 `hbm_runtime` 接口，并以 `--target s100` / `--target s100p` / `--target s600` 选择板卡目标
- 按领域组织 sample，包含视觉、语音和机器人示例
- `hbm_runtime` 与 RDK X5 同名，底层依赖不同：S 系列基于 `libhbucp`，X5 基于 `libdnn`
- RDK S 系列的历史 demo 保留在 [RDK Model Zoo S](https://github.com/d-Robotics/rdk_model_zoo_s) 仓库

</DocScope>

## 详细使用说明

<DocScope products="RDK-X3">

- RDK X3 使用说明请参考 [2 RDK X3 Model Zoo 使用说明](./rdk_x3_guide.md)

</DocScope>

<DocScope products="RDK-X5">

- RDK X5 使用说明请参考 [2 RDK X5 Model Zoo 使用说明](./rdk_x5_guide.md)

</DocScope>

<DocScope products="RDK-S100,RDK-S600">

- RDK S 系列使用说明请参考 [2 RDK S Model Zoo 使用说明](./rdk_s_guide.md)

</DocScope>

- 推理接口参考请查阅 [3 推理接口参考](./infer_api_ref.md)
