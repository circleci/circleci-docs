---
layout: classic-docs
title: "macOS 実行環境の使用"
description: "macOS 実行環境で実行するジョブの設定方法を説明します。"
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

[custom-images]: {{ site.baseurl }}/ja/2.0/custom-images/ [building-docker-images]: {{ site.baseurl }}/ja/2.0/building-docker-images/ [server-gpu]: {{ site.baseurl }}/ja/2.0/gpu/

`macos` Executor を使うと VM 上に macOS 環境を構築し、そのなかでジョブを実行できるようになります。 macOS では、以下のリソースクラスを使用できます。

| クラス                                | vCPU         | RAM   |
| ---------------------------------- | ------------ | ----- |
| medium                             | 4 @ 2.7 GHz  | 8 GB  |
| macos.x86.medium.gen2              | 4 @ 3.2 GHz  | 8 GB  |
| large                              | 8 @ 2.7 GHz  | 16 GB |
| macos.x86.metal.gen1<sup>(1)</sup> | 12 @ 3.2 GHz | 32GB  |
{: class="table table-striped"}

このとき、どのバージョンの Xcode を使うか指定することもできます。 サポートされている Xcode のバージョン一覧とそれぞれのバージョンの Xcode を実行する VM の技術仕様については、iOS テストに関するドキュメントの「[サポートされている Xcode のバージョン]({{ site.baseurl }}/ja/2.0/testing-ios/#サポートされている-xcode-のバージョン)」セクションで確認してください。

```yaml
jobs:
  build:
    macos:
      xcode: 12.5.1

    steps:
      # Commands will execute in macOS container
      # with Xcode 12.5.1 installed
      - run: xcodebuild -version
```

### macOS VM のストレージ
{: #macos-vm-storage }

macOS VM のストレージ容量は、リソースクラスや使用される Xcode イメージによって異なります。 Xcode イメージのサイズは、プリインストールされているツールによって異なります。

| Xcode のバージョン | クラス                   | 最小ストレージ容量          |
| ------------ | --------------------- | ------------------ |
| 10.3.0       | Medium、Large          | 36GB               |
| 10.3.0       | macos.x86.medium.gen2 | 36GB               |
| 11.*         | Medium、Large          | 23GB               |
| 11.*         | macos.x86.medium.gen2 | 23GB               |
| 12.*         | Medium、Large          | 30 GB              |
| 12.*         | macos.x86.medium.gen2 | 30GB<sup>(2)</sup> |
| 13.*         | Medium、Large          | 23GB               |
| 13.*         | macos.x86.medium.gen2 | 89GB               |
{: class="table table-striped"}

<sup>(1)</sup>このリソースは、最低 24 時間のリースが必要です。 このリソースクラスの詳細は、[macOS の専有ホスト]({{ site.baseurl }}/ja/2.0/dedicated-hosts-macos)を参照して下さい。

<sup>(2)</sup>例外: Xcode 12.0.1、12.4.0、および 12.5.1 の最小ストレージ容量は 100GB です。
