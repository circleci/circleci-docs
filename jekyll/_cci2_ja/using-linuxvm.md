---
layout: classic-docs
title: "Linux VM 実行環境の使用"
description: "Linux VM 実行環境で実行するジョブの設定方法を説明します。"
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

`machine` オプションは、以下のような仕様を持つ占有の一時的な VM でジョブを実行します。

{% include snippets/ja/machine-resource-table.md %}

`machine` Executor を使用すると、アプリケーションは OS のリソースにフルアクセスでき、ユーザーはジョブ環境を完全に制御できます。 この制御は、ネットワークインターフェイスのリッスンなどの目的でネットワークスタックへのフルアクセスが必要な場合や、`sysctl` コマンドを使用してシステムを変更する必要がある場合に便利です。 プロジェクトで使用する Executor を Docker から `machine` に移行する方法については、[Docker Executor から Machine Executor への移行]({{ site.baseurl }}/ja/docker-to-machine)」を参照してください。

`machine` Executor を使用すると、Docker プロセスにもフルアクセスできます。 これにより、特権 Docker コンテナを実行し、新しい Docker イメージをビルドできます。

Machine Executor を使用するには、`.circleci/config.yml` で [`machine` キー]({{ site.baseurl }}/ja/configuration-reference/#machine)を設定します。

{:.tab.machineblock.Cloud}
```yaml
version: 2.1
jobs:
  build:
    machine:
      image: ubuntu-2004:current
    resource_class: large
```

{:.tab.machineblock.Server}
```yaml
version: 2.1
jobs:
  build:
    machine: true
```

使用可能なイメージの一覧は、[こちら]({{ site.baseurl }}/ja/configuration-reference/#available-machine-images)で確認できます。

以下の例では、`image` キーを使用するとともに [Docker レイヤーキャッシュ]({{ site.baseurl }}/ja/docker-layer-caching) (DLC) を有効化しています。 DLC は、ジョブまたはワークフロー中に Docker イメージをビルドする場合に便利な機能です。

```yaml
machine:
  image: ubuntu-2004:202104-01
  docker_layer_caching: true    # default - false
```

IP アドレスの範囲 `192.168.53.0/24 `は、Machine Executor での社内使用のために CircleCI が予約しています。 この範囲はジョブ内でご使用にならないでください。
