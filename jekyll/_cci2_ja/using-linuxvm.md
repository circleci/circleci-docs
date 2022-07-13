---
layout: classic-docs
title: "Linux VM 実行環境の使用"
description: "Machine Executor を使用して、ジョブを Linux VM 実行環境で実行するように設定する方法を説明します。"
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

ジョブは、Machine Executor を使用して Linux イメージを指定することで、Linux VM (仮想マシン) 実行環境で実行できます。 Machine Executor を使うと、ジョブは専用の一時的な仮想マシン上で実行されます。

Machine Executor を使用すると、アプリケーションは OS のリソースにフルアクセスでき、ユーザーはジョブ環境を完全に制御できます。 この制御は、ネットワークインターフェイスのリッスンなどの目的でネットワークスタックへのフルアクセスが必要な場合や、`sysctl` コマンドを使用してシステムを変更する必要がある場合に便利です。

To use the machine executor, use the [`machine` key]({{ site.baseurl }}/configuration-reference/#machine) in your job configuration and specify an image:

{:.tab.machineblock.Cloud}
```yaml
version: 2.1
jobs:
  my-job:
    machine:
      image: ubuntu-2004:current
    resource_class: large
```

{:.tab.machineblock.Server}
```yaml
version: 2.1
jobs:
  my-job:
    machine: true
    resource_class: large
```

You can view the list of available images [in the docs Configuration Reference]({{ site.baseurl }}/configuration-reference/#available-linux-machine-images), or on the [Developer Hub](https://circleci.com/developer/images?imageType=machine). お客様が CircleCI Server インストール環境で作業している場合、上記の例は構文が少し異なります。また、利用できる Linux イメージは、お客様のシステム管理者によって管理されます。

## 利用できる LinuxVM リソースクラス
{: #available-linuxvm-resource-classes }

{% include snippets/ja/machine-resource-table.md %}

## プリインストールされているソフトウェア
{: #pre-installed-software }

プリインストールされているソフトウェアの最新のリストは [Image Builder](https://raw.githubusercontent.com/circleci/image-builder/picard-vm-image/provision.sh) のページを参照してください。 詳細は、[Discuss](https://discuss.circleci.com/tag/machine-images) のページでもご確認いただけます。

`sudo apt-get install<package>` を使って追加パッケージをインストールできます。 パッケージが見つからない場合は、インストールの前に `sudo apt-get update` が必要な場合があります。

## Docker とのマシンの使用
{:  #use-machine-with-docker }

Machine Executor を使用すると、Docker プロセスにもフルアクセスできます。 これにより、特権 Docker コンテナを実行し、新しい Docker イメージをビルドできます。

The following example uses an image and enables [Docker layer caching]({{ site.baseurl }}/docker-layer-caching) (DLC) which is useful when you are building Docker images during your job or workflow.

```yaml
machine:
  image: ubuntu-2004:202104-01
  docker_layer_caching: true    # default - false
```

## マシンと IP アドレスの範囲の使用
{: #using-machine-and-ip-ranges }

IP アドレスの範囲 `192.168.53.0/24 `は、Machine Executor での社内使用のために CircleCI が予約しています。 この範囲はジョブ内でご使用にならないでください。

## 次のステップ
{: #next-steps }

To find out about migrating a project from using the Docker executor to using `machine`, see the [Executor Migration from Docker to Machine]({{ site.baseurl }}/docker-to-machine) document.
