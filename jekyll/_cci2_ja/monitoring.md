---
layout: classic-docs
title: "サーバー設定、Auto Scaling、モニタリング"
category:
  - administration
order: 30
---

ここでは、システム管理者向けに、インストールした Nomad クライアントの環境変数の設定、クライアントクラスタのスケーリング、CircleCI をモニタリングするためのメトリクスの収集、およびログの表示について説明します。

* 目次 {:toc}

## 高度なシステムモニタリング

システムと Docker のメトリクスをサポート対象プラットフォームに転送する機能を有効にするには、[Replicated Admin (Replicated 管理者)] > [Settings (設定)] に移動し、対象のプロバイダーを有効にします (例：`https://example.com:8800/settings#cloudwatch_metrics`)。

### メトリクスの詳細

Services VM ホストと Docker のメトリクスは、メトリクスを収集および報告するプラグイン駆動型のサーバーエージェントの [Telegraf](https://github.com/influxdata/telegraf) 経由で転送されます。

有効なメトリクスは以下のとおりです。

* [CPU](https://github.com/influxdata/telegraf/blob/master/plugins/inputs/cpu/README.md#cpu-time-measurements)
* [ディスク](https://github.com/influxdata/telegraf/blob/master/plugins/inputs/disk/README.md#metrics)
* [メモリ](https://github.com/influxdata/telegraf/blob/master/plugins/inputs/mem/README.md#metrics)
* [ネットワーク通信](https://github.com/influxdata/telegraf/blob/master/plugins/inputs/net/NET_README.md#measurements--fields)
* [Docker](https://github.com/influxdata/telegraf/tree/master/plugins/inputs/docker#metrics)

#### Nomad ジョブのメトリクス

上記のメトリクスのほかに、[Nomad ジョブのメトリクス](https://www.nomadproject.io/docs/telemetry/metrics.html#job-metrics)が Nomad サーバーエージェントによって有効になり、出力されます。 以下の 5種類のメトリクスが報告されます。

`circle.nomad.server_agent.poll_failure`：Nomad エージェントの最後のポーリングが失敗した場合は 1、成功した場合は 0 を返します。 `circle.nomad.server_agent.jobs.pending`：クラスタ全体の保留中のジョブの総数を返します。 `circle.nomad.server_agent.jobs.running`：クラスタ全体の実行中のジョブの総数を返します。 `circle.nomad.server_agent.jobs.complete`：クラスタ全体の完了したジョブの総数を返します。 `circle.nomad.server_agent.jobs.dead`：クラスタ全体で停止しているジョブの総数を返します。

Nomad メトリクスのコンテナが正常に動作している場合、標準出力または標準エラーには何も出力されません。 障害が発生すると、標準エラーにメッセージが出力されます。

### サポートされているプラットフォーム

AWS CloudWatch と Datadog の 2つのプラットフォームが組み込まれています。

#### AWS CloudWatch

AWS CloudWatch の下で [Enable (有効にする)] をクリックして設定を開始します。![AWS CloudWatch]({{ site.baseurl }}/assets/img/docs/metrics_aws_cloudwatch1.png)

##### 設定

設定には、2つのオプションがあります。

* Services box の [IAM Instance Profile (IAM インスタンスプロファイル)] を使用し、カスタムの領域と名前空間を設定する方法

    ![IAM による設定方法]({{ site.baseurl }}/assets/img/docs/metrics_aws_cloudwatch2a.png)

* カスタムの領域と名前空間と共に、AWS のアクセスキーとシークレットキーを使用する方法

    ![その他の設定方法]({{ site.baseurl }}/assets/img/docs/metrics_aws_cloudwatch2b.png)

設定の保存後、AWS CloudWatch コンソールに移動すると、メトリクスが転送されていることを*確認*できます。

#### Datadog

Datadog Metrics の下で [Enable (有効にする)] をクリックして設定を開始します。

![Datadog]({{ site.baseurl }}/assets/img/docs/metrics_datadog1.png)

##### 設定

Datadog API キーを入力します。

![Datadog]({{ site.baseurl }}/assets/img/docs/metrics_datadog2.png)

設定の保存後、Datadog のメトリクスサマリーに移動すると、メトリクスが転送されていることを*確認*できます。

#### カスタムメトリクス

上記で紹介した CloudWatch や Datadog の定義済みメトリクスのほか、Telegraf の設定ファイルを使用したカスタムメトリクスも使用できます。 カスタムメトリクスを使用すると、より詳細な制御設定が可能になります。

![カスタム]({{ site.baseurl }}/assets/img/docs/metrics-custom.png)

##### 設定

設定オプションは、Telegraf のドキュメントに記載されている出力プラグインに基づきます。 [こちらのドキュメント](https://github.com/influxdata/telegraf#output-plugins)を参照してください。

たとえば、InfluxDB 出力プラグインを使用する場合は、以下の手順に従います。

1. Servics マシンに SSH 接続します。
2. `/etc/circleconfig/telegraf/influxdb.conf` に移動します。
3. 以下の例のように、目的の出力を追加します。

    [[output.influxdb]]
      url = "http://52.67.66.155:8086"
      database = "testdb"


4. `docker restart telegraf` を実行してコンテナを再起動し、変更をロードまたはリロードします。

`docker logs -f telegraf` を実行してログをチェックすることで、設定した出力に出力プロバイダー (influx など) がリストされているかどうかを確認できます。

また、インストール内のすべてのメトリクスが環境に対してタグ付けされるようにするには、コンフィグ内に以下のコードを記述します。

    [global_tags]
    Env="<staging-circleci>"


デフォルトの高度なインストール手順については、[InfluxDB のドキュメント](https://github.com/influxdata/influxdb#installation)を参照してください。

メモ：コンフィグに変更を加えた場合は、システムを再起動する必要があります。

## スケールスケジュール

AWS アカウントにはデフォルトで Auto Scaling グループ (ASG) が作成されます。 EC2 ダッシュボードに移動し、左側のメニューから [Auto Scaling Groups (Auto Scaling グループ)] を選択します。 次に、[Instances (インスタンス)] タブで、[Desired (必要)] と [Minimum (最小)] の値を設定し、スピンアップして利用可能な状態を維持する Nomad クライアントの数を定義します。 [Auto Scaling] ページの [Scaling Policy (スケーリングポリシー)] タブを使用すると、特定の時刻にのみグループを自動的にスケールアップするように設定できます。ポリシーの定義に関するベストプラクティスについては、以下のセクションを参照してください。

Nomad クライアントのドレインおよびスケールダウンの手順については、Nomad に関するドキュメントの「[Nomad クライアントのシャットダウン]({{ site.baseurl }}/ja/2.0/nomad/#nomad-クライアントのシャットダウン)」セクションを参照してください。

### Auto Scaling ポリシーのベストプラクティス

[こちらのブログ記事](https://circleci.com/blog/mathematical-justification-for-not-letting-builds-queue/)では、CircleCI の技術者が Auto Scaling の一般的なベストプラクティスを見つけようと、コスト削減のシミュレーションに取り組んだ過程についてシリーズで紹介しています。 AWS の Auto Scaling を設定する際は、以下のベストプラクティスを適用することを検討してください。

1. 原則として、クラスタは、ビルドのキューイングを回避できるくらい十分な大きさにします。 具体的には、一般的なワークロードでキューイングが 1秒未満、高価なハードウェアや高レベルな並列処理で実行されるワークロードでは 10秒未満になるようにします。 開発者の時間は高コストであるため、キューイングを 0 まで減らすようにサイズを調整することをお勧めします。アンダープロビジョニングの費用対効果が出るまで開発者の時間を安くできるようなモデルを作成することは困難です。

2. Auto Scaling グループを作成して、大多数の開発者が通常勤務している時間帯にはスケールアップし、夜間はスケールダウンするようなステップスケーリングポリシーを適用します。 平日の通常の勤務時間中にスケールアップし、夜間にスケールダウンしておくと、トラフィックが少ない夜間にオーバープロビジョニングを発生させることなく、開発のピーク時にキュー時間を抑制できるため、最適な組み合わせと言えます。 なお、過去の数多くのビルドデータによると、通常の勤務時間中のデータセットはおおむね正規分布になっています。

上記のベストプラクティスは、トラフィックの変動に基づいて 1日中 Auto Scaling を行う場合には向いていません。起動時間が長すぎるためにリアルタイムでのキューイングを防げないことが、モデルから明らかになっているためです。 その場合は、[ステップポリシーに関する Amazon のドキュメント](https://docs.aws.amazon.com/ja_jp/autoscaling/ec2/userguide/as-scaling-simple-step.html)に従って、CloudWatch アラームと共に Auto Scaling を設定してください。

## 1.0 のログ機能

ログの収集と一元管理は、モニタリングに不可欠な作業です。 ログは、監査証跡と共に、インフラストラクチャ障害のデバッグ情報も提供します。 以下の各セクションでは、CircleCI をログ記録ソリューションと統合する方法について説明します。

### CloudWatch による基本のシステムモニタリング

\[Replicated Admin (Replicated 管理者)] > [Settings (設定)] > [Enhanced AWS Integration (拡張 AWS を統合する)\] (1.0 のみ) > [Enable CloudWatch (CloudWatch を有効にする)] に移動し、CloudWatch を有効にします (例：`https://example.com:8800/settings#enhanced_aws`)。 **メモ：**CloudWatch では macOS コンテナのモニタリングがサポート**されていません**。

CloudWatch は、EC2 インスタンスのヘルス状態をモニタリングして、CPU、メモリ、ディスク容量、基本的なアラート数など、基本的なチェックを行っています。 CPU またはメモリがボトルネックになる場合は、Services インスタンスのマシンタイプのアップグレードを検討するか、コンテナあたりの CPU 数を減らしてください。

### ログアプライアンスエージェントのインストール

CircleCI 1.0 Builders では、ログが `/var/log/**/*.log` に格納されます。ただし、Docker では `/var/lib/docker/containers/**/*-json.log` に格納されます。

一般に、ログアプライアンスを使用するには、カスタムエージェントが各マシンにインストールされていて、収集したログをサービスに転送するように設定されている必要があります。 利用可能なログアプライアンスを以下に示します。

* [Amazon CloudWatch Logs](https://aws.amazon.com/cloudwatch/details/#log-monitoring)
* [Graylog](https://www.graylog.org/)
* [LogDNA](https://logdna.com/)
* [Logstash](https://www.elastic.co/products/logstash)
* [Splunk](http://www.splunk.com/)

エージェントは、環境、認証メカニズム、一元管理されたログサービスの検出メカニズムなどに基づいて設定してください。 現在使用しているエージェントとコンフィグの設定を再利用することができます。

CircleCI の Terraform テンプレートや CloudFormation テンプレートを使用している場合は、以下のように起動設定を変更して、エージェントをインストールおよび実行するためのフックを追加します。

    #!/usr/bin/bash


    #### ログ設定 - この例では Amazon CloudWatch を使用します

    # エージェントのインストール - この例では Amazon CloudWatch を使用します
    wget https://s3.amazonaws.com/aws-cloudwatch/downloads/latest/awslogs-agent-setup.py

    # エージェントを設定します
    cat <<EOF >/root/awslogs.conf
    [general]
    state_file = /var/awslogs/state/agent-state

    [/var/log/circle-builder/circle.log]
    datetime_format = %Y/%m/%d %H:%M:%S
    file = /var/log/circle-builder/circle.log
    buffer_duration = 5000
    log_stream_name = {instance_id}
    initial_position = end_of_file
    log_group_name = /var/log/circle-builder/circle.log
    EOF


    ## エージェントを実行します
    python ./awslogs-agent-setup.py --region us-west-2 --non-interactive --configfile=/root/awslogs.conf

    #### 通常どおり CircleCI Builder を実行します

    curl https://s3.amazonaws.com/circleci-enterprise/init-builder-0.2.sh | \
        SERVICES_PRIVATE_IP=<private ip address of services box> \
        CIRCLE_SECRET_PASSPHRASE=<passphrase entered on system console (services box port 8800) settings> \
        bash


Chef、Puppet、SaltStack などのオーケストレーションツールを使用している場合は、Builder インスタンスに適したレシピやサンプルを使用できます。

### Syslog との統合

CircleCI 1.0 Builders は `syslog` の機能と統合されています。 `syslog` はログの標準規格として広く使用されており、ほとんどのエージェントとシームレスに統合できます。 起動設定で `CIRCLE_LOG_TO_SYSLOG` を `true` に設定すると、Builder マシンがログを `syslog` 機能に出力するように設定できます。

    #!/bin/bash
    curl https://s3.amazonaws.com/circleci-enterprise/init-builder-0.2.sh | \
        CIRCLE_LOG_TO_SYSLOG=true \
        SERVICES_PRIVATE_IP=<private ip address of services box> \
        CIRCLE_SECRET_PASSPHRASE=<passphrase entered on system console (services box port 8800) settings> \
        bash


次に、`syslog` から一元管理されている `rsyslog` サーバーにログを転送するように設定します。または、ローカルログエージェントによってファイルではなく `syslog` がモニタリングされるように設定します。

Services マシンでは Docker が使用されます。 なお、Docker デーモンをカスタマイズして、サポートされている特定の出力先にログをルーティングすることができます。詳細については、[ロギングドライバに関する Docker のドキュメント](http://docs.docker.jp/engine/reference/logging/overview.html)を参照してください。

**メモ：**多くのツールでは、ファイルベースのログ記録がデフォルトで行われます。*syslog の機能を唯一のログモードとして使用すると、重要なログ情報が誤って無視される場合があります*。 カスタムエージェントがすべての `/var/log/**/*` を監視するように設定すると、`syslog` を含むほとんどのログファイルがキャプチャされます。

<!---## Health Monitoring Metrics

CloudWatch integration enables the following custom metrics for health monitoring:

 * `ContainersReserved` gives you a view of usage over time for capacity planning and budget estimation.
 * `ContainersLeaked` should be 0 or close to 0, an increase indicates a potential infrastructure issue.
 * `ContainersAvailable` is used for Auto Scaling.  If the value is too high, consider shutting some machines down, if the value is too low, consider starting up machines.

 * `circle.run-queue.builds` and `circle.run-queue.containers` expresses the degree to which the system is under-provisioned  and number of queued builds that are not running.  Ideally, the ASG will account for this as well.  Values that are too high may indicate an outage or incident.

 * `circle.state.running-builds` provides a general insight into current usage.

 * Note that `circle.state.num-masters` includes the web server host in the Services machine that does **not** run any builds.  That means the following:
   * If the value is 0, there is an outage or system is in maintenance.  Risk of dropping some github hooks.
   * If the value is 1, there are no Builders, so web traffic and GitHub hooks are accepted, but not run.
   * If the value is 1 + n, there are n builders running and visible to the system. If this is less than the total number of builders launched through AWS, your builders are most likely not launching correctly. If builds are queueing, but this number says you have builders available to the system, you may need to launch more builders.
--->
