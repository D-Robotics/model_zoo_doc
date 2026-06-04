---
sidebar_position: 3
---

# 实例分割

| Model | 输入尺寸 | 类别数 | 单线程延迟(ms) | 单线程FPS | 双线程延迟(ms) | 双线程FPS | CPU延迟(ms) | 参数量(M) | FLOPs(B) | PyTorch Box/Mask | Python Box/Mask | GitHub仓库 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| yolov8n-seg | 640x640 | 80 | 10.4 | 96.0 | 10.9 | 181.9 | 20 | 3.4 | 12.6 | 0.300/0.241 | 0.284/0.219 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x5/samples/vision/ultralytics_yolo) |
| yolov8s-seg | 640x640 | 80 | 19.6 | 50.9 | 29.0 | 68.7 | 20 | 11.8 | 42.6 | 0.380/0.299 | 0.371/0.287 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x5/samples/vision/ultralytics_yolo) |
| yolov8m-seg | 640x640 | 80 | 40.4 | 24.7 | 70.4 | 28.3 | 20 | 27.3 | 100.2 | 0.423/0.330 | 0.408/0.311 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x5/samples/vision/ultralytics_yolo) |
| yolov8l-seg | 640x640 | 80 | 74.9 | 13.3 | 139.4 | 14.3 | 20 | 46.0 | 220.5 | 0.444/0.344 | 0.431/0.332 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x5/samples/vision/ultralytics_yolo) |
| yolov8x-seg | 640x640 | 80 | 115.6 | 8.6 | 221.1 | 9.0 | 20 | 71.8 | 344.1 | 0.456/0.351 | 0.439/0.336 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x5/samples/vision/ultralytics_yolo) |
| yolov9c-seg | 640x640 | 80 | 55.9 | 17.9 | 101.3 | 19.7 | 20 | 27.7 | 158.0 | 0.446/0.345 | 0.423/0.321 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x5/samples/vision/ultralytics_yolo) |
| yolov9e-seg | 640x640 | 80 | 135.4 | 7.4 | 260.0 | 7.7 | 20 | 59.7 | 244.8 | 0.471/0.118 | 0.332/0.268 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x5/samples/vision/ultralytics_yolo) |
| yolo11n-seg | 640x640 | 80 | 11.7 | 85.6 | 13.0 | 152.6 | 20 | 2.9 | 10.4 | 0.319/0.258 | 0.296/0.227 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x5/samples/vision/ultralytics_yolo) |
| yolo11s-seg | 640x640 | 80 | 21.7 | 46.0 | 33.1 | 60.3 | 20 | 10.1 | 35.5 | 0.388/0.306 | 0.377/0.291 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x5/samples/vision/ultralytics_yolo) |
| yolo11m-seg | 640x640 | 80 | 50.3 | 19.9 | 90.2 | 22.1 | 20 | 22.4 | 123.3 | 0.436/0.340 | 0.422/0.322 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x5/samples/vision/ultralytics_yolo) |
| yolo11l-seg | 640x640 | 80 | 60.6 | 16.5 | 110.8 | 18.0 | 20 | 27.6 | 142.2 | 0.452/0.350 | 0.432/0.328 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x5/samples/vision/ultralytics_yolo) |
| yolo11x-seg | 640x640 | 80 | 129.1 | 7.7 | 247.4 | 8.1 | 20 | 62.1 | 319.0 | 0.466/0.358 | 0.447/0.338 | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x5/samples/vision/ultralytics_yolo) |
| yolo26n-seg | 640x640 | 80 | 15.5 | 64.3 | 22.8 | 87.6 | - | - | - | - | 0.285(mask) | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x5/samples/vision/ultralytics_yolo26) |
| YOLOE-11s-Seg-PF | 640x640 | 4585 (open-vocabulary) | 142.9 | 7.0 | 149.5 | 13.3 | - | - | - | - | - | [GitHub](https://github.com/D-Robotics/rdk_model_zoo/tree/rdk_x5/samples/vision/yoloe) |
