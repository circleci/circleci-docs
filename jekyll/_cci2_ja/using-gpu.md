---
layout: classic-docs
title: "GPU 実行環境の使用"
description: "GPU 実行環境で実行するジョブの設定方法を説明します。"
version:
  - クラウド
plan:
  - Scale
---

お客様のジョブは、GPU 実行環境で実行できます。これには、特別なワークロード用の Nvidia GPU にアクセスするために、Windows マシンか Linux 仮想マシンのいずれかを使用します。

Linux GPU 実行環境を使うには、Machine Executor を使い、GPU 対応イメージを指定します。 Machine Executor イメージの全一覧は、[CircleCI Developer Hub](https://circleci.com/developer/ja/images?imageType=machine) または[設定のリファレンス]({{site.baseurl}}/ja/configuration-reference#available-linux-gpu-images)を参照してください。

```yaml
version: 2.1

jobs:
  build:
    machine:
      image: ubuntu-2004-cuda-11.4:202110-01
    steps:
      - run: nvidia-smi
```

Windows GPU 実行環境を使うには、Windows Orb を使って組み込み GPU Executor を指定するか、Machine Executor を使って Windows GPU 対応イメージを指定するかのいずれかにできます。 詳細は、[Orb レジストリのページ](https://circleci.com/developer/ja/orbs/orb/circleci/windows)を参照してください。また、利用できる Machine Executor イメージの詳細は、[Developer Hub](https://circleci.com/developer/ja/images?imageType=machine) を参照してください。

{:.tab.gpublock.Windows_GPU_with_orb}
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

{:.tab.gpublock.Windows_GPU_with_machine}
```yaml
version: 2.1

jobs:
  build:
    machine: 
      image: windows-server-2019-nvidia:stable
    steps:
      - run: '&"C:\Program Files\NVIDIA Corporation\NVSMI\nvidia-smi.exe"'
```

## 利用可能なリソースクラス
{: #available-resource-classes }

お客様のプロジェクトと要件に適したリソースクラスを指定します。 これらのオプションのクレジット消費量の詳細は、[リソースクラスの料金と各種プランのページ](https://circleci.com/ja/product/features/resource-classes/)を参照してください。

### Linux GPU
{: linux-gpu}

```yaml
version: 2.1

jobs:
  build:
    machine:
      image: ubuntu-2004-cuda-11.4:202110-01
    resource_class: gpu.nvidia.small
    steps:
      - run: nvidia-smi
```

{% include snippets/ja/gpu-linux-resource-table.md %}

### Windows GPU
{: windows-gpu}

Windows の場合、現在 1 つのリソースクラスのオプションがあります。 これはデフォルトで使用されるため、お客様の設定で指定する必要はありません。

{% include snippets/ja/gpu-windows-resource-table.md %}

## CircleCI Server v2.x の GPU
CircleCI Server v2.x をお使いの場合、GPU 対応マシンを使うように VM サービスを設定できます。 詳細は、[サーバー GPU Executor]({{ site.baseurl }}/ja/gpu/) をご確認ください。
