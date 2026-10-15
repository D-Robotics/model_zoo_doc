---
sidebar_position: 1
---

# 4.1.1 Model Zoo Overview

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## Product Introduction

RDK Model Zoo is a collection of BPU (Brain Processing Unit) model examples and tools provided by D-Robotics for the RDK series development boards, designed for model deployment and intelligent application development, helping developers quickly get started with BPU and run through the model inference workflow.

The repository includes BPU-runnable models covering multiple intelligent application domains such as image classification, object detection, instance segmentation, pose estimation, OCR, and multimodal, and provides complete reference implementations from **original model (PyTorch/ONNX) → quantization conversion → inference execution → result parsing → example verification**, helping users understand and use BPU capabilities at minimal cost.

:::tip

Model Zoo GitHub repository: https://github.com/D-Robotics/rdk_model_zoo

:::

:::info

RDK Model Zoo is a community-driven open-source project. We highly welcome developers to contribute new model examples, optimize existing code, or improve documentation. If you have any suggestions for improvement, please join us by submitting a Pull Request (PR)!

:::

## Branch and Hardware Platform Mapping

RDK X5 and the RDK S series (S100 / S100P / S600) share the unified `samples/` directory on the `main` branch: after pulling `main` on the target board, select the board target with the `--target` / `--platform` arguments (`x5` / `s100` / `s100p` / `s600`) as described in each sample's README. The model format, download URLs and input protocol for each target are determined by the platform manifests inside each sample.

| Target Hardware | Code Location | Python Inference Interface | Entry Point |
| :--- | :--- | :--- | :--- |
| RDK X5 | [`main`](https://github.com/D-Robotics/rdk_model_zoo/tree/main) branch `samples/` tree, target `x5` | `hbm_runtime` | `samples/vision/<sample>/README.md` |
| RDK S100 | [`main`](https://github.com/D-Robotics/rdk_model_zoo/tree/main) branch `samples/` tree, target `s100` | `hbm_runtime` | `samples/<domain>/<sample>/README.md` |
| RDK S100P | [`main`](https://github.com/D-Robotics/rdk_model_zoo/tree/main) branch `samples/` tree, target `s100p` | `hbm_runtime` | `samples/<domain>/<sample>/README.md` |
| RDK S600 | [`main`](https://github.com/D-Robotics/rdk_model_zoo/tree/main) branch `samples/` tree, target `s600` | `hbm_runtime` | `samples/<domain>/<sample>/README.md` |
| RDK X3 | [`rdk_x3`](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x3) branch | `bpu_infer_lib_x3` / `hobot_dnn.pyeasy_dnn` | `demos/<task>/<demo>/README.md` |

## Branch Descriptions

`main` is the delivery branch (default), `develop` is the unified development branch; `rdk_x5` and `rdk_s` are preserved historical per-board delivery branches, and `rdk_x3` is archived for history only.

<DocScope versions=">=3.5.0" products="RDK X5">

### main (RDK X5)

RDK X5 samples come from the unified `samples/` directory on the `main` branch, requiring system version RDK OS >= 3.5.0.

- Python samples use the `hbm_runtime` interface and select the board target with `--target x5` / `--platform x5`; C++ samples use the `hb_dnn` interface
- Directories are organized in the normalized `samples/<domain>/<sample>` layout
- Each sample includes model download, conversion configs, Python/C++ runtime, evaluation tools, and test data

### Historical Branches and Archives

- [`rdk_x5`](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x5): historical RDK X5 delivery branch, kept for querying historical versions only
- [`rdk_x5_legacy`](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x5_legacy): RDK X5 legacy demo archive (`demos/<task>/<demo>`; the legacy interfaces have poor support for featuremap input models — use the `main` branch for new projects)

</DocScope>

<DocScope versions=">=3.0.0" products="RDK X3">
### rdk_x3

Dedicated archive branch for RDK X3 devices.

- Organized by `demos/<task>/<demo>`
- Includes image classification, object detection, and instance segmentation examples
- The inference interface is chosen based on the target directory README, including `bpu_infer_lib_x3` and the board-builtin `hobot_dnn.pyeasy_dnn`

:::caution

`bpu_infer_lib_x3` and `hobot_dnn.pyeasy_dnn` have poor support for featuremap input models.

:::

Some demos support Jupyter Notebook interactive experience.

</DocScope>

<DocScope versions=">=4.0.5" products="RDK-S100,RDK-S600">
### main (RDK S Series)

RDK S100 / S100P / S600 share the unified `samples/` directory on the `main` branch with RDK X5, requiring system version RDK OS >= 4.0.5.

- Python samples use the `hbm_runtime` interface and select the board target with `--target s100` / `--target s100p` / `--target s600`
- Samples are organized by domain, including vision, speech, and robotics examples
- `hbm_runtime` shares its name with RDK X5 but relies on a different underlying library: the S series is based on `libhbucp`, X5 is based on `libdnn`
- Legacy demos for the RDK S series are retained in the [RDK Model Zoo S](https://github.com/d-Robotics/rdk_model_zoo_s) repository

</DocScope>

## Detailed Usage Guides

<DocScope products="RDK-X3">

- RDK X3 usage guide: [2 RDK X3 Model Zoo Usage Guide](./rdk_x3_guide.md)

</DocScope>

<DocScope products="RDK-X5">

- RDK X5 usage guide: [2 RDK X5 Model Zoo Usage Guide](./rdk_x5_guide.md)

</DocScope>

<DocScope products="RDK-S100,RDK-S600">

- RDK S Series usage guide: [2 RDK S Model Zoo Usage Guide](./rdk_s_guide.md)

</DocScope>

- Inference interface reference: [3 Inference Interface Reference](./infer_api_ref.md)
