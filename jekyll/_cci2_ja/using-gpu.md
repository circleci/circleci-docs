---
layout: classic-docs
title: "Using the GPU execution environment"
description: "Learn how to configure a your jobs to run in the GPU execution environment."
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

[server-gpu]: {{ site.baseurl }}/2.0/gpu/

クラウド版 CircleCI には、特別なワークロード用に Nvidia GPU を備えた実行環境が用意されています。 ハードウェアは Nvidia Tesla T4 Tensor Core GPU であり、Linux VM と Windows VM の Executor で使用できます。

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
