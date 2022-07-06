---
layout: classic-docs
title: "GPU 実行環境の使用"
description: "GPU 実行環境で実行するジョブの設定方法を説明します。"
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

[server-gpu]: {{ site.baseurl }}/ja/2.0/gpu/

クラウド版 CircleCI には、特別なワークロード用に Nvidia GPU を備えた実行環境が用意されています。 ハードウェアは Nvidia Tesla T4 Tensor Core GPU であり、Linux VM と Windows VM で使用できます。

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
  win: circleci/windows@4.1.1

jobs:
  build:
    executor: win/server-2019-cuda
    steps:
      - run: '&"C:\Program Files\NVIDIA Corporation\NVSMI\nvidia-smi.exe"'
```

CircleCI Server v2.x では、VM サービスを設定することで GPU 対応の Machine Executor を使用できます。 詳細は、[サーバー GPU Executor]({{ site.baseurl }}/ja/2.0/gpu/) をご確認ください。
