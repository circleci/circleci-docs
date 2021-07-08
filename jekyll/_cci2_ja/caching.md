---
layout: classic-docs
title: "依存関係のキャッシュ"
short-title: "依存関係のキャッシュ"
description: "依存関係のキャッシュ"
categories:
  - optimization
order: 50
version:
  - Cloud
  - Server v2.x
---

キャッシュは、以前のジョブの高コストなフェッチ操作から取得したデータを再利用することで、CircleCI のジョブを効果的に高速化します。

* 目次
{:toc}

ジョブを 1 回実行すると、以降のジョブ インスタンスでは同じ処理をやり直す必要がなくなり、その分高速化されます。

![キャッシュのデータ フロー]({{ site.baseurl }}/assets/img/docs/caching-dependencies-overview.png)

キャッシュは、Yarn、Bundler、Pip などの**パッケージ依存関係管理ツール**と共に使用すると特に有効です。 キャッシュから依存関係を復元することで、`yarn install` などのコマンドを実行するときに、ビルドごとにすべてを再ダウンロードするのではなく、新しい依存関係をダウンロードするだけで済むようになります。

<div class="alert alert-warning" role="alert">
<b>警告:</b> 異なる Executor 間 (たとえば、Docker と Machine、Linux、Windows、MacOS の間、または CircleCI イメージとそれ以外のイメージの間) でファイルをキャッシュすると、ファイル パーミッション エラーまたはパス エラーが発生することがあります。 これらのエラーは、ユーザーが存在しない、ユーザーの UID が異なる、パスが存在しないなどの理由で発生します。 異なる Executor 間でファイルをキャッシュする場合は、特に注意してください。
</div>

## キャッシュ構成の例
{: #example-caching-configuration }
{:.no_toc}

キャッシュ キーは簡単に構成できます。 以下の例では、`pom.xml` のチェックサムとカスケード フォールバックを使用して、変更があった場合にキャッシュを更新しています。

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

CircleCI 2.0 では依存関係キャッシュの自動化を利用できません。 このため、最適なパフォーマンスを得るには、キャッシュ戦略を計画して実装することが重要です。 2.0 では、キャッシュを手動で構成し、より高度な戦略を立て、きめ細かに制御することができます。

ここでは、キャッシュの手動構成、選択した戦略のコストとメリット、およびキャッシュに関する問題を回避するためのヒントについて説明します。 **メモ:** CircleCI 2.0 のジョブ実行に使用される Docker イメージは、サーバー インフラストラクチャに自動的にキャッシュされます (可能な場合)。

Docker イメージの未変更レイヤーを再利用するプレミアム機能を有効にする方法については、「[Docker レイヤー キャッシュの有効化]({{ site.baseurl }}/ja/2.0/docker-layer-caching/)」を参照してください。

## 概要
プロジェクトがオープン ソースであるか、フォーク可能としてコントリビューターのプル リクエスト (PR) を受け付ける場合は、次のことに注意してください。
{:.no_toc}

キャッシュは、キーに基づいてファイルの階層を保存します。 キャッシュを使用してデータを保存するとジョブが高速に実行されますが、キャッシュ ミス (ゼロ キャッシュ リストア) が起きた場合でも、ジョブは正常に実行されます。 たとえば、`npm` パッケージ ディレクトリ (`node_modules`) をキャッシュする場合は、初めてジョブを実行するときに、すべての依存関係がダウンロードされてキャッシュされます。 キャッシュが有効な限り、次回そのジョブを実行するときにキャッシュが使用され、ジョブ実行が高速化されます。

キャッシュは、信頼性の確保 (古いキャッシュや不適切なキャッシュを使用しない) と最大限のパフォーマンス (すべてのビルドで完全にキャッシュを使用する) のどちらを優先するかを考慮して構成します。

通常は、ビルドが壊れる危険を冒したり、古い依存関係を使用して高速にビルドするよりも、信頼性の維持を優先した方が安全です。 このため、高い信頼性を確保しつつ、最大限のパフォーマンスを得られるようにバランスを取ることが理想的と言えます。

## キャッシュとオープン ソース
{: #caching-and-open-source }

If your project is open source/available to be forked and receive PRs from contributors, please make note of the following:

- 同じフォーク リポジトリからの PR では、キャッシュを共有します (前述のように、これには master リポジトリ内の PR と master によるキャッシュの共有が含まれます)。
- それぞれ異なるフォーク リポジトリ内にある 2 つの PR は、別々のキャッシュを持ちます。
- [環境変数]({{site.baseurl}}/2.0/env-vars)の共有を有効にすると、元のリポジトリとフォークされているすべてのビルド間でキャッシュ共有が有効になります。


## ライブラリのキャッシュ
{: #caching-libraries }

ジョブ実行中にキャッシュすることが最も重要な依存関係は、プロジェクトが依存するライブラリです。 たとえば、Python なら `pip`、Node.js なら `npm` でインストールされるライブラリをキャッシュします。 さまざまな言語の依存関係管理ツール (`npm`、`pip` など) には、依存関係がインストールされるパスがそれぞれ指定されています。 お使いのスタックの仕様については、各言語ガイドおよび[デモ プロジェクト](https://circleci.com/ja/docs/2.0/demo-apps/)を参照してください。

プロジェクトに明示的に必要でないツールは、Docker イメージに保存するのが理想的です。 CircleCI のビルド済み Docker イメージには、そのイメージが対象としている言語を使用してプロジェクトをビルドするための汎用ツールがプリインストールされています。 たとえば、`circleci/ruby:2.4.1` イメージには git、openssh-client、gzip などの便利なツールがプリインストールされています。

![依存関係のキャッシュ]( {{ site.baseurl }}/assets/img/docs/cache_deps.png)

## ワークフローでのキャッシュへの書き込み
{: #writing-to-the-cache-in-workflows }

同じワークフロー内のジョブどうしはキャッシュを共有できます。 このため、複数のワークフローの複数のジョブにまたがってキャッシュを実行すると、競合状態が発生する可能性があります。

つまり、`node-cache-master` などの特定のキーにキャッシュが書き込まれると、そのキーに再度書き込むことはできません。 この中で、Job3 は Job1 と Job2 に依存しています ({Job1, Job2} -> Job3)。  これらは、すべて同じキャッシュ キーに対して読み書きを行います。

このワークフローの実行中、Job3 は Job1 または Job2 によって書き込まれたキャッシュを使用します。  キャッシュは変更不可なので、どちらかのジョブによって最初に保存されたキャッシュが使用されます。  This is usually undesireable because the results aren't deterministic--part of the result depends on chance.  これを確定的なワークフローにするには、ジョブの依存関係を変更します。 Job1 と Job2 で別のキャッシュに書き込み、Job3 ではいずれかのキャッシュから読み込みます。 または、一方向の依存関係を指定します (Job1 -> Job2 ->Job3)。

{% raw %}`node-cache-{{ checksum "package-lock.json" }}`{% endraw %} のような動的キーを使用して保存を行い、`node-cache-` のようなキーの部分一致を使用して復元を行うような、より複雑なジョブのケースもあります。  競合状態が発生する可能性がありますが、詳細はケースによって異なります。  たとえば、ダウンストリーム ジョブがアップストリーム ジョブのキャッシュを使用して最後に実行されるような場合です。

ジョブ間でキャッシュを共有している場合に発生する競合状態もあります。 Job1 と Job2 の間に依存関係がないワークフローを例に考えます。  Job2 は Job1 によって保存されたキャッシュを使用します。  Job1 がキャッシュの保存を報告したとしても、Job2 でキャッシュを正常に復元できることもあれば、キャッシュが見つからないと報告することもあります。  また、Job2 が以前のワークフローからキャッシュを読み込むこともあります。  その場合は、Job1 がキャッシュを保存する前に、Job2 がキャッシュを読み込もうとすることになります。  この問題を解決するには、ワークフローの依存関係 (Job1 -> Job2) を作成します。  こうすることで、Job1 の実行が終了するまで、Job2 の実行を待機させることができます。

## キャッシュの復元
{: #restoring-cache }

CircleCI では、`restore_cache` ステップにリストされているキーの順番でキャッシュが復元されます。 各キャッシュ キーはプロジェクトの名前空間にあり、プレフィックスが一致すると取得されます。 最初に一致したキーのキャッシュが復元されます。 複数の一致がある場合は、最も新しく生成されたキャッシュが使用されます。

In the example below, two keys are provided:

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

Let's walk through how the above cache keys are used in more detail:

`keys:` リストのすべての行は *1 つのキャッシュ*を管理します (各行が固有のキャッシュに**対応しているわけではありません**)。 この例でリストされているキー {% raw %}(`v1-npm-deps-{{ checksum "package-lock.json" }}`{% endraw %} および `v1-npm-deps-`) は、**単一**のキャッシュを表しています。 キャッシュの復元が必要になると、まず (最も特定度の高い) 最初のキーに基づいてキャッシュがバリデーションされ、次に他のキーを順に調べて、他のキャッシュ キーに変更があるかどうかが確認されます。

`package-lock` ファイルの内容が変更された場合、`checksum` 関数は別の一意の文字列を返し、キャッシュを無効化する必要があることが示されます。

次のキーには動的コンポーネントが連結されていません。 これは静的な文字列 `v1-npm-deps-` です。 キャッシュを手動で無効にするには、`config.yml` ファイルで `v1` を `v2` にバンプします。 これで、キャッシュ キーが新しい `v2-npm-deps` になり、新しいキャッシュの保存がトリガーされます。

### モノレポ (モノリポ) でのキャッシュの使用
{: #using-caching-in-monorepos }

モノレポでキャッシュを活用する際のアプローチは数多くあります。 ここで紹介するアプローチは、モノレポのさまざまな部分にある複数のファイルに基づいて共有キャッシュを管理する必要がある場合に使用できます。

#### 連結 `package-lock` ファイルの作成と構築
{: #creating-and-building-a-concatenated-package-lock-file }

1) Add custom command to config:

{% raw %}
```yaml
commands:
  create_concatenated_package_lock:
    description: "lerna.js で認識されるすべての package-lock.json ファイルを単一のファイルに連結します。 File is used as checksum source for part of caching key."
    ファイルは、チェックサム ソースとしてキャッシュ キーの一部に使用します"
    parameters:
      filename:
        type: string
    steps:
      - run:
          name: package-lock.json ファイルの単一ファイルへの統合
          command: npx lerna list -p -a | awk -F packages '{printf "\"packages%s/package-lock.json\" ", $2}' | xargs cat &#062; &#060;&#060; parameters.filename &#062;&#062;
```
{% endraw %}

2) Use custom command in build to generate the concatenated `package-lock` file

{% raw %}
```yaml
    {% endraw %}

2) ビルド時にカスタム コマンドを使用して、連結 `package-lock` ファイルを生成します。

{% raw %}
```yaml
    steps:
      - checkout
      - create_concatenated_package_lock:
          filename: combined-package-lock.txt
      ## combined-package-lock.text をキャッシュ キーに使用します
      - restore_cache:
          keys:
            - v3-deps-{{ checksum "package-lock.json" }}-{{ checksum "combined-package-lock.txt" }}
            - v3-deps
```
{% endraw %}

## キャッシュの管理
`save_cache` ステップで作成されたキャッシュは、最長 15 日間保存されます。

### キャッシュの有効期限
{: #cache-expiration }
{:.no_toc}
Caches created via the `save_cache` step are stored for up to 15 days.

### キャッシュのクリア
{: #clearing-cache }
{:.no_toc}

If you need to get clean caches when your language or dependency management tool versions change, use a naming strategy similar to the previous example and then change the cache key names in your `config.yml` file and commit the change to clear the cache.

<div class="alert alert-info" role="alert">
<b>ヒント:</b> キャッシュは変更不可なので、すべてのキャッシュ キーの先頭にプレフィックスとしてバージョン名 (<code class="highlighter-rouge">v1-...</code>など) を付加すると便利です。 こうすれば、プレフィックスのバージョン番号を増やすだけで、キャッシュ全体を再生成できます。
</div>

For example, you may want to clear the cache in the following scenarios by incrementing the cache key name:

* npm のバージョンが 4 から 5 に変更されるなど、依存関係管理ツールのバージョンが変更された場合
* Ruby のバージョンが 2.3 から 2.4 に変更されるなど、言語のバージョンが変更された場合
* プロジェクトから依存関係が削除された場合

<div class="alert alert-info" role="alert">
  <b>ヒント:</b> キャッシュ キーに <code class="highlighter-rouge">:、?、&、=、/、#</code> などの特殊文字や予約文字を使用すると、ビルドの際に問題が発生する可能性があるため、注意が必要です。 一般に、キャッシュ キーのプレフィックスには [a-z][A-Z] の範囲の文字を使用してください。
</div>

### キャッシュ サイズ
{: #cache-size }
{:.no_toc}
キャッシュ サイズは 500 MB 未満に抑えることをお勧めします。 This is our upper limit for corruption checks because above this limit check times would be excessively long. キャッシュ サイズは、CircleCI の [Jobs (ジョブ)] ページの `restore_cache` ステップで確認できます。 キャッシュ サイズを増やすこともできますが、キャッシュの復元中に問題が発生したり、ダウンロード中に破損する可能性が高くなるため、お勧めできません。 キャッシュ サイズを抑えるため、複数のキャッシュに分割することを検討してください。

## 基本的な依存関係キャッシュの例
{: #basic-example-of-dependency-caching }

CircleCI 2.0 の手動で構成可能な依存関係キャッシュを最大限に活用するには、キャッシュの対象と方法を明確にする必要があります。 その他の例については、「CircleCI を設定する」の「[save_cache]({{ site.baseurl }}/ja/2.0/configuration-reference/#save_cache)」セクションを参照してください。

ファイルやディレクトリのキャッシュを保存するには、`.circleci/config.yml` ファイルでジョブに `save_cache` ステップを追加します。

```yaml
    steps:
      - save_cache:
          key: my-cache
          paths:
            - my-file.txt
            - my-project/my-dependencies-directory
```

ディレクトリのパスは、ジョブの `working_directory` からの相対パスです。 必要に応じて、絶対パスも指定できます。

**Note:** Unlike the special step [`persist_to_workspace`]({{ site.baseurl }}/2.0/configuration-reference/#persist_to_workspace), neither `save_cache` nor `restore_cache` support globbing for the `paths` key.

## キーとテンプレートの使用
{: #using-keys-and-templates }

各キャッシュ キーは、1 つのデータ キャッシュに対応する*ユーザー定義*の文字列です。 **動的な値**を挿入してキャッシュ キーを作成することができます。 これは**テンプレート**と呼ばれます。 キャッシュ キー内の中かっこで囲まれている部分がテンプレートです。 以下を例に考えてみましょう。

```sh
{% raw %}myapp-{{ checksum "package-lock.json" }}{% endraw %}
```

上の例の出力は、このキーを表す一意の文字列です。 ここでは、[チェックサム](https://ja.wikipedia.org/wiki/チェックサム)を使用して、`package-lock.json` の内容を表す一意の文字列を作成しています。

この例では、以下のような文字列が出力されます。

```sh
{% raw %}myapp-+KlBebDceJh_zOWQIAJDLEkdkKoeldAldkaKiallQ={% endraw %}
```

If the contents of the `package-lock` file were to change, the `checksum` function would return a different, unique string, indicating the need to invalidate the cache.

キャッシュの `key` に使用するテンプレートを選択するうえでは、キャッシュの保存にはコストがかかること、キャッシュを CircleCI ストレージにアップロードするにはある程度の時間がかかることに留意してください。 ビルドのたびに新しいキャッシュが生成されないように、実際に何かが変更された場合にのみ新しいキャッシュが生成されるような `key` にします。

最初に、プロジェクトの何らかの側面を表す値を含むキーを使用して、キャッシュを保存または復元するタイミングを指定します。 たとえば、ビルド番号が増えたとき、リビジョン番号が増えたとき、依存関係マニフェスト ファイルのハッシュが変更されたときなどです。

以下に、さまざまな目的を持つキャッシュ戦略の例を示します。

 * 言語の依存関係管理ツールが扱うロック ファイル (`Gemfile.lock` や `yarn.lock` など) のチェックサムは、キャッシュ キーとして便利に使用できます。
 * {% raw %}`myapp-{{ .Branch }}-{{ checksum "package-lock.json" }}`{% endraw %} - `package-lock.json` ファイルの内容が変更されるたびにキャッシュが再生成されます。 このプロジェクトのブランチでそれぞれ異なるキャッシュ キーが生成されます。
 * {% raw %}`myapp-{{ epoch }}`{% endraw %} - ビルドのたびに異なるキャッシュ キーが生成されます。

ステップの実行中に、上のテンプレートが実行時値に置き換えられ、その置換後の文字列が `key` として使用されます。 以下の表に、使用可能なキャッシュの `key` テンプレートを示します。

| テンプレート                                                 | 説明                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| {% raw %}`{{ checksum "filename" }}`{% endraw %}       | filename で指定したファイルの内容の SHA256 ハッシュを Base64 エンコードした値。 ファイルが変更されると、新しいキャッシュ キーが生成されます。 This should be a file committed in your repo. 依存関係マニフェスト ファイル (`package-lock.json`、`pom.xml`、`project.clj` など) の使用を検討してください。 また、`restore_cache` から `save_cache` までの間にファイルの内容が変更されないようにすることが重要です。 ファイルの内容が変更された場合、`restore_cache` のタイミングで使用されるファイルとは異なるキャッシュ キーの下でキャッシュが保存されます。                                                        |
| {% raw %}`{{ .Branch }}`{% endraw %}                   | 現在ビルド中の VCS ブランチ。                                                                                                                                                                                                                                                                                                                                                                                                          |
| {% raw %}`{{ .BuildNum }}`{% endraw %}                 | このビルドの CircleCI ジョブ番号。                                                                                                                                                                                                                                                                                                                                                                                                     |
| {% raw %}`{{ .Revision }}`{% endraw %}                 | 現在ビルド中の VCS リビジョン。                                                                                                                                                                                                                                                                                                                                                                                                         |
| {% raw %}`{{ .Environment.variableName }}`{% endraw %} | 環境変数 `variableName` ([CircleCI からエクスポートされる環境変数](https://circleci.com/ja/docs/2.0/env-vars/#circleci-environment-variable-descriptions)、または特定の[コンテキスト](https://circleci.com/ja/docs/2.0/contexts)に追加した環境変数がサポートされ、任意の環境変数は使用できません)。                                                                                                                                                                                         |
| {% raw %}`{{ epoch }}`{% endraw %}                     | 協定世界時 (UTC) 1970 年 1 月 1 日午前 0 時 0 分 0 秒からの経過秒数。 POSIX や UNIX エポックとも呼ばれます。 このキャッシュ キーは、実行のたびに新しいキャッシュを保存する必要がある場合に便利です。                                                                                                                                                                                                                                                                                                    |
| {% raw %}`{{ arch }}`{% endraw %}                      | OS と CPU (アーキテクチャ、ファミリ、モデル) の情報を取得します。 OS や CPU アーキテクチャに依存するコンパイル済みバイナリをキャッシュする場合に便利です (`darwin-amd64-6_58`、`linux-amd64-6_62` など)。 [サポートされている CPU アーキテクチャ]({{ site.baseurl }}/ja/2.0/faq/#circleci-%E3%81%A7%E3%81%AF%E3%81%A9%E3%81%AE-cpu-%E3%82%A2%E3%83%BC%E3%82%AD%E3%83%86%E3%82%AF%E3%83%81%E3%83%A3%E3%82%92%E3%82%B5%E3%83%9D%E3%83%BC%E3%83%88%E3%81%97%E3%81%A6%E3%81%84%E3%81%BE%E3%81%99%E3%81%8B)を参照してください。 |
{: class="table table-striped"}

### キーとテンプレートの使用に関する補足説明
{: #further-notes-on-using-keys-and-templates }
{:.no_toc}

- キャッシュに一意の識別子を定義するときは、{% raw %}`{{ epoch }}`{% endraw %} などの特定度の高いテンプレート キーを過度に使用しないように注意してください。 {% raw %}`{{ .Branch }}`{% endraw %} や {% raw %}`{{ checksum "filename" }}`{% endraw %} などの特定度の低いテンプレート キーを使用すると、キャッシュが使用される可能性が高くなります。
- キャッシュ変数には、ビルドで使用している[パラメーター]({{site.baseurl}}/2.0/reusing-config/#executor-でのパラメーターの使用)も使用できます。 たとえば、{% raw %}`v1-deps-<< parameters.varname >>`{% endraw %} のように指定します。
- キャッシュ キーに動的なテンプレートを使用する必要はありません。 静的な文字列を使用し、その名前を「バンプ」(変更) することで、キャッシュを強制的に無効化できます。

### キャッシュの保存および復元の例
{: #full-example-of-saving-and-restoring-cache }
{:.no_toc}

以下に、`.circleci/config.yml` ファイルで `restore_cache` と `save_cache` をテンプレートとキーと共に使用する例を示します。

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
      - image: circleci/mysql:5.6
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

依存関係管理ツールの中には、部分的に復元された依存関係ツリー上へのインストールを正しく処理できないものがあります。

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

In the above example, if a dependency tree is partially restored by the second or third cache keys, some dependency managers will incorrectly install on top of the outdated dependency tree.

カスケード フォールバックの代わりに、以下のように単一バージョンのプレフィックスが付いたキャッシュ キーを使用することで、動作の信頼性が高まります。

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

部分的な依存関係キャッシュの信頼性は、依存関係管理ツールに依存します。 以下に、一般的な依存関係管理ツールについて、推奨される部分キャッシュの使用方法をその理由と共に示します。

#### Bundler (Ruby)
{% raw %}```yaml
{:.no_toc}

この問題を解決するには、キャッシュから依存関係を復元する前に Bundler をクリーンアップするステップを追加します。

Bundler では、明示的に指定されないシステム gem が使用されるため、確定的でなく、部分キャッシュ リストアの信頼性が低下することがあります。

To prevent this behavior, add a step that cleans Bundler before restoring dependencies from cache.

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
        # ロック ファイルが変更されたら、パターンが一致する範囲を少しずつ広げてキャッシュを復元します
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

**Safe to Use Partial Cache Restoration?** Yes.

Gradle リポジトリは、規模が大きく、一元化や共有が行われることが想定されています。 生成されたアーティファクトのクラスパスに実際に追加されるライブラリに影響を与えることなく、キャッシュの一部を復元できます。

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
        # ロック ファイルが変更されたら、パターンが一致する範囲を少しずつ広げてキャッシュを復元します
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

**Safe to Use Partial Cache Restoration?** Yes.

Maven リポジトリは、規模が大きく、一元化や共有が行われることが想定されています。 生成されたアーティファクトのクラスパスに実際に追加されるライブラリに影響を与えることなく、キャッシュの一部を復元できます。

Since Leiningen uses Maven under the hood, it has equivalent behavior.

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
        # ロック ファイルが変更されたら、パターンが一致する範囲を少しずつ広げてキャッシュを復元します
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

NPM5 以降でロック ファイルを使用すると、部分キャッシュ リストアを安全に行うことができます。

With NPM5+ and a lock file, you can safely use partial cache restoration.

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
        # ロック ファイルが変更されたら、パターンが一致する範囲を少しずつ広げてキャッシュを復元します
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

**Safe to Use Partial Cache Restoration?** Yes (with Pipenv).

Pip では、`requirements.txt` で明示的に指定されていないファイルを使用できます。 [Pipenv](https://docs.pipenv.org/) を使用するには、ロック ファイルでバージョンを明示的に指定する必要があります。

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
        # ロック ファイルが変更されたら、パターンが一致する範囲を少しずつ広げてキャッシュを復元します
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

**Safe to Use Partial Cache Restoration?** Yes.

Yarn has always used a lock file for exactly these reasons.

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
        # ロック ファイルが変更されたら、パターンが一致する範囲を少しずつ広げてキャッシュを復元します
        - yarn-packages-v1-{{ .Branch }}-{{ checksum "yarn.lock" }}
        - yarn-packages-v1-{{ .Branch }}-
        - yarn-packages-v1-
  - save_cache:
      paths:
        - ~/.cache/yarn
      key: yarn-packages-v1-{{ .Branch }}-{{ checksum "yarn.lock" }}
```

次の 2 つの理由から、`yarn --frozen-lockfile --cache-folder ~/.cache/yarn` を使うことをお勧めします。

1) `--frozen-lockfile` を指定すると新しいロック ファイルが作成されるので、既存のロック ファイルの変更を防止できます。 これにより、チェックサムが保たれ、依存関係が開発環境のものと完全に一致します。

2) デフォルトのキャッシュの保存場所は OS によって異なります。 `--cache-folder ~.cache/yarn` により、目的のキャッシュの保存場所を明示的に指定できます。

{% endraw %}

## キャッシュ戦略のトレードオフ
{: #caching-strategy-tradeoffs }

使用言語のビルド ツールが依存関係を難なく処理できる場合は、ゼロ キャッシュ リストアよりも部分キャッシュ リストアの方がパフォーマンス上は有利です。 ゼロ キャッシュ リストアでは、依存関係をすべて再インストールしなければならないため、パフォーマンスが低下することがあります。 この問題を回避するには、キャッシュをゼロから作り直すのではなく、依存関係の大部分を古いキャッシュから復元します。

一方、それ以外の言語では、部分キャッシュ リストアを実行すると、宣言された依存関係と矛盾するコード依存関係が作成されるリスクがあり、キャッシュなしでビルドを実行するまでその矛盾は解決されません。 依存関係が頻繁に変更されない場合は、ゼロ キャッシュ リストア キーをリストの最初に配置してみてください。

次に、ビルドにかかる時間を追跡します。 ゼロ キャッシュ リストア (キャッシュ ミス) に伴ってパフォーマンスが大幅に低下することがわかった場合には、部分キャッシュ リストア キーの追加を検討してください。

キャッシュを復元するためのキーを複数列挙すると、部分キャッシュがヒットする可能性が高くなります。 ただし、`restore_cache` の対象が時間的に広がることで、さらに多くの混乱を招く危険性もあります。 たとえば、アップグレードしたブランチに Node v6 の依存関係がある一方で、他のブランチでは Node v5 の依存関係が使用されている場合は、他のブランチを検索する `restore_cache` ステップで、アップグレードしたブランチとは互換性がない依存関係が復元される可能性があります。

### ロック ファイルの使用
{: #using-a-lock-file }
{:.no_toc}

Language dependency manager lockfiles (for example, `Gemfile.lock` or `yarn.lock`) checksums may be a useful cache key.

また、`ls -laR your-deps-dir > deps_checksum` を実行し、{% raw %}`{{ checksum "deps_checksum" }}`{% endraw %} で参照するという方法もあります。 たとえば、Python で `requirements.txt` ファイルのチェックサムよりも限定的なキャッシュを取得するには、プロジェクト ルート `venv` の virtualenv 内に依存関係をインストールし、`ls -laR venv > python_deps_checksum` を実行します。

### 言語ごとに異なるキャッシュを使用する
{: #using-multiple-caches-for-different-languages }
{:.no_toc}

ジョブを複数のキャッシュに分割することで、キャッシュ ミスのコストを抑制できます。 異なるキーを使用して複数の `restore_cache` ステップを指定することで、各キャッシュのサイズを小さくし、キャッシュ ミスによるパフォーマンスへの影響を抑えることができます。 それぞれの依存関係管理ツールによるファイルの保存方法、ファイルのアップグレード方法、および依存関係のチェック方法がわかっている場合は、言語ごとに (npm、pip、bundler) キャッシュを分割することを検討してください。

### 高コストのステップのキャッシュ
{: #caching-expensive-steps }
{:.no_toc}

言語やフレームワークによっては、キャッシュ可能で、キャッシュする方が望ましいものの、大きなコストがかかるステップがあります。 たとえば、Scala や Elixir では、コンパイル ステップをキャッシュすることで、効率が大幅に向上します。 Rails の開発者も、フロントエンドのアセットをキャッシュするとパフォーマンスが大幅に向上することをご存じでしょう。

すべてをキャッシュするのではなく、コンパイルのようなコストがかかるステップをキャッシュすることを*お勧めします*。

## ソースのキャッシュ
{: #source-caching }

git リポジトリをキャッシュすると `checkout` ステップにかかる時間を短縮できる場合があります。 これは特に、大規模なプロジェクトで有効です。 以下に、ソースのキャッシュ例を示します。

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

この例では、`restore_cache` は最初に現在の git リビジョンからキャッシュ ヒットを探し、次に現在のブランチからキャッシュ ヒットを探します。 `keys` リストが検出されると、最初に一致するキーからキャッシュが復元されます。 複数の一致がある場合は、最も新しく生成されたキャッシュが使用されます。

ソース コードが頻繁に変更される場合は、特定度の高い少数のキーを使用することをお勧めします。 こうすることで、より細かなソース キャッシュが生成され、現在のブランチや git リビジョンが変更されるたびに更新されます。

最も限定的な `restore_cache` オプション({% raw %}`source-v1-{{ .Branch }}-{{ .Revision }}`{% endraw %}) を指定した場合でも、ソースのキャッシュはきわめて有効です。 たとえば、同じ git リビジョンに対してビルドを繰り返す場合 ([API トリガーのビルド](https://circleci.com/docs/api/v1/#trigger-a-new-build-by-project-preview)) や、ワークフローを使用する場合です。

ただし、ソースをキャッシュした場合としなかった場合のビルド時間を比較することは重要です。 `git clone` よりも速いことも少なくありません。

**メモ:** 組み込みの `checkout` コマンドを実行すると、git の自動ガベージ コレクションが無効になります。 `save_cache` を実行する前に、`run` ステップで `git gc` を手動で実行すると、保存されるキャッシュのサイズが小さくなります。

## 関連項目
{: #see-also }
{:.no_toc}

[最適化]({{ site.baseurl }}/2.0/optimizations/)
