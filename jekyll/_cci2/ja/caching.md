---
layout: classic-docs
title: "依存関係のキャッシュ"
short-title: "依存関係のキャッシュ"
description: "依存関係のキャッシュ"
categories:
  - optimization
order: 50
---

キャッシュは、以前のジョブの高コストなフェッチ操作から取得したデータを再利用することで、CircleCI のジョブを効果的に高速化します。

* TOC
{:toc}

ジョブを 1 回実行すると、以降のジョブ インスタンスでは同じ処理をやり直す必要がなくなり、その分高速化されます。

![キャッシュのデータ フロー]( {{ site.baseurl }}/assets/img/docs/Diagram-v3-Cache.png)

Caching is particularly useful with **package dependency managers** such as Yarn, Bundler, or Pip. キャッシュから依存関係を復元することで、`yarn install` などのコマンドを実行するときに、ビルドごとにすべてを再ダウンロードするのではなく、新しい依存関係をダウンロードするだけで済むようになります。

<div class="alert alert-warning" role="alert">
<b>Warning:</b> Caching files between different executors, for example, between Docker and Machine, Linux, Windows or MacOS, or CircleCI Image and Non-CircleCI Image, can result in file permissions and path errors. これらのエラーは、ユーザーが存在しない、ユーザーの UID が異なる、パスが存在しないなどの理由で発生します。 異なる Executor 間でファイルをキャッシュする場合は、特に注意してください。
</div>

## キャッシュ構成の例
{:.no_toc}

キャッシュ キーは簡単に構成できます。 以下の例では、`pom.xml` のチェックサムとカスケード フォールバックを使用して、変更があった場合にキャッシュを更新しています。

{% raw %}
```yaml
    steps:
      - restore_cache:
         keys:
           - m2-{{ checksum "pom.xml" }}
           - m2- # used if checksum fails
```
{% endraw %}

## はじめに
{:.no_toc}

CircleCI 2.0 では依存関係キャッシュの自動化を利用できません。このため、最適なパフォーマンスを得るには、キャッシュ戦略を計画して実装することが重要です。 2.0 では、キャッシュを手動で構成し、より高度な戦略を立て、きめ細かに制御することができます。

ここでは、キャッシュの手動構成、選択した戦略のコストとメリット、およびキャッシュに関する問題を回避するためのヒントについて説明します。 **Note:** The Docker images used for CircleCI 2.0 job runs are automatically cached on the server infrastructure where possible.

Docker イメージの未変更レイヤーを再利用するプレミアム機能を有効にする方法については、「[Docker レイヤー キャッシュの有効化]({{ site.baseurl }}/2.0/docker-layer-caching/)」を参照してください。

## 概要
{:.no_toc}

キャッシュは、キーに基づいてファイルの階層を保存します。 キャッシュを使用してデータを保存するとジョブが高速に実行されますが、キャッシュ ミス (ゼロ キャッシュ リストア) が起きた場合でも、ジョブは正常に実行されます。 たとえば、`NPM` パッケージ ディレクトリ (`node_modules`) をキャッシュする場合は、初めてジョブを実行するときに、すべての依存関係がダウンロードされてキャッシュされます。キャッシュが有効な限り、次回そのジョブを実行するときにキャッシュが使用され、ジョブ実行が高速化されます。

キャッシュは、信頼性の確保 (古いキャッシュや不適切なキャッシュを使用しない) と最大限のパフォーマンス (すべてのビルドで完全にキャッシュを使用する) のどちらを優先するかを考慮して構成します。

通常は、ビルドが壊れる危険を冒したり、古い依存関係を使用して高速にビルドするよりも、信頼性の維持を優先した方が安全です。 このため、高い信頼性を確保しつつ、最大限のパフォーマンスを得られるようにバランスを取ることが理想的と言えます。

## ライブラリのキャッシュ

ジョブ実行中にキャッシュすることが最も重要な依存関係は、プロジェクトが依存するライブラリです。 たとえば、Python なら `pip`、Node.js なら `npm` でインストールされるライブラリをキャッシュします。 さまざまな言語の依存関係管理ツール (`npm`、`pip` など) には、依存関係がインストールされるパスがそれぞれ指定されています。 お使いのスタックの仕様については、各言語ガイドおよび[デモ プロジェクト](https://circleci.com/ja/docs/2.0/demo-apps/)を参照してください。

プロジェクトに明示的に必要でないツールは、Docker イメージに保存するのが理想的です。 CircleCI のビルド済み Docker イメージには、そのイメージが対象としている言語を使用してプロジェクトをビルドするための汎用ツールがプリインストールされています。 たとえば、`circleci/ruby:2.4.1` イメージには git、openssh-client、gzip などの便利なツールがプリインストールされています。

![依存関係のキャッシュ]( {{ site.baseurl }}/assets/img/docs/cache_deps.png)

## ワークフローでのキャッシュへの書き込み

同じワークフロー内のジョブどうしはキャッシュを共有できます。 このため、複数のワークフローの複数のジョブにまたがってキャッシュを実行すると、競合状態が発生する可能性があります。

キャッシュは書き込み後に変更不可です。つまり、`node-cache-master` などの特定のキーにキャッシュが書き込まれると、そのキーに再度書き込むことはできません。 Consider a workflow of 3 jobs, where Job3 depends on Job1 and Job2: {Job1, Job2} -> Job3.  これらは、すべて同じキャッシュ キーに対して読み書きを行います。

このワークフローの実行中、Job3 は Job1 または Job2 によって書き込まれたキャッシュを使用します。  キャッシュは変更不可なので、どちらかのジョブによって最初に保存されたキャッシュが使用されます。  結果が確定的ではなく、その時々によって結果が異なるため、通常、この動作は好ましくありません。  You could make this workflow deterministic by changing the job dependencies: make Job1 and Job2 write to different caches and Job3 loads from only one, or ensure there can be only one ordering: Job1 -> Job2 ->Job3.

{% raw %}`node-cache-{{ checksum "package-lock.json" }}`{% endraw %} のような動的キーを使用して保存を行い、`node-cache-` のようなキーの部分一致を使用して復元を行うような、より複雑なジョブのケースもあります。  競合状態が発生する可能性がありますが、詳細はケースによって異なります。  たとえば、ダウンストリーム ジョブがアップストリーム ジョブのキャッシュを使用して最後に実行されるような場合です。

ジョブ間でキャッシュを共有している場合に発生する競合状態もあります。 Job1 と Job2 の間に依存関係がないワークフローを例に考えます。  Job2 は Job1 によって保存されたキャッシュを使用します。  Job1 がキャッシュの保存を報告したとしても、Job2 でキャッシュを正常に復元できることもあれば、キャッシュが見つからないと報告することもあります。  また、Job2 が以前のワークフローからキャッシュを読み込むこともあります。  その場合は、Job1 がキャッシュを保存する前に、Job2 がキャッシュを読み込もうとすることになります。  This can be resolved by creating a workflow dependency: Job1 -> Job2.  こうすることで、Job1 の実行が終了するまで、Job2 の実行を待機させることができます。

## キャッシュの復元

CircleCI では、`restore_cache` ステップにリストされているキーの順番でキャッシュが復元されます。 各キャッシュ キーはプロジェクトの名前空間にあり、プレフィックスが一致すると取得されます。 最初に一致したキーのキャッシュが復元されます。 複数の一致がある場合は、最も新しく生成されたキャッシュが使用されます。

次の例では、2 つのキーが提供されています。

{% raw %}
```yaml
    steps:
      - restore_cache:
          keys:
            # Find a cache corresponding to this specific package-lock.json checksum
            # when this file is changed, this key will fail
            - v1-npm-deps-{{ checksum "package-lock.json" }}
            # Find the most recently generated cache used from any branch
            - v1-npm-deps-
```
{% endraw %}

2 つ目のキーは最初のキーよりも特定度が低いため、現在の状態と最も新しく生成されたキャッシュとの間に差がある可能性が高くなります。 依存関係ツールを実行すると、古い依存関係が検出されて更新されます。 This is referred to as a **partial cache restore**.

上のキャッシュ キーの使用方法について、詳しく見ていきましょう。

Each line in the `keys:` list all manage _one cache_ (each line does **not** correspond to it's own cache). The list of keys {% raw %}(`v1-npm-deps-{{ checksum "package-lock.json" }}`{% endraw %} and `v1-npm-deps-`), in this example, represent a **single** cache. キャッシュの復元が必要になると、まず (最も特定度の高い) 最初のキーに基づいてキャッシュがバリデーションされ、次に他のキーを順に調べて、他のキャッシュ キーに変更があるかどうかが確認されます。

ここでは、最初のキーによって `package-lock.json` ファイルのチェックサムが文字列 `v1-npm-deps-` に連結されます。コミットでこのファイルが変更されている場合は、新しいキャッシュ キーが調べられます。

次のキーには動的コンポーネントが連結されていません。これは静的な文字列 `v1-npm-deps-` です。 キャッシュを手動で無効にするには、`config.yml` ファイルで `v1` を `v2` にバンプします。 これで、キャッシュ キーが新しい `v2-npm-deps` になり、新しいキャッシュの保存がトリガーされます。

### Using Caching in Monorepos

There are many different approaches to utilizing caching in monorepos. This type of approach can be used whenever you need to managed a shared cache based on multiple files in different parts of your monorepo.

#### Creating and Building a Concatenated `package-lock` file

1) Add custom command to config:

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
          command: npx lerna list -p -a | awk -F packages '{printf "\"packages%s/package-lock.json\" ", $2}' | xargs cat > << parameters.filename >>
```
{% endraw %}

2) Use custom command in build to generate the concatenated `package-lock` file

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

### Cache Expiration
{:.no_toc}
Caches created via the `save_cache` step are stored for up to 30 days.

### Clearing Cache
{:.no_toc}

If you need to get clean caches when your language or dependency management tool versions change, use a naming strategy similar to the previous example and then change the cache key names in your `config.yml` file and commit the change to clear the cache.

<div class="alert alert-info" role="alert">
<b>Tip:</b> Caches are immutable so it is useful to start all your cache keys with a version prefix, for example <code class="highlighter-rouge">v1-...</code>. こうすれば、プレフィックスのバージョン番号を増やすだけで、キャッシュ全体を再生成できます。
</div>

For example, you may want to clear the cache in the following scenarios by incrementing the cache key name:

* npm のバージョンが 4 から 5 に変更されるなど、依存関係管理ツールのバージョンが変更された場合
* Ruby のバージョンが 2.3 から 2.4 に変更されるなど、言語のバージョンが変更された場合
* プロジェクトから依存関係が削除された場合

<div class="alert alert-info" role="alert">
  <b>ヒント:</b> キャッシュ キーに <code class="highlighter-rouge">:、?、&、=、/、#</code> などの特殊文字や予約文字を使用すると、ビルドの際に問題が発生する可能性があるため、注意が必要です。 一般に、キャッシュ キーのプレフィックスには [a-z][A-Z] の範囲の文字を使用してください。
</div>

### Cache Size
{:.no_toc}
We recommend keeping cache sizes under 500MB. This is our upper limit for corruption checks because above this limit check times would be excessively long. You can view the cache size from the CircleCI Jobs page within the `restore_cache` step. Larger cache sizes are allowed but may cause problems due to a higher chance of decompression issues and corruption during download. To keep cache sizes down, consider splitting into multiple distinct caches.

## 基本的な依存関係キャッシュの例

The extra control and power in CircleCI 2.0 manual dependency caching requires that you be explicit about what you cache and how you cache it. See the [save cache section]({{ site.baseurl }}/2.0/configuration-reference/#save_cache) of the Configuring CircleCI document for additional examples.

To save a cache of a file or directory, add the `save_cache` step to a job in your `.circleci/config.yml` file:

```yaml
    steps:
      - save_cache:
          key: my-cache
          paths:
            - my-file.txt
            - my-project/my-dependencies-directory
```

The path for directories is relative to the `working_directory` of your job. You can specify an absolute path if you choose.

**Note:** Unlike the special step [`persist_to_workspace`]({{ site.baseurl }}/2.0/configuration-reference/#persist_to_workspace), neither `save_cache` nor `restore_cache` support globbing for the `paths` key.

## キーとテンプレートの使用

A cache-key is a _user-defined_ string that corresponds to a data cache. A cache-key can be created by interpolating **dynamic values** — these are called **templates**. Anything you see in a cache-key between curly braces is a template. Consider the following example:

```sh
{% raw %}myapp-{{ checksum "package-lock.json" }}{% endraw %}
```

The above example will output a unique string to represent this key. Here, the example is using a [checksum](https://en.wikipedia.org/wiki/Checksum) to create a unique string that represents the contents of a `package-lock.json` file.

The example may output a string that looks like the following:

```sh
{% raw %}myapp-+KlBebDceJh_zOWQIAJDLEkdkKoeldAldkaKiallQ<etc>{% endraw %}
```

If the contents of the `package-lock` file were to change, the `checksum` function would return a different, unique string, indicating the need to invalidate the cache.

While choosing suitable templates for your cache `key`, keep in mind that cache saving is not a free operation, it will take some time to upload the cache to CircleCI storage. To avoid generating a new cache every build, have a `key` that generates a new cache only if something actually changes.

The first step is to decide when a cache will be saved or restored by using a key for which some value is an explicit aspect of your project. For example, when a build number increments, when a revision is incremented, or when the hash of a dependency manifest file changes.

Following are some examples of caching strategies for different goals:

 * {% raw %}`myapp-{{ checksum "package-lock.json" }}`{% endraw %} - `package-lock.json` ファイルの内容が変更されるたびにキャッシュが再生成されます。このプロジェクトのさまざまなブランチで同じキャッシュ キーが生成されます。
 * {% raw %}`myapp-{{ .Branch }}-{{ checksum "package-lock.json" }}`{% endraw %} - `package-lock.json` ファイルの内容が変更されるたびにキャッシュが再生成されます。このプロジェクトのブランチでそれぞれ異なるキャッシュ キーが生成されます。
 * {% raw %}`myapp-{{ epoch }}`{% endraw %} - ビルドのたびに異なるキャッシュ キーが生成されます。

During step execution, the templates above will be replaced by runtime values and use the resultant string as the `key`. The following table describes the available cache `key` templates:

| テンプレート                                                 | 説明                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| {% raw %}`{{ checksum "filename" }}`{% endraw %}       | filename で指定したファイルの内容の SHA256 ハッシュを Base64 エンコードした値。ファイルが変更されると、新しいキャッシュ キーが生成されます。 リポジトリにコミットされるファイルのみを指定できます。 依存関係マニフェスト ファイル (`package-lock.json`、`pom.xml`、`project.clj` など) の使用を検討してください。 また、`restore_cache` から `save_cache` までの間にファイルの内容が変更されないようにすることが重要です。ファイルの内容が変更された場合、`restore_cache` のタイミングで使用されるファイルとは異なるキャッシュ キーの下でキャッシュが保存されます。 |
| {% raw %}`{{ .Branch }}`{% endraw %}                   | 現在ビルド中の VCS ブランチ。                                                                                                                                                                                                                                                                                                                               |
| {% raw %}`{{ .BuildNum }}`{% endraw %}                 | このビルドの CircleCI ジョブ番号。                                                                                                                                                                                                                                                                                                                          |
| {% raw %}`{{ .Revision }}`{% endraw %}                 | 現在ビルド中の VCS リビジョン。                                                                                                                                                                                                                                                                                                                              |
| {% raw %}`{{ .Environment.variableName }}`{% endraw %} | 環境変数 `variableName` ([CircleCI によってエクスポートされた環境変数](https://circleci.com/ja/docs/2.0/env-vars/#circleci-environment-variable-descriptions)または特定の[コンテキスト](https://circleci.com/ja/docs/2.0/contexts)に追加された環境変数がサポートされ、任意の環境変数は使用できません)。                                                                                                            |
| {% raw %}`{{ epoch }}`{% endraw %}                     | 協定世界時 (UTC) 1970 年 1 月 1 日午前 0 時 0 分 0 秒からの経過秒数。POSIX や Unix エポックとも呼ばれます。 このキャッシュ キーは、実行のたびに新しいキャッシュを保存する必要がある場合に便利です。                                                                                                                                                                                                                          |
| {% raw %}`{{ arch }}`{% endraw %}                      | OS と CPU (アーキテクチャ、ファミリ、モデル) の情報を取得します。 OS や CPU アーキテクチャに依存するコンパイル済みバイナリをキャッシュする場合に便利です (`darwin-amd64-6_58`、`linux-amd64-6_62` など)。 See [サポートされている CPU アーキテクチャ]({{ site.baseurl }}/2.0/faq/#circleci-がサポートしている-cpu-アーキテクチャは)を参照してください。                                                                                                          |
{: class="table table-striped"}

### Further Notes on Using Keys and Templates
{:.no_toc}

- キャッシュに一意の識別子を定義するときは、{% raw %}`{{ epoch }}`{% endraw %} などの特定度の高いテンプレート キーを過度に使用しないように注意してください。 {% raw %}`{{ .Branch }}`{% endraw %} や {% raw %}`{{ checksum "filename" }}`{% endraw %} などの特定度の低いテンプレート キーを使用すると、キャッシュが使用される可能性が高くなります。
- キャッシュ変数には、ビルドで使用している[パラメーター]({{site.baseurl}}/2.0/reusing-config/#executor-でのパラメーターの使用)も使用できます。たとえば、{% raw %}`v1-deps-<< parameters.varname >>`{% endraw %} のように指定します。
- キャッシュ キーに動的なテンプレートを使用する必要はありません。 静的な文字列を使用し、その名前を「バンプ」(変更) することで、キャッシュを強制的に無効化できます。

### Full Example of Saving and Restoring Cache
{:.no_toc}

The following example demonstrates how to use `restore_cache` and `save_cache` together with templates and keys in your `.circleci/config.yml` file.

{% raw %}

```yaml
    docker:
      - image: customimage/ruby:2.3-node-phantomjs-0.0.1
        environment:
          RAILS_ENV: test
          RACK_ENV: test
      - image: circleci/mysql:5.6

    steps:
      - checkout
      - run: cp config/{database_circleci,database}.yml

      # Run bundler
      # Load installed gems from cache if possible, bundle install then save cache
      # Multiple caches are used to increase the chance of a cache hit

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

      # Precompile assets
      # Load assets from cache if possible, precompile assets then save cache
      # Multiple caches are used to increase the chance of a cache hit

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

### Partial Dependency Caching Strategies
{:.no_toc}

Some dependency managers do not properly handle installing on top of partially restored dependency trees.

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

Instead of a cascading fallback, a more stable option is a single version-prefixed cache key.

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
        - v1-gem-cache-{{ arch }}-{{ .Branch }}-{{ checksum "Gemfile.lock" }}
```

{% endraw %}

Since caches are immutable, this strategy allows you to regenerate all of your caches by incrementing the version. This is useful in the following scenarios:

- `npm` などの依存関係管理ツールのバージョンを変更した場合
- Ruby などの言語のバージョンを変更した場合
- プロジェクトに依存関係を追加または削除した場合

The stability of partial dependency caching is dependent on your dependency manager. Below is a list of common dependency managers, recommended partial caching strategies, and associated justifications.

#### Bundler (Ruby)
{:.no_toc}

**Safe to Use Partial Cache Restoration?** Yes (with caution).

Since Bundler uses system gems that are not explicitly specified, it is non-deterministic, and partial cache restoration can be unreliable.

To prevent this behavior, add a step that cleans Bundler before restoring dependencies from cache.

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
        # when lock file changes, use increasingly general patterns to restore cache
        - v1-gem-cache-{{ arch }}-{{ .Branch }}-{{ checksum "Gemfile.lock" }}
        - v1-gem-cache-{{ arch }}-{{ .Branch }}-
        - v1-gem-cache-{{ arch }}-
  - run: bundle install && bundle clean
  - save_cache:
      paths:
        - ~/.bundle
      key: v1-gem-cache-{{ arch }}-{{ .Branch }}-{{ checksum "Gemfile.lock" }}
```

{% endraw %}

#### Gradle (Java)
{:.no_toc}

**Safe to Use Partial Cache Restoration?** Yes.

Gradle repositories are intended to be centralized, shared, and massive. Partial caches can be restored without impacting which libraries are actually added to classpaths of generated artifacts.

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
        # when lock file changes, use increasingly general patterns to restore cache
        - gradle-repo-v1-{{ .Branch }}-{{ checksum "dependencies.lockfile" }}
        - gradle-repo-v1-{{ .Branch }}-
        - gradle-repo-v1-
  - save_cache:
      paths:
        - ~/.gradle
      key: gradle-repo-v1-{{ .Branch }}-{{ checksum "dependencies.lockfile" }}
```

{% endraw %}

#### Maven (Java) and Leiningen (Clojure)
{:.no_toc}

**Safe to Use Partial Cache Restoration?** Yes.

Maven repositories are intended to be centralized, shared, and massive. Partial caches can be restored without impacting which libraries are actually added to classpaths of generated artifacts.

Since Leiningen uses Maven under the hood, it has equivalent behavior.

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
        # when lock file changes, use increasingly general patterns to restore cache
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
{:.no_toc}

**Safe to Use Partial Cache Restoration?** Yes (with NPM5+).

With NPM5+ and a lock file, you can safely use partial cache restoration.

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
        # when lock file changes, use increasingly general patterns to restore cache
        - node-v1-{{ .Branch }}-{{ checksum "package-lock.json" }}
        - node-v1-{{ .Branch }}-
        - node-v1-
  - save_cache:
      paths:
        - ~/usr/local/lib/node_modules  # location depends on npm version
      key: node-v1-{{ .Branch }}-{{ checksum "package-lock.json" }}
```

{% endraw %}

#### pip (Python)
{:.no_toc}

**Safe to Use Partial Cache Restoration?** Yes (with Pipenv).

Pip can use files that are not explicitly specified in `requirements.txt`. Using [Pipenv](https://docs.pipenv.org/) will include explicit versioning in a lock file.

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
        # when lock file changes, use increasingly general patterns to restore cache
        - pip-packages-v1-{{ .Branch }}-{{ checksum "Pipfile.lock" }}
        - pip-packages-v1-{{ .Branch }}-
        - pip-packages-v1-
  - save_cache:
      paths:
        - ~/.local/share/virtualenvs/venv  # this path depends on where pipenv creates a virtualenv
      key: pip-packages-v1-{{ .Branch }}-{{ checksum "Pipfile.lock" }}
```

{% endraw %}

#### Yarn (Node)
{:.no_toc}

**Safe to Use Partial Cache Restoration?** Yes.

Yarn has always used a lock file for exactly these reasons.

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
        # when lock file changes, use increasingly general patterns to restore cache
        - yarn-packages-v1-{{ .Branch }}-{{ checksum "yarn.lock" }}
        - yarn-packages-v1-{{ .Branch }}-
        - yarn-packages-v1-
  - save_cache:
      paths:
        - ~/.cache/yarn
      key: yarn-packages-v1-{{ .Branch }}-{{ checksum "yarn.lock" }}
```

{% endraw %}

## キャッシュ戦略のトレードオフ

In cases where the build tools for your language include elegant handling of dependencies, partial cache restores may be preferable to zero cache restores for performance reasons. If you get a zero cache restore, you have to reinstall all of your dependencies, which can result in reduced performance. One alternative is to get a large percentage of your dependencies from an older cache instead of starting from zero.

However, for other types of languages, partial caches carry the risk of creating code dependencies that are not aligned with your declared dependencies and do not break until you run a build without a cache. If the dependencies change infrequently, consider listing the zero cache restore key first.

Then, track the costs over time. If the performance costs of zero cache restores (also referred to as a *cache miss*) prove to be significant over time, only then consider adding a partial cache restore key.

Listing multiple keys for restoring a cache increases the odds of a partial cache hit. However, broadening your `restore_cache` scope to a wider history increases the risk of confusing failures. For example, if you have dependencies for Node v6 on an upgrade branch, but your other branches are still on Node v5, a `restore_cache` step that searches other branches might restore incompatible dependencies.

### Using a Lock File
{:.no_toc}

Language dependency manager lockfiles (for example, `Gemfile.lock` or `yarn.lock`) checksums may be a useful cache key.

An alternative is to do `ls -laR your-deps-dir > deps_checksum` and reference it with {% raw %}`{{ checksum "deps_checksum" }}`{% endraw %}. For example, in Python, to get a more specific cache than the checksum of your `requirements.txt` file you could install the dependencies within a virtualenv in the project root `venv` and then do `ls -laR venv > python_deps_checksum`.

### Using Multiple Caches For Different Language
{:.no_toc}

It is also possible to lower the cost of a cache miss by splitting your job across multiple caches. By specifying multiple `restore_cache` steps with different keys, each cache is reduced in size thereby reducing the performance impact of a cache miss. Consider splitting caches by language type (npm, pip, or bundler) if you know how each dependency manager stores its files, how it upgrades, and how it checks dependencies.

### Caching Expensive Steps
{:.no_toc}

Certain languages and frameworks have more expensive steps that can and should be cached. Scala and Elixir are two examples where caching the compilation steps will be especially effective. Rails developers, too, would notice a performance boost from caching frontend assets.

Do not cache everything, but _do_ consider caching for costly steps like compilation.

## ソースのキャッシュ

As in CircleCI 1.0, it is possible and oftentimes beneficial to cache your git repository, thus saving time in your `checkout` step—especially for larger projects. Here is an example of source caching:

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

In this example, `restore_cache` looks for a cache hit from the current git revision, then for a hit from the current branch, and finally for any cache hit, regardless of branch or revision. When CircleCI encounters a list of `keys`, the cache will be restored from the first match. 複数の一致がある場合は、最も新しく生成されたキャッシュが使用されます。

If your source code changes frequently, we recommend using fewer, more specific keys. This produces a more granular source cache that will update more often as the current branch and git revision change.

Even with the narrowest `restore_cache` option ({% raw %}`source-v1-{{ .Branch }}-{{ .Revision }}`{% endraw %}), source caching can be greatly beneficial when, for example, running repeated builds against the same git revision (i.e., with [API-triggered builds](https://circleci.com/docs/api/#trigger-a-new-build-by-project-preview)) or when using Workflows, where you might otherwise need to `checkout` the same repository once per Workflows job.

That said, it's worth comparing build times with and without source caching; `git clone` is often faster than `restore_cache`.

**NOTE**: The built-in `checkout` command disables git's automatic garbage collection. You might choose to manually run `git gc` in a `run` step prior to running `save_cache` to reduce the size of the saved cache.

## 関連項目
{:.no_toc}

[Optimizations]({{ site.baseurl }}/2.0/optimizations/)
