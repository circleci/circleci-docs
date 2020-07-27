---
layout: classic-docs
title: "ビルドアーティファクトの保存"
short-title: "ビルドアーティファクトの保存"
description: "ビルド中に作成されるアーティファクトのアップロード例"
categories:
  - configuring-jobs
order: 70
---
このドキュメントでは、以下のセクションに沿って、アーティファクトの操作方法を説明します。

* 目次
{:toc}

## アーティファクトの概要

アーティファクトには、ジョブが完了した後もデータが維持され、ビルドプロセス出力の長期ストレージとして使用できます。

たとえば、Java ビルド・テストのプロセスが 1つ終了すると、プロセスの出力が `.jar` ファイルとして保存されます。 CircleCI では、このファイルをアーティファクトとして保存し、プロセスの終了後も長期間使用可能な状態に維持できます。

![アーティファクトのデータフロー]({{ site.baseurl }}/assets/img/docs/Diagram-v3-Artifact.png)

Android アプリとしてパッケージ化されるプロジェクトの場合は、`.apk` ファイルが Google Play にアップロードされます。これもアーティファクトの例です。

ジョブによってスクリーンショット、カバレッジレポート、コアファイル、デプロイターボールなどの永続的アーティファクトが生成される場合、CircleCI はそれらを自動的に保存およびリンクします。

![[Artifacts (アーティファクト)] タブのスクリーンショット]({{ site.baseurl }}/assets/img/docs/artifacts.png)

**[Job (ジョブ)] ページ**の上部にアーティファクトへのリンクがあります。 アーティファクトは Amazon S3 に保存され、プライベートプロジェクト用の CircleCI アカウントを使用して保護されます。 `curl` ファイルのサイズは 3 GB に制限されています。 アーティファクトはビルドの前後で役立つように設計されています。 長期的な将来の保証を備えたソフトウェアディストリビューションのメカニズムとしてアーティファクトに依存することはお勧めできません。

**メモ：**アップロードされたアーティファクトのファイル名は、[Java URLEncoder](https://docs.oracle.com/javase/7/docs/api/java/net/URLEncoder.html) を使用してエンコードされます。 アプリケーション内の特定のパスにあるアーティファクトを探すときには、この点にご注意ください。

## アーティファクトのアップロード

ビルド中に作成されるアーティファクトをアップロードするには、以下の例を使用します。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: python:3.6.0-jessie

    working_directory: /tmp
    steps:
      - run:
          name: ダミーアーティファクトの作成
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

この `store_artifacts` ステップによって、ファイル (`/tmp/artifact-1`) とディレクトリ (`/tmp/artifacts`) の 2つのビルドアーティファクトがアップロードされます。 アップロードが正常に完了すると、ブラウザー内の**[Job (ジョブ)] ページ**の **[Artifacts (アーティファクト)]** タブにアーティファクトが表示されます。 1つのジョブで実行できる `store_artifacts` ステップの数に制限はありません。

現在、`store_artifacts` には `path` と `destination` の 2つのキーがあります。

* `path` は、アーティファクトとしてアップロードされるファイルまたはディレクトリのパスです。
* `destination` **(オプション)** は、アーティファクト API でアーティファクトパスに追加されるプレフィックスです。 `path` で指定されたファイルのディレクトリがデフォルトとして使用されます。

## コアファイルのアップロード

このセクションでは、[コアダンプ](http://man7.org/linux/man-pages/man5/core.5.html)を取得し、検査やデバッグで使用するためにアーティファクトとしてプッシュする方法について説明します。 以下の例では、[`abort(3)`](http://man7.org/linux/man-pages/man3/abort.3.html) を実行してプログラムをクラッシュさせる短い C プログラムを作成します。

1. 以下の行を含む `Makefile` を作成します。
  ```
        all:
           gcc -o dump main.c
  ```

2. 以下の行を含む `main.c` ファイルを作成します。

    ```C
    #include <stdlib.h>

    int main(int argc, char **argv) { abort(); }
    ```

3. 生成されたプログラムで `make` および `./dump` を実行し、`Aborted (core dumped)`! を印刷します。

このサンプル C abort プログラムをコンパイルし、コアダンプをアーティファクトとして収集する `config.yml` の全体は、以下のようになります。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: gcc:8.1.0
    working_directory: ~/work
    steps:
      - checkout
      - run: make
      - run: |
          # コアダンプファイルのファイルサイズ制限をなくすようにオペレーティング システムに指示します
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

`ulimit -c unlimited` は、コアダンプファイルのファイルサイズ制限をなくします。 この制限をなくすと、プログラムがクラッシュするたびに、カレント作業ディレクトリにコアダンプファイルが作成されます。 コアダンプファイルには、`core.%p.%E` という名前が付きます。`%p` はプロセス ID、`%E` は実行可能ファイルのパス名です。 詳細については、`/proc/sys/kernel/core_pattern` で仕様を確認してください。

最後に、`store_artifacts` によってアーティファクトサービスの `/tmp/core_dumps` ディレクトリにコアダンプファイルが格納されます。

![アーティファクトページに表示されたコアダンプファイル]({{ site.baseurl }}/assets/img/docs/core_dumps.png)

CircleCI がジョブを実行すると、**[Job (ジョブ)] ページ**の [Artifacts (アーティファクト)] タブにコアダンプファイルへのリンクが表示されます。

## CircleCI で行うビルドのすべてのアーティファクトのダウンロード

`curl` を使用してアーティファクトをダウンロードするには、以下の手順を実行します。

1. [パーソナル API トークンを作成]({{ site.baseurl }}/ja/2.0/managing-api-tokens/#パーソナル-api-トークンの作成)し、クリップボードにコピーします。

2. ターミナルウィンドウで、アーティファクトを保存するディレクトリに `cd` します。

3. 以下のコマンドを実行します。 `:` で始まる変数は、コマンドの下に掲載した表を参照して、実際の値に置き換えてください。

```bash
export CIRCLE_TOKEN=':your_token'

curl https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/$build_number/artifacts?circle-token=$CIRCLE_TOKEN \
   | grep -o 'https://[^"]*' \
   | tr -d \" \
   | sed -e "s/$/?circle-token=$CIRCLE_TOKEN/" \
   | wget -v -i -
```

プレースホルダ | 意味 |
--------------|-------------------------------------------------------------------------------|
`:your_token` | 上記で作成したパーソナル API トークン。
`:vcs-type` | 使用しているバージョン管理システム (VCS)。`github` または `bitbucket` のいずれかとなります。
`:username` | ターゲットプロジェクトの VCS プロジェクトアカウントのユーザー名または組織名。 CircleCI アプリケーションの画面左上に表示されています。
`:project` | ターゲット VCS リポジトリの名前。
`:build_num` | アーティファクトをダウンロードする対象のビルドの番号。
{: class="table table-striped"}

### コマンドの説明
{:.no_toc}

まず、CIRCLE_TOKEN 環境変数を作成します。 次に、`curl` コマンドでビルドのすべてのアーティファクト詳細をフェッチし、それを `grep` にパイプして URL を抽出します。 これらの URL が `artifacts.txt` ファイルに保存されます。 最後に、`xargs` がテキストファイルを読み取り、`wget` を使用してアーティファクトをダウンロードします。 すべてのアーティファクトがカレントディレクトリにダウンロードされます。

**メモ：**上記の例の `xargs` は 4つのプロセスを実行してアーティファクトを並列にダウンロードします。 必要に応じて、`-P` フラグに指定する数を調整してください。

## 関連項目
{:.no_toc}

[依存関係のキャッシュ]({{ site.baseurl }}/ja/2.0/caching/)
