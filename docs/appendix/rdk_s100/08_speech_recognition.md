---
sidebar_position: 8
---

# 语音识别

## 测试条件

- 测试开发板：RDK S100。
- 测试集：AISHELL dev，300 条语音，40 位说话人。
- 输入：16 kHz WAV 经 FunASR 预处理后的 `[1, 400, 560]` fbank+LFR 特征。
- 模型流水线：Encoder INT16 HBM → Predictor INT16 HBM → CPU CIF → Decoder INT16 HBM → greedy decoding。

## 性能与精度

| 模型 | 指标 | Python `hbm_runtime` | C++ UCP | GitHub仓库 |
| --- | --- | ---: | ---: | --- |
| Paraformer-large-contextual | CER | 3.13% | 3.13% | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_s/samples/speech/paraformer) |
| Paraformer-large-contextual | Encoder | 33.63 ms | 33.15 ms | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_s/samples/speech/paraformer) |
| Paraformer-large-contextual | Predictor | 1.44 ms | 1.00 ms | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_s/samples/speech/paraformer) |
| Paraformer-large-contextual | CPU CIF | 3.41 ms | 0.38 ms | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_s/samples/speech/paraformer) |
| Paraformer-large-contextual | Decoder | 7.12 ms | 6.29 ms | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_s/samples/speech/paraformer) |
| Paraformer-large-contextual | 端到端 | 45.61 ms | 40.81 ms | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_s/samples/speech/paraformer) |
| Paraformer-large-contextual | RTF | 0.008 | 0.007 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_s/samples/speech/paraformer) |

端到端数据是 300 条语音的历史 HBM 流水线统计；当前 Python WAV 运行时会额外报告前处理耗时，因此不可直接与该端到端数据比较。
