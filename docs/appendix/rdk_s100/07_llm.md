---
sidebar_position: 7
---

# LLM



## 测试条件

- 测试开发板：RDK S100P。

- 性能数据获取：测试单条 prompt，取TTFT（首token延迟）和TPS（平均每秒 Token 数）指标。

- Python版本：Python3.10。

- 运行环境：Linux。

## 实测数据

### DeepSeek-R1-Distill-Qwen 模型

| model | platform | dtype | seqlen | max context | TTFt(ms) | TPS | memory(GB) |
|-------|----------|-------|--------|-------------|----------|-----|------------|
| DeepSeek-R1-Distill-Qwen-1.5B | S100P | q8 | 256 | 1024 | 109 | 27.08 | 1.7 |
| DeepSeek-R1-Distill-Qwen-1.5B | S100P | q4 | 256 | 1024 | 108 | 39.49 | 1.1 |
| DeepSeek-R1-Distill-Qwen-1.5B | S100P | q8 | 256 | 4096 | 226 | 23.80 | 1.8 |
| DeepSeek-R1-Distill-Qwen-1.5B | S100P | q4 | 256 | 4096 | 224 | 32.35 | 1.2 |
| DeepSeek-R1-Distill-Qwen-7B | S100P | q8 | 256 | 1024 | 544 | 6.76 | 7.4 |


### InternLM2 模型

| model | platform | dtype | seqlen | max context | TTFt(ms) | TPS | memory(GB) |
|-------|----------|-------|--------|-------------|----------|-----|------------|
| InternLM2-1.8B | S100P | q8 | 256 | 1024 | 132 | 23.83 | 1.8 |

### Qwen2.5 模型

| model | platform | dtype | seqlen | max context | TTFt(ms) | TPS | memory(GB) |
|-------|----------|-------|--------|-------------|----------|-----|------------|
| Qwen2.5-1.5B | S100P | q8 | 256 | 1024 | 130 | 24.04 | 1.8 |
| Qwen2.5-1.5B-Instruct | S100P | q8 | 256 | 1024 | 130 | 24.40 | 1.8 |
| Qwen2.5-7B | S100P | q8 | 256 | 1024 | 535 | 6.67 | 7.4 |
| Qwen2.5-7B-Instruct | S100P | q8 | 256 | 1024 | 534 | 6.75 | 7.4 |

### Qwen2.5-Omni 模型

| model | platform | dtype | seqlen | max context | TTFt(ms) | TPS | memory(GB) |
|-------|----------|-------|--------|-------------|----------|-----|------------|
| Qwen2.5-Omni-3B | S100P | q8 | 256 | 2048 | 285 | 14.03 | 5.5 |

### Model Zoo 原生 C++ 示例（MiniCPM5-2B / Gemma4-E2B VLM）

以下为 Model Zoo `main` 分支中面向 S100 / S100P 的原生 C++ 端侧大模型示例实测参考：

| model | platform | runtime / dtype | max context | Decode (TPS) | 备注 | GitHub仓库 |
| :--- | :--- | :--- | ---: | ---: | :--- | :--- |
| MiniCPM5-2B | S100 / S100P | OELLM 1.0.0 W8 | 2048 | ~12.1 / ~13.0 | 短请求实测；全量 WikiText2 PPL 17.92 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/llm/minicpm5-2b) |
| Gemma4-E2B VLM | S100P | 原生 C++（Vision + Text HBM） | 4096 | ~6.9 | 支持纯文本多轮与图文多模态对话 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/llm/gemma4-e2b) |