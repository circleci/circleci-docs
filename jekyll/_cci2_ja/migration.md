---
layout: classic-docs
title: "2.0 への移行のヒント"
description: "1.0 から CircleCI 2.0 設定ファイルへの移行のヒント"
version:
  - Server v2.x
---


CircleCI v1.0 のサポート期限の終了が近付いています。 まだ 2.0 への移行作業を開始していない場合は、以下にまとめられたヒントとベスト プラクティスを確認してください。

* 目次
{:toc}

## CircleCI 1.0 と 2.0 で同じプロジェクトをビルド可能
{: #you-can-build-the-same-project-on-both-circleci-10-and-20 }

CircleCI 2.0 への移行を開始するにあたり、直ちにすべてを移行する必要はありません。 1.0 でプロジェクトのビルドを継続しながら、以下の方法で 2.0 を試用してください。

- 2.0 のテストのための新しいブランチを作成します。
- そのブランチから `circle.yml` を削除し、`.circleci/config.yml` ファイルを追加します。
- 2.0 設定ファイルにそのブランチに対する最小限の処理を記述して、ビルドが成功するまでプッシュします。
- 動作具合を細かく確認できるように、少しずつ構成を追加します。 最初はコードをチェックアウトするだけにし、次に依存関係をインストールし、さらにテストを実行します。 その後、依存関係をキャッシュしたり、ワークフローなどの高度な機能を使用したりします。 Build up your config bit by bit.
- すべてが正常に機能するようになったら、新しい設定ファイルを含むブランチを主プロジェクトにマージします。

## CircleCI 2.0 のセットアップに関するヒント
{: #tips-for-setting-up-circleci-20 }

- `steps` にリストされたコマンドは、`docker` セクションで最初にリストされたコンテナ内でのみ実行されます。
- こまめにビルドを実行して構成をテストします。 そうすれば、何かが壊れても、最後のビルドから何を変更していたかがわかります。
- 最初はワークフローを追加せずに、正常に機能するビルドを先に完成させます。 ワークフローを追加したら、CircleCI アプリケーションの [Workflows (ワークフロー)] タブで、ジョブが実行されているかを確認します。 ワークフローの構成が誤っていると、ジョブが実行されなくなり、エラーと共に問題の詳細がアプリケーションの [Workflows (ワークフロー)] ページに表示されます。
- 設定ファイルはゼロから手動で作成しますが、[`config-translation` エンドポイント]({{ site.baseurl }}/ja/2.0/config-translation/)を参考として利用できます。
- 設定ファイルの `environment` セクションで環境変数を定義することはできません。
    - 回避策として、変数を `$BASH_ENV` にエコーします。
        - `$BASH_ENV` への変数のエコーは、`bash` でのみ機能し、`sh` では機能しません (Alpine イメージには `sh` のみ)。

- `bash` の `if` ステートメントを使用して、条件付きでコマンドを実行できます。
    - `if [ $CIRCLE_BRANCH =`master`] ; then ./ci.sh ; fi`
- `circleci-agent step halt` を使用すると、そのステップで条件に基づいてビルドを停止できます。
    - 停止することによって、条件付きで `setup_remote_docker` を使用できます。
- 環境変数を定義するだけでタイムゾーンを変更できます。
    - `TZ: America/New_York`
- プロジェクトによっては、`/dev/shm` (たとえば、`/dev/shm/project`) からビルドを実行すると、速度を向上できます。
    - Ruby gems など、共有メモリからロードできないものもあります。 その場合は、システム内の別の場所 (たとえば、`~/vendor`) にインストールしてシンボリック リンクを設定します。
- 多数のコマンドの前に sudo を付ける代わりに、その実行用のシェルを sudo に設定することを検討してください。
    - `shell: sudo bash -eo pipefail`

- 通常、Docker ビルドと docker-compose は `machine` で実行する必要があります。 しかし、事前に言語固有のツール (Ruby、Node、PHP など) が必要になる場合は、リモート環境でも十分です。
- 全体のビルド時間を短縮するために、一部のタスクをバックグラウンドで実行するように設定できますが、リソースの不足に注意してください。
- 異なる `resource_class` サイズの方が良い結果を得られる場合があります。
- `$PATH` には文字列を設定できます。 Docker イメージの `$PATH` がわからない場合は、単に実行して `echo $PATH` を行うか、`env` の出力を確認します。
- イメージの `sha` は、`Spin up Environment` ステップで参照できます。 イメージをその `sha` 値にハードコーディングして、変更不可にすることができます。

- サービス コンテナをカスタム フラグ付きで実行できます。
    - `command: [mysqld, --character-set-server=utf8mb4, --collation-server=utf8mb4_unicode_ci, --init-connect='SET NAMES utf8mb4;']`
- CI でテスト ランナーを実行するときは、スレッドまたはワーカーを 2 つだけ (または、`resource_class` を使用する場合はそれ以上) 生成するように構成します。 それらは、不正な値に基づいて自動的に最適化される場合があります。 詳細については、[こちらのビデオ](https://www.youtube.com/watch?v=CKDVkqIMpHM)を参照してください。



## 1.0 から 2.0 への移行のヒント
{: #tips-for-migrating-from-10-to-20 }

- `$CIRCLE_ARTIFACTS` と `$CIRCLE_TEST_REPORTS` は 2.0 で定義されていないことに注意してください。
    - ユーザーご自身で定義できますが、その場合は `mkdir -p $CIRCLE_ARTIFACTS $CIRCLE_TEST_REPORTS` を実行してください。
- 1 つのリポジトリにある Linux と macOS (React Native など) を移行する場合は、2 つの設定ファイルを組み合わせて 1 つのワークフローにする前に、Linux と macOS のそれぞれに 1 つのブランチを開く必要があります。
- `sudo echo` は使用できません。 `echo 192.168.44.44 git.example.com | sudo tee -a /etc/hosts` のようにパイプしてください。
- Ubuntu システムと Debian システムではフォントが異なります。
- Apache 2.2 と 2.4 では設定ファイルの構成方法が大幅に異なります。 必ず 2.2 の設定ファイルをアップグレードしてください。
- 1.0 によって自動的に推測されていたコマンドと、UI から手動で格納されたコマンドをすべて移行することを忘れないでください。


## Python
{: #python }
- 通常、テストの実行にはファイル名ではなくクラス名が必要です。

## Ruby
{: #ruby }
- Ruby ファイルは、AUFS で想定される順序とは異なる順序でロードされる可能性があります。
- `$RAILS_ENV` と `$RACK_ENV` を `test` と定義します (1.0 では自動で行われていました)。


## Java
{: #java }
- Java (アプリ、ツール、サービス) は使用可能な RAM の量を認識しないため、OOM (メモリ不足) が発生する可能性があります。 その場合は環境変数を定義する必要があります。 それでもメモリ不足になる場合は、コンテナを大きくする必要があります。
    - [CircleCI のブログ記事「How to Handle OOM Errors (OOM エラーの対処方法)」](https://circleci.com/blog/how-to-handle-java-oom-errors/)
- Scala プロジェクトのファイル名は長すぎる場合があるため、`-Xmax-classfile-name` フラグを追加してください。

    ```
                ``` scalacOptions ++= Seq( <code>-encoding</code>, <code>utf-8</code>, <code>-target:jvm-1.8</code>, <code>-deprecation</code>, <code>-unchecked</code>, <code>-Xlint</code>, <code>-feature</code>, <code>-Xmax-classfile-name</code>, <code>242</code> &#060;= add here ),
```


## ## ブラウザー テストに関するヒント
- テストに再現性がなく、理由なく失敗するように見える場合があります。 失敗したブラウザー テストは自動的に再実行できます。 ただし、タイミング データは破損します。
- 失敗したテストのスクリーンショットを撮ると、デバッグが容易になります。
- VNC をインストールして使用できます。 `metacity` をインストールしたら、VNC 内でブラウザーをドラッグできます。 ブラウザー イメージの 1 つから以下を実行してください。

```
ssh -p PORT ubuntu@IP_ADDRESS -L 5902:localhost:5901 # SSH で接続します
  sudo apt install vnc4server metacity
  vnc4server -geometry 1280x1024 -depth 24
  export DISPLAY=:1.0
  metacity &
  firefox &
```

## ## Docker に関するヒント

- cron ジョブで Docker イメージをビルドすると、以下のメリットがあります。
    - 毎週、毎日、または必要に応じてビルドできます。
        - API から容易に新しい Docker イメージのビルドをトリガーできるようになります。
    - `node_modules` のような依存関係をイメージに含めると、以下のメリットがあります。
        - DNS 障害による問題を緩和できます。
        - 依存関係のバージョン管理を行うことができます。
        - ノード リポジトリから消失したモジュールがあっても、アプリケーションの実行に必要な依存関係は安全です。
    - プライベート イメージには、プライベート gems およびプライベート ソース キャッシュを含めることができます。

- データベース用のソケット ファイルはないため、ホスト変数 (`$PGHOST`、`$MYSQL_HOST`) を定義して 127.0.0.1 を指定し、TCP を使用する必要があります。
- CircleCI コンビニエンス イメージまたは公式 Docker Hub イメージを使用すると、イメージがホスト上でキャッシュされる可能性が高くなります。
    - これらのイメージからビルドすると、ダウンロードが必要なイメージ レイヤーの数が減ります。
- コンテナの `-ram` バージョンを使用すると、指定されたデーモンが `/dev/shm` で実行されます。
- すべてがプリインストールされたカスタム イメージをビルドすると、ビルドが高速化され、信頼性が向上します。
    - これにより、一例として、ビルドを破壊するような不良な更新を Heroku がインストーラーにプッシュする状況を防止できます。
- `dockerize` ユーティリティを使用して、サービス コンテナが使用可能になるまでテストの実行を待つことができます。
    - https://github.com/jwilder/dockerize
- ElasticSearch には独自の Docker レジストリがあり、そこからプルできます。
    - https://www.docker.elastic.co/
- コンテナに名前を付けることができます。 そのため、特定のサービスの複数のコンテナを、異なるホスト名を持つ同じポートで実行できます。
- 特権コンテナをリモート環境および `machine` Executor で実行できます。
- ベース Docker Executor からリモート環境にボリュームをマウントすることはできません。
    - `docker cp` でファイルを転送できます。
    - 参照されるボリュームは、リモート環境内からコンテナにマウントされます。




## Fun facts

- CircleCI 2.0 では、ユーザーの想像力を無限に活かすことができます。
- シェルを Python に設定すれば、YAML で任意の Python を実行できます。

```yml
            - run:
      shell: /usr/bin/python3
      command:
          import sys
          print(sys.version)
```

- ``` - bash を上手に活用することで、何でも実行可能です。 `for i in {1..5}; do curl -v $ENDPOINT_URL && break || sleep 10; done`
