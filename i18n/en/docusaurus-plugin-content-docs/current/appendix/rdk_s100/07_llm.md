---
sidebar_position: 7
---

# LLM



## Test Conditions

- Test Development Board: S100P.

- Performance Data Acquisition: Test a single prompt, capturing TTFT (Time To First Token) and TPS (Tokens Per Second) metrics.

- Python Version: Python 3.10.

- Runtime Environment: Linux.

## Measured Data

### DeepSeek-R1-Distill-Qwen Models

| model | platform | dtype | seqlen | max context | TTFT(ms) | TPS | memory(GB) |
|-------|----------|-------|--------|-------------|----------|-----|------------|
| DeepSeek-R1-Distill-Qwen-1.5B | S100P | q8 | 256 | 1024 | 109 | 27.08 | 1.7 |
| DeepSeek-R1-Distill-Qwen-1.5B | S100P | q4 | 256 | 1024 | 108 | 39.49 | 1.1 |
| DeepSeek-R1-Distill-Qwen-1.5B | S100P | q8 | 256 | 4096 | 226 | 23.80 | 1.8 |
| DeepSeek-R1-Distill-Qwen-1.5B | S100P | q4 | 256 | 4096 | 224 | 32.35 | 1.2 |
| DeepSeek-R1-Distill-Qwen-7B | S100P | q8 | 256 | 1024 | 544 | 6.76 | 7.4 |

### InternLM2 Models

| model | platform | dtype | seqlen | max context | TTFT(ms) | TPS | memory(GB) |
|-------|----------|-------|--------|-------------|----------|-----|------------|
| InternLM2-1.8B | S100P | q8 | 256 | 1024 | 132 | 23.83 | 1.8 |

### Qwen2.5 Models

| model | platform | dtype | seqlen | max context | TTFT(ms) | TPS | memory(GB) |
|-------|----------|-------|--------|-------------|----------|-----|------------|
| Qwen2.5-1.5B | S100P | q8 | 256 | 1024 | 130 | 24.04 | 1.8 |
| Qwen2.5-1.5B-Instruct | S100P | q8 | 256 | 1024 | 130 | 24.40 | 1.8 |
| Qwen2.5-7B | S100P | q8 | 256 | 1024 | 535 | 6.67 | 7.4 |
| Qwen2.5-7B-Instruct | S100P | q8 | 256 | 1024 | 534 | 6.75 | 7.4 |

### Qwen2.5-Omni Models

| model | platform | dtype | seqlen | max context | TTFT(ms) | TPS | memory(GB) |
|-------|----------|-------|--------|-------------|----------|-----|------------|
| Qwen2.5-Omni-3B | S100P | q8 | 256 | 2048 | 285 | 14.03 | 5.5 |

### Model Zoo Native C++ Samples (MiniCPM5-2B / Gemma4-E2B VLM)

Measured reference data for native C++ on-device LLM/VLM samples in the Model Zoo `main` branch on S100 / S100P:

| model | platform | runtime / dtype | max context | Decode (TPS) | Notes | GitHub Repository |
| :--- | :--- | :--- | ---: | ---: | :--- | :--- |
| MiniCPM5-2B | S100 / S100P | OELLM 1.0.0 W8 | 2048 | ~12.1 / ~13.0 | Short-prompt decode; full WikiText2 PPL 17.92 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/llm/minicpm5-2b) |
| Gemma4-E2B VLM | S100P | Native C++ (Vision + Text HBM) | 4096 | ~6.9 | Text multi-turn & image-text multimodal chat | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/llm/gemma4-e2b) |