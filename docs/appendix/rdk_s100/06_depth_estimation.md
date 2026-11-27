---
sidebar_position: 6
---

# 深度估计



| Device | Model | 输入尺寸 | 线程数 | 平均延迟(ms) | FPS | GitHub仓库 |
| --- | --- | --- | --- | --- | --- | --- |
| S100 | DepthAnythingV2 | 518×518 | 1 | 137.38 | 7.27 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/vision/depth_anything_v2) |
| S100 | DepthAnythingV2 | 518×518 | 2 | 263.74 | 7.54 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/vision/depth_anything_v2) |
| S100 | DepthAnythingV2 | 518×518 | 4 | 521.90 | 7.54 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/vision/depth_anything_v2) |
| S100 | DepthAnythingV2 | 518×518 | 8 | 1020.35 | 7.54 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/vision/depth_anything_v2) |

## YOLO26 Depth（S100 / S100P）

以下为 `samples/vision/yolo26_depth` 在 RDK S100 / S100P 上的单线程纯模型延迟实测（`n/s/m` 为 NV12 配置，`l/x` 为 lite 配置）：

| Device | Model | 线程数 | 单线程延迟(ms) | GitHub仓库 |
| --- | --- | ---: | ---: | --- |
| S100 | YOLO26n Depth (nv12) | 1 | 3.165 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/vision/yolo26_depth) |
| S100 | YOLO26s Depth (nv12) | 1 | 4.490 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/vision/yolo26_depth) |
| S100 | YOLO26m Depth (nv12) | 1 | 8.246 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/vision/yolo26_depth) |
| S100 | YOLO26l Depth (lite) | 1 | 9.790 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/vision/yolo26_depth) |
| S100 | YOLO26x Depth (lite) | 1 | 19.059 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/vision/yolo26_depth) |
| S100P | YOLO26n Depth (nv12) | 1 | 2.254 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/vision/yolo26_depth) |
| S100P | YOLO26s Depth (nv12) | 1 | 3.244 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/vision/yolo26_depth) |
| S100P | YOLO26m Depth (nv12) | 1 | 5.986 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/vision/yolo26_depth) |
| S100P | YOLO26l Depth (lite) | 1 | 7.090 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/vision/yolo26_depth) |
| S100P | YOLO26x Depth (lite) | 1 | 12.853 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/vision/yolo26_depth) |
