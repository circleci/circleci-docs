---
layout: classic-docs
title: "Nomad クラスタの操作ガイド"
category:
  - administration
order: 9
description: "CircleCI での Nomad クラスタの操作ガイド"
---

CircleCI では、CircleCI 2.0 のプライマリジョブスケジューラとして [Nomad](https://www.hashicorp.com/blog/nomad-announcement/) を使用しています。ここでは、CircleCI 2.0 での Nomad クラスタの操作方法について理解を深めていただくために、以下のセクションに沿って Nomad の概要を説明します。

- 目次 {:toc}

## 基本的な用語とアーキテクチャ

- **Nomad サーバー：**Nomad サーバーは、Nomad クラスタの「頭脳」です。 ジョブを受け取り、Nomad クライアントに割り当てます。 CircleCI では、Nomad サーバーは Docker コンテナとして Service Box 内で実行されます。

- **Nomad クライアント：**Nomad クライアントは、Nomad サーバーによって割り当てられたジョブを実行します。 通常、Nomad クライアントは専用マシン (多くの場合は VM) 上で動作するため、マシンの能力を最大限に活用できます。 複数の Nomad クライアントで 1つのクラスタを構成することができ、Nomad サーバーはスケジュールアルゴリズムに従ってクラスタにジョブを割り当てます。

- **Nomad ジョブ：**Nomad ジョブは、ユーザーによって提供される仕様で、Nomad のワークロードを宣言します。 CircleCI 2.0 において、Nomad ジョブは CircleCI のジョブやビルドの実行に対応しています。 ジョブやビルドで、たとえば 10個の並列処理を使用する場合、Nomad は 10個のジョブを実行します。

- **ビルドエージェント：**ビルドエージェントは CircleCI によって記述された Go プログラムで、ジョブ内のステップを実行し、結果を報告します。 ビルドエージェントは、Nomad ジョブ内部のメイン処理として実行されます。

## 基本的な操作

ここでは、CircleCI での Nomad クラスタの基本的な操作について説明します。

`nomad` CLI は Service インスタンスにインストールされます。 Nomad クラスタとやり取りするようにあらかじめ設定されているため、`nomad` コマンドを使用して、以下で説明するコマンドを実行できます。

### ジョブステータスの確認

`nomad status` コマンドは、クラスタ内のジョブステータスのリストを提供します。 `Status` は、出力内容のうち最も重要なフィールドで、以下のステータスタイプが定義されています。

- `running`：Nomad がジョブの実行を開始すると、ステータスは `running` になります。 このステータスは通常、CircleCI 上のジョブが開始されたことを意味します。

- `pending`：クラスタ内にジョブの実行に利用できる十分なリソースがない場合、ステータスは `pending` になります。

- `dead`：Nomad がジョブの実行を完了すると、ステータスは `dead` になります。 対応する CircleCI のジョブまたはビルドが成功したか失敗したかにかかわらず、ステータスは `dead` になります。

### クラスタのステータスの確認

`nomad node-status` コマンドは、Nomad クライアントのリストを提供します。 また、`nomad node-status` コマンドは、現在使用中の Nomad クライアント (ステータスが `active`) と、クラスタから取り出された Nomad クライアント (ステータスが `down`) の両方を報告します。 したがって、現在のクラスタの容量を知るには、ステータスが `active` の Nomad クライアントの数を数える必要があります。

`nomad node-status -self` コマンドは、コマンドを実行するクライアントについて詳細な情報を提供します。 提供される情報には、クライアント上で実行中のジョブの数、クライアントのリソースの利用状況などが含まれます。

### ログの確認

Nomad ジョブのセクションで前述したように、Nomad ジョブは CircleCI のジョブやビルドの実行に対応しています。 したがって、CircleCI のジョブやビルドで問題が発生した場合に Nomad ジョブのログを確認すると、そのジョブまたはビルドの状態を理解するのに役立つことがあります。

`nomad logs -job -stderr <nomad-job-id>` コマンドは、ジョブのログを提供します。

**メモ：**ビルドエージェントのほとんどのログは `stderr` に表示されるため、必ず `-stderr` フラグを指定してください。

`nomad logs -job` コマンドは便利ですが、`-job` フラグは指定されたジョブのランダム割り当てを使用するため、必ずしも正確とは限りません。 `allocation` は Nomad ジョブ内のさらに小さい単位で、このドキュメントでは取り上げていません。 詳細については、[Nomad の公式ドキュメント](https://www.nomadproject.io/docs/internals/scheduling.html)を参照してください。

指定されたジョブの割り当てからログを取得するには、以下の手順に従います。

1. `nomad status` コマンドで、ジョブ ID を取得します。

2. `nomad status <job-id>` コマンドで、ジョブの割り当て ID を取得します。

3. `nomad logs -stderr <allocation-id>` で、割り当てからログを取得します。

<!---
## Scaling the Nomad Cluster
Nomad itself does not provide a scaling method for cluster, so you must implement one. This section provides basic operations regarding scaling a cluster.
--->

### クライアントクラスタのスケールアップ

Nomad クライアントインスタンスを AWS Auto Scaling グループに追加する方法、および必要に応じて自動的にスケールアップを行うスケールポリシーを使用する方法の詳細については、「[サーバー設定、Auto Scaling、モニタリング](https://circleci.com/docs/ja/2.0/monitoring/)」の Auto Scaling のセクションを参照してください。

<!--- 
commenting until we have non-aws installations?
Scaling up Nomad cluster is very straightforward. To scale up, you need to register new Nomad clients into the cluster. If a Nomad client knows the IP addresses of Nomad servers, then the client can register to the cluster automatically.
HashiCorp recommends using Consul or other service discovery mechanisms to make this more robust in production. For more information, see the following pages in the official documentation for [Clustering](https://www.nomadproject.io/intro/getting-started/cluster.html), [Service Discovery](https://www.nomadproject.io/docs/service-discovery/index.html), and [Consul Integration](https://www.nomadproject.io/docs/agent/configuration/consul.html).
--->

### Nomad クライアントのシャットダウン

Nomad クライアントをシャットダウンするときは、まずクライアントをドレイン (`drain`) モードに設定する必要があります。 `drain` モードのクライアントは、既に割り当てられたジョブが完了するまで実行しますが、新しいジョブの割り当ては取得しません。

1. クライアントをドレインするには、クライアントにログインし、`node-drain` コマンドを以下のように使用して、クライアントをドレインモードに設定します。

`nomad node-drain -self -enable`

2. 次に、`node-status` コマンドを使用してクライアントがドレインモードに変更されていることを確認します。

`nomad node-status -self`

また、`nomad node-drain -enable -yes <node-id>` を使用して、リモートノードをドレインすることも可能です。

### クライアントクラスタのスケールダウン

まず `drain` モードでクライアントをシャットダウンし、すべてのジョブが完了してからクライアントを終了するようにメカニズムを設定するには、インスタンスをスケールダウンする際にスクリプトをトリガーする ASG ライフサイクルフックを設定します。

このスクリプトは、上記のコマンドを使用してインスタンスをドレインモードに設定し、インスタンス上で実行中のジョブをモニタリングし、ジョブが完了するのを待ってからインスタンスを終了します。