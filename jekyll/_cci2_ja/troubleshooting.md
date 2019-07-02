---
layout: classic-docs
title: "Server のトラブルシューティング"
category:
  - administration
order: 12
description: "CircleCI Server のトラブルシューティング手順"
---

ここでは、プライベートサーバー上の CircleCI で問題が発生した場合の初期トラブルシューティング手順について説明します。 以下で取り上げられていない問題が発生した場合は、[サポートバンドルを生成](https://help.replicated.com/docs/native/packaging-an-application/support-bundle/)し、[サポートチケットをオープン](https://support.circleci.com/hc/ja/requests/new)して、CircleCI のサポートエンジニアにご連絡ください。

## Server 機能のテスト

[realitycheck レポジトリ](https://github.com/circleci/realitycheck)を使用して、基本的な CircleCI 機能をチェックすることをお勧めします。 コンテキストテストは、指定されたコンテキストがシステム内に存在しないと失敗するため、注意してください。

## ビルドのキューイングのデバッグ

Services コンポーネントに問題はないが、ビルドが実行されない場合、またはすべてのビルドがキューイングされる場合は、以下の手順を行ってください。

1. `sudo docker logs dispatcher` を実行します。ログ出力にエラーがなければ、次のステップに進んでください。 ログディスパッチャコンテナが存在しないか、停止している場合は、`sudo docker start <container_name>` コマンドを使用して起動し、進行状況をモニタリングします。 以下の出力では、ログディスパッチャが起動し、正しく実行されていることがわかります。

```
Jan 4 22:38:38.589:+0000 INFO circle.backend.build.run-queue dispatcher mode is on - no need for run-queue
Jan 4 22:38:38.589:+0000 INFO circle.backend.build.usage-queue 5a4ea0047d560d00011682dc: GERey/realitycheck/37 -> forwarded to run-queue
Jan 4 22:38:38.589:+0000 INFO circle.backend.build.usage-queue 5a4ea0047d560d00011682dc: publishing :usage-changed (:recur) event
Jan 4 22:38:39.069:+0000 INFO circle.backend.build.usage-queue got usage-queue event for 5a4ea0047d560d00011682dc (finished-build)
```

エラーが発生する場合や、上記の出力が表示されない場合は、1.0 から 2.0 へのビルドのルーティングに問題があるため、スタックトレースを調査してください。

1.0 ビルドは実行できるが、2.0 ビルドは実行できない場合、または 2.0 ビルドのみを実行でき、ログディスパッチャが実行されている場合は、次のステップに進んでください。

1. `sudo docker logs picard-dispatcher` コマンドを実行します。 picard-dispatcher が正常な場合は、以下のように出力されます。

```
Jan 9 19:32:33.629:+0000 INFO picard-dispatcher.init Still running...
Jan 9 19:34:33.630:+0000 INFO picard-dispatcher.init Still running...
Jan 9 19:34:44.694:+0000 INFO picard-dispatcher.core taking build=GERey/realitycheck/38
Jan 9 19:34:45.001:+0000 INFO circle.http.builds project GERey/realitycheck at revision 2c6179654541ee3dc0abf46970551b4594986293 succcessfully fetched and parsed .circleci/config.yml
Jan 9 19:34:45.027:+0000 INFO picard-dispatcher.tasks build GERey/realitycheck/38 is using resource class {:cpu 2.0, :ram 4096, :class :medium}
Jan 9 19:34:45.027:+0000 INFO picard-dispatcher.tasks Computed tasks for build=GERey/realitycheck/38, stage=:write_artifacts, parallel=1
Jan 9 19:34:45.027:+0000 INFO picard-dispatcher.tasks build has matching jobs: build=GERey/realitycheck/38 parsed=:write_artifacts passed=:write_artifacts
```

出力は、上記のメッセージで埋まっているはずです。 処理量が少なく、ほとんどビルドが行われていない日には、以下のように出力されます。

```
Jan 9 19:32:33.629:+0000 INFO picard-dispatcher.init Still running...
```

ビルドを実行すると、上記のメッセージが直ちに表示され、スケジューラにディスパッチされたことが確認できます。 上記の出力が表示されない場合、または picard-dispatcher コンテナにスタックトレースがある場合は、CircleCI サポートにお問い合わせください。

2.0 ビルドを実行して、picard-dispatcher ログ出力にメッセージが表示されない場合は、たいていディスパッチャと picard-dispatcher の間でジョブが失われています。 CircleCI アプリケーションを停止して再起動し、2つのコンテナ間の接続を再度確立してください。

1. `sudo docker logs picard-scheduler` を実行します。 `picard-scheduler` はジョブをスケジュールし、直接接続によってジョブを Nomad に送信します。 これを行っても、実際に CircleCI 内のジョブのキューイングが処理されるわけではありません。

2. `nomad node-status -allocs` コマンドを実行し、以下のような出力を表示させて、Nomad ノードが存在するかどうかを確認します。

```
ID        DC         Name             Class        Drain  Status  Running Allocs
ec2727c5  us-east-1  ip-127-0-0-1     linux-64bit  false  ready   0
```

Nomad クライアントがリストされない場合は、[Nomad に関するガイド]({{site.baseurl}}/ja/2.0/nomad/)で Nomad サーバーの管理とトラブルシューティングの方法を参照してください。

**メモ：**出力内の「DC」はデータセンターを意味し、この列には常に us-east-1 と表示されていますが、 何か影響や問題があるわけではありません。 ここで重要なのは、Drain、Status、Allocs の各列の内容です。

- Drain - `Drain` が `true` の場合、CircleCI ではその Nomad クライアントにジョブをルーティング**しません**。 この値は、`nomad node-drain [options] <node>` コマンドを実行することで変更できます。 Drain を `true` に設定すると、現在実行中のジョブが終了し、ビルドの受け付けが停止します。 割り当ての数が 0 になれば、インスタンスを停止しても安全です。 `Drain` を `false` に設定すると、ノードが接続を受け付けて、ビルドを取得するようになります。

- Status - Status が `ready` の場合は、ビルドを受け付ける準備が整っており、正しく接続されています。 正しく接続されていなければ、`ready` とは表示されません。Status に `ready` と表示されないノードはビルドを受け付けないため、調査する必要があります。

- Allocs - 「Allocs」とはビルドを意味する用語です。 つまり、Running Allocs の数は、単一ノード上で実行されているビルドの数と対応しています。 この数は、ビルドがルーティングされているかどうかを示しています。 すべての Builder に Running Allocs があるにもかかわらず、ジョブがキューイングされる場合は、容量が十分でないため、フリートに Builder を追加する必要があります。

上記のような出力が表示され、それでもビルドがキューイングされている場合は、以下のステップに進んでください。

1. `sudo docker exec -it nomad nomad status` コマンドを実行して、現在処理中のジョブを表示させます。 以下のように、各ジョブの ID とステータスが表示されます。

```
ID                                                      Type   Priority  Status
5a4ea06b7d560d000116830f-0-build-GERey-realitycheck-1   batch  50        dead
5a4ea0c9fa4f8c0001b6401b-0-build-GERey-realitycheck-2   batch  50        dead
5a4ea0cafa4f8c0001b6401c-0-build-GERey-realitycheck-3   batch  50        dead
```

ジョブが完了すると、Status に `dead` と表示されます。 これは、ジョブの通常の状態です。 Status に `running` と表示される場合、ジョブは現在実行中です。 これは、CircleCI アプリケーションのビルドダッシュボードにも表示されます。 アプリケーションに表示されない場合は、output-processor に問題があります。 `docker logs picard-output-processor` コマンドを実行し、ログに明白なスタックトレースがないかを確認してください。

1. 割り当てが行われず、ジョブが常に `pending` 状態の場合は、`sudo docker exec -it nomad nomad status JOB_ID` コマンドを実行します。その結果から、どこで Nomad がスタックしているかが特定できたら、標準的な Nomad Cluster エラーのドキュメントを参照して詳細情報を調べてください。
2. ジョブが実行中または完了しているのに CircleCI アプリケーションに何も表示されない場合は、以下のように対処してください。
    - `sudo docker exec -it nomad nomad logs --stderr --job JOB_ID` コマンドを実行して、Nomad ジョブのログをチェックします。 **メモ：**`--stderr` を使用すると、特定のエラーがあった場合に出力されます。
    - `picard-output-processor` コマンドを実行して、ログに特定のエラーがないかどうかをチェックします。
