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