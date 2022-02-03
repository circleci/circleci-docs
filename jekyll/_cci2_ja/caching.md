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
  - Server v3.x
  - Server v2.x
---

キャッシュは、CircleCI でのジョブを高速化する最も効果的な方法の 1 つです。 また、以前のジョブからデータを再利用することでフェッチ操作のコストを下げることができます。

* 目次
{:toc}

ジョブを 1 回実行すると、以降のジョブインスタンスでは同じ処理をやり直す必要がなくなり、その分高速化されます。

![キャッシュのデータ フロー]({{ site.baseurl }}/assets/img/docs/caching-dependencies-overview.png)

キャッシュは、Yarn、Bundler、Pip などの**パッケージ依存関係管理ツール**と共に使用すると特に有効です。 キャッシュから依存関係を復元することで、`yarn install` などのコマンドを実行するときに、ビルドごとにすべてを再ダウンロードするのではなく、新しい依存関係をダウンロードするだけで済むようになります。

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

キャッシュの書き換えはできません。 `node-cache-main`のように特定のキーにキャッシュを一度書き込むと、再度書き込むことはできません。 この中で、Job3 は Job1 と Job2 に依存しています ({Job1, Job2} -> Job3)。 それら 3 つのジョブはすべて同じキャッシュキーについて読み書きを行います。

Workflow の実行中は、最後の ジョブ 3 はジョブ 1 もしくはジョブ 2 のどちらかが書き込んだキャッシュを使用します。 ただし、キャッシュは書き換え不可のため、ジョブ 1 とジョブ 2 のどちらかが最初に書き込んだキャッシュを使うことになります。 This is usually undesirable, because the results are not deterministic. Part of the result depends on chance. You could make this workflow deterministic by changing the job dependencies. For example, make Job1 and Job2 write to different caches, and Job3 loads from only one. Or ensure there can be only one ordering: Job1 -> Job2 ->Job3.

There are more complex cases where jobs can save using a dynamic key like {% raw %}`node-cache-{{ checksum "package-lock.json" }}`{% endraw %} and restore using a partial key match like `node-cache-`. A race condition is still possible, but the details may change. 例えば、後の方で実行されるジョブが、継続実行しているジョブのキャッシュを使うようなケースもあります。

ジョブ間で共有するキャッシュでレースコンディションが発生することもあります。 依存リンクのない、ジョブ 1 とジョブ 2 からなる Workflow を考えてみましょう。 ジョブ 2 はジョブ 1 で保存したキャッシュを使うこととします。 ジョブ 1 がキャッシュを保存していても、ジョブ 2 はそのキャッシュを復元することもあれば、キャッシュがないことを検出することもあります。 ジョブ 2 はさらに直前の Workflow からキャッシュを読み込むこともあります。 このケースでは、ジョブ 1 がキャッシュを保存する前に、ジョブ 2 がそれを読み込もうとしていると考えられます。 この問題を解決するには、ワークフローの依存関係 (Job1 -> Job2) を作成します。 This forces Job2 to wait until Job1 has finished running.

## キャッシュの復元
{: #restoring-cache }

CircleCI は、`restore_cache` ステップの keys 内で記述している順番通りにキャッシュを復元しようとします。 Each cache key is namespaced to the project and retrieval is prefix-matched. The cache is restored from the first matching key. If there are multiple matches, the most recently generated cache is used.

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

Because the second key is less specific than the first, it is more likely there will be differences between the current state and the most recently generated cache. 依存関係ツールを実行すると、古い依存関係が検出されて更新されます。 これを**部分キャッシュ リストア**と言います。

The following example provides a more detailed explanation of how the above cache keys are used:

Each line in the `keys:` list manages _one cache_ (each line does **not** correspond to its own cache). この例でリストされているキー {% raw %}(`v1-npm-deps-{{ checksum "package-lock.json" }}`{% endraw %} および `v1-npm-deps-`) は、**単一**のキャッシュを表しています。 When it is time to restore the cache, CircleCI first validates the cache based on the first (and most specific) key, and then steps through the other keys looking for any other cache key changes.

The first key concatenates the checksum of `package-lock.json` file into the string `v1-npm-deps-`. If this file changed in your commit, CircleCI would see a new cache key.

The next key does not have a dynamic component to it. It is simply a static string: `v1-npm-deps-`. キャッシュを手動で無効にするには、`config.yml` ファイルで `v1` を `v2` にバンプします。 In this case, you would now have a new cache key `v2-npm-deps`, which triggers the storing of a new cache.

### モノレポ (モノリポ) でのキャッシュの使用
{: #using-caching-in-monorepos }

モノレポでキャッシュを活用する際のアプローチは数多くあります。 The following approach can be used whenever you need to manage a shared cache based on multiple files in different parts of your monorepo.

#### 連結 `package-lock` ファイルの作成と構築
{: #creating-and-building-a-concatenated-package-lock-file }

1. Add custom command to config:

      {% raw %}
      ```yaml
      commands:
        create_concatenated_package_lock:
          description: "Concatenate all package-lock.json files recognized by lerna.js into single file. ファイルは、チェックサム ソースとしてキャッシュ キーの一部に使用します"
          parameters:
            filename:
              type: string
          steps:
            - run:
                name: Combine package-lock.json files to single file
                command: npx lerna la -a | awk -F packages '{printf "\"packages%s/package-lock.json\" ", $2}' | xargs cat > << parameters.filename >>
      ```
      {% endraw %}

2. Use custom command in build to generate the concatenated `package-lock` file:

      {% raw %}
      ```yaml
          steps:
            - checkout
            - create_concatenated_package_lock:
                filename: combined-package-lock.txt
            ## Use combined-package-lock.text in cache key
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

If you need to get clean caches when your language or dependency management tool versions change, use a naming strategy similar to the previous example. Then change the cache key names in your `config.yml` file and commit the change to clear the cache.

<div class="alert alert-info" role="alert">
<b>Tip:</b> Caches are immutable, so it is helpful to start all your cache keys with a version prefix, for example <code class="highlighter-rouge">v1-...</code>. This allows you to regenerate all of your caches just by incrementing the version in this prefix.
</div>

下記のような状況では、キャッシュキーの名前を変えることによるキャシュのクリアを検討してみてください。

* npm コマンドがバージョンアップするなど、依存関係管理ツールのバージョンが変更になった.
* Language version change, for example, you change Ruby 2.3 to 2.4.
* プロジェクトから依存関係が削除された.

<div class="alert alert-info" role="alert">
  <b>Tip:</b> Beware when using special or reserved characters in your cache key (for example: <code class="highlighter-rouge">:, ?, &, =, /, #</code>), as they may cause issues with your build. Consider using keys within [a-z][A-Z] in your cache key prefix.
</div>

### キャッシュ サイズ
{: #cache-size }
{:.no_toc}
We recommend keeping cache sizes under 500MB. This is our upper limit for corruption checks. Above this limit, check times would be excessively long. キャッシュ サイズは、CircleCI の [Jobs (ジョブ)] ページの `restore_cache` ステップで確認できます。 Larger cache sizes are allowed, but may cause problems due to a higher chance of decompression issues and corruption during download. To keep cache sizes down, consider splitting them into multiple distinct caches.

## 基本的な依存関係キャッシュの例
{: #basic-example-of-dependency-caching }

CircleCI manual dependency caching requires you to be explicit about what you cache and how you cache it. その他の例については、「CircleCI を設定する」の「[save_cache]({{ site.baseurl }}/2.0/configuration-reference/#save_cache)」セクションを参照してください。

ファイルやディレクトリのキャッシュを保存するには、`.circleci/config.yml` ファイルで指定している ジョブに `save_cache` ステップを追加します。

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

A cache key is a _user-defined_ string that corresponds to a data cache. A cache key can be created by interpolating **dynamic values**. These are called **templates**. Anything that appears between curly braces in a cache key is a template. 以下を例に考えてみましょう。

```sh
{% raw %}myapp-{{ checksum "package-lock.json" }}{% endraw %}
```

The above example outputs a unique string to represent this key. The example is using a [checksum](https://en.wikipedia.org/wiki/Checksum) to create a unique string that represents the contents of a `package-lock.json` file.

The example may output a string similar to the following:

```sh
{% raw %}myapp-+KlBebDceJh_zOWQIAJDLEkdkKoeldAldkaKiallQ={% endraw %}
```

`package-lock` ファイルの内容が変更された場合、`checksum` 関数は別の一意の文字列を返し、キャッシュを無効化する必要があることが示されます。

When choosing suitable templates for your cache `key`, remember that cache saving is not a free operation. It will take some time to upload the cache to CircleCI storage. To avoid generating a new cache every build, include a `key` that generates a new cache only if something changes.

まず初めに、プロジェクトにおいて一意となる値のキーを用いて、キャッシュを保存・復元するタイミングを決めます。 ビルド番号が増えたとき、リビジョンが上がったとき、依存マニフェストファイルのハッシュ値が変わったときなどが考えられます。

The following are examples of caching strategies for different goals:

 * {% raw %}`myapp-{{ checksum "package-lock.json" }}`{% endraw %} - Cache is regenerated every time something is changed in `package-lock.json` file. Different branches of this project generate the same cache key.
 * {% raw %}`myapp-{{ .Branch }}-{{ checksum "package-lock.json" }}`{% endraw %} - Cache is regenerated every time something is changed in `package-lock.json` file. Different branches of this project generate separate cache keys.
 * {% raw %}`myapp-{{ epoch }}`{% endraw %} - Every build generates separate cache keys.

During step execution, the templates above are replaced by runtime values and use the resultant string as the `key`. CirlceCI のキャッシュ`キー`で利用可能なテンプレートを下記の表にまとめました。

| テンプレート                                                 | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| {% raw %}`{{ checksum "filename" }}`{% endraw %}       | filename で指定したファイルの内容の SHA256 ハッシュを Base64 エンコードした値。ファイルが変更されると、新しいキャッシュ キーが生成されます。 ここで指定できるのはリポジトリでコミットされているファイルに限られるため、 `package-lock.json` や `pom.xml`、もしくは `project.clj` などの依存関係を定義しているマニフェストファイルを使うことも検討してください。 The important factor is that the file does not change between `restore_cache` and `save_cache`, otherwise the cache is saved under a cache key that is different from the file used at `restore_cache` time. |
| {% raw %}`{{ .Branch }}`{% endraw %}                   | 現在ビルド中の VCS ブランチ。                                                                                                                                                                                                                                                                                                                                                                                                                 |
| {% raw %}`{{ .BuildNum }}`{% endraw %}                 | このビルドの CircleCI ジョブ番号。                                                                                                                                                                                                                                                                                                                                                                                                            |
| {% raw %}`{{ .Revision }}`{% endraw %}                 | 現在ビルド中の VCS リビジョン。                                                                                                                                                                                                                                                                                                                                                                                                                |
| {% raw %}`{{ .Environment.variableName }}`{% endraw %} | The environment variable `variableName` (supports any environment variable [exported by CircleCI](https://circleci.com/docs/2.0/env-vars/#circleci-environment-variable-descriptions) or added to a specific [Context](https://circleci.com/docs/2.0/contexts), not any arbitrary environment variable).                                                                                                                          |
| {% raw %}`{{ epoch }}`{% endraw %}                     | The number of seconds that have elapsed since 00:00:00 Coordinated Universal Time (UTC), also known as POSIX or UNIX epoch. このキャッシュ キーは、実行のたびに新しいキャッシュを保存する必要がある場合に便利です。                                                                                                                                                                                                                                                          |
| {% raw %}`{{ arch }}`{% endraw %}                      | OS と CPU (アーキテクチャ、ファミリ、モデル) の情報を取得します。 OS や CPU アーキテクチャに合わせてコンパイル済みバイナリをキャッシュするような場合に用います。`darwin-amd64-6_58` あるいは `linux-amd64-6_62` のような文字列になります。 CircleCI で利用可能な CPU については[こちら]({{ site.baseurl }}/2.0/faq/#which-cpu-architectures-does-circleci-support)を参照してください                                                                                                                                                            |
{: class="table table-striped"}

### キーとテンプレートの使用に関する補足説明
{: #further-notes-on-using-keys-and-templates }
{:.no_toc}

- キャッシュに一意の識別子を定義するときは、{% raw %}`{{ epoch }}`{% endraw %} などの特定度の高いテンプレート キーを過度に使用しないように注意してください。 If you use less specific template keys such as {% raw %}`{{ .Branch }}`{% endraw %} or {% raw %}`{{ checksum "filename" }}`{% endraw %}, you increase the chance of the cache being used.
- Cache variables can also accept [parameters]({{site.baseurl}}/2.0/reusing-config/#using-parameters-in-executors), if your build makes use of them. For example: {% raw %}`v1-deps-<< parameters.varname >>`{% endraw %}.
- You do not have to use dynamic templates for your cache key. 静的な文字列を使用し、その名前を「バンプ」(変更) することで、キャッシュを強制的に無効化できます。

### キャッシュの保存および復元の例
{: #full-example-of-saving-and-restoring-cache }
{:.no_toc}

The following example demonstrates how to use `restore_cache` and `save_cache`, together with templates and keys in your `.circleci/config.yml` file.

<div class="alert alert-warning" role="alert">
<b>Warning:</b> This is example is only a <i>potential</i> solution and might be unsuitable for your specific needs.</div>

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

上の例では、2 番目または 3 番目のキャッシュ キーによって依存関係ツリーが部分的に復元された場合に、依存関係管理ツールによっては古い依存関係ツリーの上に誤ってインストールを行ってしまいます。

Instead of a cascading fallback, a more stable option is a single version-prefixed cache key:

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

**部分キャッシュ リストアを使用しても安全でしょうか？** はい。ただし、注意点があります。

Bundler では、明示的に指定されないシステム gem が使用されるため、確定的でなく、部分キャッシュ リストアの信頼性が低下することがあります。

この問題を解決するには、キャッシュから依存関係を復元する前に Bundler をクリーンアップするステップを追加します。

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

**部分キャッシュ リストアを使用しても安全でしょうか？** はい。

Gradle リポジトリは、規模が大きく、一元化や共有が行われることが想定されています。 Partial caches can be restored without impacting which libraries are added to classpaths of generated artifacts.

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

**部分キャッシュ リストアを使用しても安全でしょうか？** はい。

Maven リポジトリは、規模が大きく、一元化や共有が行われることが想定されています。 Partial caches can be restored without impacting which libraries are added to classpaths of generated artifacts.

Since Leiningen uses Maven under the hood, it behaves in a similar way.

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

**部分キャッシュ リストアを使用しても安全でしょうか？** はい。 ただし、NPM5 以降を使用する必要があります。

NPM5 以降でロック ファイルを使用すると、部分キャッシュ リストアを安全に行うことができます。

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

**部分キャッシュ リストアを使用しても安全でしょうか？** はい。ただし、Pipenv を使用する必要があります。

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

**部分キャッシュ リストアを使用しても安全でしょうか？** はい。

Yarn はまさしく部分キャッシュリストアを行えるように、元から lock ファイルを使う設計になっています。

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

We recommend using `yarn --frozen-lockfile --cache-folder ~/.cache/yarn` for two reasons:

1) `--frozen-lockfile` ensures a whole new lockfile is created and it also ensures your lockfile is not altered. これにより、チェックサムが保たれ、依存関係が開発環境のものと完全に一致します。

2) デフォルトのキャッシュの保存場所は OS によって異なります。 `--cache-folder ~/.cache/yarn` ensures you are explicitly matching your cache save location.

{% endraw %}

## キャッシュ戦略のトレードオフ
{: #caching-strategy-tradeoffs }

使用言語のビルド ツールが依存関係を難なく処理できる場合は、ゼロ キャッシュ リストアよりも部分キャッシュ リストアの方がパフォーマンス上は有利です。 If you get a zero cache restore, you have to reinstall all your dependencies, which can cause reduced performance. One alternative is to get a large percentage of your dependencies from an older cache, instead of starting from zero.

However, for other language types, partial caches carry the risk of creating code dependencies that are not aligned with your declared dependencies and do not break until you run a build without a cache. 依存関係が頻繁に変更されない場合は、ゼロ キャッシュ リストア キーをリストの最初に配置してみてください。

Then track the costs over time. If the performance costs of zero cache restores (also referred to as a *cache miss*) prove significant over time, only then consider adding a partial cache restore key.

Listing multiple keys for restoring a cache increases the chances of a partial cache hit. ただし、`restore_cache`の対象が時間的に広がることで、さらに多くの混乱を招く危険性もあります。 たとえば、アップグレードしたブランチに Node v6 の依存関係がある一方で、他のブランチでは Node v5 の依存関係が使用されている場合は、他のブランチを検索する `restore_cache` ステップで、アップグレードしたブランチとは互換性がない依存関係が復元される可能性があります。

### ロック ファイルの使用
{: #using-a-lock-file }
{:.no_toc}

依存関係管理ツールが扱う Lock ファイル (`Gemfile.lock` や `yarn.lock` など) のチェックサムは、キャッシュキーに適しています。

An alternative is to run the command `ls -laR your-deps-dir > deps_checksum` and reference it with {% raw %}`{{ checksum "deps_checksum" }}`{% endraw %}. For example, in Python, to get a more specific cache than the checksum of your `requirements.txt` file, you could install the dependencies within a virtualenv in the project root `venv` and then run the command `ls -laR venv > python_deps_checksum`.

### 言語ごとに異なるキャッシュを使用する
{: #using-multiple-caches-for-different-languages }
{:.no_toc}

ジョブを複数のキャッシュに分割することで、キャッシュ ミスのコストを抑制できます。 By specifying multiple `restore_cache` steps with different keys, each cache is reduced in size, thereby reducing the performance impact of a cache miss. Consider splitting caches by language type (npm, pip, or bundler), if you know how each dependency manager stores its files, how it upgrades, and how it checks dependencies.

### 高コストのステップのキャッシュ
{: #caching-expensive-steps }
{:.no_toc}

Certain languages and frameworks include more expensive steps that can and should be cached. たとえば、Scala や Elixir では、コンパイル ステップをキャッシュすることで、効率が大幅に向上します。 Rails の開発者も、フロントエンドのアセットをキャッシュするとパフォーマンスが大幅に向上することをご存じでしょう。

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

この例では、`restore_cache` は最初に現在の git リビジョンからキャッシュ ヒットを探し、次に現在のブランチからキャッシュ ヒットを探します。最後に、すべてのブランチとリビジョンからキャッシュ ヒットを探します。 When CircleCI encounters a list of `keys`, the cache is restored from the first match. If there are multiple matches, the most recently generated cache is used.

ソースコードの更新が頻繁に行われるようなら、指定するファイルをさらに絞り込むと良いでしょう。 This produces a more granular source cache that updates more often as the current branch and git revision change.

Even with the narrowest `restore_cache` option ({% raw %}`source-v1-{{ .Branch }}-{{ .Revision }}`{% endraw %}), source caching can be greatly beneficial when, for example, running repeated builds against the same git revision (for example, with [API-triggered builds](https://circleci.com/docs/api/v1/#trigger-a-new-build-by-project-preview)) or when using workflows, where you might otherwise need to `checkout` the same repository once per workflow job.

However, it is worth comparing build times with and without source caching. `git clone` is often faster than `restore_cache`.

**メモ:** 組み込みの `checkout` コマンドを実行すると、git の自動ガベージ コレクションが無効になります。 `save_cache` を実行する前に、`run` ステップで `git gc` を手動で実行すると、保存されるキャッシュのサイズが小さくなります。

## 関連項目
{: #see-also }
{:.no_toc}

[最適化]({{ site.baseurl }}/2.0/optimizations/)
