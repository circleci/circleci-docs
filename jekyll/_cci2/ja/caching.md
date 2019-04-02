---
layout: classic-docs
title: "Caching Dependencies"
short-title: "Caching Dependencies"
description: "Caching Dependencies"
categories:
  - optimization
order: 50
---
Caching is one of the most effective ways to make jobs faster on CircleCI by reusing the data from expensive fetch operations from previous jobs.

- TOC
{:toc}

After an initial job run, future instances of the job will run faster by not redoing work.

![データフローのキャッシュ]({{ site.baseurl }}/assets/img/docs/Diagram-v3-Cache.png)

わかりやすい例としては、Yarn や Bundler、Pip といった依存関係管理ツールが挙げられます。 キャッシュから依存関係を読み込むことで、複数のモジュールからなるパッケージであっても、`yarn install` などのコマンドは新たに必要になった依存ファイルのみダウンロードするだけでよくなります。

## キャッシュ設定の例
{:.no_toc}

Caching keys are simple to configure. The following example updates a cache if it changes by using checksum of `pom.xml` with a cascading fallback:

{% raw %}
```yaml
    steps:
      - restore_cache:
         keys:
           - m2-{{ checksum "pom.xml" }}
           - m2- # チェックサムが変わった時はこちらが使われる
```
{% endraw %}

## Introduction
{:.no_toc}

CircleCI 2.0 では依存関係のキャッシュの自動化には対応していません。ビルドの高速化を狙ってキャッシュの積極利用を図ろうとしているときは注意が必要です。 ただし、CicleCI 2.0 ではより優れたキャッシュ活用を手動設定で実現できます。

ここでは、そのメリットとデメリットも含め、正しく利用するためのキャッシュの手動設定の仕方について説明しています。   
**注：**CircleCI 2.0 のジョブ実行に使われる Docker イメージは、サーバーインフラ上で自動的にキャッシュされる場合があります。

Docker イメージの未変更レイヤー部分を再利用する有償のキャッシュ機能については、[Docker レイヤーキャッシュの利用]({{ site.baseurl }}/2.0/docker-layer-caching/)をご覧ください。

## Overview
{:.no_toc}

キャッシュはキーで指定したファイル群の階層構造を保存するものです。 ジョブを高速化するためのデータを保存するのがキャッシュの目的です。ただし、Npm や Gem、Maven といった依存関係管理ツールのパッケージディレクトリをキャッシュするときのように、キャッシュミスやキャッシュを一から作り直す場合のジョブも問題なく実行されます。

キャッシュは信頼性をとるか (期限切れ、もしくは不正なキャッシュのときは使用しない)、あるいは最大のパフォーマンスを得るか (ビルド時に毎回キャッシュをフルで使う) という、安全と性能のトレードオフを考慮して設定します。

通常は、高速化と引き換えに古い依存関係を残したまま不確実なビルドになる危険を犯すよりも、信頼性を担保できる設定にするのが無難とされます。 そのため理想としては、高い信頼性を維持しながらパフォーマンスを高められるバランスの良い設定を目指します。

## Cache Expiration

The caches created via the `save_cache` step are stored for up to 30 days.

## Caching Libraries

The dependencies that are most important to cache during a job are the libraries on which your project depends. For example, cache the libraries that are installed with `pip` in Python or `npm` for Node.js. The various language dependency managers, for example `npm` or `pip`, each have their own paths where dependencies are installed. See our Language guides and demo projects for the specifics for your stack: <https://circleci.com/docs/2.0/demo-apps/>.

Tools that are not explicitly required for your project are best stored on the Docker image. The Docker image(s) pre-built by CircleCI have tools preinstalled that are generic for building projects using the language the image is focused on. For example the `circleci/ruby:2.4.1` image has useful tools like git, openssh-client, and gzip preinstalled.

## Source Caching

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

In this example, `restore_cache` looks for a cache hit from the current git revision, then for a hit from the current branch, and finally for any cache hit, regardless of branch or revision. When CircleCI encounters a list of `keys`, the cache will be restored from the first match. If there are multiple matches, the most recently generated cache will be used.

If your source code changes frequently, we recommend using fewer, more specific keys. This produces a more granular source cache that will update more often as the current branch and git revision change.

Even with the narrowest `restore_cache` option (

{% raw %}
`source-v1-{{ .Branch }}-{{ .Revision }}`
{% endraw %}

), source caching can be greatly beneficial when, for example, running repeated builds against the same git revision (i.e., with [API-triggered builds](https://circleci.com/docs/api/v1-reference/#new-build)) or when using Workflows, where you might otherwise need to `checkout` the same repository once per Workflows job.

That said, it's worth comparing build times with and without source caching; `git clone` is often faster than `restore_cache`.

**NOTE**: The built-in `checkout` command disables git's automatic garbage collection. You might choose to manually run `git gc` in a `run` step prior to running `save_cache` to reduce the size of the saved cache.

## Writing to the Cache in Workflows

Jobs in one workflow can share caches. Note that this makes it possible to create race conditions in caching across different jobs in workflows.

Cache is immutable on write: once a cache is written for a particular key like `node-cache-master`, it cannot be written to again. Consider a workflow of 3 jobs, where Job3 depends on Job1 and Job2: {Job1, Job2} -> Job3. They all read and write to the same cache key.

In a run of the workflow, Job3 may use the cache written by Job1 or Job2. Since caches are immutable, this would be whichever job saved its cache first. This is usually undesireable because the results aren't deterministic--part of the result depends on chance. You could make this workflow deterministic by changing the job dependencies: make Job1 and Job2 write to different caches and Job3 loads from only one, or ensure there can be only one ordering: Job1 -> Job2 ->Job3.

There are more complex cases, where jobs can save using a dynamic key like
{% raw %}`node-cache-{{ checksum "package-lock.json" }}
            `

{% endraw %}

and restore using a partial key match like `node-cache-`. The possibility for a race condition still exists, but the details may change. For instance, the downstream job uses the cache from the upstream job to run last.

Another race condition is possible when sharing caches between jobs. Consider a workflow with no dependency links: Job1 and Job2. Job2 uses the cache saved from Job1. Job2 could sometimes successfully restore a cache, and sometimes report no cache is found, even when Job1 reports saving it. Job2 could also load a cache from a previous workflow. If this happens, this means Job2 tried to load the cache before Job1 saved it. This can be resolved by creating a workflow dependency: Job1 -> Job2. This would force Job2 to wait until Job1 has finished running.

## Restoring Cache

CircleCI restores caches in the order of keys listed in the `restore_cache` step. Each cache key is namespaced to the project, and retrieval is prefix-matched. The cache will be restored from the first matching key. If there are multiple matches, the most recently generated cache will be used.

In the example below, two keys are provided:
{% raw %}```yaml
    steps:
      - restore_cache:
          keys:
            # package-lock.json ファイルのチェックサムに一致するキャッシュを検索します
            # このファイル内容が変更されている場合は処理をスキップします
            - v1-npm-deps-{{ checksum "package-lock.json" }}
            # 以下の文字列に一致するキャッシュのうち、最新のものを検索します
            - v1-npm-deps-
 

```
{% endraw %}

Because the second key is less specific than the first, it is more likely that there will be differences between the current state and the most recently generated cache. When a dependency tool runs, it would discover outdated dependencies and update them. This is referred to as a **partial cache restore**.

### キャッシュのクリア
{:.no_toc}

If you need to get clean caches when your language or dependency management tool versions change, use a naming strategy similar to the previous example and then change the cache key names in your `config.yml` file and commit the change to clear the cache.

<div class="alert alert-info" role="alert">
<b>ヒント：</b>キャッシュは書き換え不可のため、キャッシュキー名の先頭にバージョン名などを入れておくと好都合です。例えば <code class="highlighter-rouge">v1-...</code> のようにします。 こうすると、そのバージョン名の数字を増やすだけでキャッシュ全体を再生成できることになります。
</div>

For example, you may want to clear the cache in the following scenarios by incrementing the cache key name:

- npm コマンドがバージョンアップするなど、依存関係管理ツールのバージョンが変更になった
- Ruby がバージョンアップするなど、開発言語のバージョンが変わった
- プロジェクトから依存関係が削除された

<div class="alert alert-info" role="alert">
  <b>Tip:</b> Beware when using special or reserved characters in your cache key (ex:
  <code class="highlighter-rouge">:, ?, &, =, /, #</code>), as they may cause issues with your build. Generally,
  consider using keys within [a-z][A-Z] in your cache key prefix.
</div>

## Basic Example of Dependency Caching

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

## Using Keys and Templates

While choosing suitable templates for your cache `key`, keep in mind that cache saving is not a free operation, it will take some time to upload the cache to CircleCI storage. To avoid generating a new cache every build, have a `key` that generates a new cache only if something actually changes.

The first step is to decide when a cache will be saved or restored by using a key for which some value is an explicit aspect of your project. For example, when a build number increments, when a revision is incremented, or when the hash of a dependency manifest file changes.

Following are some examples of caching strategies for different goals:

-
{% raw %}`myapp-{{ checksum "package-lock.json" }}`

{% endraw %}

`package-lock.json` の内容が変わるたびにキャッシュが毎回生成されます。このプロジェクトの別のブランチも、同じキャッシュキーを生成します
-
{% raw %}`myapp-{{ .Branch }}-{{ checksum "package-lock.json" }}
        `

{% endraw %}

`package-lock.json` の内容が変わるたびにキャッシュが毎回生成されます。このプロジェクトの別のブランチは、それごとに異なるキャッシュキーを生成します 
-
{% raw %}`myapp-{{ epoch }}`

{% endraw %}

ビルドごとに異なるキャッシュキーを生成します

ステップの処理では、以上のようなテンプレートの部分は実行時に値が置き換えられ、その置換後の文字列が`キー`の値として使われます。 The following table describes the available cache `key` templates:

テンプレート | 解説 \----|\---\---\----
{% raw %}`{{ .Branch }}`

{% endraw %}

| 現在ビルドを実行しているバージョン管理システムのブランチ名。
{% raw %}`{{ .BuildNum }}`

{% endraw %}


| The CircleCI job number for this build.

{% raw %}

`{{ .Revision }}`

{% endraw %}

| 現在ビルドを実行しているバージョン管理システムのリビジョン。

{% raw %}

`{{ .Environment.variableName }}`

{% endraw %}

| `variableName`で示される環境変数 ([定義済み環境変数](https://circleci.com/docs/2.0/env-vars/#circleci-environment-variable-descriptions) 、もしくは[コンテキスト](https://circleci.com/docs/2.0/contexts)を指定できますが、ユーザー定義の環境変数は使えません)。

{% raw %}

`{{ checksum "filename" }}`{% endraw %} | A base64 encoded SHA256 hash of the given filename's contents, so that a new cache key is generated if the file changes. This should be a file committed in your repo. Consider using dependency manifests, such as `package-lock.json`, `pom.xml` or `project.clj`. The important factor is that the file does not change between `restore_cache` and `save_cache`, otherwise the cache will be saved under a cache key that is different from the file used at `restore_cache` time.

{% raw %}

`{{ epoch }}`{% endraw %} | The number of seconds that have elapsed since 00:00:00 Coordinated Universal Time (UTC), also known as POSIX or Unix epoch.

{% raw %}

`{{ arch }}`{% endraw %} | Captures OS and CPU (architecture, family, model) information. Useful when caching compiled binaries that depend on OS and CPU architecture, for example, `darwin-amd64-6_58` versus `linux-amd64-6_62`. See [supported CPU architectures]({{ site.baseurl }}/2.0/faq/#which-cpu-architectures-does-circleci-support).
{: class="table table-striped"}

**Note:** When defining a unique identifier for the cache, be careful about overusing template keys that are highly specific such as

{% raw %}

`{{ epoch }}`{% endraw %}. If you use less specific template keys such as

{% raw %}

`{{ .Branch }}`{% endraw %} or

{% raw %}

`{{ checksum "filename" }}`{% endraw %}, you’ll increase the odds of the cache being used. But, there are tradeoffs as described in the following section.

### キャッシュの保存・復元の参考例
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

      # Bundlerの実行
      # 可能ならキャッシュからインストール済み gem を読み込み
      # bundle install したら save_cache する
      # 複数のキャッシュを作ってキャッシュヒットしやすく

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

      # assets のプリコンパイル
      # 可能ならキャッシュから assets を読み込み
      # assets をプリコンパイルしたら save_cache する
      # 複数のキャッシュを作ってキャッシュヒットしやすく

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

### 依存関係の部分キャッシュの使い方
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

- `npm` などの依存関係管理ツールのバージョンを変えたとき
- Ruby などの開発言語のバージョンを変えたとき
- プロジェクトにおいて依存関係ファイルを追加・削除したとき

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
        # lock ファイルが変更されると、より広範囲にマッチする 2 番目以降のパターンがキャッシュの復元に使われます
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
{:.no_toc}

**Safe to Use Partial Cache Restoration?** Yes.

Maven repositories are intended to be centralized, shared, and massive. Partial caches can be restored without impacting which libraries are actually added to classpaths of generated artifacts.

Since Leiningen uses Maven under the hood, it has equivalent behavior.

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
       # lock ファイルが変更されると、より広範囲にマッチする 2 番目以降のパターンがキャッシュの復元に使われます
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
       # lock ファイルが変更されると、より広範囲にマッチする 2 番目以降のパターンがキャッシュの復元に使われます
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
       # lock ファイルが変更されると、より広範囲にマッチする 2 番目以降のパターンがキャッシュの復元に使われます
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
      # lock ファイルが変更されると、より広範囲にマッチする 2 番目以降のパターンがキャッシュの復元に使われます
        - yarn-packages-v1-{{ .Branch }}-{{ checksum "yarn.lock" }}
        - yarn-packages-v1-{{ .Branch }}-
        - yarn-packages-v1-
  - save_cache:
      paths:
        - ~/.cache/yarn
      key: yarn-packages-v1-{{ .Branch }}-{{ checksum "yarn.lock" }}
```

{% endraw %}

## キャッシュのメリットとデメリット

依存関係のスマートな制御機能を実装している開発言語では、ビルド時のパフォーマンス上の要因からキャッシュを一から作り直すことは避け、部分キャッシュリストアを推奨するケースがあります。 キャッシュを一から作り直すには、依存関係をすべて再インストールする必要があり、パフォーマンスの低下にもつながります。 これを避けるためには、一から作り直すのではなく、依存関係の大部分を古いキャッシュから復元する方法が有効です。

一方で、そうではない別の開発言語においては、部分キャッシュは宣言済みの依存関係と矛盾するコード依存を生むリスクをはらんでおり、キャッシュなしでビルドを実行するまでそれをリセットできない問題もあります。 依存関係がそれほど頻繁に変わらないのなら、一からキャッシュを作り直すためのキーをリストの最初に入れてみてください。 その状態でビルドにどれだけ時間がかかるか検証します。 キャッシュを作り直した (*キャッシュミス*ともみなせる) 場合にパフォーマンスが大幅に低下することが確かであれば、部分キャッシュリストアを行うキーの追加を検討してください。

キャッシュ復元のために複数のキーを列挙すると、部分キャッシュのヒットは増加します。 ただし、より広範囲に `restore_cache` の対象が広がることで、さらに多くの混乱を招く危険性もあります。 例えば、他のブランチでまだ Node.js v5 を使っているにもかかわらず、アップグレードしたブランチに Node.js v6 の依存関係がある場合、他のブランチを見る `restore_cache` は、アップグレードしたブランチとは互換性のない依存関係を復元してしまいます。

### Lock ファイルを使用する
{:.no_toc}

依存関係管理ツールが扱う Lock ファイル (`Gemfile.lock` や `yarn.lock` など) のチェックサムは、キャッシュキーに適しています。

チェックサムの取得方法は、他にも `ls -laR your-deps-dir > deps_checksum` としたうえで、 {% raw %}`{{ checksum "deps_checksum" }}`{% endraw %} で参照するやり方もあります。 例えば Python で多くの固有キャッシュを取得する際には、`requirements.txt` ファイルのチェックサムを利用する以外にも、Python のプロジェクトルートで仮想環境 `venv` を使って依存関係をインストールし、`ls -laR venv > python_deps_checksum` を実行する手法が使えます。

### Using Multiple Caches For Different Language
{:.no_toc}

複数のキャッシュにまたがる形でジョブを分けることにより、キャッシュミスの発生を抑えることも可能です。 異なるキーを用いた複数の `restore_cache` ステップを指定することで、1 つあたりのキャッシュサイズを小さくし、キャッシュミスによるパフォーマンスへの影響を最小限にします。 依存関係管理ツールがそれぞれどのようにファイルを保管しているのか、どのように更新しているか、あるいは依存関係をどのように確認しているのかを把握しているなら、言語 (npm、pip、bundler) ごとにキャッシュを分割することを検討してください。

### 処理コストの高いステップのキャッシュ
{:.no_toc}

いくつかの言語やフレームワークにおいては、キャッシュした方が望ましい、処理コストの高いステップが存在します。 Scala や Elixir は、コンパイルステップのキャッシュが顕著に影響する言語です。 Rails の開発者も同様に、フロントエンドのアセットをキャッシュすることがパフォーマンスアップに効果的であることを実感するはずです。

なんでもキャッシュするのではなく、コンパイルのような処理コストの高いステップにおいてキャッシュすることを*ぜひ*心がけてください。

## See Also
{:.no_toc}

[Optimizations]({{ site.baseurl }}/2.0/optimizations/)