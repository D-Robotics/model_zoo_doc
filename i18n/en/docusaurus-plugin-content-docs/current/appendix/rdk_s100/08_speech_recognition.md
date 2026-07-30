---
sidebar_position: 8
---

# Speech Recognition

## Test Conditions

- Board: RDK S100.
- Dataset: AISHELL dev, 300 utterances from 40 speakers.
- Input: 16 kHz WAV preprocessed by FunASR into `[1, 400, 560]` fbank+LFR features.
- Pipeline: Encoder INT16 HBM → Predictor INT16 HBM → CPU CIF → Decoder INT16 HBM → greedy decoding.

## Performance and Accuracy

| Model | Metric | Python `hbm_runtime` | C++ UCP | GitHub Repository |
| --- | --- | ---: | ---: | --- |
| Paraformer-large-contextual | CER | 3.13% | 3.13% | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_s/samples/speech/paraformer) |
| Paraformer-large-contextual | Encoder | 33.63 ms | 33.15 ms | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_s/samples/speech/paraformer) |
| Paraformer-large-contextual | Predictor | 1.44 ms | 1.00 ms | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_s/samples/speech/paraformer) |
| Paraformer-large-contextual | CPU CIF | 3.41 ms | 0.38 ms | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_s/samples/speech/paraformer) |
| Paraformer-large-contextual | End-to-end | 45.61 ms | 40.81 ms | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_s/samples/speech/paraformer) |
| Paraformer-large-contextual | RTF | 0.008 | 0.007 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_s/samples/speech/paraformer) |

The end-to-end figures are historical HBM-pipeline measurements over 300 utterances. The current Python WAV runtime additionally reports preprocessing time, so its end-to-end value is not directly comparable.
