---
layout: classic-docs
title: "依存関係のキャッシュ"
short-title: "依存関係のキャッシュ"
description: "依存関係のキャッシュ"
categories:
  - optimization
order: 50
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

キャッシュは、CircleCI でのジョブを高速化する最も効果的な方法の 1 つです。 また、以前のジョブからデータを再利用することでフェッチ操作のコストを下げることができます。

* 目次
{:toc}

ジョブを 1 回実行すると、以降のジョブインスタンスでは同じ処理をやり直す必要がなくなり、その分高速化されます。

![キャッシュのデータフロー]({{ site.baseurl }}/assets/img/docs/caching-dependencies-overview.png)

キャッシュは、Yarn、Bundler、Pip などの**パッケージ依存関係管理ツール**と共に使用すると特に有効です。 キャッシュから依存関係をリストアすることで、`yarn install` などのコマンドを実行するときに、ビルドごとにすべてを再ダウンロードするのではなく、新しい依存関係をダウンロードするだけで済むようになります。

<div class="alert alert-warning" role="alert">
<b>警告:</b> 異なる Executor 間で (たとえば、Docker と Machine、Linux、Windows、または MacOS の間、または CircleCI イメージとそれ以外のイメージの間で) ファイルをキャッシュすると、ファイル パーミッションエラーまたはパスエラーが発生することがあります。 これらのエラーは、ユーザーが存在しない、ユーザーの UID が異なる、パスが存在しないなどの理由で発生します。 異なる Executor 間でファイルをキャッシュする場合は、特に注意してください。
</div>

## キャッシュの設定例
{: #example-caching-configuration }
{:.no_toc}

キャッシュ キーは簡単に設定できます。 以下の例では、`pom.xml` のチェックサムとカスケード フォールバックを使用して、変更があった場合にキャッシュを更新しています。

{% raw %}
```yaml
    steps:
      - restore_cache:
         keys:
           - m2-{{ checksum "pom.xml" }}
           - m2- # チェックサムが失敗した場合に使用されます
```
{% endraw %}

## はじめに
{: #introduction }
{:.no_toc}

CircleCI  では依存関係のキャッシュの自動化には対応していません。このため、最適なパフォーマンスを得るには、キャッシュ戦略を計画して実装することが重要です。 2.0 では、キャッシュを手動で設定し、より高度な戦略を立て、きめ細かに制御することができます。 キャッシュ戦略に関するヒントは[データの永続化]({{site.baseurl}}/2.0/persist-data/)をご覧ください。

ここでは、キャッシュの手動構成、選択した戦略のコストとメリット、およびキャッシュに関する問題を回避するためのヒントについて説明します。 **注:** CircleCI  のジョブ実行に使用される Docker イメージは、サーバーインフラストラクチャに自動的にキャッシュされます (可能な場合)。

<div class="alert alert-warning" role="alert">
<b>重要:</b> 下記では様々な例を紹介していますが、キャッシュ戦略は各プロジェクトごとに入念に計画する必要があります。 サンプルコードのコピー＆ペーストではお客様のニーズに合わない場合があります。</div>

Docker イメージの未変更レイヤーを再利用するプレミアム機能を有効にする方法については、「[Docker レイヤー キャッシュの有効化]({{ site.baseurl }}/ja/2.0/docker-layer-caching/)」を参照してください。

## 概要
{: #overview }
{:.no_toc}

キャッシュは、キーに基づいてファイルの階層を保存します。 キャッシュを使用してデータを保存するとジョブが高速に実行されますが、キャッシュミス (ゼロキャッシュ リストア) が起きた場合でも、ジョブは正常に実行されます。 たとえば、`NPM`パッケージディレクトリ (`node_modules`として知られています) をキャッシュするとします。 ジョブを初めて実行すると、依存関係がすべてダウンロードされ、キャッシュされます。また、キャッシュが有効な場合は、次回ジョブを実行するときにそのキャッシュを使用してジョブを高速化します。

キャッシュにより、信頼性と最大限のパフォーマンスのバランスを取ることができます。 通常、ビルドが破損したり、古い依存関係を使用して迅速にビルドするといったリスクを背負うよりも、信頼性を追求する方が安全です。

## キャッシュとオープンソース
{: #caching-and-open-source }

プロジェクトがオープンソースの場合や、フォーク可能としてコントリビューターのプルリクエスト (PR) を受け付ける場合は、次のことに注意してください。

- 同じフォークリポジトリからの PR は、キャッシュを共有します (前述のように、これには main リポジトリ内の PR と main によるキャッシュの共有が含まれます)。
- それぞれ異なるフォークリポジトリ内にある 2 つの PR は、別々のキャッシュを持ちます。
- [環境変数]({{site.baseurl}}/2.0/env-vars)の共有を有効にすると、元のリポジトリとフォークされているすべてのビルド間でキャッシュ共有が有効になります。

## ライブラリのキャッシュ
{: #caching-libraries }

ジョブ実行中にキャッシュすることが最も重要な依存関係は、プロジェクトが依存するライブラリです。 例えば、Python の `pip` や Node.js の `npm` のような依存関係管理ツールがインストールするライブラリをキャッシュするというものです。 これら `pip` や `npm` などの依存関係管理ツールは、依存関係のインストール先となるパスが個別に用意されています。 お使いのスタックの仕様については、各言語ガイドおよび[デモ プロジェクト](https://circleci.com/ja/docs/2.0/demo-apps/)を参照してください。

現在のプロジェクトで必要になるツールがわからない場合でも、Docker イメージが解決してくれます。 CircleCI のビルド済み Docker イメージには、そのイメージが対象としている言語を使用してプロジェクトをビルドするための汎用ツールがプリインストールされています。 たとえば、`circleci/ruby:2.4.1` というビルド済みイメージには git、openssh-client、gzip がプリインストールされています。

![依存関係のキャッシュ]( {{ site.baseurl }}/assets/img/docs/cache_deps.png)

## ワークフローでのキャッシュへの書き込み
{: #writing-to-the-cache-in-workflows }

同じワークフロー内の複数のジョブでキャッシュを共有することができます。 このため、複数のワークフローの複数のジョブにまたがってキャッシュを実行すると、競合状態が発生する可能性があります。

キャッシュの書き換えはできません。 `node-cache-main`のように特定のキーにキャッシュを一度書き込むと、再度書き込むことはできません。 たとえば、ジョブ 3 がジョブ 1 とジョブ 2 に依存する 3 つのジョブのワークフローがあるとします ({Job1, Job2} -> Job3)。 この 3 つのジョブはすべて同じキャッシュキーに対して読み書きを行います。

このワークフローの実行中、Job 3 は Job 1 または Job 2 によって書き込まれたキャッシュを使用します。 キャッシュは書き換え不可のため、どちらかのジョブが最初に保存したキャッシュが使用されます。 これは、結果が確定的ではないため通常は望ましくありません。 結果の一部が異なる場合があります。 ジョブの依存関係を変更することにより、ワークフローを確定的にすることができます。 たとえば、ジョブ 1 とジョブ 2 では別々のキャッシュに書き込み、 Job 3 ではいずれかのキャッシュからのみ読み込みます。 または、一方向の依存関係を指定します (Job1 -> Job2 -> Job3)

{% raw %}`node-cache-{{ checksum "package-lock.json" }}`{% endraw %} のような動的キーを使用して保存を行い、`node-cache-` のようなキーの部分一致を使用してリストアを行うような、より複雑なジョブのケースもあります。 この場合でも競合状態になる可能性はありますが、詳細はケースによって異なります。 たとえば、ダウンストリームジョブがアップストリームジョブのキャッシュを使用して最後に実行されるようなケースです。

ジョブ間でキャッシュを共有している場合に発生する競合状態もあります。 依存リンクのない、ジョブ 1 とジョブ 2 からなるワークフローを考えてみましょう。 ジョブ 2 はジョブ 1 で保存したキャッシュを使います。 ジョブ 1 がキャッシュの保存を報告したとしても、ジョブ 2 でキャッシュを正常にリストアできることもあれば、キャッシュが見つからないと報告することもあります。 また、ジョブ 2 が以前のワークフローからキャッシュを読み込むこともあります。 このケースでは、ジョブ 1 がキャッシュを保存する前に、ジョブ 2 がそれを読み込もうとしていると考えられます。 この問題を解決するには、ワークフローの依存関係 (Job1 -> Job2) を作成します。 こうすることで、ジョブ 1 が処理を終えるまでジョブ 2 が強制的に待機することになります。

## キャッシュのリストア
{: #restoring-cache }

CircleCI では、`restore_cache` ステップにリストされているキーの順番でキャッシュがリストアされます。 各キャッシュキーはプロジェクトごとに名前空間をもち、プレフィックスの一致で検索されます。 最初に一致したキーのキャッシュがリストアされます。 複数の一致がある場合は、最も新しく生成されたキャッシュが使用されます。

次の例では、2 つのキーが提供されています。

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

下記の例では、これらのキーがどのように使用されるかの詳細を説明します。

`keys:` リストのすべての行は _1 つのキャッシュ_を管理します (各行が固有のキャッシュに**対応しているわけではありません**)。 この例でリストされているキー {% raw %}(`v1-npm-deps-{{ checksum "package-lock.json" }}`{% endraw %} および `v1-npm-deps-`) は、**単一**のキャッシュを表しています。 キャッシュのリストアが必要になると CircleCI は、まず (最も特定度の高い) 最初のキーに基づいてキャッシュを検証し、次に他のキーを順に調べ、他のキャッシュキーに変更があるかどうかを確認します。

最初のキーにより、 `package-lock.json` ファイルのチェックサムが文字列 `v1-nPM-deps-` に連結されます。 コミットでこのファイルが変更された場合は、新しいキャッシュキーが調べられます。

2 つ目のキーには動的コンポーネントが連結されていません。 これは静的な文字列 `v1-npm-deps-`です。 キャッシュを手動で無効にするには、`config.yml` ファイルで `v1` を `v2` にバンプします。 これで、キャッシュ キーが新しい `v2-npm-deps` になり、新しいキャッシュの保存がトリガーされます。

### モノレポ でのキャッシュの使用
{: #using-caching-in-monorepos }

モノレポでキャッシュを活用する方法は数多くあります。 ここで紹介する方法は、モノレポのさまざまな部分にある複数のファイルに基づいて共有キャッシュを管理する必要がある場合に使用できます。

#### 連結 `package-lock` ファイルの作成とビルド
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

### キャッシュの有効期限
{: #cache-expiration }
{:.no_toc}
`save_cache` ステップで作成されたキャッシュは、最長 15 日間保存されます。

### キャッシュのクリア
{: #clearing-cache }
{:.no_toc}

言語または依存関係管理ツールのバージョンが変更され、キャッシュをクリアする必要がある場合は、上の例のような命名戦略を使用します。 その後、`config.yml` ファイルのキャッシュキー名を変更して、変更をコミットしてキャッシュをクリアします。

<div class="alert alert-info" role="alert">
<b>ヒント:</b> キャッシュは変更不可なので、すべてのキャッシュ キーの先頭にプレフィックスとしてバージョン名 (<code class="highlighter-rouge">v1-...</code>など) を付加すると便利です。 それにより、プレフィックスのバージョン番号を増やすだけで、キャッシュ全体を再生成できます。
</div>

下記のような状況では、キャッシュキーの名前を変えることによるキャシュのクリアを検討してみてください。

* npm コマンドがバージョンアップするなど、依存関係管理ツールのバージョンが変更になった場合
* Ruby のバージョンが 2.3 から 2.4 に変更されるなど、言語のバージョンが変更された場合
* プロジェクトから依存関係が削除された場合

<div class="alert alert-info" role="alert">
  <b>ヒント:</b> キャッシュキーに <code class="highlighter-rouge">:、?、&、=、/、#</code> などの特殊文字や予約文字を使用すると、ビルドの際に問題が発生する可能性があるため、注意が必要です。 キャッシュキーのプレフィックスには [a-z][A-Z] の文字を使用してください。
</div>

### キャッシュ サイズ
{: #cache-size }
{:.no_toc}
キャッシュサイズは 500 MB 未満に抑えることをお勧めします。 これは、破損チェックを実行するための上限のサイズです。 このサイズを超えると、チェック時間が非常に長くなります。 キャッシュサイズは、CircleCI のジョブページの `restore_cache` ステップで確認できます。 キャッシュサイズを増やすこともできますが、キャッシュのリストア中に問題が発生したり、ダウンロード中に破損する可能性が高くなるため、お勧めできません。 キャッシュサイズを抑えるため、複数のキャッシュに分割することを検討してください。

## 基本的な依存関係キャッシュの例
{: #basic-example-of-dependency-caching }

CircleCI  の手動で設定可能な依存関係キャッシュを最大限に活用するには、キャッシュの対象と方法を明確にする必要があります。 他の例については、「CircleCI の設定」の[キャッシュの保存]({{ site.baseurl }}/2.0/configuration-reference/#save_cache)セクションを参照してください。

ファイルやディレクトリのキャッシュを保存するには、`.circleci/config.yml` ファイルで指定しているジョブに `save_cache` ステップを追加します。

```yaml
    steps:
      - save_cache:
          key: my-cache
          paths:
            - my-file.txt
            - my-project/my-dependencies-directory
```

ディレクトリのパスは、ジョブの `working_directory` からの相対パスです。 必要に応じて、絶対パスも指定できます。

**注:** 特別なステップ[`persist_to_workspace`]({{ site.baseurl }}/2.0/configuration-reference/#persist_to_workspace) とは異なり、`save_cache` および `restore_cache` は `paths` キーのグロブをサポートしていません。

## キーとテンプレートの使用
{: #using-keys-and-templates }

各キャッシュ キーは、1 つのデータキャッシュに対応する*ユーザー定義*の文字列です。 **動的な値**を挿入してキャッシュキーを作成することができます。 これは**テンプレート**と呼ばれます。 キャッシュキー内の中かっこで囲まれている部分がテンプレートです。 以下を例に考えてみましょう。

```shell
{% raw %}myapp-{{ checksum "package-lock.json" }}{% endraw %}
```

上の例の出力は、このキーを表す一意の文字列です。 ここでは、[チェックサム](https://ja.wikipedia.org/wiki/チェックサム)を使用して、`package-lock.json` の内容を表す一意の文字列を作成しています。

この例では、以下のような文字列が出力されます。

```shell
{% raw %}myapp-+KlBebDceJh_zOWQIAJDLEkdkKoeldAldkaKiallQ={% endraw %}
```

`package-lock` ファイルの内容が変更された場合、`checksum` 関数は別の一意の文字列を返し、キャッシュを無効化する必要があることが示されます。

キャッシュの `key` に使用するテンプレートを選択するうえでは、キャッシュの保存にはコストがかかることを留意してください。 キャッシュを CircleCI ストレージにアップロードするにはある程度の時間がかかります。 ビルドのたびに新しいキャッシュが生成されるのを避けるには、変更があった場合にのみ新しいキャッシュを生成する`キー`を指定します。

まず、プロジェクトにおいて一意となる値のキーを用いて、キャッシュを保存またはリストアするタイミングを決めます。 たとえば、ビルド番号が増えたとき、リビジョン番号が増えたとき、依存関係マニフェストファイルのハッシュが変更されたときなどです。

以下は、さまざまな目的に合わせたキャッシュ戦略の例です。

 * {% raw %}`myapp-{{ checksum "package-lock.json" }}`{% endraw %}: `package-lock.json` ファイルの内容が変更されるたびにキャッシュが再生成されます。 このプロジェクトの別々のブランチで同じキャッシュキーが生成されます。
 * {% raw %}`myapp-{{ .Branch }}-{{ checksum "package-lock.json" }}`{% endraw %}: `package-lock.json` ファイルの内容が変更されるたびにキャッシュが再生成されます。 このプロジェクトの別々のブランチで異なるキャッシュキーが生成されます。
 * {% raw %}`myapp-{{ epoch }}`{% endraw %}: ビルドごとに異なるキャッシュキーを生成します。

ステップの実行中に、上のテンプレートが実行時の値に置き換えられ、その置換後の文字列が `key` として使用されます。 CirlceCI のキャッシュ`キー`で利用可能なテンプレートを紹介します。

| テンプレート                                                 | 説明                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| {% raw %}`{{ checksum "filename" }}`{% endraw %}       | filenameで指定したファイルの内容の SHA256 ハッシュを Base64 エンコードした値。ファイルが変更されると、新しいキャッシュ キーが生成されます。 ここで指定できるのはリポジトリでコミットされているファイルに限られるため、 `package-lock.json` や `pom.xml`、もしくは `project.clj` などの依存関係を定義しているマニフェストファイルを使うことも検討してください。 `restore_cache` から `save_cache` までの間にファイルの内容が変更されないようにすることが重要です。ファイルの内容が変更された場合、`restore_cache` のタイミングで使用されるファイルとは異なるキャッシュキーの下でキャッシュが保存されます。 |
| {% raw %}`{{ .Branch }}`{% endraw %}                   | 現在ビルド中の VCS ブランチ。                                                                                                                                                                                                                                                                                                                                                |
| {% raw %}`{{ .BuildNum }}`{% endraw %}                 | このビルドの CircleCI ジョブ番号。                                                                                                                                                                                                                                                                                                                                           |
| {% raw %}`{{ .Revision }}`{% endraw %}                 | 現在ビルド中の VCS リビジョン。                                                                                                                                                                                                                                                                                                                                               |
| {% raw %}`{{ .Environment.variableName }}`{% endraw %} | 環境変数 `variableName` ([CircleCI からエクスポートされる環境変数](https://circleci.com/ja/docs/2.0/env-vars/#circleci-environment-variable-descriptions)、または特定の[コンテキスト](https://circleci.com/ja/docs/2.0/contexts)に追加した環境変数がサポートされ、任意の環境変数は使用できません)。                                                                                                                               |
| {% raw %}`{{ epoch }}`{% endraw %}                     | 協定世界時 (UTC) 1970 年 1 月 1 日午前 0 時 0 分 0 秒からの経過秒数。POSIX や UNIX エポックとも呼ばれます。 このキャッシュキーは、実行のたびに新しいキャッシュを保存する必要がある場合に便利です。                                                                                                                                                                                                                                            |
| {% raw %}`{{ arch }}`{% endraw %}                      | OS と CPU (アーキテクチャ、ファミリ、モデル) の情報を取得します。 OS や CPU アーキテクチャに合わせてコンパイル済みバイナリをキャッシュするような場合に用います。`darwin-amd64-6_58` あるいは `linux-amd64-6_62` のような文字列になります。 CircleCI で利用可能な CPU については[こちら]({{ site.baseurl }}/2.0/faq/#which-cpu-architectures-does-circleci-support)を参照してください                                                                                           |
{: class="table table-striped"}

### キーとテンプレートの使用に関する補足説明
{: #further-notes-on-using-keys-and-templates }
{:.no_toc}

- キャッシュに一意の識別子を定義するときは、{% raw %}`{{ epoch }}`{% endraw %} などの特定度の高いテンプレートキーを過度に使用しないように注意してください。 {% raw %}`{{ .Branch }}`{% endraw %} や {% raw %}`{{ checksum "filename" }}`{% endraw %} といった汎用性の高い値になるテンプレートを使うと、使われるキャッシュの数は増えます。
- キャッシュ変数には、ビルドで使用している場合は、[パラメーターの使用">パラメーター]({{site.baseurl}}/2.0/reusing-config/#using-parameters-in-executors)も使用できます。 たとえば、{% raw %}`v1-deps-<< parameters.varname >>`{% endraw %} などです。
- キャッシュ キーに動的なテンプレートを使用する必要はありません。 静的な文字列を使用し、その名前を「バンプ」(変更) することで、キャッシュを強制的に無効化できます。

### キャッシュの保存およびリストアの例
{: #full-example-of-saving-and-restoring-cache }
{:.no_toc}

下記に、キーとテンプレートを含む `restore_cache` および `save_cache` の使い方がわかる `.circleci/config.yml` ファイルのサンプルコードを例示します。

<div class="alert alert-warning" role="alert">
<b>警告:</b> この例は、<i>潜在的な</i>ソリューションであり、お客様のニーズには適さない可能性があります。</div>

{% raw %}

```yaml
    docker:
      - image: customimage/ruby:2.3-node-phantomjs-0.0.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI の環境変数を参照
        environment:
          RAILS_ENV: test
          RACK_ENV: test
      - image: cimg/mysql:5.7
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI の環境変数を参照

    steps:
      - checkout
      - run: cp config/{database_circleci,database}.yml

      # Bundler の実行
      # 可能な場合は、インストールされている gem をキャッシュから読み込み、バンドル インストール後にキャッシュを保存します
      # 複数のキャッシュを使用して、キャッシュ ヒットの確率を上げます

      - restore_cache:
          keys:
            - gem-cache-v1-{{ arch }}-{{ .Branch }}-{{ checksum "Gemfile.lock" }}
            - gem-cache-v1-{{ arch }}-{{ .Branch }}
            - gem-cache-v1

      - run: bundle install --path vendor/bundle

      - save_cache:
          key: gem-cache-v1-{{ arch }}-{{ .Branch }}-{{ checksum "Gemfile.lock" }}
          paths:
            - vendor/bundle

      - run: bundle exec rubocop
      - run: bundle exec rake db:create db:schema:load --trace
      - run: bundle exec rake factory_girl:lint

      # アセットのプリコンパイル
      # 可能な場合は、アセットをキャッシュから読み込み、アセットのプリコンパイル後にキャッシュを保存します
      # 複数のキャッシュを使用して、キャッシュ ヒットの確率を上げます

      - restore_cache:
          keys:
            - asset-cache-v1-{{ arch }}-{{ .Branch }}-{{ .Environment.CIRCLE_SHA1 }}
            - asset-cache-v1-{{ arch }}-{{ .Branch }}
            - asset-cache-v1

      - run: bundle exec rake assets:precompile

      - save_cache:
          key: asset-cache-v1-{{ arch }}-{{ .Branch }}-{{ .Environment.CIRCLE_SHA1 }}
          paths:
            - public/assets
            - tmp/cache/assets/sprockets

      - run: bundle exec rspec
      - run: bundle exec cucumber
```

{% endraw %}

### 部分的な依存関係キャッシュの使用方法
{: #partial-dependency-caching-strategies }
{:.no_toc}

依存関係管理ツールの中には、部分的にリストアされた依存関係ツリー上へのインストールを正しく処理できないものがあります。

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
        - gem-cache-{{ arch }}-{{ .Branch }}-{{ checksum "Gemfile.lock" }}
        - gem-cache-{{ arch }}-{{ .Branch }}
        - gem-cache
```
{% endraw %}

上の例では、2 番目または 3 番目のキャッシュキーによって依存関係ツリーが部分的にリストアされた場合に、依存関係管理ツールによっては古い依存関係ツリーの上に誤ってインストールを行ってしまいます。

カスケードフォールバックの代わりに、以下のように単一バージョンのプレフィックスが付いたキャッシュ キーを使用することで、動作の信頼性が高まります。

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
        - v1-gem-cache-{{ arch }}-{{ .Branch }}-{{ checksum "Gemfile.lock" }}
```

{% endraw %}

キャッシュは変更不可なので、この方法でバージョン番号を増やすことで、すべてのキャッシュを再生成できます。 この方法は、以下のような場合に便利です。

- `npm` などの依存関係管理ツールのバージョンを変更した場合
- Ruby などの言語のバージョンを変更した場合
- プロジェクトに依存関係を追加または削除した場合

依存関係の部分キャッシュの信頼性については、依存関係管理ツールに左右されます。 以下に、一般的な依存関係管理ツールについて、推奨される部分キャッシュの使用方法をその理由と共に示します。

#### Bundler (Ruby)
{: #bundler-ruby }
{:.no_toc}

**部分キャッシュリストアを使用しても安全でしょうか？**
はい。ただし、注意点があります。

Bundler では、明示的に指定されないシステム gem が使用されるため、確定的でなく、部分キャッシュリストアの信頼性が低下することがあります。

この問題を解決するには、キャッシュから依存関係をリストアする前に Bundler をクリーンアップするステップを追加します。

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
        # ロック ファイルが変更されたら、パターンが一致する範囲を少しずつ広げてキャッシュをリストアします
        - gradle-repo-v1-{{ .Branch }}-{{ checksum "dependencies.lockfile" }}
        - gradle-repo-v1-{{ .Branch }}-
        - gradle-repo-v1-
  - save_cache:
      paths:
        - ~/.gradle
      key: gradle-repo-v1-{{ .Branch }}-{{ checksum "dependencies.lockfile" }}
```

{% endraw %}

#### Gradle (Java)
{: #gradle-java }
{:.no_toc}

**部分キャッシュリストアを使用しても安全でしょうか？**
はい。

Gradle リポジトリは、規模が大きく、一元化や共有が行われることが想定されています。 生成されたアーティファクトのクラスパスに実際に追加されるライブラリに影響を与えることなく、一部のキャッシュをリストアできます。

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
        # ロック ファイルが変更されたら、パターンが一致する範囲を少しずつ広げてキャッシュをリストアします
        - gradle-repo-v1-{{ .Branch }}-{{ checksum "dependencies.lockfile" }}
        - gradle-repo-v1-{{ .Branch }}-
        - gradle-repo-v1-
  - save_cache:
      paths:
        - ~/.gradle
      key: gradle-repo-v1-{{ .Branch }}-{{ checksum "dependencies.lockfile" }}
```

{% endraw %}

#### Maven (Java) および Leiningen (Clojure)
{: #maven-java-and-leiningen-clojure }
{:.no_toc}

**部分キャッシュリストアを使用しても安全でしょうか？**
はい。

Maven リポジトリは、規模が大きく、一元化や共有が行われることが想定されています。 生成されたアーティファクトのクラスパスに実際に追加されるライブラリに影響を与えることなく、一部のキャッシュをリストアできます。

Leiningen も内部で Maven を利用しているため、同様に動作します。

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
        # ロック ファイルが変更されたら、パターンが一致する範囲を少しずつ広げてキャッシュをリストアします
        - maven-repo-v1-{{ .Branch }}-{{ checksum "pom.xml" }}
        - maven-repo-v1-{{ .Branch }}-
        - maven-repo-v1-
  - save_cache:
      paths:
        - ~/.m2
      key: maven-repo-v1-{{ .Branch }}-{{ checksum "pom.xml" }}
```

{% endraw %}

#### npm (Node)
{: #npm-node }
{:.no_toc}

**部分キャッシュ リストアを使用しても安全でしょうか？**
はい。 ただし、NPM5 以降を使用する必要があります。

NPM5 以降でロック ファイルを使用すると、部分キャッシュ リストアを安全に行うことができます。

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
        # ロック ファイルが変更されたら、パターンが一致する範囲を少しずつ広げてキャッシュをリストアします
        - node-v1-{{ .Branch }}-{{ checksum "package-lock.json" }}
        - node-v1-{{ .Branch }}-
        - node-v1-
  - save_cache:
      paths:
        - ~/usr/local/lib/node_modules  # 場所は npm のバージョンによって異なります
      key: node-v1-{{ .Branch }}-{{ checksum "package-lock.json" }}
```

{% endraw %}

#### pip (Python)
{: #pip-python }
{:.no_toc}

**部分キャッシュ リストアを使用しても安全でしょうか？**
はい。ただし、Pipenv を使用する必要があります。

Pip では、`requirements.txt` で明示的に指定されていないファイルを使用できます。 [Pipenv](https://docs.pipenv.org/) を使用するには、ロック ファイルでバージョンを明示的に指定する必要があります。

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
        # ロック ファイルが変更されたら、パターンが一致する範囲を少しずつ広げてキャッシュをリストアします
        - pip-packages-v1-{{ .Branch }}-{{ checksum "Pipfile.lock" }}
        - pip-packages-v1-{{ .Branch }}-
        - pip-packages-v1-
  - save_cache:
      paths:
        - ~/.local/share/virtualenvs/venv  # このパスは、pipenv が virtualenv を作成する場所によって異なります
      key: pip-packages-v1-{{ .Branch }}-{{ checksum "Pipfile.lock" }}
```

{% endraw %}

#### Yarn (Node)
{: #yarn-node }
{:.no_toc}

**部分キャッシュリストアを使用しても安全でしょうか？**
はい。

Yarn では、部分キャッシュリストアを行えるように、元からロックファイルが使用されています。

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
        # ロック ファイルが変更されたら、パターンが一致する範囲を少しずつ広げてキャッシュをリストアします
        - yarn-packages-v1-{{ .Branch }}-{{ checksum "yarn.lock" }}
        - yarn-packages-v1-{{ .Branch }}-
        - yarn-packages-v1-
  - save_cache:
      paths:
        - ~/.cache/yarn
      key: yarn-packages-v1-{{ .Branch }}-{{ checksum "yarn.lock" }}
```

以下の 2 つの理由から、`yarn --frozen-lockfile --cache-folder ~/.cache/yarn` を使うことをお勧めします。

1) `--frozen-lockfile` を指定すると新しいロックファイルが作成されるので、既存のロックファイルの変更を防止できます。 これにより、チェックサムが保たれ、依存関係が開発環境のものと完全に一致します。

2) デフォルトのキャッシュの保存場所は OS によって異なります。 `--cache-folder ~.cache/yarn` により、目的のキャッシュの保存場所を明示的に指定できます。

{% endraw %}

## キャッシュ戦略のトレードオフ
{: #caching-strategy-tradeoffs }

使用言語のビルド ツールが依存関係を難なく処理できる場合は、ゼロキャッシュリストアよりも部分キャッシュリストアの方がパフォーマンス上は有利です。 ゼロキャッシュリストアでは、依存関係をすべて再インストールしなければならないため、パフォーマンスが低下することがあります。 これを避けるためには、一から作り直すのではなく、依存関係の大部分を古いキャッシュからリストアする方法が有効です。

一方、それ以外の言語では、部分キャッシュリストアを実行すると、宣言された依存関係と矛盾するコード依存関係が作成されるリスクがあり、キャッシュなしでビルドを実行するまでその矛盾は解決されません。 依存関係が頻繁に変更されない場合は、ゼロ キャッシュリストアキーをリストの最初に配置してみてください。

次に時間の経過に伴うコストを追跡します。 時間の経過に伴いゼロキャッシュリストア (*キャッシュミス*) のパフォーマンスコストが大幅に増加することがわかった場合には、部分キャッシュリストアキーの追加を検討してください。

キャッシュをリストアするためのキーを複数列挙すると、部分キャッシュがヒットする可能性が高くなります。 ただし、より広範囲に `restore_cache` の対象が広がることで、さらに多くの混乱を招く危険性もあります。 たとえば、アップグレードしたブランチに Node v6 の依存関係がある一方で、他のブランチでは Node v5 の依存関係が使用されている場合は、他のブランチを検索する `restore_cache` ステップで、アップグレードしたブランチとは互換性がない依存関係がリストアされる可能性があります。

### ロックファイルの使用
{: #using-a-lock-file }
{:.no_toc}

依存関係管理ツールが扱う Lock ファイル (`Gemfile.lock` や `yarn.lock` など) のチェックサムは、キャッシュキーに適しています。

また、`ls -laR your-deps-dir > deps_checksum` を実行し、{% raw %}`{{ checksum "deps_checksum" }}`{% endraw %} で参照するという方法もあります。 たとえば、Python で `requirements.txt` ファイルのチェックサムよりも限定的なキャッシュを取得するには、プロジェクト ルート `venv` の virtualenv 内に依存関係をインストールし、`ls -laR venv > python_deps_checksum` を実行します。

### 言語ごとに異なるキャッシュを使用する
{: #using-multiple-caches-for-different-languages }
{:.no_toc}

ジョブを複数のキャッシュに分割することで、キャッシュミスのコストを抑制できます。 異なるキーを使用して複数の `restore_cache` ステップを指定することで、各キャッシュのサイズを小さくし、キャッシュ ミスによるパフォーマンスへの影響を抑えることができます。 それぞれの依存関係管理ツールによるファイルの保存方法、ファイルのアップグレード方法、および依存関係のチェック方法がわかっている場合は、言語ごとに (npm、pip、bundler) キャッシュを分割することを検討してください。

### 高コストのステップのキャッシュ
{: #caching-expensive-steps }
{:.no_toc}

言語やフレームワークによっては、キャッシュ可能で、キャッシュする方が望ましいものの、大きなコストがかかるステップがあります。 たとえば、Scala や Elixir では、コンパイル ステップをキャッシュすることで、効率が大幅に向上します。 Rails の開発者も、フロントエンドのアセットをキャッシュするとパフォーマンスが大幅に向上することをご存じでしょう。

すべてをキャッシュするのではなく、コンパイルのようなコストがかかるステップをキャッシュすることを*お勧めします*。

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

この例では、`restore_cache` は最初に現在の git リビジョンからキャッシュヒットを探し、次に現在のブランチからキャッシュヒットを探します。最後に、すべてのブランチとリビジョンからキャッシュヒットを探します。 `keys` リストが検出されると、最初に一致するキーからキャッシュがリストアされます。 複数の一致がある場合は、最も新しく生成されたキャッシュが使用されます。

ソースコードの更新が頻繁に行われるようなら、指定するファイルをさらに絞り込むと良いでしょう。 そうすることで、現在のブランチや git のリビジョンの変更が頻繁に行われる場合でも、より細やかなソースコードのキャッシュ管理を実現できます。

最も限定的な `restore_cache` オプション({% raw %}`source-v1-{{ .Branch }}-{{ .Revision }}`{% endraw %}) を指定した場合でも、ソースのキャッシュはきわめて有効です。たとえば、同じ git リビジョンに対してビルドを繰り返す場合 ([API トリガーのビルド](https://circleci.com/docs/api/v1/#trigger-a-new-build-by-project-preview)) や、ワークフローを使用する場合です。ワークフローを使用するときには、ソースをキャッシュしないと、ワークフローのジョブごとに同じリポジトリを 1 回ずつ `checkout` しなければならなくなるためです。

とはいえ、ソースのキャッシュを使用する場合と使用しない場合のビルド時間を比較した方が良い場合もあります。 `restore_cache`よりも`git clone`の方が高速な場合も多々あります。

**注:** 既に組み込まれている `checkout` コマンドを実行すると、git の自動ガベージコレクションが無効になります。 `save_cache` を実行する前に、`run` ステップで `git gc` を手動で実行すると、保存されるキャッシュのサイズが小さくなります。

## 関連項目
{: #see-also }
{:.no_toc}

[最適化]({{ site.baseurl }}/2.0/optimizations/)
