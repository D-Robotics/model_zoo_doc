---
sidebar_position: 1
---

# Image Classification



| Device | Model | Input Size | Number of Classes | Single Thread Latency(ms) | Single Thread FPS | Double Thread Latency(ms) | Double Thread FPS | CPU Latency(ms) | Number of Parameters(M) | FLOPs(B) | GitHub Repository |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S100 | EfficientNet_lite0 | 224x224 | 1000 | 0.448 | 2107.8 | 0.591 | 4827.9 | - | 4.7 | - | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/EfficientNet) |
| S100 | EfficientNet_lite1 | 240x240 | 1000 | 0.489 | 1949.0 | 0.708 | 4086.5 | - | 5.4 | - | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/EfficientNet) |
| S100 | EfficientNet_lite2 | 260x260 | 1000 | 0.565 | - | 0.935 | - | - | 6.1 | - | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/EfficientNet) |
| S100 | EfficientNet_lite3 | 300x300 | 1000 | 0.668 | - | 1.249 | - | - | 8.2 | - | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/EfficientNet) |
| S100 | EfficientNet_lite4 | 380x380 | 1000 | 0.915 | - | 1.979 | - | - | 13.0 | - | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/EfficientNet) |
| S100 | MobileNetV1 | 224x224 | 1000 | - | - | - | - | - | 4.7 | - | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/MobileNet) |
| S100 | MobileNetV2 | 224x224 | 1000 | 0.405 | 2345.4 | 0.565 | 5026.5 | - | 3.5 | - | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/MobileNet) |
| S100 | ResNet152 | 224x224 | 1000 | 2.131 | 463.0 | 5.504 | 539.0 | - | - | - | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ResNet) |
| S100 | YOLO11l CLS | 640×640 | 80 | 1.21 | 805.52 | 1.73 | 1139.48 | 0.5 | 14.1 M | 50.4 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100 | YOLO11m CLS | 640×640 | 80 | 1.02 | 955.28 | 1.35 | 1445.18 | 0.5 | 11.6 M | 40.3 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100 | YOLO11n CLS | 640×640 | 80 | 0.53 | 1827.92 | 0.62 | 3115.65 | 0.5 | 2.8 M | 4.2 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100 | YOLO11s CLS | 640×640 | 80 | 0.68 | 1415.98 | 0.76 | 2553.99 | 0.5 | 6.7 M | 13.0 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100 | YOLO11x CLS | 640×640 | 80 | 1.97 | 501.49 | 3.23 | 612.29 | 0.5 | 29.6 M | 111.3 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100 | YOLO26l Cls | 224x224 | 1000 | 1.34 | 723.45 | 1.97 | 999.78 | - | 14.12 | 6.2 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo26) |
| S100 | YOLO26m Cls | 224x224 | 1000 | 1.13 | 853.03 | 1.56 | 1266.73 | - | 11.63 | 5.0 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo26) |
| S100 | YOLO26n Cls | 224x224 | 1000 | 0.56 | 1659.68 | 0.62 | 3112.09 | - | 2.81 | 0.5 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo26) |
| S100 | YOLO26s Cls | 224x224 | 1000 | 0.74 | 1293.15 | 0.83 | 2332.95 | - | 6.72 | 1.6 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo26) |
| S100 | YOLO26x Cls | 224x224 | 1000 | 2.08 | 471.88 | 3.46 | 573.27 | - | 29.64 | 13.7 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo26) |
| S100 | YOLOv8l CLS | 640×640 | 80 | 1.98 | 497.58 | 3.22 | 614.92 | 0.5 | 37.5 M | 99.7 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100 | YOLOv8m CLS | 640×640 | 80 | 1.00 | 970.04 | 1.31 | 1500.86 | 0.5 | 17.0 M | 42.7 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100 | YOLOv8n CLS | 640×640 | 80 | 0.49 | 1928.23 | 0.57 | 3399.86 | 0.5 | 2.7 M | 4.3 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100 | YOLOv8s CLS | 640×640 | 80 | 0.62 | 1562.83 | 0.71 | 2712.53 | 0.5 | 6.4 M | 13.5 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100 | YOLOv8x CLS | 640×640 | 80 | 2.77 | 357.03 | 4.81 | 412.60 | 0.5 | 57.4 M | 154.8 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100P | YOLO11l CLS | 640×640 | 80 | 0.90 | 1088.57 | 1.27 | 1544.42 | 0.5 | 14.1 M | 50.4 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100P | YOLO11m CLS | 640×640 | 80 | 0.78 | 1248.81 | 1.01 | 1935.47 | 0.5 | 11.6 M | 40.3 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100P | YOLO11n CLS | 640×640 | 80 | 0.40 | 2368.83 | 0.46 | 4151.62 | 0.5 | 2.8 M | 4.2 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100P | YOLO11s CLS | 640×640 | 80 | 0.52 | 1843.47 | 0.61 | 3128.03 | 0.5 | 6.7 M | 13.0 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100P | YOLO11x CLS | 640×640 | 80 | 1.45 | 676.30 | 2.34 | 844.07 | 0.5 | 29.6 M | 111.3 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100P | YOLOv8l CLS | 640×640 | 80 | 1.44 | 683.65 | 2.34 | 842.80 | 0.5 | 37.5 M | 99.7 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100P | YOLOv8m CLS | 640×640 | 80 | 0.80 | 1218.07 | 1.05 | 1876.12 | 0.5 | 17.0 M | 42.7 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100P | YOLOv8n CLS | 640×640 | 80 | 0.38 | 2470.91 | 0.45 | 4304.69 | 0.5 | 2.7 M | 4.3 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100P | YOLOv8s CLS | 640×640 | 80 | 0.49 | 1953.98 | 0.57 | 3364.17 | 0.5 | 6.4 M | 13.5 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
| S100P | YOLOv8x CLS | 640×640 | 80 | 2.09 | 470.34 | 3.55 | 559.63 | 0.5 | 57.4 M | 154.8 M | [GitHub](https://github.com/D-Robotics/rdk_model_zoo_s/tree/s100/samples/Vision/ultralytics_yolo) |
