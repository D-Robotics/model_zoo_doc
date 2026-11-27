---
sidebar_position: 6
---

# Depth Estimation



| Device | Model | Input Size | Number of Threads | Average Latency(ms) | FPS | GitHub Repository |
| --- | --- | --- | --- | --- | --- | --- |
| S100 | DepthAnythingV2 | 518×518 | 1 | 137.38 | 7.27 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/vision/depth_anything_v2) |
| S100 | DepthAnythingV2 | 518×518 | 2 | 263.74 | 7.54 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/vision/depth_anything_v2) |
| S100 | DepthAnythingV2 | 518×518 | 4 | 521.90 | 7.54 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/vision/depth_anything_v2) |
| S100 | DepthAnythingV2 | 518×518 | 8 | 1020.35 | 7.54 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/main/samples/vision/depth_anything_v2) |

## YOLO26 Depth (S100 / S100P)

Single-thread measured latency for `samples/vision/yolo26_depth` on RDK S100 / S100P (`n/s/m`: NV12 profile; `l/x`: lite profile):

| Device | Model | Threads | 1-Thread Latency (ms) | GitHub Repository |
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
