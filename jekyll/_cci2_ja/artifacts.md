---
layout: classic-docs
title: "ビルド アーティファクトの保存"
short-title: "ビルド アーティファクトの保存"
description: "ビルド中に作成されるアーティファクトのアップロード例"
order: 70
version:
  - Cloud
  - Server v2.x
---

以下のセクションに沿って、アーティファクトの操作方法を説明します。

* 目次
{:toc}

## アーティファクトの概要
アーティファクトには、ジョブが完了した後もデータが維持され、ビルド プロセス出力を格納するストレージとして使用できます。

Artifacts persist data after a job is completed and may be used for storage of the outputs of your build process.

たとえば、Java のビルドおよびテストのプロセスが 1 つ終了すると、プロセスの出力が `.jar` ファイルとして保存されます。 CircleCI では、このファイルをアーティファクトとして保存し、プロセスの終了後も使用可能な状態に維持できます。

![アーティファクトのデータ フロー]( {{ site.baseurl }}/assets/img/docs/Diagram-v3-Artifact.png)

ジョブによってスクリーンショット、カバレッジ レポート、コア ファイル、デプロイ ターボールなどの永続的アーティファクトが生成される場合、CircleCI はそれらを自動的に保存およびリンクします。

If a job produces persistent artifacts such as screenshots, coverage reports, core files, or deployment tarballs, CircleCI can automatically save and link them for you.

![[Artifacts (アーティファクト)] タブのスクリーンショット]( {{ site.baseurl }}/assets/img/docs/artifacts.png)

アーティファクトへのリンクは、**[Job (ジョブ)] ページ**の [Artifacts (アーティファクト)] タブに表示されます。 アーティファクトは Amazon S3 に保存され、プライベート プロジェクト用の CircleCI アカウントを使用して保護されます。 `curl` ファイルのサイズは 3 GB に制限されています。

**アーティファクトへは作成から30日間アクセスできます。 **  ドキュメントや永続的なコンテンツのソースとして依存している場合、S3や静的Webサイト用のGitHub Pages、Netlifyのような専用領域にデプロイすることを推奨します。

**メモ:** アップロードされたアーティファクトのファイル名は、[Java URLEncoder](https://docs.oracle.com/javase/7/docs/api/java/net/URLEncoder.html) を使用してエンコードされます。 アプリケーション内の特定のパスにあるアーティファクトを探すときには、この点にご注意ください。

## アーティファクトのアップロード
{: #uploading-artifacts }

現在、`store_artifacts` には `path` と `destination` の 2 つのキーがあります。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: python:3.6.3-jessie
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference

    working_directory: /tmp
    steps:

      - run:
          name: ダミー アーティファクトの作成
          command: |
            echo "my artifact file" > /tmp/artifact-1;
            mkdir /tmp/artifacts;
            echo "my artifact files in a dir" > /tmp/artifacts/artifact-2;

      - store_artifacts:
          path: /tmp/artifact-1
          destination: artifact-file

      - store_artifacts:
          path: /tmp/artifacts
```

この `store_artifacts` ステップによって、ファイル (`/tmp/artifact-1`) とディレクトリ (`/tmp/artifacts`) の 2 つのビルド アーティファクトがアップロードされます。 アップロードが正常に完了すると、ブラウザー内の**[Job (ジョブ)] ページ**の **[Artifacts (アーティファクト)]** タブにアーティファクトが表示されます。 大量のアーティファクトをまとめてアップロードする場合は、[単一の圧縮ファイルとしてアップロード](https://support.circleci.com/hc/en-us/articles/360024275534?input_string=store_artifacts+step)することで高速化できます。   
単一のジョブで実行可能な `store_artifacts` ステップの数に制限はありません。


このサンプル C abort プログラムをコンパイルし、コア ダンプをアーティファクトとして収集する `config.yml` の全体は、以下のようになります。

  - `path` は、アーティファクトとしてアップロードされるファイルまたはディレクトリのパスです。
  - `destination` **(オプション)** は、アーティファクト API でアーティファクト パスに追加されるプレフィックスです。 `path` で指定されたファイルのディレクトリがデフォルトとして使用されます。

## コア ファイルのアップロード
{: #uploading-core-files }

このセクションでは、[コア ダンプ](http://man7.org/linux/man-pages/man5/core.5.html)を取得し、検査やデバッグで使用するためにアーティファクトとしてプッシュする方法について説明します。 以下の例では、[`abort(3)`](http://man7.org/linux/man-pages/man3/abort.3.html) を実行してプログラムをクラッシュさせる短い C プログラムを作成します。

1. 以下の行を含む `Makefile` を作成します。

     ```
     all:
       gcc -o dump main.c
     ```

2. 以下の行を含む `main.c` ファイルを作成します。

     ```C
     # <stdlib.h> を含めます

     int main(int argc, char **argv) {
         abort();
     }
     ```

3. 生成されたプログラムで `make` と `./dump` を実行し、`Aborted (core dumped)`! を印刷します。

Following is a full `config.yml` that compiles the example C abort program, and collects the core dumps as artifacts.

```yaml
version: 2
jobs:
  build:
    docker:
      - image: gcc:8.1.0
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    working_directory: ~/work
    steps:
      - checkout
      - run: make
      - run: |
          # コア ダンプ ファイルのファイル サイズ制限をなくすようにオペレーティング システムに指示します
          ulimit -c unlimited
          ./dump
      - run:
          command: |
            mkdir -p /tmp/core_dumps
            cp core.* /tmp/core_dumps
          when: on_fail
      - store_artifacts:
          path: /tmp/core_dumps
```

`ulimit -c unlimited` は、コア ダンプ ファイルのファイル サイズ制限をなくします。 この制限をなくすと、プログラムがクラッシュするたびに、作業中のカレント ディレクトリにコア ダンプ ファイルが作成されます。 コア ダンプ ファイルには、`core.%p.%E` という名前が付きます。 `%p` はプロセス ID、`%E` は実行可能ファイルのパス名です。 詳細については、`/proc/sys/kernel/core_pattern` で仕様を確認してください。

`curl` を使用してアーティファクトをダウンロードするには、以下の手順を実行します。

![アーティファクト ページに表示されたコア ダンプ ファイル]( {{ site.baseurl }}/assets/img/docs/core_dumps.png)

CircleCI の API を使用してアーティファクトを操作する詳しい方法については、[API リファレンス ガイド](https://circleci.com/docs/api/#artifacts) を参照してください。

## CircleCI で行うビルドのすべてのアーティファクトのダウンロード
{: #downloading-all-artifacts-for-a-build-on-circleci }

To download your artifacts with `curl`, follow the steps below.

1. [パーソナル API トークンを作成]({{ site.baseurl }}/ja/2.0/managing-api-tokens/#パーソナル-api-トークンの作成)し、クリップボードにコピーします。

2. ターミナル ウィンドウで、アーティファクトを保存するディレクトリに `cd` します。

3. 以下のコマンドを実行します。 `:` で始まる変数は、コマンドの下に掲載した表を参照して、実際の値に置き換えてください。

```bash
# Set an environment variable for your API token.
次に、<code>curl</code> コマンドでビルドのすべてのアーティファクト詳細をフェッチし、それを <code>grep</code> にパイプして URL を抽出します。
最後に、<code>wget</code> を使用してアーティファクトをターミナル内のカレント ディレクトリにダウンロードします。

export CIRCLE_TOKEN=':your_token'

curl -H "Circle-Token: $CIRCLE_TOKEN" https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/$build_number/artifacts \
   | grep -o 'https://[^"]*' \
   | wget --verbose --header "Circle-Token: $CIRCLE_TOKEN" --input-file -
```
 コマンドでビルドのすべてのアーティファクト詳細をフェッチし、それを grep にパイプして URL を抽出します。
最後に、wget を使用してアーティファクトをターミナル内のカレント ディレクトリにダウンロードします。

export CIRCLE_TOKEN=':your_token'

curl -H "Circle-Token: $CIRCLE_TOKEN" https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/$build_number/artifacts \
   | grep -o 'https://[^"]*' \
   | wget --verbose --header "Circle-Token: $CIRCLE_TOKEN" --input-file -
</code>

同様に、ビルドの*最新*のアーティファクトをダウンロードする場合は、curl の呼び出しを以下のように URL で置き換えます。

```bash
curl https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/latest/artifacts?circle-token=:your_token
```

You can read more about using CircleCI's API to interact with artifacts in our [API reference guide](https://circleci.com/docs/api/v1/#artifacts).

| プレースホルダー      | 意味                                                                           |
| ------------- | ---------------------------------------------------------------------------- |
| `:your_token` | 上記で作成した個人用の API トークン。                                                        |
| `:vcs-type`   | 使用しているバージョン管理システム (VCS)。 `github` または `bitbucket` のいずれかとなります。                |
| `:username`   | ターゲット プロジェクトの VCS プロジェクト アカウントのユーザー名または組織名。 CircleCI アプリケーションの画面左上に表示されています。 |
| `:project`    | ターゲット VCS リポジトリの名前。                                                          |
| `:build_num`  | アーティファクトをダウンロードする対象のビルドの番号。                                                  |
{: class="table table-striped"}

## 関連項目
{: #see-also }
{:.no_toc}

[依存関係のキャッシュ]({{ site.baseurl }}/2.0/caching/)
