---
layout: classic-docs
title: "依存関係のキャッシュ"
description: "このドキュメントでは、CircleCI パイプラインにおける依存関係のキャッシュについて説明します。"
categories:
  - 最適化
order: 50
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
    - Server v2.x
---

キャッシュは、CircleCI でのジョブを高速化する最も効果的な方法の 1 つです。 また、以前のジョブからデータを再利用することでフェッチ操作のコストを下げることができます。 ジョブを 1 回実行すると、それ以降のジョブインスタンスでは同じ処理をやり直す必要がなくなり、その分高速化されます。

* 目次
{:toc}

![キャッシュのデータフロー]({{site.baseurl}}/assets/img/docs/caching-dependencies-overview.png)

キャッシュは、Yarn、Bundler、Pip などの**パッケージ依存関係管理ツール**と共に使用すると特に有効です。 キャッシュから依存関係をリストアすることで、`yarn install` などのコマンドを実行するときに、ビルドごとにすべてを再ダウンロードするのではなく、新しい依存関係のみをダウンロードすれば済むようになります。


**警告:** 異なる Executor 間で (たとえば、Docker と Machine、Linux、Windows、または MacOS の間、または CircleCI イメージとそれ以外のイメージの間で) ファイルをキャッシュすると、ファイルへのアクセスエラーまたはパスエラーが発生することがあります。 これらのエラーは、ユーザーが存在しない、ユーザーの UID が異なる、パスが存在しないなどの理由で発生します。 異なる Executor 間でファイルをキャッシュする場合は、特に注意してください。
{: class="alert alert-warning"}


## はじめに
{: #introduction }
{:.no_toc}

CircleCI  では依存関係のキャッシュの自動化には対応していません。このため、最適なパフォーマンスを得るには、キャッシュ戦略を計画して実装することが重要です。 CicleCI  では手動設定により、優れたキャッシュ戦略を立て、きめ細やかに制御することが可能です。 [キャッシュ戦略]({{site.baseurl}}/ja/caching-strategy/)と[データの永続化]({{site.baseurl}}/ja/persist-data/)でキャッシュ戦略と管理に関するヒントを参照してださい。

ここでは、手動によるキャッシュオプション、選択した戦略のコストとメリット、およびキャッシュに関する問題を回避するためのヒントについて説明します。

デフォルトのキャッシュの保存期間は 15 日間です。 保存期間は、[CircleCI Web アプリ](https://app.circleci.com/)の **Plan > Usage Controls** からカスタマイズ可能です。 現在、設定できる保存期間の最大値が 15 日間となっています。

CircleCI のジョブ実行に使われる Docker イメージは、サーバーインフラ上で自動的にキャッシュされる場合があります。
{: class="alert alert-info"}

**警告:** 下記では様々な例を紹介していますが、キャッシュ戦略は各プロジェクトごとに入念に計画する必要があります。 サンプルコードのコピー＆ペーストではお客様のニーズに合わない場合があります。
{: class="alert alert-warning"}

Docker イメージの未変更レイヤー部分のキャッシュと再利用については、[Docker レイヤーキャッシュ]({{site.baseurl}}/ja/docker-layer-caching/)のページをご覧ください。

## キャッシュとは
{: #how-caching-works }

キャッシュは、キーで指定したファイル群の階層構造を保存するものです。 キャッシュを使用してデータを保存するとジョブが高速で実行されますが、キャッシュミス (ゼロキャッシュリストア) が起きた場合でも、ジョブは正常に実行されます。 たとえば、`NPM`パッケージディレクトリ (`node_modules`として知られています) をキャッシュするとします。 ジョブを初めて実行すると、依存関係がすべてダウンロードされ、キャッシュされます。また、キャッシュが有効な場合は、次回ジョブを実行するときにそのキャッシュを使用してジョブを高速化します。

キャッシュにより、信頼性を確保しつつ最大限のパフォーマンスを得ることができます。  通常、ビルドが破損するリスクを冒したり、古い依存関係を使用して迅速にビルドするよりも、信頼性を追求する方が安全です。

## 基本的な依存関係キャッシュの例
{: #basic-example-of-dependency-caching }

### キャッシュの保存
{: #saving-cache }

手動で設定可能な依存関係キャッシュを最大限に活用するには、キャッシュの対象と方法を明確にする必要があります。 具体例は CircleCI の設定方法のページ内にある [save_cache]({{site.baseurl}}/ja/configuration-reference/#save_cache) のセクションをご覧ください。

ファイルやディレクトリのキャッシュを保存するには、`.circleci/config.yml` ファイルでジョブに `save_cache` ステップを追加します。

```yaml
    steps:
      - save_cache:
          key: my-cache
          paths:
            - my-file.txt
            - my-project/my-dependencies-directory
```

CircleCI では、`key`の最大文字数を 900 文字に設定しています。 キャッシュキーがこの制限を超えないよう、ご注意ください。 ディレクトリのパスは、ジョブの `working_directory` からの相対パスです。 必要に応じて、絶対パスも指定できます。

**注:** 特別なステップ[`persist_to_workspace`]({{site.baseurl}}/ja/configuration-reference/#persist_to_workspace) とは異なり、`save_cache` および `restore_cache` は `paths` キーのグロブをサポートしていません。

### キャッシュのリストア
{: #restoring-cache }

CircleCI では、`restore_cache` ステップにリストされているキーの順番でキャッシュが復元されます。 各キャッシュキーはプロジェクトごとに名前空間をもち、プレフィックスの一致で検索されます。 最初に一致したキーのキャッシュがリストアされます。 複数の一致がある場合は、最も新しく生成されたキャッシュが使用されます。

2 つのキーを用いた例は下記の通りです。

{% raw %}
```yaml
    steps:
      - restore_cache:
          keys:
            # この package-lock.json のチェックサムに一致するキャッシュを検索します
            # このファイルが変更されている場合、このキーは失敗します
            - v1-npm-deps-{{ checksum "package-lock.json" }}
            # 任意のブランチから使用される、最も新しく生成されたキャッシュを検索します
            - v1-npm-deps-
```
{% endraw %}

2 つ目のキーは最初のキーよりも特定度が低いため、現在の状態と最も新しく生成されたキャッシュとの間に差がある可能性が高くなります。 依存関係ツールを実行すると、古い依存関係が検出されて更新されます。 これを**部分キャッシュ リストア**と言います。

`keys:` リストのすべての行は _1 つのキャッシュ_を管理します (各行が固有のキャッシュに**対応しているわけではありません**)。 この例でリストされているキー {% raw %}(`v1-npm-deps-{{ checksum "package-lock.json" }}`{% endraw %} および `v1-npm-deps-`) は、**単一**のキャッシュを表しています。 キャッシュのリストアが必要になると CircleCI は、まず (最も特定度の高い) 最初のキーに基づいてキャッシュを検証し、次に他のキーを順に調べ、他のキャッシュキーに変更があるかどうかを確認します。

最初のキーにより、 `package-lock.json` ファイルのチェックサムが文字列 `v1-nPM-deps-` に連結されます。 コミットでこのファイルが変更された場合は、新しいキャッシュキーが調べられます。

2 つ目のキーには動的コンポーネントが連結されていません。 これは静的な文字列 `v1-npm-deps-`です。 キャッシュを手動で無効にするには、`.config.yml` ファイルで `v1` を `v2` にバンプします。 これで、キャッシュ キーが新しい `v2-npm-deps` になり、新しいキャッシュの保存がトリガーされます。

## Yarn パッケージマネージャーのキャッシュの基本的な例
{: #basic-example-of-yarn-package-manager-caching }

[Yarn](https://classic.yarnpkg.com/en/) は、JavaScript 用のオープンソースパッケージマネージャーです。 インストールされるパッケージはキャッシュが可能です。キャッシュにより、ビルドを高速化できるだけでなく、さらに重要なメリットとして、ネットワーク接続に関連するエラーを低減できます。

Yarn 2.x のリリースには [Zero Installs](https://yarnpkg.com/features/zero-installs) 機能が含まれています。 Zero Installs をご使用の場合、CircleCI で特にキャッシュを行う必要なありません。

Yarn 2.x を Zero Installs を _使わずに_ 使用している場合は、次のように設定します。

{% raw %}
```yaml
#...
      - restore_cache:
          name: Restore Yarn Package Cache
          keys:
            - yarn-packages-{{ checksum "yarn.lock" }}
      - run:
          name: Install Dependencies
          command: yarn install --immutable
      - save_cache:
          name: Save Yarn Package Cache
          key: yarn-packages-{{ checksum "yarn.lock" }}
          paths:
            - .yarn/cache
            - .yarn/unplugged
#...
```
{% endraw %}

Yarn 1.x をご使用の場合は、次のように設定します。

{% raw %}
```yaml
#...
      - restore_cache:
          name: Restore Yarn Package Cache
          keys:
            - yarn-packages-{{ checksum "yarn.lock" }}
      - run:
          name: Install Dependencies
          command: yarn install --frozen-lockfile --cache-folder ~/.cache/yarn
      - save_cache:
          name: Save Yarn Package Cache
          key: yarn-packages-{{ checksum "yarn.lock" }}
          paths:
            - ~/.cache/yarn
#...
```
{% endraw %}

## キャッシュとオープンソース
{: #caching-and-open-source }

プロジェクトがオープンソースの場合や、フォーク可能として開発者からのプルリクエスト (PR) を受け付ける場合は、次のことに注意してください。

- 同じフォークリポジトリからの PR は、キャッシュを共有します (前述のように、これには main リポジトリ内の PR と main によるキャッシュの共有が含まれます)。
- それぞれ異なるフォークリポジトリ内にある 2 つの PR は、別々のキャッシュを持ちます。
- [環境変数]({{site.baseurl}}/ja/env-vars)の共有を有効にすると、元のリポジトリとフォークされているすべてのビルド間でキャッシュ共有が有効になります。

## ライブラリのキャッシュ
{: #caching-libraries }

ジョブで任意の時点のデータをフェッチする場合は、キャッシュを利用できる可能性があります。 ジョブ実行中にキャッシュすることが最も重要な依存関係は、プロジェクトが依存するライブラリです。 例えば、Python の `pip` や Node.js の `npm` のような依存関係管理ツールがインストールするライブラリをキャッシュするというものです。 これら `pip` や `npm` などの依存関係管理ツールは、依存関係のインストール先となるディレクトリを個別に用意しています。 お使いのスタックの仕様については、各言語ガイドおよび[デモ プロジェクト]({{site.baseurl}}/ja/demo-apps/)を参照してください。

現在のプロジェクトで必要になるツールがわからない場合でも、Docker イメージが解決してくれます。 CircleCI のビルド済み Docker イメージには、そのイメージが対象としている言語を使用してプロジェクトをビルドするための汎用ツールがプリインストールされています。 たとえば、`circleci/ruby:3.1.2` というイメージには、git、openssh-client、gzip などの便利なツールが含まれています。

![依存関係のキャッシュ]({{site.baseurl}}/assets/img/docs/cache_deps.png)

依存関係のインストール ステップが正常に終了したことを確認してから、キャッシュのステップを追加することをお勧めします。 依存関係のステップで失敗したままキャッシュする場合は、不良キャッシュによるビルドの失敗を回避するために、キャッシュ キーを変更する必要があります。

`pip` の依存関係のキャッシュ例

{:.tab.dependencies.Cloud}
{% raw %}
```yaml
version: 2.1
jobs:
  build:
    steps: # a collection of executable commands making up the 'build' job
      - checkout # pulls source code to the working directory
      - restore_cache: # **restores saved dependency cache if the Branch key template or requirements.txt files have not changed since the previous run**
          key: deps1-{{ .Branch }}-{{ checksum "requirements.txt" }}
      - run: # install and activate virtual environment with pip
          command: |
            python3 -m venv venv
            . venv/bin/activate
            pip install -r requirements.txt
      - save_cache: # ** special step to save dependency cache **
          key: deps1-{{ .Branch }}-{{ checksum "requirements.txt" }}
          paths:
            - "venv"
```
{% endraw %}

{:.tab.dependencies.Server_3}
{% raw %}
```yaml
version: 2.1
jobs:
  build:
    steps: # a collection of executable commands making up the 'build' job
      - checkout # pulls source code to the working directory
      - restore_cache: # **restores saved dependency cache if the Branch key template or requirements.txt files have not changed since the previous run**
          key: deps1-{{ .Branch }}-{{ checksum "requirements.txt" }}
      - run: # install and activate virtual environment with pip
          command: |
            python3 -m venv venv
            . venv/bin/activate
            pip install -r requirements.txt
      - save_cache: # ** special step to save dependency cache **
          key: deps1-{{ .Branch }}-{{ checksum "requirements.txt" }}
          paths:
            - "venv"
```
{% endraw %}

{:.tab.dependencies.Server_2}
{% raw %}
```yaml
version: 2
jobs:
  build:
    steps: # a collection of executable commands making up the 'build' job
      - checkout # pulls source code to the working directory
      - restore_cache: # **restores saved dependency cache if the Branch key template or requirements.txt files have not changed since the previous run**
          key: deps1-{{ .Branch }}-{{ checksum "requirements.txt" }}
      - run: # install and activate virtual environment with pip
          command: |
            python3 -m venv venv
            . venv/bin/activate
            pip install -r requirements.txt
      - save_cache: # ** special step to save dependency cache **
          key: deps1-{{ .Branch }}-{{ checksum "requirements.txt" }}
          paths:
            - "venv"
```
{% endraw %}

キャッシュ `key` で `checksum` の使用を記述します。 これを使用すると、特定の依存関係管理ファイル (`package.json`、`requirements.txt` など) に _変更_ があるかどうかを判断でき、キャッシュはそれに応じて更新されます。 また上記の例では、[`restore_cache`]({{site.baseurl}}/ja/configuration-reference#restore_cache) で動的な値をキャッシュ キーに挿入することで、キャッシュの更新が必要となる条件をより正確に制御できるようにしています。

## ワークフローでのキャッシュへの書き込み
{: #writing-to-the-cache-in-workflows }

同じワークフロー内のジョブどうしはキャッシュを共有できます。 そのため、複数のワークフローの複数のジョブにまたがってキャッシュを実行すると、競合状態が発生する可能性があります。

キャッシュの書き換えはできません。 `node-cache-main`のように特定のキーにキャッシュを一度書き込むと、再度書き込むことはできません。

### キャッシュの競合状態の例 1
{: #caching-race-condition-example-1 }

たとえば、ジョブ 3 がジョブ 1 とジョブ 2 に依存する 3 つのジョブのワークフローがあるとします ({Job1, Job2} -&gt; Job3)。 それら 3 つのジョブはすべて同じキャッシュキーについて読み書きを行います。

このワークフローの実行中、ジョブ 3 はジョブ 1 _または_ジョブ 2 によって書き込まれたキャッシュを使用します。 ただし、キャッシュは書き換え不可のため、ジョブ 1 とジョブ 2 のどちらかが最初に書き込んだキャッシュを使うことになります。

これは、結果が確定的ではないため通常は望ましくありません。 結果の一部が異なる場合があります。

ジョブの依存関係を変更することにより、ワークフローを確定的にすることができます。 たとえば、ジョブ 1 とジョブ 2 では別々のキャッシュに書き込み、 ジョブ 3 ではいずれかのキャッシュからのみ読み込みます。 または、一方向の依存関係を指定します (ジョブ 1 -&gt; ジョブ 2 -&gt; ジョブ 3)

### キャッシュの競合状態の例 2
{: #caching-race-condition-example-2 }

{% raw %}`node-cache-{{ checksum "package-lock.json" }}`{% endraw %} のような動的キーを使用して保存を行い、`node-cache-` のようなキーの部分一致を使用してリストアを行うような、より複雑なジョブのケースもあります。

この場合でも競合状態になる可能性はありますが、詳細はケースによって異なります。 たとえば、ダウンストリームジョブでは、最後に実行されたアップストリームジョブのキャッシュが使用されるようなケースです。

ジョブ間でキャッシュを共有している場合に発生する競合状態もあります。 依存リンクのない、ジョブ 1 とジョブ 2 からなるワークフローを考えてみましょう。 ジョブ 2 はジョブ 1 で保存したキャッシュを使うこととします。 ジョブ 1 がキャッシュを保存していても、ジョブ 2 はそのキャッシュを復元することもあれば、キャッシュがないことを検出することもあります。 また、ジョブ 2 が以前のワークフローからキャッシュを読み込むこともあります。 このケースでは、ジョブ 1 がキャッシュを保存する前に、ジョブ 2 がそれを読み込もうとしていると考えられます。 この問題を解決するには、ワークフローの依存関係 (ジョブ 1 -> ジョブ 2) を作成します。 こうすることで、ジョブ 1 が処理を終えるまでジョブ 2 が強制的に待機することになります。

## モノレポ でのキャッシュの使用
{: #using-caching-in-monorepos }

モノレポでキャッシュを活用する際のアプローチは数多くあります。 ここで紹介する方法は、モノレポのさまざまな部分にある複数のファイルに基づいて共有キャッシュを管理する必要がある場合に使用できます。

### 連結 `package-lock` ファイルの作成とビルド
{: #creating-and-building-a-concatenated-package-lock-file }

1. カスタムコマンドを設定ファイルに追加します。

      {% raw %}
      ```yaml
      commands:
        create_concatenated_package_lock:
          description: "Concatenate all package-lock.json files recognized by lerna.js into single file. File is used as checksum source for part of caching key."
          parameters:
            filename:
              type: string
          steps:
            - run:
                name: Combine package-lock.json files to single file
                command: npx lerna la -a | awk -F packages '{printf "\"packages%s/package-lock.json\" ", $2}' | xargs cat > << parameters.filename >>
      ```
      {% endraw %}

2. ビルド時にカスタムコマンドを使用して、連結 `package-lock` ファイルを生成します。

      {% raw %}
      ```yaml
          steps:
            - checkout
            - create_concatenated_package_lock:
                filename: combined-package-lock.txt
            ## キャッシュキーに combined-package-lock.text を使用します。
            - restore_cache:
                keys:
                  - v3-deps-{{ checksum "package-lock.json" }}-{{ checksum "combined-package-lock.txt" }}
                  - v3-deps
      ```
      {% endraw %}

## キャッシュの管理
{: #managing-caches }

### キャッシュのクリア
{: #clearing-cache }

キャッシュはクリアできません。 新しくキャッシュを生成する必要がある場合は、上述の例と同様にキャッシュキーをアップデートします。 言語またはビルド管理ツールのバージョンを更新した際は、この操作を実行することをお勧めします。

`.circleci/config.yml` ファイルの保存ステップとリストアステップでキャッシュキーを更新すると、その時点から一連のキャッシュが新たに生成されます。 以前のキーを使用して古いコミットを行ってもキャッシュが生成され保存される可能性があるため、 config.yml の変更後にリベースすることをお勧めします。

キャッシュのバージョンを上げて新しいキャッシュを作成しても、「古い」キャッシュは保存されます。 ここでは、別のキャッシュを作成していることに注意してください。 この方法ではストレージの使用量が増加します。 一般的なベストプラクティスとして、現在キャッシュされている内容を確認し、ストレージの使用量をできる限り削減する必要があります。

**ヒント:** キャッシュは変更不可なので、すべてのキャッシュ キーの先頭にプレフィックスとしてバージョン名 (<code class="highlighter-rouge">v1-...</code> など) を付加すると便利です。 それにより、プレフィックスのバージョン番号を増やすだけで、キャッシュ全体を再生成できます。
{: class="alert alert-info"}

下記のような状況では、キャッシュキーの名前を変えることによるキャシュのクリアを検討してみてください。

* npm コマンドがバージョンアップするなど、依存関係管理ツールのバージョンが変更になった場合
* Ruby のバージョンが 2.3 から 2.4 に変更されるなど、言語のバージョンが変更された場合
* プロジェクトから依存関係が削除された場合

**ヒント:** キャッシュキーに <code class="highlighter-rouge">:、?、&、=、/、#</code> などの特殊文字や予約文字を使用すると、ビルドの際に問題が発生する可能性があるため、注意が必要です。 キャッシュキーのプレフィックスには \[a-z\]\[A-Z\] の文字を使用してください。
{: class="alert alert-info"}

### キャッシュサイズ
{: #cache-size }

キャッシュサイズは 500 MB 未満に抑えることをお勧めします。 これは、破損チェックを実行するための上限のサイズです。 このサイズを超えると、チェック時間が非常に長くなります。 キャッシュ サイズは、CircleCI の [Jobs (ジョブ)] ページの `restore_cache` ステップで確認できます。 キャッシュサイズを増やすこともできますが、キャッシュのリストア中に問題が発生したり、ダウンロード中に破損する可能性が高くなるため、お勧めできません。 キャッシュサイズを抑えるため、複数のキャッシュに分割することを検討してください。

### ネットワークとストレージ使用状況の表示

ネットワークとストレージの使用状況の表示、および毎月のネットワークとストレージの超過コストの計算については、[データの永続化 ]({{site.baseurl}}/ja/persist-data/#managing-network-and-storage-use)を参照してください。

## キーとテンプレートの使用
{: #using-keys-and-templates }

各キャッシュ キーは、1 つのデータキャッシュに対応する*ユーザー定義*の文字列です。 **動的な値**を挿入してキャッシュキーを作成することができます。 これは**テンプレート**と呼ばれます。 キャッシュキー内の中かっこで囲まれている部分がテンプレートです。 以下を例に考えてみましょう。

```shell
{% raw %}myapp-{{ checksum "package-lock.json" }}{% endraw %}
```

上の例の出力は、このキーを表す一意の文字列です。 ここでは、[チェックサム](https://ja.wikipedia.org/wiki/チェックサム)を使用して、`package-lock.json` の内容を表す一意の文字列を作成しています。

この例では、以下のような文字列が出力されます。

```shell
myapp-+KlBebDceJh_zOWQIAJDLEkdkKoeldAldkaKiallQ=
```

`package-lock` ファイルの内容が変更された場合、`checksum` 関数は別の一意の文字列を返し、キャッシュを無効化する必要があることが示されます。

キャッシュの `key` に使用するテンプレートを選択するうえでは、キャッシュの保存にはコストがかかることを留意してください。 キャッシュを CircleCI ストレージにアップロードするにはある程度の時間がかかります。 ビルドのたびに新しいキャッシュが生成されるのを避けるには、変更があった場合にのみ新しいキャッシュを生成する`キー`を指定します。

まず初めに、プロジェクトにおいて一意となる値のキーを用いて、キャッシュを保存・復元するタイミングを決めます。 ビルド番号が増えたとき、リビジョンが上がったとき、依存マニフェストファイルのハッシュ値が変わったときなどが考えられます。

以下は、さまざまな目的に合わせたキャッシュ戦略の例です。

 * {% raw %}`myapp-{{ checksum "package-lock.json" }}`{% endraw %}: `package-lock.json` ファイルの内容が変更されるたびにキャッシュが再生成されます。 このプロジェクトの別々のブランチで同じキャッシュキーが生成されます。
 * {% raw %}`myapp-{{ .Branch }}-{{ checksum "package-lock.json" }}`{% endraw %}: `package-lock.json` ファイルの内容が変更されるたびにキャッシュが再生成されます。 このプロジェクトの別々のブランチで異なるキャッシュキーが生成されます。
 * {% raw %}`myapp-{{ epoch }}`{% endraw %}: ビルドごとに異なるキャッシュキーを生成します。

ステップの実行中に、上のテンプレートが実行時の値に置き換えられ、その置換後の文字列が `key` として使用されます。 CirlceCI のキャッシュ`キー`で利用可能なテンプレートを下記の表にまとめました。

| テンプレート                                                            | 説明                                                                                                                                                                                                                                                                                                                                                                |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| {% raw %}`{{ checksum "filename" }}`{% endraw %}{:.env_var}       | filename で指定したファイルの内容の SHA256 ハッシュを Base64 エンコードした値。ファイルが変更されると、新しいキャッシュ キーが生成されます。 ここで指定できるのはリポジトリでコミットされているファイルに限られるため、 `package-lock.json` や `pom.xml`、もしくは `project.clj` などの依存関係を定義しているマニフェストファイルを使うことも検討してください。 `restore_cache` から `save_cache` までの間にファイルの内容が変更されないようにすることが重要です。ファイルの内容が変更された場合、`restore_cache` のタイミングで使用されるファイルとは異なるキャッシュキーの下でキャッシュが保存されます。 |
| {% raw %}`{{ .Branch }}`{% endraw %}                              | 現在ビルド中の VCS ブランチ。                                                                                                                                                                                                                                                                                                                                                 |
| {% raw %}`{{ .BuildNum }}`{% endraw %}                            | このビルドの CircleCI ジョブ番号。                                                                                                                                                                                                                                                                                                                                            |
| {% raw %}`{{ .Revision }}`{% endraw %}                            | 現在ビルド中の VCS リビジョン。                                                                                                                                                                                                                                                                                                                                                |
| {% raw %}`{{ .Environment.variableName }}`{% endraw %}{:.env_var} | 環境変数 `variableName` ([CircleCI からエクスポートされた環境変数]({{site.baseurl}}/ja/env-vars/)、または特定の[コンテキスト]({{site.baseurl}}/ja/contexts)に追加された環境変数がサポートされ、任意の環境変数は使用できません)。                                                                                                                                                                                                    |
| {% raw %}`{{ epoch }}`{% endraw %}                                | 協定世界時 (UTC) 1970 年 1 月 1 日午前 0 時 0 分 0 秒からの経過秒数。POSIX や UNIX エポックとも呼ばれます。 このキャッシュ キーは、実行のたびに新しいキャッシュを保存する必要がある場合に便利です。                                                                                                                                                                                                                                            |
| {% raw %}`{{ arch }}`{% endraw %}                                 | OS と CPU (アーキテクチャ、ファミリ、モデル) の情報を取得します。 OS や CPU アーキテクチャに合わせてコンパイル済みバイナリをキャッシュするような場合に用います。`darwin-amd64-6_58` あるいは `linux-amd64-6_62` のような文字列になります。 CircleCI で利用可能な CPU については[こちら]({{ site.baseurl }}/ja/faq/#which-cpu-architectures-does-circleci-support)を参照してください。                                                                                            |
{: class="table table-striped"}

### キーとテンプレートの使用に関する補足説明
{: #further-notes-on-using-keys-and-templates }
{:.no_toc}

- キャッシュキーの最大文字数は 900 文字です。 キャッシュキーの文字数が これより長くなると、キャッシュは保存されません。
- キャッシュに一意の識別子を定義するときは、{% raw %}`{{ epoch }}`{% endraw %} などの特定度の高いテンプレート キーを過度に使用しないように注意してください。 {% raw %}`{{ .Branch }}`{% endraw %} や {% raw %}`{{ checksum "filename" }}`{% endraw %} といった汎用性の高い値になるテンプレートを使うと、使われるキャッシュの数は増えます。
- キャッシュ変数には、ビルドで使用している場合は、[パラメーターの使用">パラメーター]({{site.baseurl}}/ja/reusing-config/#using-parameters-in-executors)も使用できます。 たとえば、{% raw %}`v1-deps-<< parameters.varname >>`{% endraw %} などです。
- キャッシュ キーに動的なテンプレートを使用する必要はありません。 静的な文字列を使用し、その名前を「バンプ」(変更) することで、キャッシュを強制的に無効化できます。

## キャッシュの保存およびリストアの例
{: #full-example-of-saving-and-restoring-cache }

下記に、キーとテンプレートを含む `restore_cache` および `save_cache` の使い方がわかる `.circleci/config.yml` ファイルのサンプルコードを例示します。

このサンプルでは_非常に_特定度の高いキャッシュキーを使用します。 キャッシュキーをより具体的に指定することで、どのブランチまたはコミットの依存関係をキャッシュに保存するかをより細かく制御できます。 ただし、ストレージの使用率が** 大幅に**増加 する可能性があることに注意してください。 キャッシュ戦略の最適化についてのヒントは、[キャッシュ戦略]({{site.baseurl}}/ja/caching-strategy)をご覧ください。

**警告:** この例は、ソリューションの_候補_ではありますが、お客様の個別のニーズには適さず、ストレージコストが増加する可能性があります。
{: class="alert alert-warning"}

{% raw %}

```yaml
    Make note of the use of a <code>checksum</code> in the cache <code>key</code>.
```
 in the cache key.
</code>

{% endraw %}

## ソースのキャッシュ
{: #source-caching }

git リポジトリをキャッシュすると `checkout` ステップにかかる時間を短縮できる場合があります。これは特に、大規模なプロジェクトで有効です。 ソースコードのキャッシュ方法は下記を参考にしてください。

{% raw %}

```yaml
    steps:
      - restore_cache:
          keys:
            - source-v1-{{ .Branch }}-{{ .Revision }}
            - source-v1-{{ .Branch }}-
            - source-v1-

      - checkout

      - save_cache:
          key: source-v1-{{ .Branch }}-{{ .Revision }}
          paths:
            - ".git"
```

{% endraw %}

この例では、`restore_cache` は最初に現在の git リビジョンからキャッシュ ヒットを探し、次に現在のブランチからキャッシュ ヒットを探します。最後に、すべてのブランチとリビジョンからキャッシュ ヒットを探します。 `keys` リストが検出されると、最初に一致するキーからキャッシュがリストアされます。 複数の一致がある場合は、最も新しく生成されたキャッシュが使用されます。

ソースコードの更新が頻繁に行われるようなら、指定するファイルをさらに絞り込むと良いでしょう。 そうすることで、現在のブランチや git のリビジョンの変更が頻繁に行われる場合でも、より細やかなソースコードのキャッシュ管理を実現できます。

最も限定的な `restore_cache` オプション({% raw %}`source-v1-{{ .Branch }}-{{ .Revision }}`{% endraw %}) を指定した場合でも、ソースのキャッシュはきわめて有効です。たとえば、同じ git リビジョンに対してビルドを繰り返す場合 ([API トリガーのビルド](https://circleci.com/docs/api/v1/#trigger-a-new-build-by-project-preview)) や、ワークフローを使用する場合です。ワークフローを使用するときには、ソースをキャッシュしないと、ワークフローのジョブごとに同じリポジトリを 1 回ずつ `checkout` しなければならなくなるためです。

とはいえ、ソースのキャッシュを使用する場合と使用しない場合のビルド時間を比較した方が良い場合もあります。 `restore_cache`よりも`git clone`の方が高速な場合も多々あります。

**メモ:** 組み込みの `checkout` コマンドを実行すると、git の自動ガベージ コレクションが無効になります。 `save_cache` を実行する前に、`run` ステップで `git gc` を手動で実行すると、保存されるキャッシュのサイズが小さくなります。

## 関連項目
{: #see-also }
{:.no_toc}

- [データの永続化]({{site.baseurl}}/ja/persist-data)
- [キャッシュ戦略]({{site.baseurl}}/ja/caching-strategy)
- [ワークスペース]({{site.baseurl}}/ja/workspaces)
- [アーティファクト]({{site.baseurl}}/ja/artifacts)
- [最適化の概要]({{site.baseurl}}/ja/optimizations)

