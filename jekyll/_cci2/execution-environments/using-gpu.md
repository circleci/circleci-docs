---
layout: classic-docs
title: "Using the GPU execution environment"
description: "Learn how to configure a your jobs to run in the GPU execution environment."
version:
- Cloud
- Server v3.x
- Server v2.x
---
[server-gpu]: {{ site.baseurl }}/2.0/gpu/

CircleCI Cloud has execution environments with Nvidia GPUs for specialized workloads. The hardware is Nvidia Tesla T4 Tensor Core GPU, and our GPU executors come in both Linux and Windows VMs.

{:.tab.gpublock.Linux}
```yaml
version: 2.1

jobs:
  build:
    machine:
      resource_class: gpu.nvidia.small
      image: ubuntu-1604-cuda-10.1:201909-23
    steps:
      - run: nvidia-smi
```

{:.tab.gpublock.Windows}
```yaml
version: 2.1

orbs:
  win: circleci/windows@2.3.0

jobs:
  build:
    executor: win/gpu-nvidia
    steps:
      - run: '&"C:\Program Files\NVIDIA Corporation\NVSMI\nvidia-smi.exe"'
```

Customers using CircleCI server v2.x can configure their VM service to use GPU-enabled machine executors. See [Running GPU Executors in Server]({{ site.baseurl }}/2.0/gpu/).
