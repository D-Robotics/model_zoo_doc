---
sidebar_position: 7
---

# Promptable Segmentation

The following measurements were collected on RDK X5 with `hrt_model_exec perf`. Encoder and decoder binaries are measured separately using the default frame count of 200.

| Model Component | Threads | Average Latency (ms) | FPS | GitHub Repository |
| --- | ---: | ---: | ---: | --- |
| EfficientSAM-Tiny Encoder | 1 | 1451.073 | 0.689135 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x5/samples/vision/efficient_sam) |
| EfficientSAM-Tiny Encoder | 8 | 1974.671 | 3.965380 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x5/samples/vision/efficient_sam) |
| EfficientSAM-Tiny Decoder | 1 | 86.532 | 11.553175 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x5/samples/vision/efficient_sam) |
| EfficientSAM-Tiny Decoder | 8 | 155.994 | 50.565231 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x5/samples/vision/efficient_sam) |
| MobileSAM Encoder | 1 | 1402.542 | 0.712979 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x5/samples/vision/mobile_sam) |
| MobileSAM Encoder | 8 | 2091.229 | 3.772934 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x5/samples/vision/mobile_sam) |
| MobileSAM Decoder | 1 | 96.198 | 10.393262 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x5/samples/vision/mobile_sam) |
| MobileSAM Decoder | 8 | 171.752 | 45.783301 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x5/samples/vision/mobile_sam) |
