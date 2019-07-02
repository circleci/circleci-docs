---
layout: classic-docs
title: "Nomad メトリクスのインストールと設定"
category:
  - administration
order: 9
description: "Nomad メトリクスのインストールと設定"
---

# Nomad メトリクスの設定

Nomad メトリクスは、Services ホストと Builder ホストでそれぞれ実行している [Nomad サーバーおよびクライアント](https://circleci.com/docs/ja/2.0/nomad/)からメトリクスデータを収集するためのヘルパーサービスです。 メトリクスは [DogStatsD](https://docs.datadoghq.com/developers/dogstatsd/) プロトコルを使用して収集され、Services ホストに送信されます。

## Nomad メトリクスサーバー

Nomad メトリクスコンテナは、server フラグを使用して Services ホストで実行され、追加の設定は必要ありません。

## Nomad メトリクスクライアント

Nomad メトリクスクライアントは、すべての Builder インスタンスにインストールされ、実行されます。 Nomad メトリクスクライアントをインストールおよび設定するには、AWS の起動設定を更新する必要があります。 また、AWS セキュリティグループを変更して、UDP ポート 8125 が Services ホストでオープンするように設定する必要があります。

**メモ：** 次のセクションに進む前に、この段階で AWS コンソールの EC2 サービスセクションにログインする必要があります。 必ず、CircleCI Server の実行に使用する領域にログインしてください。

### Services ホストのセキュリティグループの更新

1. 左のサイドバーで、[Instances (インスタンス)] グループの下にある [`Instances (インスタンス)`] リンクを選択します。
2. Services Box のインスタンスを選択します。 [name (名前)] タグは通常、`circleci_services` のように表示されています。
3. ページ下部の [description (説明)] ボックスで、[`Security Groups (セキュリティグループ)`] セクションの隣にあるユーザーセキュリティグループのリンクを選択します。 通常、`*_users_sg` のように表示されています。
4. これにより、[Security Groups (セキュリティグループ)] ページに移動し、ユーザーセキュリティグループが強調表示されます。 ページ下部の [description (説明)] ボックスで、[`Inbound (インバウンド)`] タブを選択してから [`Edit (編集)`] ボタンを選択します。
5. [`Add a Rule (ルールを追加する)`] ボタンを選択します。 ドロップダウンから [`Custom UDP Rule (カスタム UDP のルール)`] を選択します。 [Port Range (ポートの範囲)] フィールドに「`8125`」と入力します。
6. [source (ソース)] フィールドには、いくつかのオプションが用意されています。 VPC とサブネットの設定を考慮してオプションを選択してください。 一般的なシナリオを以下に示します。  
  1. (推奨) Nomad クライアントサブネットからのトラフィックを許可します。 通常は、ポート 4647 または 3001 に使用されるエントリに一致させます。 たとえば、`10.0.0.0/24` などです。
  2. UDP ポート 8125 へのすべてのトラフィックで `0.0.0.0/0` を使用することを許可します。
7. [`Save (保存する)`] ボタンを押します。

### AWS 起動設定の更新

#### 前提条件

##### AWS EC2 起動設定 の ID

1. 左のサイドバーで [`Auto Scaling Groups (Auto Scaling グループ)`] (ASG) リンクを選択します。
2. [name (名前)] タグに `*_nomad_clients_asg` のような値が表示されている ASG を探します。
3. 起動設定名が ASG 名の隣に表示されます (例：`terraform-20180814231555427200000001`)。

##### AWS EC2 Services Box のプライベート IP アドレス

1. 左のサイドバーで、[Instances (インスタンス)] グループの下にある [`Instances (インスタンス)`] リンクを選択します。
2. Services Box のインスタンスを選択します。 [name (名前)] タグは通常、`circleci_services` のように表示されています。
3. ページ下部の [description (説明)] ボックスに表示されているプライベート IP アドレスをメモします。

#### 起動設定の更新

1. 左のサイドバーで、[`Auto Scaling`] の下にある [`Launch Configurations (起動設定)`] リンクを選択します。 前の手順で取得した起動設定を選択します。
2. ページ下部の [description (説明)] ボックスで、[`Copy launch configuration (起動設定をコピーする)`] ボタンを選択します。
3. 設定ページが開いたら、ページ上部にある [`Configure details (詳細を設定する)`] リンクを選択します。
4. [`Name (名前)`] フィールドを `nomad-builder-with-metrics-lc-DATE` などのわかりやすい名前で更新します。
5. [`Advanced Details (詳細情報)`] ドロップダウンを選択します。
6. 下のテキストフィールドから [`User data (ユーザーデータ)`] に起動設定スクリプトをコピー＆ペーストします。
7. **重要：** 10行目に Services Box のプライベート IP アドレスを入力してください （例：`export SERVICES_PRIVATE_IP="192.168.1.2"`)。
8. [`Skip to review (レビューに進む)`] ボタンを選択し、次に [`Create launch configuration (起動設定を作成する)`] ボタンを選択します。

```bash
#! /bin/sh

set -exu

export http_proxy=""
export https_proxy=""
export no_proxy=""
export CONTAINER_NAME="nomad_metrics"
export CONTAINER_IMAGE="circleci/nomad-metrics:0.1.90-1448fa7"
export SERVICES_PRIVATE_IP=""
export NOMAD_METRICS_PORT="8125"

echo "-------------------------------------------"
echo "     Performing System Updates"
echo "-------------------------------------------"
apt-get update && apt-get -y upgrade

echo "--------------------------------------"
echo "        Installing Docker"
echo "--------------------------------------"
apt-get install -y linux-image-extra-$(uname -r) linux-image-extra-virtual
apt-get install -y apt-transport-https ca-certificates curl
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
apt-get update
apt-get -y install docker-ce=17.03.2~ce-0~ubuntu-trusty cgmanager

sudo echo 'export http_proxy=""' >> /etc/default/docker
sudo echo 'export https_proxy=""' >> /etc/default/docker
sudo echo 'export no_proxy=""' >> /etc/default/docker
sudo service docker restart
sleep 5

echo "--------------------------------------"
echo "         Installing nomad"
echo "--------------------------------------"
apt-get install -y zip
curl -o nomad.zip https://releases.hashicorp.com/nomad/0.5.6/nomad_0.5.6_linux_amd64.zip
unzip nomad.zip
mv nomad /usr/bin

echo "--------------------------------------"
echo "      Creating config.hcl"
echo "--------------------------------------"
export PRIVATE_IP="$(/sbin/ifconfig eth0 | grep 'inet addr:' | cut -d: -f2 | awk '{ print $1}')"
mkdir -p /etc/nomad
cat <<EOT > /etc/nomad/config.hcl
log_level = "DEBUG"

data_dir = "/opt/nomad"
datacenter = "us-east-1"

advertise {
    http = "$PRIVATE_IP"
    rpc = "$PRIVATE_IP"
    serf = "$PRIVATE_IP"
}

client {
    enabled = true

    # Nomad サーバーの DNS レコードが取得されます
    servers = ["$SERVICES_PRIVATE_IP:4647"]
    node_class = "linux-64bit"
    options = {"driver.raw_exec.enable" = "1"}
}

telemetry {
    publish_node_metrics = true
    statsd_address = "$SERVICES_PRIVATE_IP:8125"
}
EOT

echo "--------------------------------------"
echo "      Creating nomad.conf"
echo "--------------------------------------"
cat <<EOT > /etc/init/nomad.conf
start on filesystem or runlevel [2345]
stop on shutdown

script
    exec nomad agent -config /etc/nomad/config.hcl
end script
EOT

echo "--------------------------------------"
echo "   Creating ci-privileged network"
echo "--------------------------------------"
docker network create --driver=bridge --opt com.docker.network.bridge.name=ci-privileged ci-privileged

echo "--------------------------------------"
echo "      Starting Nomad service"
echo "--------------------------------------"
service nomad restart

echo "--------------------------------------"
echo "      Setting up Nomad metrics"
echo "--------------------------------------"
docker pull $CONTAINER_IMAGE
docker rm -f $CONTAINER_NAME || true

docker run -d --name $CONTAINER_NAME \
    --rm \
    --net=host \
    --userns=host \
    $CONTAINER_IMAGE \
    start --nomad-uri=http://localhost:4646 --statsd-host=$SERVICES_PRIVATE_IP --statsd-port=$NOMAD_METRICS_PORT --client

```

#### Auto Scaling グループの更新

1. 左のサイドバーで [`Auto Scaling Groups (Auto Scaling グループ)`] (ASG) リンクを選択します。
2. [name (名前)] タグに `*_nomad_clients_asg` のような値が表示されている ASG を選択します。
3. ページ下部の [description (説明)] ボックスで、[`Edit (編集する)`] ボタンを選択します。
4. ドロップダウンから、新たに作成した起動設定を選択します。
5. [`Save (保存する)`] ボタンを押します。
6. この時点で、古い Nomad クライアントインスタンスはシャットダウンを開始し、 Nomad メトリクスを実行する新しい Nomad クライアントに置き換えられます。

## StatsD メトリクス

## --server

| 名前                                        | タイプ | 説明                                                                                                                                                                         |
| ----------------------------------------- | --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `circle.nomad.server_agent.poll_failure`  | ゲージ | Nomad エージェントの最後のポーリングが失敗した場合は 1、そうでない場合は 0 が返されます。 このゲージは、Nomad メトリクスが `--client` モードと `--server` モードで同時に動作しているときに、`circle.nomad.client_agent.poll_failure` からは独立して設定されます。 |
| `circle.nomad.server_agent.jobs.pending`  | ゲージ | クラスタ全体の保留中のジョブの総数を返します。                                                                                                                                                    |
| `circle.nomad.server_agent.jobs.running`  | ゲージ | クラスタ全体の実行中のジョブの総数を返します。                                                                                                                                                    |
| `circle.nomad.server_agent.jobs.complete` | ゲージ | クラスタ全体の完了したジョブの総数を返します。                                                                                                                                                    |
| `circle.nomad.server_agent.jobs.dead`     | ゲージ | クラスタ全体で停止しているジョブの総数を返します。                                                                                                                                                  |

- 終了状態 (`complete` と `dead`) にあるジョブの数は、通常、Nomad がその状態からジョブをガベージコレクションするまで増えていきます。

## --client

| 名前                                                     | タイプ | 説明                                                 |
| ------------------------------------------------------ | --- | -------------------------------------------------- |
| `circle.nomad.client_agent.poll_failure`               | ゲージ | Nomad エージェントの最後のポーリングが失敗した場合は 1、そうでない場合は 0 が返されます。 |
| `circle.nomad.client_agent.resources.total.cpu`        | ゲージ | (以下の説明を参照してください)                                   |
| `circle.nomad.client_agent.resources.used.cpu`         | ゲージ | (以下の説明を参照してください)                                   |
| `circle.nomad.client_agent.resources.available.cpu`    | ゲージ | (以下の説明を参照してください)                                   |
| `circle.nomad.client_agent.resources.total.memory`     | ゲージ | (以下の説明を参照してください)                                   |
| `circle.nomad.client_agent.resources.used.memory`      | ゲージ | (以下の説明を参照してください)                                   |
| `circle.nomad.client_agent.resources.available.memory` | ゲージ | (以下の説明を参照してください)                                   |
| `circle.nomad.client_agent.resources.total.disk`       | ゲージ | (以下の説明を参照してください)                                   |
| `circle.nomad.client_agent.resources.used.disk`        | ゲージ | (以下の説明を参照してください)                                   |
| `circle.nomad.client_agent.resources.available.disk`   | ゲージ | (以下の説明を参照してください)                                   |
| `circle.nomad.client_agent.resources.total.iops`       | ゲージ | (以下の説明を参照してください)                                   |
| `circle.nomad.client_agent.resources.used.iops`        | ゲージ | (以下の説明を参照してください)                                   |
| `circle.nomad.client_agent.resources.available.iops`   | ゲージ | (以下の説明を参照してください)                                   |

- CPU リソースは MHz 単位で報告されます。 メモリリソースは MB 単位で報告されます。 ディスク (容量) リソースは MB 単位で報告されます。
- リソースメトリクスは、Nomad メトリクスがポーリングするように設定されている Nomad ノードをその範囲とします。 `--client` モードで動作している単一の Nomad メトリクスジョブから得られた数値は、クラスタ全体を代表する数値とは*言えません* (ただし、これらの時系列のデータを外部のメカニズムによって集計することで、クラスタ全体の傾向をつかむことはできます)。
- `circle.nomad.client_agent.resources` 名前空間内のメトリクスにはすべて、DogStatsD への書き込み時に以下のタグが付けられます。
  - `drain`：Nomad ノードがドレイン済みとしてマークされている場合は `true`、そうでない場合は `false` が付けられます。
  - `status`： `initializing`、`ready`、または `down` のいずれかが付けられます。
