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

- 目次
{:toc}

ジョブを 1 回実行すると、以降のジョブ インスタンスでは同じ処理をやり直す必要がなくなり、その分高速化されます。

![キャッシュのデータ フロー]({{ site.baseurl }}/assets/img/docs/caching-dependencies-overview.png)

キャッシュは、Yarn、Bundler、Pip などの**パッケージ依存関係管理ツール**と共に使用すると特に有効です。 キャッシュから依存関係を復元することで、`yarn install` などのコマンドを実行するときに、ビルドごとにすべてを再ダウンロードするのではなく、新しい依存関係をダウンロードするだけで済むようになります。

<div class="alert alert-warning" role="alert">
<b>警告:</b> 異なる Executor 間 (たとえば、Docker と Machine、Linux、Windows、MacOS の間、または CircleCI イメージとそれ以外のイメージの間) でファイルをキャッシュすると、ファイル パーミッション エラーまたはパス エラーが発生することがあります。 これらのエラーは、ユーザーが存在しない、ユーザーの UID が異なる、パスが存在しないなどの理由で発生します。 異なる Executor 間でファイルをキャッシュする場合は、特に注意してください。
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
           - m2- # チェックサムが失敗した場合に使用されます
```
{% endraw %}

## はじめに
{:.no_toc}

CircleCI 2.0 では依存関係キャッシュの自動化を利用できません。このため、最適なパフォーマンスを得るには、キャッシュ戦略を計画して実装することが重要です。 2.0 では、キャッシュを手動で構成し、より高度な戦略を立て、きめ細かに制御することができます。

ここでは、キャッシュの手動構成、選択した戦略のコストとメリット、およびキャッシュに関する問題を回避するためのヒントについて説明します。 **メモ:** CircleCI 2.0 のジョブ実行に使用される Docker イメージは、サーバー インフラストラクチャに自動的にキャッシュされます (可能な場合)。

Docker イメージの未変更レイヤーを再利用するプレミアム機能を有効にする方法については、「[Docker レイヤー キャッシュの有効化]({{ site.baseurl }}/2.0/docker-layer-caching/)」を参照してください。

## 概要
{:.no_toc}

キャッシュは、キーに基づいてファイルの階層を保存します。 キャッシュを使用してデータを保存するとジョブが高速に実行されますが、キャッシュ ミス (ゼロ キャッシュ リストア) が起きた場合でも、ジョブは正常に実行されます。 たとえば、`npm` パッケージ ディレクトリ (`node_modules`) をキャッシュする場合は、初めてジョブを実行するときに、すべての依存関係がダウンロードされてキャッシュされます。キャッシュが有効な限り、次回そのジョブを実行するときにキャッシュが使用され、ジョブ実行が高速化されます。

キャッシュは、信頼性の確保 (古いキャッシュや不適切なキャッシュを使用しない) と最大限のパフォーマンス (すべてのビルドで完全にキャッシュを使用する) のどちらを優先するかを考慮して構成します。

通常は、ビルドが壊れる危険を冒したり、古い依存関係を使用して高速にビルドするよりも、信頼性の維持を優先した方が安全です。 このため、高い信頼性を確保しつつ、最大限のパフォーマンスを得られるようにバランスを取ることが理想的と言えます。

## Caching and Open Source

If your project is open source/available to be forked and receive PRs from contributors, please make note of the following:

- PRs from the same fork repo will share a cache (this includes, as previously stated, that PRs in the master repo share a cache with master).
- Two PRs in different Fork Repos will have different caches.
- enabling the sharing of [environment variables]({{site.baseurl}}/2.0/env-vars) will enable cache sharing between the original repo and all forked builds.

## Caching Libraries

The dependencies that are most important to cache during a job are the libraries on which your project depends. For example, cache the libraries that are installed with `pip` in Python or `npm` for Node.js. The various language dependency managers, for example `npm` or `pip`, each have their own paths where dependencies are installed. See our Language guides and [demo projects](https://circleci.com/docs/2.0/demo-apps/) for the specifics for your stack.

Tools that are not explicitly required for your project are best stored on the Docker image. The Docker image(s) pre-built by CircleCI have tools preinstalled that are generic for building projects using the language the image is focused on. For example the `circleci/ruby:2.4.1` image has useful tools like git, openssh-client, and gzip preinstalled.

![Caching Dependencies]({{ site.baseurl }}/assets/img/docs/cache_deps.png)

## Writing to the Cache in Workflows

Jobs in one workflow can share caches. Note that this makes it possible to create race conditions in caching across different jobs in workflows.

Cache is immutable on write: once a cache is written for a particular key like `node-cache-master`, it cannot be written to again. Consider a workflow of 3 jobs, where Job3 depends on Job1 and Job2: {Job1, Job2} -> Job3. They all read and write to the same cache key.

In a run of the workflow, Job3 may use the cache written by Job1 or Job2. Since caches are immutable, this would be whichever job saved its cache first. This is usually undesireable because the results aren't deterministic--part of the result depends on chance. You could make this workflow deterministic by changing the job dependencies: make Job1 and Job2 write to different caches and Job3 loads from only one, or ensure there can be only one ordering: Job1 -> Job2 ->Job3.

There are more complex cases, where jobs can save using a dynamic key like

{% raw %}
`node-cache-{{ checksum "package-lock.json" }}
            `{% endraw %} and restore using a partial key match like `node-cache-`. The possibility for a race condition still exists, but the details may change. For instance, the downstream job uses the cache from the upstream job to run last.

Another race condition is possible when sharing caches between jobs. Consider a workflow with no dependency links: Job1 and Job2. Job2 uses the cache saved from Job1. Job2 could sometimes successfully restore a cache, and sometimes report no cache is found, even when Job1 reports saving it. Job2 could also load a cache from a previous workflow. If this happens, this means Job2 tried to load the cache before Job1 saved it. This can be resolved by creating a workflow dependency: Job1 -> Job2. This would force Job2 to wait until Job1 has finished running.

## Restoring Cache

CircleCI restores caches in the order of keys listed in the `restore_cache` step. Each cache key is namespaced to the project, and retrieval is prefix-matched. The cache will be restored from the first matching key. If there are multiple matches, the most recently generated cache will be used.

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

Because the second key is less specific than the first, it is more likely that there will be differences between the current state and the most recently generated cache. When a dependency tool runs, it would discover outdated dependencies and update them. This is referred to as a **partial cache restore**.

Let's walk through how the above cache keys are used in more detail:

Each line in the `keys:` list all manage *one cache* (each line does **not** correspond to its own cache). The list of keys

{% raw %}
(`v1-npm-deps-{{ checksum "package-lock.json" }}`{% endraw %} and `v1-npm-deps-`), in this example, represent a **single** cache. When it comes time to restore the cache, CircleCI first validates the cache based on the first (and most specific) key, and then steps through the other keys looking for any other cache-key changes.

Here, the first key concatenates the checksum of `package-lock.json` file into the string `v1-npm-deps-`; if this file was to change in your commit, CircleCI would see a new cache-key.

The next key does not have a dynamic component to it, it simply is a static string: `v1-npm-deps-`. If you would like to invalidate your cache manually, you can bump `v1` to `v2` in your `config.yml` file. In this case, you would now have a new cache key `v2-npm-deps`, which will trigger the storing of a new cache.

### モノレポ (モノリポ) でのキャッシュの使用

There are many different approaches to utilizing caching in monorepos. This type of approach can be used whenever you need to manage a shared cache based on multiple files in different parts of your monorepo.

#### 連結 `package-lock` ファイルの作成と構築

1) Add custom command to config:
{% raw %}```yaml
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

2) Use custom command in build to generate the concatenated `package-lock` file
{% raw %}```yaml
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

## Managing Caches

### キャッシュの有効期限

{:.no_toc} Caches created via the `save_cache` step are stored for up to 15 days.

### キャッシュのクリア
{:.no_toc}
If you need to get clean caches when your language or dependency management tool versions change, use a naming strategy similar to the previous example and then change the cache key names in your `config.yml` file and commit the change to clear the cache.

<div class="alert alert-info" role="alert">
<b>ヒント:</b> キャッシュは変更不可なので、すべてのキャッシュ キーの先頭にプレフィックスとしてバージョン名 (<code class="highlighter-rouge">v1-...</code>など) を付加すると便利です。 こうすれば、プレフィックスのバージョン番号を増やすだけで、キャッシュ全体を再生成できます。
</div>

For example, you may want to clear the cache in the following scenarios by incrementing the cache key name:

- Dependency manager version change, for example, you change npm from 4 to 5
- Language version change, for example, you change ruby 2.3 to 2.4
- Dependencies are removed from your project

<div class="alert alert-info" role="alert">
  <b>ヒント:</b> キャッシュ キーに <code class="highlighter-rouge">:、?、&、=、/、#</code> などの特殊文字や予約文字を使用すると、ビルドの際に問題が発生する可能性があるため、注意が必要です。 一般に、キャッシュ キーのプレフィックスには [a-z][A-Z] の範囲の文字を使用してください。
</div>

### キャッシュ サイズ

{:.no_toc} We recommend keeping cache sizes under 500MB. This is our upper limit for corruption checks because above this limit check times would be excessively long. You can view the cache size from the CircleCI Jobs page within the `restore_cache` step. Larger cache sizes are allowed but may cause problems due to a higher chance of decompression issues and corruption during download. To keep cache sizes down, consider splitting into multiple distinct caches.

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

A cache-key is a *user-defined* string that corresponds to a data cache. A cache-key can be created by interpolating **dynamic values** — these are called **templates**. Anything you see in a cache-key between curly braces is a template. Consider the following example:

```sh
{% raw %}myapp-{{ checksum "package-lock.json" }}{% endraw %}
```

The above example will output a unique string to represent this key. Here, the example is using a [checksum](https://en.wikipedia.org/wiki/Checksum) to create a unique string that represents the contents of a `package-lock.json` file.

The example may output a string that looks like the following:

```sh
{% raw %}myapp-+KlBebDceJh_zOWQIAJDLEkdkKoeldAldkaKiallQ={% endraw %}
```

If the contents of the `package-lock` file were to change, the `checksum` function would return a different, unique string, indicating the need to invalidate the cache.

While choosing suitable templates for your cache `key`, keep in mind that cache saving is not a free operation, it will take some time to upload the cache to CircleCI storage. To avoid generating a new cache every build, have a `key` that generates a new cache only if something actually changes.

The first step is to decide when a cache will be saved or restored by using a key for which some value is an explicit aspect of your project. For example, when a build number increments, when a revision is incremented, or when the hash of a dependency manifest file changes.

Following are some examples of caching strategies for different goals:

-
{% raw %}`myapp-{{ checksum "package-lock.json" }}`

{% endraw %}

- Cache will be regenerated every time something is changed in `package-lock.json` file, different branches of this project will generate the same cache key.
-
{% raw %}`myapp-{{ .Branch }}-{{ checksum "package-lock.json" }}
        `
{% endraw %}

- Cache will be regenerated every time something is changed in `package-lock.json` file, different branches of this project will generate separate cache keys.
-
{% raw %}`myapp-{{ epoch }}`

{% endraw %}

- Every build will generate separate cache keys.

During step execution, the templates above will be replaced by runtime values and use the resultant string as the `key`. The following table describes the available cache `key` templates:

| テンプレート                                                 | 説明                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| {% raw %}`{{ checksum "filename" }}`{% endraw %}       | filename で指定したファイルの内容の SHA256 ハッシュを Base64 エンコードした値。ファイルが変更されると、新しいキャッシュ キーが生成されます。 リポジトリにコミットされるファイルのみを指定できます。 依存関係マニフェスト ファイル (`package-lock.json`、`pom.xml`、`project.clj` など) の使用を検討してください。 また、`restore_cache` から `save_cache` までの間にファイルの内容が変更されないようにすることが重要です。ファイルの内容が変更された場合、`restore_cache` のタイミングで使用されるファイルとは異なるキャッシュ キーの下でキャッシュが保存されます。 |
| {% raw %}`{{ .Branch }}`{% endraw %}                   | 現在ビルド中の VCS ブランチ。                                                                                                                                                                                                                                                                                                                               |
| {% raw %}`{{ .BuildNum }}`{% endraw %}                 | このビルドの CircleCI ジョブ番号。                                                                                                                                                                                                                                                                                                                          |
| {% raw %}`{{ .Revision }}`{% endraw %}                 | 現在ビルド中の VCS リビジョン。                                                                                                                                                                                                                                                                                                                              |
| {% raw %}`{{ .Environment.variableName }}`{% endraw %} | 環境変数 `variableName` ([CircleCI からエクスポートされる環境変数](https://circleci.com/ja/docs/2.0/env-vars/#circleci-environment-variable-descriptions)、または特定の[コンテキスト](https://circleci.com/ja/docs/2.0/contexts)に追加した環境変数がサポートされ、任意の環境変数は使用できません)。                                                                                                              |
| {% raw %}`{{ epoch }}`{% endraw %}                     | 協定世界時 (UTC) 1970 年 1 月 1 日午前 0 時 0 分 0 秒からの経過秒数。POSIX や Unix エポックとも呼ばれます。 このキャッシュ キーは、実行のたびに新しいキャッシュを保存する必要がある場合に便利です。                                                                                                                                                                                                                          |
| {% raw %}`{{ arch }}`{% endraw %}                      | OS と CPU (アーキテクチャ、ファミリ、モデル) の情報を取得します。 OS や CPU アーキテクチャに依存するコンパイル済みバイナリをキャッシュする場合に便利です (`darwin-amd64-6_58`、`linux-amd64-6_62` など)。 See [サポートされている CPU アーキテクチャ]({{ site.baseurl }}/2.0/faq/#circleci-ではどの-cpu-アーキテクチャをサポートしていますか)を参照してください。                                                                                                     |
{: class="table table-striped"}

### キーとテンプレートの使用に関する補足説明
{:.no_toc}

- When defining a unique identifier for the cache, be careful about overusing template keys that are highly specific such as
{% raw %}`{{ epoch }}`

{% endraw %}

. If you use less specific template keys such as
{% raw %}`{{ .Branch }}`{% endraw %} or
{% raw %}`{{ checksum "filename" }}`

{% endraw %}

, you’ll increase the odds of the cache being used. 
- Cache variables can also accept [parameters]({{site.baseurl}}/2.0/reusing-config/#using-parameters-in-executors) if your build makes use of them — for example:
{% raw %}`v1-deps-<< parameters.varname >>`

{% endraw %}

.
- You do not have to use dynamic templates for your cache-key. You can use a static string, and "bump" (change) its name to force a cache invalidation.

### キャッシュの保存および復元の例
{:.no_toc}
The following example demonstrates how to use `restore_cache` and `save_cache` together with templates and keys in your `.circleci/config.yml` file.

{% raw %}

```yaml
    docker:
      - image: customimage/ruby:2.3-node-phantomjs-0.0.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          RAILS_ENV: test
          RACK_ENV: test
      - image: circleci/mysql:5.6
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference

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

### 部分的な依存関係キャッシュの使用方法
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

- When you change the version of a dependency manager like `npm`.
- When you change the version of a language like Ruby.
- When you add or remove dependencies from your project.

The stability of partial dependency caching is dependent on your dependency manager. Below is a list of common dependency managers, recommended partial caching strategies, and associated justifications.

#### Bundler (Ruby)
{:.no_toc}

**Safe to Use Partial Cache Restoration?** Yes (with caution).

Since Bundler uses system gems that are not explicitly specified, it is non-deterministic, and partial cache restoration can be unreliable.

To prevent this behavior, add a step that cleans Bundler before restoring dependencies from cache.

{% raw %}

```yaml
steps:
  - run: bundle clean --force
  - restore_cache:
      keys:
        # when lock file changes, use increasingly general patterns to restore cache
        - v1-gem-cache-{{ arch }}-{{ .Branch }}-{{ checksum "Gemfile.lock" }}
        - v1-gem-cache-{{ arch }}-{{ .Branch }}-
        - v1-gem-cache-{{ arch }}-
  - run: bundle install
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
{:.no_toc}

**Safe to Use Partial Cache Restoration?** Yes.

Maven repositories are intended to be centralized, shared, and massive. Partial caches can be restored without impacting which libraries are actually added to classpaths of generated artifacts.

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
{:.no_toc}

**Safe to Use Partial Cache Restoration?** Yes (with NPM5+).

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
{:.no_toc}

**Safe to Use Partial Cache Restoration?** Yes (with Pipenv).

Pip can use files that are not explicitly specified in `requirements.txt`. Using [Pipenv](https://docs.pipenv.org/) will include explicit versioning in a lock file.

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

We recommend using `yarn --frozen-lockfile --cache-folder ~/.cache/yarn` for two reasons.

1) `--frozen-lockfile` ensures that a whole new lockfile is created and it also ensures your lockfile isn't altered. This allows for the checksum to stay relevant and your dependencies should identically match what you use in development.

2) The default cache location depends on OS. `--cache-folder ~.cache/yarn` ensures we're explitly matching our cache save location.

{% endraw %}

## Caching Strategy Tradeoffs

In cases where the build tools for your language include elegant handling of dependencies, partial cache restores may be preferable to zero cache restores for performance reasons. If you get a zero cache restore, you have to reinstall all of your dependencies, which can result in reduced performance. One alternative is to get a large percentage of your dependencies from an older cache instead of starting from zero.

However, for other types of languages, partial caches carry the risk of creating code dependencies that are not aligned with your declared dependencies and do not break until you run a build without a cache. If the dependencies change infrequently, consider listing the zero cache restore key first.

Then, track the costs over time. If the performance costs of zero cache restores (also referred to as a *cache miss*) prove to be significant over time, only then consider adding a partial cache restore key.

Listing multiple keys for restoring a cache increases the odds of a partial cache hit. However, broadening your `restore_cache` scope to a wider history increases the risk of confusing failures. For example, if you have dependencies for Node v6 on an upgrade branch, but your other branches are still on Node v5, a `restore_cache` step that searches other branches might restore incompatible dependencies.

### ロック ファイルの使用
{:.no_toc}

Language dependency manager lockfiles (for example, `Gemfile.lock` or `yarn.lock`) checksums may be a useful cache key.

An alternative is to do `ls -laR your-deps-dir > deps_checksum` and reference it with

{% raw %}

`{{ checksum "deps_checksum" }}`{% endraw %}. For example, in Python, to get a more specific cache than the checksum of your `requirements.txt` file you could install the dependencies within a virtualenv in the project root `venv` and then do `ls -laR venv > python_deps_checksum`.

### 言語ごとに異なるキャッシュを使用する
{:.no_toc}

It is also possible to lower the cost of a cache miss by splitting your job across multiple caches. By specifying multiple `restore_cache` steps with different keys, each cache is reduced in size thereby reducing the performance impact of a cache miss. Consider splitting caches by language type (npm, pip, or bundler) if you know how each dependency manager stores its files, how it upgrades, and how it checks dependencies.

### 高コストのステップのキャッシュ
{:.no_toc}

Certain languages and frameworks have more expensive steps that can and should be cached. Scala and Elixir are two examples where caching the compilation steps will be especially effective. Rails developers, too, would notice a performance boost from caching frontend assets.

Do not cache everything, but *do* consider caching for costly steps like compilation.

## Source Caching

It is possible and often beneficial to cache your git repository to save time in your `checkout` step, especially for larger projects. Here is an example of source caching:

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

Even with the narrowest `restore_cache` option ({% raw %}`source-v1-{{ .Branch }}-{{ .Revision }}`{% endraw %}), source caching can be greatly beneficial when, for example, running repeated builds against the same git revision (i.e., with [API-triggered builds](https://circleci.com/docs/api/v1/#trigger-a-new-build-by-project-preview)) or when using Workflows, where you might otherwise need to `checkout` the same repository once per Workflows job.

That said, it's worth comparing build times with and without source caching; `git clone` is often faster than `restore_cache`.

**NOTE**: The built-in `checkout` command disables git's automatic garbage collection. You might choose to manually run `git gc` in a `run` step prior to running `save_cache` to reduce the size of the saved cache.

## See Also
{:.no_toc}

[Optimizations]({{ site.baseurl }}/2.0/optimizations/)