---
sidebar_position: 5
---

# LLM


## 测试条件

- 测试开发板：RDK S600

- 运行环境：Linux

## 统计信息

- model：模型名。

- BPU core num：模型运行时占用的BPU核数量。

- qtype：模型的量化精度。

- max context：模型累计能处理的token序列最大长度。

- TTFT(ms)：首字生成时间。

- Decode(TPS)：Decode阶段每秒生成的token数。

- memory(GB)：模型的内存占用量。

## 实测数据

<table>
<colgroup>
<col style={{ width: '20%' }} />
<col style={{ width: '15%' }} />
<col style={{ width: '6%' }} />
<col style={{ width: '6%' }} />
<col style={{ width: '12%' }} />
<col style={{ width: '12%' }} />
<col style={{ width: '12%' }} />
<col style={{ width: '12%' }} />
</colgroup>
<thead>
<tr>
<th><strong>model</strong></th>
<th><strong>BPU<br/>core num</strong></th>
<th><strong>qtype</strong></th>
<th><strong>max context</strong></th>
<th><strong>TTFT<br/>(ms)</strong></th>
<th><strong>Decode<br/>(TPS)</strong></th>
<th><strong>memory<br/>(GB)</strong></th>
</tr>
</thead>
<tbody>

<tr>
<td>DeepSeek-R1-Distill-Qwen-1.5B</td>
<td>prefill 2<br/>decode 2</td>
<td style={{ whiteSpace: "nowrap" }}>prefill w4<br/>decode w4</td>
<td>4096</td>
<td>68.9</td>
<td>92.4</td>
<td>2.2</td>
</tr>

<tr>
<td>Qwen3-0.6B</td>
<td>prefill 4<br/>decode 4</td>
<td>prefill w8<br/>decode w8</td>
<td>4096</td>
<td>75.4</td>
<td>92.9</td>
<td>3.0</td>
</tr>

<tr>
<td>Qwen3-1.7B</td>
<td>prefill 4<br/>decode 4</td>
<td>prefill w4<br/>decode w4</td>
<td>4096</td>
<td>91.2</td>
<td>75.0</td>
<td>3.7</td>
</tr>

<tr>
<td>Qwen3-4B</td>
<td>prefill 4<br/>decode 4</td>
<td>prefill w4<br/>decode w4</td>
<td>4096</td>
<td>232.1</td>
<td>45.8</td>
<td>6.6</td>
</tr>

<tr>
<td>Qwen3-4B</td>
<td>prefill 4<br/>decode 4</td>
<td>prefill w8<br/>decode w8</td>
<td>4096</td>
<td>235.3</td>
<td>32.3</td>
<td>8.3</td>
</tr>

<tr>
<td>Qwen3-8B</td>
<td>prefill 4<br/>decode 4</td>
<td>prefill w4<br/>decode w4</td>
<td>4096</td>
<td>283.6</td>
<td>31.4</td>
<td>9.1</td>
</tr>

</tbody>
</table>

## Model Zoo S600 大模型示例（Gemma4 / MiniCPM5-2B / OELLM 套件）

Model Zoo `main` 分支已集成以下 RDK S600 端侧大模型与多模态示例（完整 32 个官方 OELLM SDK 2.0.0 文本/视觉/语音配置见 [`samples/llm/oellm`](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/llm/oellm)）：

| model | BPU core num | qtype | max context | TTFT (ms) | Decode (TPS) | memory (GB) | GitHub仓库 |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | :--- |
| Gemma4-E2B（SDK 2.0.0） | 4 | w4 | 4096 | 74 | 61.2 | 9.9 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/llm/gemma4) |
| Gemma4-E2B（SDK 2.0.0） | 4 | w8 | 4096 | 79 | 47.8 | 13.5 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/llm/gemma4) |
| Gemma4-E4B（SDK 2.0.0） | 4 | w4 | 4096 | 137 | 38.3 | 15.4 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/llm/gemma4) |
| Gemma4-E4B（SDK 2.0.0） | 4 | w8 | 4096 | 139 | 27.9 | 15.5 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/llm/gemma4) |
| MiniCPM5-2B（原生 C++） | 4 | OELLM 2.0 beta | 4096 | 147.86 | 53.25 | - | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/llm/minicpm5-2b) |

> 更多 S600 模型（如 Qwen3 / Qwen3.5 / Qwen3-VL / InternVL / Whisper / Gemma4-E2B 原生 C++ VLM）请查阅 [`samples/llm/`](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/llm) 与 [在线模型目录](https://d-robotics.github.io/rdk_model_zoo/)。

