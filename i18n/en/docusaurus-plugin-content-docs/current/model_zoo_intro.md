---
sidebar_position: 1
---

# 4.1.1 Model Zoo Overview

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## Product Introduction

**RDK Model Zoo** is D-Robotics' official collection of AI models and BPU (Brain Processing Unit) quantization workflows for the RDK series development boards. It helps developers run Vision, LLM / VLM, Speech, Embodied VLA, and Robotics models directly on BPU hardware with minimal setup.

Every sample follows a unified four-stage workflow from upstream weights to verified board deployment: **Export ONNX → OpenExplorer Quantization & Compilation (`.bin` / `.hbm`) → On-Board Python (`hbm_runtime`) / C++ Inference → Dataset Accuracy & Performance Evaluation**, complete with precompiled model download scripts, runnable inference code, and quantization guides.

:::tip

- **Web Model Catalog (Recommended)**: [https://d-robotics.github.io/rdk_model_zoo/](https://d-robotics.github.io/rdk_model_zoo/) — Filter models by board or task, compare measured FPS and accuracy, and copy ready-to-run commands
- **GitHub Repository**: [https://github.com/D-Robotics/rdk_model_zoo](https://github.com/D-Robotics/rdk_model_zoo)

:::

:::info

RDK Model Zoo is a community-driven open-source project. Contributions of new model samples, runtime optimizations, and documentation improvements are welcome via [GitHub Issues](https://github.com/D-Robotics/rdk_model_zoo/issues) and Pull Requests (PRs)!

:::

## Supported Hardware

| Board | Target ID | CPU | BPU (INT8) | Recommended OS | Manifests |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **[RDK X5](https://www.d-robotics.cc/rdkX5)** | `x5` | 8× Cortex-A55 | 1× Bayes-E, 10 TOPS | RDK OS >= 3.5.0 | [`docs/release/x5/`](https://github.com/D-Robotics/rdk_model_zoo/tree/main/docs/release/x5) |
| **[RDK S100](https://www.d-robotics.cc/rdkS100)** | `s100` | 6× Cortex-A78AE | 1× Nash-E, 80 TOPS | RDK OS >= 4.0.5 | [`docs/release/s/`](https://github.com/D-Robotics/rdk_model_zoo/tree/main/docs/release/s) |
| **[RDK S100P](https://www.d-robotics.cc/rdkS100)** | `s100p` | 6× Cortex-A78AE | 1× Nash-M, 128 TOPS | Matching OS image | [`docs/release/s/`](https://github.com/D-Robotics/rdk_model_zoo/tree/main/docs/release/s) |
| **[RDK S600](https://www.d-robotics.cc/rdkS600)** | `s600` | 18× Cortex-A78AE | 4× Nash-P, 560 TOPS | RDK OS >= 5.1.0 | [`docs/release/s/`](https://github.com/D-Robotics/rdk_model_zoo/tree/main/docs/release/s) |

## Branch and Hardware Platform Mapping

Starting from **v2.0.0 (unified source layout)**, RDK X5 and RDK S series (S100 / S100P / S600) share a single `samples/` directory on the stable delivery branch [`main`](https://github.com/D-Robotics/rdk_model_zoo/tree/main), using `--target` or `--platform` to select hardware. Legacy per-board branches and RDK X3 remain archived for compatibility:

| Target Hardware | Recommended Branch | Inference Interface | Entry Directory |
| :--- | :--- | :--- | :--- |
| **RDK X5 / S Series** | [`main`](https://github.com/D-Robotics/rdk_model_zoo/tree/main) / [`develop`](https://github.com/D-Robotics/rdk_model_zoo/tree/develop) | Python `hbm_runtime`; C++ `hb_dnn` / `hb_ucp` / OELLM | `samples/<domain>/<sample>/` |
| RDK X5 (legacy line) | [`rdk_x5`](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x5) | `hbm_runtime` / `hb_dnn` | `samples/vision/<sample>/` |
| RDK X5 (legacy demos) | [`rdk_x5_legacy`](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x5_legacy) | `bpu_infer_lib_x5` / `hobot_dnn.pyeasy_dnn` | `demos/<task>/<demo>/` |
| RDK S Series (legacy line) | [`rdk_s`](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_s) | `hbm_runtime` / `hb_ucp` | `samples/<domain>/<sample>/` |
| RDK X3 (archive) | [`rdk_x3`](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x3) | `bpu_infer_lib_x3` / `hobot_dnn.pyeasy_dnn` | `demos/<task>/<demo>/` |

## Covered Domains (Unified `main` Branch)

| Domain | Samples | Representative Models | Entry |
| :--- | :---: | :--- | :--- |
| **Vision** | 49 | Ultralytics YOLO (`YOLOv5u–YOLO26`), MobileSAM, EfficientSAM, Depth Anything V2, YOLO26 Depth, PaddleOCR, ByteTrack, CLIP, DINOv2, SigLIP, LiteAvatar, DiffusionDrive | [`samples/README.md`](https://github.com/D-Robotics/rdk_model_zoo/blob/main/samples/README.md) |
| **LLM / VLM** | 4 | Official OELLM S600 Suite (32 profiles), Gemma4 (E2B / E4B), Gemma4-E2B VLM (native C++), MiniCPM5-2B (native C++) | [`samples/llm/`](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/llm) |
| **Speech** | 3 | ASR (Wav2Vec2 / XLSR53), Paraformer, Keyword Spotting (KWS) | [`samples/speech/`](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/speech) |
| **Embodied VLA** | 2 | Upstream ACT & Pi0 robot manipulation policies (pinned Git submodules) | [`samples/vla/README.md`](https://github.com/D-Robotics/rdk_model_zoo/blob/main/samples/vla/README.md) |
| **Robotics** | 1 | HIMLoco legged locomotion policy (Unitree Go2) | [`samples/robotics/himloco`](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/robotics/himloco) |

The repository also ships [`skills/`](https://github.com/D-Robotics/rdk_model_zoo/tree/main/skills) (the RDK Model Zoo Agent Skills Pack), providing 7 reusable workflow skills for discovering, developing, validating, reviewing, and releasing BPU samples.

## Branch Descriptions

<DocScope products="RDK-X5">

### RDK X5: main (Recommended) and Legacy Branches

For RDK X5, use the unified release branch **`main`** (requires RDK OS >= 3.5.0):

- Shares the unified `samples/` tree with RDK S series; select hardware via `--target auto|x5` (or `--platform x5`)
- Python samples uniformly use `hbm_runtime` and follow the clean `preprocess → infer → postprocess` (`predict`) pattern; C++ samples use `hb_dnn`
- Covers 37 vision samples plus the legged locomotion policy `samples/robotics/himloco`
- Published artifact manifests and benchmarks live in `docs/release/x5/models.yaml` and `docs/release/x5/benchmarks.yaml`

Legacy branches:

- **`rdk_x5`**: Pre-unification RDK X5 delivery branch, retained for historical compatibility
- **`rdk_x5_legacy`**: Legacy RDK X5 demo archive (`demos/<task>/<demo>`), using `bpu_infer_lib_x5` or `hobot_dnn.pyeasy_dnn`

:::caution

`bpu_infer_lib_x5` and `hobot_dnn.pyeasy_dnn` have poor support for featuremap input models. For new projects and featuremap input models, use `hbm_runtime` on the `main` branch.

:::

</DocScope>

<DocScope products="RDK-X3">

### rdk_x3

Archive-only branch for RDK X3 devices (no longer an active adaptation target).

- Organized by `demos/<task>/<demo>`
- Includes image classification, object detection, instance segmentation, and OCR examples
- The inference interface is chosen based on each target directory's README (`bpu_infer_lib_x3` or board-builtin `hobot_dnn.pyeasy_dnn`)

:::caution

`bpu_infer_lib_x3` and `hobot_dnn.pyeasy_dnn` have poor support for featuremap input models.

:::

Some demos support Jupyter Notebook interactive execution.

</DocScope>

<DocScope products="RDK-S100,RDK-S600">

### RDK S Series: main (Recommended) and Legacy Branches

For RDK S100 / S100P / S600 boards, use the unified release branch **`main`** (RDK OS >= 4.0.5 recommended for S100; RDK OS >= 5.1.0 recommended for S600; match board image and runtime to published artifacts):

- Organized by domain across **Vision, LLM / VLM, Speech, and Embodied VLA**
- Vision and speech Python samples uniformly use `hbm_runtime` (backed by `libhbucp`, sharing the same Python API style as X5's `libdnn`) with `--target auto|s100|s100p|s600` (or `--platform`)
- C++ runtimes use UCP (`hb_ucp` / `hb_dnn`); on-device LLM / VLM samples ship native C++ and official OELLM SDK 2.0.0 launchers
- Published artifact manifests and benchmarks live in `docs/release/s/models.yaml` and `docs/release/s/benchmarks.yaml`

Legacy branch and archive repo:

- **`rdk_s`**: Pre-unification RDK S delivery branch, retained for historical compatibility
- **[RDK Model Zoo S](https://github.com/D-Robotics/rdk_model_zoo_s)**: Historical archive repository for early RDK S demos

</DocScope>

## Detailed Usage Guides

<DocScope products="RDK-X3">

- RDK X3 usage guide: [RDK X3 Model Zoo Usage Guide](./rdk_x3_guide.md)

</DocScope>

<DocScope products="RDK-X5">

- RDK X5 usage guide: [RDK X5 Model Zoo Usage Guide](./rdk_x5_guide.md)

</DocScope>

<DocScope products="RDK-S100,RDK-S600">

- RDK S Series usage guide: [RDK S Model Zoo Usage Guide](./rdk_s_guide.md)

</DocScope>

- Inference interface reference: [Model Zoo Inference Interface Reference](./infer_api_ref.md)
- Browse all models and measured benchmarks online: [RDK Model Zoo Web Model Catalog](https://d-robotics.github.io/rdk_model_zoo/)
