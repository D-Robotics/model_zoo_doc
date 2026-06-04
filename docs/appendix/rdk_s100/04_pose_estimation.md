---
sidebar_position: 4
---

# 姿态估计



| Device | Model | 输入尺寸 | 类别数 | 单线程延迟(ms) | 单线程FPS | 双线程延迟(ms) | 双线程FPS | CPU延迟(ms) | 参数量(M) | FLOPs(B) | GitHub仓库 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S100 | YOLO11l Pose | 640×640 | 80 | 7.23 | 136.91 | 13.48 | 147.21 | 1.0 | 26.2 M | 90.7 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100 | YOLO11m Pose | 640×640 | 80 | 5.89 | 167.50 | 10.79 | 183.34 | 1.0 | 20.9 M | 71.7 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100 | YOLO11n Pose | 640×640 | 80 | 1.69 | 568.00 | 2.48 | 780.47 | 1.0 | 2.9 M | 7.6 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100 | YOLO11s Pose | 640×640 | 80 | 2.76 | 354.06 | 4.62 | 424.92 | 1.0 | 9.9 M | 23.2 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100 | YOLO11x Pose | 640×640 | 80 | 13.61 | 73.02 | 26.16 | 76.04 | 1.0 | 58.8 M | 203.3 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100 | YOLO26l Pose | 640x640 | 1 | 7.75 | 124.84 | 14.30 | 137.49 | - | 28.63 | 103.6 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo26) |
| S100 | YOLO26m Pose | 640x640 | 1 | 6.42 | 149.73 | 11.68 | 167.90 | - | 24.22 | 85.2 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo26) |
| S100 | YOLO26n Pose | 640x640 | 1 | 1.81 | 486.37 | 2.59 | 713.83 | - | 3.68 | 10.3 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo26) |
| S100 | YOLO26s Pose | 640x640 | 1 | 3.07 | 300.62 | 5.03 | 380.99 | - | 11.81 | 29.2 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo26) |
| S100 | YOLO26x Pose | 640x640 | 1 | 14.45 | 67.87 | 27.60 | 71.79 | - | 62.73 | 225.3 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo26) |
| S100 | YOLOv8l Pose | 640×640 | 80 | 10.31 | 96.20 | 19.55 | 101.60 | 1.0 | 44.4 M | 168.6 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100 | YOLOv8m Pose | 640×640 | 80 | 5.47 | 180.46 | 9.92 | 199.50 | 1.0 | 26.4 M | 81.0 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100 | YOLOv8n Pose | 640×640 | 80 | 1.62 | 587.59 | 2.31 | 837.95 | 1.0 | 3.3 M | 9.2 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100 | YOLOv8s Pose | 640×640 | 80 | 2.83 | 344.35 | 4.71 | 417.72 | 1.0 | 11.6 M | 30.2 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100 | YOLOv8x Pose | 640×640 | 80 | 16.07 | 61.88 | 31.01 | 64.14 | 1.0 | 69.4 M | 263.2 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100P | YOLO11l Pose | 640×640 | 80 | 4.87 | 202.29 | 8.99 | 220.09 | 1.0 | 26.2 M | 90.7 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100P | YOLO11m Pose | 640×640 | 80 | 4.04 | 241.82 | 7.32 | 269.96 | 1.0 | 20.9 M | 71.7 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100P | YOLO11n Pose | 640×640 | 80 | 1.23 | 770.10 | 1.74 | 1097.27 | 1.0 | 2.9 M | 7.6 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100P | YOLO11s Pose | 640×640 | 80 | 1.92 | 501.66 | 3.11 | 627.29 | 1.0 | 9.9 M | 23.2 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100P | YOLO11x Pose | 640×640 | 80 | 9.15 | 108.13 | 17.45 | 113.64 | 1.0 | 58.8 M | 203.3 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100P | YOLOv8l Pose | 640×640 | 80 | 6.92 | 142.52 | 12.99 | 152.18 | 1.0 | 44.4 M | 168.6 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100P | YOLOv8m Pose | 640×640 | 80 | 3.65 | 267.74 | 6.54 | 301.30 | 1.0 | 26.4 M | 81.0 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100P | YOLOv8n Pose | 640×640 | 80 | 1.14 | 822.46 | 1.58 | 1206.58 | 1.0 | 3.3 M | 9.2 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100P | YOLOv8s Pose | 640×640 | 80 | 1.97 | 486.85 | 3.23 | 606.41 | 1.0 | 11.6 M | 30.2 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100P | YOLOv8x Pose | 640×640 | 80 | 10.67 | 92.89 | 20.48 | 96.97 | 1.0 | 69.4 M | 263.2 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
