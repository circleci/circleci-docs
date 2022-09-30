---
layout: classic-docs
title: "実行環境の概要"
description: "CircleCI の全実行環境の概要"
redirect_from: /ja/executor-types/
version:
  - クラウド
  - Server v4.x
  - Server v3.x
  - Server v2.x
---

CircleCI では複数の実行環境 (Docker、 Linux VM (仮想マシン)、macOS、Windows、GPU、Arm) を提供しています。 プロジェクトの設定ファイルで定義されたジョブはそれぞれ、Docker コンテナまたは仮想マシンのいずれかの隔離された実行環境で実行されます。

プロジェクトの設定ファイル内の各ジョブに **Executor** を割り当て、実行環境を指定します。 **Executor** により、基盤テクノロジー、つまりジョブの実行環境とプロジェクトに最適なイメージが定義されます。

[.circleci/config.yml]({{ site.baseurl }}/ja/configuration-reference/) で Executor タイプと適切なイメージを指定することで、ジョブごとに異なる Executor タイプを指定することも可能です。 *イメージ*は、実行環境を作成するための指示を含むパッケージ化されたシステムです。 *コンテナ*または*仮想マシン*は、イメージの実行インスタンスを指す用語です。 たとえば、下記のようにします。

- Docker イメージ (`docker`) を必要とするジョブには、Node.js または Python のイメージを使用します。 CircleCI Docker Hub にある[ビルド済みの CircleCI Docker イメージ]({{ site.baseurl }}/ja/circleci-images/)を使用すると、Docker について完全に理解していなくてもすぐに着手できます。 このイメージはフルオペレーティングシステムではないため、多くの場合ソフトウェアのビルドの効率化が図れます。
- Linux 仮想マシン (VM) の完全なイメージ (`machine`) を必要とするジョブには、[利用可能なマシンイメージのリスト]({{site.baseurl}}/ja/configuration-reference/#available-machine-images)に記載されている Ubuntu バージョンを使用します。
- macOS VM イメージ (`macos`) を必要とするジョブには、Xcode バージョン (12.5.1 など) を使用します。<!---!\[Executor Overview\]({{ site.baseurl }}/assets/img/docs/executor_types.png)--->## Docker
{: #docker }

**プレフィックスが「 circleci/ 」のレガシーイメージは、 2021 年 12 月 31 日に[サポートが終了](https://discuss.circleci.com/t/legacy-convenience-image-deprecation/41034)**しています。 ビルドを高速化するには、[次世代の CircleCI イメージ](https://circleci.com/blog/announcing-our-next-generation-convenience-images-smaller-faster-more-deterministic/)を使ってプロジェクトをアップグレードしてください。
{: class="alert alert-warning"}

Docker 実行環境を使用するには、`docker` Executor を使ってイメージを指定します。 CircleCI がビルドした CircleCI イメージの全リストは、[CircleCI Developer Hub](https://circleci.com/developer/ja/images?imageType=docker) を参照してください。

```yml
jobs:
  build: # name of your job
    docker: # executor type
      - image: cimg/base:stable # primary container will run the latest, production-ready base image
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference

      steps:
        # Commands run in the primary container
```

Docker 実行環境に関する詳細は、[Docker の使用]({{ site.baseurl }}/ja/using-docker)のページを参照してください。

## Linux VM
{: #linux-vm }

Linux VM 実行環境を使用するには、`machine` Executor を使って Linux イメージを指定します。 `machine`  イメージの全リストは、[CircleCI Developer Hub](https://circleci.com/developer/ja/images?imageType=machine) を参照してください。

{:.tab.machine.Cloud}
```yml
steps:
        # Linux 仮想マシン環境で実行するコマンド
```

{:.tab.machine.Server_3}
```yml
jobs:
  build: # name of your job
    machine: true # executor type
    steps:
      # Commands run in a Linux virtual machine environment
```

{:.tab.machine.Server_2}
```yml
jobs:
  build: # name of your job
    machine: true # executor type

    steps:
      # Commands run in a Linux virtual machine environment
```

Linux VM 実行環境に関する詳細は、[Linux 仮想マシンの使用]({{ site.baseurl }}/ja/using-linuxvm)のページを参照してください。

## macOS
{: #macos }

macOS 実行環境を使用するには、`macos` Executor を使って、`xcode` キーでイメージを指定します。 macOS イメージの全リストは、[CircleCI Developer Hub](https://circleci.com/developer/ja/machine/image/macos) をご覧ください。

サーバーインスタンスで macOS ビルドを実行するには、[セルフホストランナー]({{site.baseurl}}/runner-overview)を使う必要があります。
{: class="alert alert-info"}

```yml
jobs:
  build: # name of your job
    macos: # executor type
      xcode: 12.5.1

    steps:
      # Commands run in a macOS virtual machine environment
      # with Xcode 12.5.1 installed
```

macOS 実行環境に関する詳細は、[macOS の使用]({{site.baseurl}}/using-macos)のページを参照してください。

## Windows
{: #windows }

Windows 実行環境を使用するには、Windows Orb を使って Orb からデフォルトの Executor を指定するか、`machine` Executor を使用して Windows イメージを指定します。 `machine` イメージの全リストは、[CircleCI Developer Hub](https://circleci.com/developer/ja/images?imageType=machine) を参照してください。

{:.tab.windowsblock.Cloud_with_orb}
```yml
version: 2.1

orbs:
  win: circleci/windows@4.1.1 # The Windows orb gives you everything you need to start using the Windows executor

jobs:
  build: # name of your job
    executor: win/server-2022 # use one of the executors defined within the windows orb

    steps:
      # Commands are run in a Windows virtual machine environment
      - checkout
      - run: Write-Host 'Hello, Windows'
```

{:.tab.windowsblock.Cloud_with_machine}
```yml
version: 2.1 

jobs:
  build: # name of your job
    resource_class: 'windows.medium'
    machine:
      image: 'windows-server-2022-gui:current'   
      shell: 'powershell.exe -ExecutionPolicy Bypass'
    steps:
      # Commands are run in a Windows virtual machine environment
      - checkout
      - run: Write-Host 'Hello, Windows'
```

{:.tab.windowsblock.Server_3}
```yml
version: 2.1

jobs:
  build: # name of your job
    machine: # executor type
      image: windows-default
    resource_class: windows.medium
    steps:
      # Commands are run in a Windows virtual machine environment
      - checkout
      - run: Write-Host 'Hello, Windows'
```

{:.tab.windowsblock.Server_2}
```yaml
version: 2

jobs:
  build: # name of your job
    machine: # executor type
      image: windows-default
    resource_class: windows.medium
    steps:
      # Commands are run in a Windows virtual machine environment
      - checkout
      - run: Write-Host 'Hello, Windows'
```

Windows 実行環境に関する詳細は、[Windows 実行環境の使用]({{ site.baseurl }}/ja/using-windows)のページを参照してください。 Windows Orb で使用できるオプションの一覧は、[Developer Hub の Windows Orb の詳細ページ](https://circleci.com/ja/developer/orbs/orb/circleci/windows)でご確認ください。

## GPU
{: #gpu }

GPU 実行環境を使用するには、Windows Orb を使って Orb から GPU が有効化されている Executor を指定するか、`machine` Executor を使用して Linux イメージか GPU が有効化された Windows イメージを指定します。 `machine` イメージの全リストは、[CircleCI Developer Hub](https://circleci.com/developer/ja/images?imageType=machine) を参照してください。

サーバーインスタンスで GPU ビルドを実行することはできません。
{: class="alert alert-info"}

{:.tab.gpublock.Linux}
```yaml
version: 2.1

jobs:
  build:
    resource_class: gpu.nvidia.small
    machine:
      image: ubuntu-2004-cuda-11.4:202110-01
    resource_class: gpu.nvidia.small
    steps:
      - run: nvidia-smi
```

{:.tab.gpublock.Windows_without_orb}
```yaml
version: 2.1

jobs:
  build:
    machine:
      image: windows-server-2019-cuda
    resource_class: gpu.nvidia.small
    steps:
      - run: nvidia-smi
```

{:.tab.gpublock.Windows_with_orb}
```yaml
version: 2.1

orbs:
  win: circleci/windows@4.1.1

jobs:
  build:
    executor: win/server-2019-cuda
    steps:
      - run: 'Write-Host ''Hello, Windows'''
```

GPU 実行環境に関する詳細は、[GPU 実行環境の使用]({{site.baseurl}}/ja/using-gpu)のページを参照してください。

## Arm

Arm 実行環境を使用するには、`machine` Executor を下記に沿って使用し、`arm.medium` または `arm.large` のいずれかのリソースクラスを指定します。 `machine` イメージの全リストは、[CircleCI Developer Hub](https://circleci.com/developer/ja/images?imageType=machine) を参照してください。

{:.tab.armblock.Cloud}
```yaml
# .circleci/config.yml
version: 2.1

jobs:
  build-medium:
    machine:
      image: ubuntu-2004:202101-01
    resource_class: arm.medium
    steps:
      - run: uname -a
      - run: echo "Hello, Arm!"


  build-large:
    machine:
      image: ubuntu-2004:202101-01
    resource_class: arm.large
    steps:
      - run: uname -a
      - run: echo "Hello, Arm!"

workflows:
  build:
    jobs:
      - build-medium
      - build-large
```

{:.tab.armblock.Server}
```yaml
# .circleci/config.yml
version: 2.1

jobs:
  build-medium:
    machine:
      image: arm-default
    resource_class: arm.medium
    steps:
      - run: uname -a
      - run: echo "Hello, Arm!"

  build-large:
    machine:
      image: arm-default
    resource_class: arm.large
    steps:
      - run: uname -a
      - run: echo "Hello, Arm!"

workflows:
  build:
    jobs:
      - build-medium
      - build-large
```

Arm 実行環境に関する詳細は、[GPU 実行環境の使用]({{site.baseurl}}/ja/using-arm)のページを参照してください。

## セルフホストランナー
{: #self-hosted-runner }

Kubernetes を使用する[コンテナランナー]({{site.baseurl}}/ja/container-runner)、および Linux、Windows、macOS で[マシンランナー]({{site.baseurl}}/ja/runner-overview#machine-runner-use-case)を使用する仮想マシンで、セルフホストランナーを使用できます。

## 次のステップ
{: #next-steps }

* Docker 実行環境用の[ビルド済み CircleCI イメージ]({{ site.baseurl }}/ja/circleci-images/)に関する詳細をお読みください。
* CircleCI Academy の[ビルド環境コース](https://academy.circleci.com/build-environments-1?access_code=public-2021)を受講すると、Executor の選択と使用についてさらに詳しく学ぶことができます。
