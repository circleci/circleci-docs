---
layout: classic-docs
title: HTTP プロキシの設定
category:
  - administration
order: 7
description: "CircleCI で HTTP プロキシを使用する方法"
---

ここでは、HTTP プロキシを使用するための CircleCI の設定方法について、以下のセクションに沿って説明します。

- 目次
{:toc}

## 概要

Amazon を通してプロキシを設定する場合は、読み進める前に以下の AWS ドキュメントをご確認ください。

[HTTP プロキシを使用する](https://docs.aws.amazon.com/cli/latest/userguide/cli-http-proxy.html)

特に Services マシンについては、内部リクエストに対するプロキシの適用を避けてください。 `export NO_PROXY=<services_box_ip>` を実行して、`NO_PROXY` ルールに追加します。 理想としては、`NO_PROXY` ルールに `s3.amazonaws.com,*.s3.amazonaws.com` を追加することで、S3 へのトラフィックがプロキシを経由せずにバイパスされるようにします。

これらの命令は、未認証の HTTP プロキシが `10.0.0.33:3128`、Services マシンが `10.0.1.238` であり、GitHub Enterprise ホストとして `ghe.example.com` を使用することを想定しています。

**メモ：**CircleCI を新しい VM またはインスタンスにインストールする**前に**、以下のプロキシ命令が完了している必要があります。 また、以下の説明に従って、JVM OPT を再度設定する必要があります。

## Services マシンのプロキシ設定

Services マシンには多数のコンポーネントがあり、以下のネットワーク呼び出しを行う必要があります。

- **外部ネットワーク呼び出し** - Replicated は、CircleCI の管理コンソール用に使用しているベンダーサービスです。 CircleCI では、ライセンスのバリデーション、更新の確認、およびアップグレードのダウンロードを行うために、Replicated が外部呼び出しを行う必要があります。 また Replicated は、Docker をダウンロードしてローカルマシンにインストールし、Docker コンテナを使用して S3 バケットの作成と設定を行います。

- **内部ネットワーク呼び出し**
  
  - S3 トラフィックが HTTP プロキシを経由する必要がある場合、CircleCI はプロキシ設定をコンテナに渡す必要があります。
  - Services マシン上の CircleCI インスタンスは Docker コンテナで実行されるため、すべての機能を維持するにはプロキシ設定をコンテナに渡す必要があります。

### Services マシンのプロキシサポートの設定

Services マシンに対して SSH 接続を実行し、プロキシアドレスから以下のコードスニペットを実行します。 Amazon の EC2 サービスで実行する場合、以下に示すとおり `169.254.169.254` の EC2 サービスを含める必要があります。

    # 1.) コンテナのプルダウンにプロキシを使用するように、Replicated に指示します
    echo '{"HttpProxy": "http://<proxy-ip:port>"}' | sudo tee  /etc/replicated.conf
    # 2.) 通信時にプロキシを使用するように、すべての CircleCI コンテナに指示します
    (cat <<'EOF'
    HTTP_PROXY=<proxy-ip:port>
    HTTPS_PROXY=<proxy-ip:port>
    NO_PROXY=169.254.169.254,<circleci-service-ip>,127.0.0.1,localhost,ghe.example.com
    JVM_OPTS="-Dhttp.proxyHost=<ip> -Dhttp.proxyPort=<port> -Dhttps.proxyHost=<proxy-ip> -Dhttps.proxyPort=3128 -Dhttp.nonProxyHosts=169.254.169.254|<circleci-service-ip>|127.0.0.1|localhost|ghe.example.com"
    
    EOF
    ) | sudo tee -a /etc/circle-installation-customizations
    # 3.) Replicated を再起動して変更点を拾い出します
    sudo service replicated-ui stop; sudo service replicated stop; sudo service replicated-operator stop; sudo service replicated-ui start; sudo service replicated-operator start; sudo service replicated start
    

**メモ：**上記は、CircleCI の enterprise-setup スクリプトでは処理されません。Services box の起動のためにユーザーデータに追加するか、または手動で実行する必要があります。

### コーポレートプロキシ

環境によっては、使用中のネットワークの外部から `NO_PROXY` と同等の設定にアクセスできません。 その場合には、関連するすべてのアウトバウンドアドレスを `HTTP_PROXY` または `HTTPS_PROXY` に設定し、Services や Builders など、内部ネットワーク上のマシンのみを `NO_PROXY` に追加します。

また、プロキシを使用するかどうかを確認する問い合わせでは、アドレスの入力も要求されるため注意してください。 プロキシは、`<protocol>://<ip>:<port>` 形式で入力することが**非常に重要**です。 一部でも欠落していると、`apt-get` は正しく機能せず、パッケージはダウンロードされません。

CircleCI の Replicated 管理コンソールのページにアクセスできない場合、Services マシンは動作していると考えられるなら、`ssh -L 8800:<address you want to proxy through>:8800 ubuntu@<ip_of_services_box>` を実行してマシンへの SSH トンネルを試行します。

### Nomad クライアントの設定

- **外部ネットワーク呼び出し** - CircleCI は、`curl` スクリプトおよび `awscli` スクリプトを使用して、Amazon S3 から初期化スクリプトと JAR ファイルをダウンロードします。 `curl` と `awscli` はどちらも環境設定に従いますが、Amazon S3 からのトラフィックがホワイトリストに登録されていれば問題は発生しません。

- **内部ネットワーク呼び出し**
  
  - CircleCI JVM  
    - 他の Nomad クライアントマシンまたは Services マシンへの接続は、HTTP プロキシから除外する必要があります。
    - GitHub Enterprise への接続は、HTTP プロキシから除外する必要があります。
  - 以下に、プロキシ設定によって影響を受ける部分を示します。 - Amazon EC2 メタデータ (https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/ec2-instance-metadata.html) — このデータに対しては、プロキシ設定を行うべきでは**ありません**。 プロキシ設定を行うと、マシンの設定が不適切になります。 - Amazon S3 トラフィック — 上記の S3 に関する説明を参照してください。 - Amazon EC2 API — EC2 API トラフィックには、プロキシ設定が必要な場合があります。 プロキシ設定が誤っている場合、ログに多数の障害 (タイムアウト障害) が記録されますが、CircleCI の機能が停止することはありません。

### Nomad クライアントのプロキシ設定

AWS Terraform を使用している場合、Nomad クライアントの起動設定に以下を追加する必要があります。 以下の命令は、`/etc/environment` に追加します。 Docker を使用している場合は、[Docker での HTTP プロキシの設定に関するドキュメント](https://docs.docker.com/engine/admin/systemd/#/http-proxy)を参照してください。

    #!/bin/bash
    
    # 1.) 任意のプロセスで読み込めるようにプロキシを設定します
    (cat <<'EOF'
    HTTP_PROXY=<proxy-ip:port>
    HTTPS_PROXY=<proxy-ip:port>
    NO_PROXY=169.254.169.254,<circleci-service-ip>,127.0.0.1,localhost,ghe.example.com
    JVM_OPTS="-Dhttp.proxyHost=<ip> -Dhttp.proxyPort=<port> -Dhttps.proxyHost=<proxy-ip> -Dhttps.proxyPort=3128 -Dhttp.nonProxyHosts=169.254.169.254|<circleci-service-ip>|127.0.0.1|localhost|ghe.example.com"
    EOF
    ) | sudo tee -a /etc/environment
    
    # 2.) 修正した環境を現在のシェルに読み込ませます
    set -a
    . /etc/environment
    
    

また、https://docs.docker.com/network/proxy/ の指示に従って、コンテナが確実にアウトバウンドおよびプロキシのアクセス権を持つようにしてください。
