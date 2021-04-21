---
layout: classic-docs
title: "ビルド アーティファクトの保存"
short-title: "ビルド アーティファクトの保存"
description: "ビルド中に作成されるアーティファクトのアップロード例"
categories:
  - configuring-jobs
order: 70
---

以下のセクションに沿って、アーティファクトの操作方法を説明します。

* 目次
{:toc}

## アーティファクトの概要

アーティファクトには、ジョブが完了した後もデータが維持され、ビルド プロセス出力を格納する長期ストレージとして使用できます。

たとえば、Java のビルドおよびテストのプロセスが 1 つ終了すると、プロセスの出力が `.jar` ファイルとして保存されます。 CircleCI では、このファイルをアーティファクトとして保存し、プロセスの終了後も長期間使用可能な状態に維持できます。

![アーティファクトのデータ フロー]({{ site.baseurl }}/assets/img/docs/Diagram-v3-Artifact.png)

Android アプリとしてパッケージ化されるプロジェクトの場合は、`.apk` ファイルが Google Play にアップロードされます。これもアーティファクトの一種です。

ジョブによってスクリーンショット、カバレッジ レポート、コア ファイル、デプロイ ターボールなどの永続的アーティファクトが生成される場合、CircleCI はそれらを自動的に保存およびリンクします。

![[Artifacts (アーティファクト)] タブのスクリーンショット]({{ site.baseurl }}/assets/img/docs/artifacts.png)

アーティファクトへのリンクは、**[Job (ジョブ)] ページ**の [Artifacts (アーティファクト)] タブに表示されます。 アーティファクトは Amazon S3 に保存され、プライベート プロジェクト用の CircleCI アカウントを使用して保護されます。 `curl` ファイルのサイズは 3 GB に制限されています。 アーティファクトはビルドの前後で役立つように設計されています。 長期的な将来の保証を備えたソフトウェア ディストリビューションのメカニズムとしてアーティファクトに依存することはお勧めできません。

**メモ:** アップロードされたアーティファクトのファイル名は、[Java URLEncoder](https://docs.oracle.com/javase/7/docs/api/java/net/URLEncoder.html) を使用してエンコードされます。 アプリケーション内の特定のパスにあるアーティファクトを探すときには、この点にご注意ください。

## アーティファクトのアップロード

ビルド中に作成されるアーティファクトをアップロードするには、以下の例を使用します。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: python:3.6.3-jessie

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

現在、`store_artifacts` には `path` と `destination` の 2 つのキーがあります。

* `path` は、アーティファクトとしてアップロードされるファイルまたはディレクトリのパスです。
* `destination` **(オプション)** は、アーティファクト API でアーティファクト パスに追加されるプレフィックスです。 `path` で指定されたファイルのディレクトリがデフォルトとして使用されます。

## コア ファイルのアップロード

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

このサンプル C abort プログラムをコンパイルし、コア ダンプをアーティファクトとして収集する `config.yml` の全体は、以下のようになります。

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

`ulimit -c unlimited` は、コア ダンプ ファイルのファイル サイズ制限をなくします。 この制限をなくすと、プログラムがクラッシュするたびに、作業中のカレント ディレクトリにコア ダンプ ファイルが作成されます。 コア ダンプ ファイルには、`core.%p.%E` という名前が付きます。`%p` はプロセス ID、`%E` は実行可能ファイルのパス名です。 詳細については、`/proc/sys/kernel/core_pattern` で仕様を確認してください。

最後に、`store_artifacts` によってアーティファクト サービスの `/tmp/core_dumps` ディレクトリにコア ダンプ ファイルが格納されます。

![アーティファクト ページに表示されたコア ダンプ ファイル]({{ site.baseurl }}/assets/img/docs/core_dumps.png)

CircleCI がジョブを実行すると、**[Job (ジョブ)] ページ**の [Artifacts (アーティファクト)] タブにコア ダンプ ファイルへのリンクが表示されます。

## CircleCI で行うビルドのすべてのアーティファクトのダウンロード

`curl` を使用してアーティファクトをダウンロードするには、以下の手順を実行します。

1. [パーソナル API トークンを作成]({{ site.baseurl }}/2.0/managing-api-tokens/#パーソナル-api-トークンの作成)し、クリップボードにコピーします。

2. ターミナル ウィンドウで、アーティファクトを保存するディレクトリに `cd` します。

3. 以下のコマンドを実行します。 `:` で始まる変数は、コマンドの下に掲載した表を参照して、実際の値に置き換えてください。

```bash
export CIRCLE_TOKEN=':your_token'

curl https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/$build_number/artifacts?circle-token=$CIRCLE_TOKEN \
   | grep -o 'https://[^"]*' \
   | sed -e "s/$/?circle-token=$CIRCLE_TOKEN/" \
   | wget -v -i -
```

同様に、ビルドの*最新*のアーティファクトをダウンロードする場合は、curl の呼び出しを以下のように URL で置き換えます。

```bash
curl https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/latest/artifacts?circle-token=:your_token
```

CircleCI の API を使用してアーティファクトを操作する詳しい方法については、[API リファレンス ガイド](https://circleci.com/docs/api/#artifacts) を参照してください。

| プレースホルダー      | 意味                                                                           |
| ------------- | ---------------------------------------------------------------------------- |
| `:your_token` | 上記で作成した個人用の API トークン。                                                        |
| `:vcs-type`   | 使用しているバージョン管理システム (VCS)。 `github` または `bitbucket` のいずれかとなります。                |
| `:username`   | ターゲット プロジェクトの VCS プロジェクト アカウントのユーザー名または組織名。 CircleCI アプリケーションの画面左上に表示されています。 |
| `:project`    | ターゲット VCS リポジトリの名前。                                                          |
| `:build_num`  | アーティファクトをダウンロードする対象のビルドの番号。                                                  |
{: class="table table-striped"}

### コマンドの説明
{:.no_toc}

まず、CIRCLE_TOKEN 環境変数を作成します。 次に、`curl` コマンドでビルドのすべてのアーティファクト詳細をフェッチし、それを `grep` にパイプして URL を抽出します。 circle トークンでファイルの末尾に追加される `sed` を使用して、一意のファイル名を作成します。 最後に、`wget` を使用してアーティファクトをターミナル内のカレント ディレクトリにダウンロードします。

## 関連項目
{:.no_toc}

[依存関係のキャッシュ]({{ site.baseurl }}/2.0/caching/)