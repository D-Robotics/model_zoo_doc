---
sidebar_position: 5
---

# LLM


## Test Conditions

- Development Board: RDK S600

- Operating Environment: Linux

## Metrics and Statistics

- model: Name of the model.

- BPU core num: Number of BPU (Brain Processing Unit) cores utilized during model execution.

- qtype: Quantization precision of the model.

- max context: Maximum cumulative token sequence length the model can handle.

- TTFT(ms): Time To First Token; the latency for generating the first token.

- Decode(TPS): Tokens Per Second; the generation rate during the decoding stage.

- memory(GB): Memory usage of the model.


## Measured Data

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

## Model Zoo S600 LLM Samples (Gemma4 / MiniCPM5-2B / OELLM Suite)

The Model Zoo `main` branch ships the following RDK S600 LLM/VLM samples (for all 32 official OELLM SDK 2.0.0 text/vision/ASR profiles, see [`samples/llm/oellm`](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/llm/oellm)):

| model | BPU core num | qtype | max context | TTFT (ms) | Decode (TPS) | memory (GB) | GitHub Repository |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | :--- |
| Gemma4-E2B (SDK 2.0.0) | 4 | w4 | 4096 | 74 | 61.2 | 9.9 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/llm/gemma4) |
| Gemma4-E2B (SDK 2.0.0) | 4 | w8 | 4096 | 79 | 47.8 | 13.5 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/llm/gemma4) |
| Gemma4-E4B (SDK 2.0.0) | 4 | w4 | 4096 | 137 | 38.3 | 15.4 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/llm/gemma4) |
| Gemma4-E4B (SDK 2.0.0) | 4 | w8 | 4096 | 139 | 27.9 | 15.5 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/llm/gemma4) |
| MiniCPM5-2B (native C++) | 4 | OELLM 2.0 beta | 4096 | 147.86 | 53.25 | - | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/llm/minicpm5-2b) |

> For additional S600 models (Qwen3 / Qwen3.5 / Qwen3-VL / InternVL / Whisper / native C++ Gemma4-E2B VLM), see [`samples/llm/`](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/llm) and the [Web Model Catalog](https://d-robotics.github.io/rdk_model_zoo/).
