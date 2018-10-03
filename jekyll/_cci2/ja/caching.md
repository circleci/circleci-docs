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

- 目次 {:toc}

初回のジョブを実行すると、その後のジョブインスタンスでは前回と同じ処理が不要になるため、その分高速化される仕組みです。

![caching data flow]({{ site.baseurl }}/assets/img/docs/Diagram-v3-Cache.png)

A good example is package dependency managers such as Yarn, Bundler, or Pip. With dependencies restored from a cache, commands like `yarn install` will only need to download new dependencies, if any, and not redownload everything on every build.

## Example Caching Configuration

{:.no_toc}

Caching keys are simple to configure. The following example updates a cache if it changes by using checksum of `pom.xml` with a cascading fallback:

{% raw %}

```yaml
    steps:
      - restore_cache:
         keys:
           - m2-{{ checksum "pom.xml" }}
           - m2- # used if checksum fails
```

{% endraw %}

## Introduction

{:.no_toc}

Automatic dependency caching is not available in CircleCI 2.0, so it is important to plan and implement your caching strategy to get the best performance. Manual configuration in 2.0 enables more advanced strategies and finer control.

This document describes the manual caching available, the costs and benefits of a chosen strategy, and tips for avoiding problems with caching. **Note:** The Docker images used for CircleCI 2.0 job runs are automatically cached on the server infrastructure where possible.

For information about enabling a premium feature to reuse the unchanged layers of your Docker image, see the [Enabling Docker Layer Caching]({{ site.baseurl }}/2.0/docker-layer-caching/) document.

## Overview

{:.no_toc}

A cache stores a hierarchy of files under a key. Use the cache to store data that makes your job faster, but in the case of a cache miss or zero cache restore the job will still run successfully, for example, by caching Npm, Gem, or Maven package directories.

Caching is a balance between reliability (not using an out-of-date or inappropriate cache) and getting maximum performance (using a full cache for every build).

In general it is safer to preserve reliability than to risk a corrupted build or to build using stale dependencies very quickly. So, the ideal is to balance performance gains while maintaining high reliability.

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

上記の `restore_cache` の例では、最初に現在の git のリビジョンから該当するキャッシュを見つけようとします。なければ現在のブランチ全体から探し、それでも見つからなければブランチやリビジョンにかかわらず全体からキャッシュを見つける、という動きになります。 `keys` のなかに複数のリストがある場合、CircleCI はそのなかから最初にマッチしたものについて復元します。 該当するキャッシュが複数ある場合は、一番新しいキャッシュを使用します。

If your source code changes frequently, we recommend using fewer, more specific keys. This produces a more granular source cache that will update more often as the current branch and git revision change.

Even with the narrowest `restore_cache` option ({% raw %}`source-v1-{{ .Branch }}-{{ .Revision }}`{% endraw %}), source caching can be greatly beneficial when, for example, running repeated builds against the same git revision (i.e., with [API-triggered builds](https://circleci.com/docs/api/v1-reference/#new-build)) or when using Workflows, where you might otherwise need to `checkout` the same repository once per Workflows job.

That said, it's worth comparing build times with and without source caching; `git clone` is often faster than `restore_cache`.

## Writing to the Cache in Workflows

Jobs in one workflow can share caches. Note that this makes it possibile to create race conditions in caching across different jobs in workflows.

Cache is immutable on write: once a cache is written for a particular key like `node-cache-master`, it cannot be written to again. Consider a workflow of 3 jobs, where Job3 depends on Job1 and Job2: {Job1, Job2} -> Job3. They all read and write to the same cache key.

In a run of the workflow, Job3 may use the cache written by Job1 or Job2. Since caches are immutable, this would be whichever job saved its cache first. This is usually undesireable because the results aren't deterministic--part of the result depends on chance. You could make this workflow deterministic by changing the job dependencies: make Job1 and Job2 write to different caches and Job3 loads from only one, or ensure there can be only one ordering: Job1 -> Job2 ->Job3.

さらに複雑なケースもあります。{% raw %}`node-cache-{{ checksum "package-lock.json" }}`{% endraw %} のような可変キーで保存し、`node-cache-` のような部分マッチのキーで復元する場合です。 The possibility for a race condition still exists, but the details may change. For instance, the downstream job uses the cache from the upstream job to run last.

Another race condition is possible when sharing caches between jobs. Consider a workflow with no dependency links: Job1 and Job2. Job2 uses the cache saved from Job1. Job2 could sometimes successfully restore a cache, and sometimes report no cache is found, even when Job1 reports saving it. Job2 could also load a cache from a previous workflow. If this happens, this means Job2 tried to load the cache before Job1 saved it. This can be resolved by creating a workflow dependency: Job1 -> Job2. This would force Job2 to wait until Job1 has finished running.

## Restoring Cache

CircleCI restores caches in the order of keys listed in the `restore_cache` step. キャッシュキーはプロジェクトに名前空間をもち、検索時は文字列の前方一致となります。 The cache will be restored from the first matching key. 該当するキャッシュが複数ある場合は、一番新しいキャッシュを使用します。

In the example below, two keys are provided:

{% raw %}

```yaml
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

keys 内の 2 番目の項目が 1 番目よりも短いのは、その方が現在の状態と生成された最新のキャッシュとの間で差分が生じやすいためです。 npm のような依存関係管理ツールを実行すると、古くなった依存関係を見つけ、更新します。 これは**部分キャッシュリストア**とも呼ばれます。

### Clearing Cache

{:.no_toc}

If you need to get clean caches when your language or dependency management tool versions change, use a naming strategy similar to the previous example and then change the cache key names in your `config.yml` file and commit the change to clear the cache.

<div class="alert alert-info" role="alert">
<b>ヒント：</b>キャッシュは書き換え不可のため、キャッシュキー名の先頭にバージョン名などを入れておくと好都合です。例えば <code class="highlighter-rouge">v1-...</code> のようにします。 こうすると、そのバージョン名の数字を増やすだけでキャッシュ全体を再生成できることになります。
</div>

For example, you may want to clear the cache in the following scenarios by incrementing the cache key name:

- Dependency manager version change, for example, you change npm from 4 to 5
- Language version change, for example, you change ruby 2.3 to 2.4
- Dependencies are removed from your project

## Basic Example of Dependency Caching

The extra control and power in CircleCI 2.0 manual dependency caching requires that you be explicit about what you cache and how you cache it. 具体例は CircleCI の設定方法のページ内にある [save_cache](https://circleci.com/docs/2.0/configuration-reference/#save_cache) のセクションをご覧ください。

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

**注：**特別な [`persist_to_workspace`](https://circleci.com/docs/2.0/configuration-reference/#persist_to_workspace) ステップとは違って、`save_cache` も `restore_cache` も、`paths` キーに対してワイルドカードによるグロブをサポートしません。

## Using Keys and Templates

キャッシュ`キー`にテンプレート値を埋め込む場合、キャッシュの保存に制限がかかることに注意してください。CircleCI のストレージにキャッシュをアップロードするのに通常より時間がかかります。 ビルドのたびに新しいキャッシュを生成したくないときは、変更があった場合にのみ新しいキャッシュを生成する`キー`を指定します。

まず初めに、プロジェクトにおいて一意となる値のキーを用いて、キャッシュを保存・復元するタイミングを決めます。 ビルド番号が増えたとき、リビジョンが上がったとき、依存マニフェストファイルのハッシュ値が変わったときなどが考えられます。

いくつかのキャッシュの設定例を下記に挙げてみます。

- {% raw %}`myapp-{{ checksum "package-lock.json" }}`{% endraw %}  
    `package-lock.json` の内容が変わるたびにキャッシュが毎回生成されます。このプロジェクトの別のブランチも、同じキャッシュキーを生成します
- {% raw %}`myapp-{{ .Branch }}-{{ checksum "package-lock.json" }}`{% endraw %}  
    `package-lock.json` の内容が変わるたびにキャッシュが毎回生成されます。このプロジェクトの別のブランチは、それごとに異なるキャッシュキーを生成します 
- {% raw %}`myapp-{{ epoch }}`{% endraw %} - Every build will generate separate cache keys.

ステップの処理では、以上のようなテンプレートの部分は実行時に値が置き換えられ、その置換後の文字列が`キー`の値として使われます。 CirlceCI のキャッシュ`キー`で利用可能なテンプレートを下記の表にまとめました。

テンプレート | 解説 \----|\---\---\---- {% raw %}`{{ .Branch }}`{% endraw %} | 現在ビルドを実行しているバージョン管理システムのブランチ名。 {% raw %}`{{ .BuildNum }}`{% endraw %} | 実行中のビルドにおける CircleCI のジョブ番号。 {% raw %}`{{ .Revision }}`{% endraw %} | 現在ビルドを実行しているバージョン管理システムのリビジョン。 {% raw %}`{{ .Environment.variableName }}`{% endraw %} | `variableName`で示される環境変数 ([定義済み環境変数](https://circleci.com/docs/2.0/env-vars/#circleci-environment-variable-descriptions) 、もしくは[コンテキスト](https://circleci.com/docs/2.0/contexts)を指定できますが、ユーザー定義の環境変数は使えません)。 {% raw %}`{{ checksum "filename" }}`{% endraw %} | filename で指定したファイル内容の SHA256 ハッシュを Base64 エンコードしたもの。ファイル内容に変更があるとキャッシュキーも新たに生成されます。 ここで指定できるのはリポジトリでコミットされているファイルに限られるため、 `package-lock.json` や `pom.xml`、もしくは `project.clj` などの依存関係を定義しているマニフェストファイルを使うことも検討してください。 また、`restore_cache` から `save_cache` までの処理でファイル内容が変わらないようにします。そうしないと `restore_cache` のタイミングで使われるファイルとは異なるキャッシュキーを元にキャッシュが保存されることになります。 {% raw %}`{{ epoch }}`{% endraw %} | 協定世界時 (UTC) における 1970 年 1 月 1 日午前 0 時 0 分 0 秒からの経過秒数。POSIX 時間や UNIX 時間と同じです。 {% raw %}`{{ arch }}`{% endraw %} | OS と CPU に関連する情報（アーキテクチャ、プロセッサファミリー、モデル）。 OS や CPU アーキテクチャに合わせてコンパイル済みバイナリをキャッシュするような場合に用います。`darwin-amd64-6_58` あるいは `linux-amd64-6_62` のような文字列になります。 CircleCI で利用可能な CPU については[こちら]({{ site.baseurl }}/2.0/faq/#which-cpu-architectures-does-circleci-support)を参照してください {: class="table table-striped"}

**注：**キャッシュに対してユニークな識別子を定義する際には、{% raw %}`{{ epoch }}`{% endraw %} のような厳密すぎる値になるテンプレートをむやみに使わないよう注意してください。 {% raw %}`{{ .Branch }}`{% endraw %} や {% raw %}`{{ checksum "filename" }}`{% endraw %} といった汎用性の高い値になるテンプレートを使うと、使われるキャッシュの数は増えます。 これについては、以降で説明するようにトレードオフの関係にあると言えます。

### Full Example of Saving and Restoring Cache

{:.no_toc}

下記に、キーとテンプレートを含む `restore_cache` および `save_cache` の使い方がわかる `.circleci/config.yml` ファイルのサンプルコードを例示します。

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

依存関係管理ツールによっては、部分的に復元した依存関係ツリー上位へのインストールを正しく行えないものもあります。

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

上記の例では、2 番目もしくは 3 番目に指定しているキャッシュキーで依存関係ツリーが部分的にリストアされた場合、ツールによっては期限切れの依存関係ツリーの上位に誤ってインストールしてしまいます。

名前違いのキャッシュキーを複数並べるのではなく、単一のバージョンをキャッシュキーに付加することでより安全に扱えるようにする下記のような方法もあります。

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
        - v1-gem-cache-{{ arch }}-{{ .Branch }}-{{ checksum "Gemfile.lock" }}
```

{% endraw %}

キャッシュは書き換え不可のため、このようにバージョン (v1-) の数字を増やすことでキャッシュを丸ごと生成し直す方法がとれます。これは以下のようなシチュエーションでも有効です。

- `npm` などの依存関係管理ツールのバージョンを変えたとき
- Ruby などの開発言語のバージョンを変えたとき
- プロジェクトにおいて依存関係ファイルを追加・削除したとき

依存関係の部分キャッシュの信頼性については、依存関係管理ツールに左右されます。 下記に、各種依存関係管理ツールにおける部分キャッシュの推奨される使い方とその解説を記載しました。

#### Bundler (Ruby)

{:.no_toc}

**安全な部分キャッシュリストア**…可能 (条件付き)

Bundler は明示的に指定されないシステム上の gem を扱うことから、部分キャッシュが一意に決まることがなく、部分キャッシュリストアは信頼性の点で懸念があります。

この問題を解決するには、キャッシュから依存関係を復元する前に Bundler を clean するステップを追加します。

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
        # lock ファイルが変更されると、より広範囲にマッチする 2 番目以降のパターンがキャッシュの復元に使われます
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

**安全な部分キャッシュリストア**…可能

Gradle リポジトリは集約型、共有型、かつ大規模を指向したツールです。アーティファクトの生成先となる classpath にどれだけのライブラリが追加されたかに関係なく、部分キャッシュリストアが可能です。

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

**安全な部分キャッシュリストア**…可能

Maven リポジトリは集約型、共有型、かつ大規模を指向したツールです。アーティファクトの生成先となる classpath にどれだけのライブラリが追加されたかに関係なく、部分キャッシュリストアが可能です。

Clojure 向けビルドツールである Leiningen も裏で Maven を利用しているため、同じように部分キャッシュリストアが可能となります。

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

**安全な部分キャッシュリストア**…可能 (NPM5 以降)

NPM5 以降で lock ファイルを使用すると、部分キャッシュリストアを安全に行えます。

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

**安全な部分キャッシュリストア**…可能 (要 Pipenv)

Pip は `requirements.txt` のなかで明示的に指定されていないファイルを使えてしまいます。lock ファイルの正確なバージョン管理機能が含まれる [Pipenv](https://docs.pipenv.org/) を組み合わせてください。

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

**安全な部分キャッシュリストア**…可能

Yarn はまさしく部分キャッシュリストアを行えるように、元から lock ファイルを使う設計になっています。

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

## 制限について

The caches created via the `save_cache` step are stored for up to 30 days.

## Caching Strategy Tradeoffs

依存関係のスマートな制御機能を実装している開発言語では、ビルド時のパフォーマンス上の要因からキャッシュを一から作り直すことは避け、部分キャッシュリストアを推奨するケースがあります。 キャッシュを一から作り直すには、依存関係をすべて再インストールする必要があり、パフォーマンスの低下にもつながります。 これを避けるためには、一から作り直すのではなく、依存関係の大部分を古いキャッシュから復元する方法が有効です。

一方で、そうではない別の開発言語においては、部分キャッシュは宣言済みの依存関係と矛盾するコード依存を生むリスクをはらんでおり、キャッシュなしでビルドを実行するまでそれをリセットできない問題もあります。 依存関係がそれほど頻繁に変わらないのなら、一からキャッシュを作り直すためのキーをリストの最初に入れてみてください。 その状態でビルドにどれだけ時間がかかるか検証します。 キャッシュを作り直した (*キャッシュミス*ともみなせる) 場合にパフォーマンスが大幅に低下することが確かであれば、部分キャッシュリストアを行うキーの追加を検討してください。

キャッシュ復元のために複数のキーを列挙すると、部分キャッシュのヒットは増加します。 ただし、より広範囲に `restore_cache` の対象が広がることで、さらに多くの混乱を招く危険性もあります。 例えば、他のブランチでまだ Node.js v5 を使っているにもかかわらず、アップグレードしたブランチに Node.js v6 の依存関係がある場合、他のブランチを見る `restore_cache` は、アップグレードしたブランチとは互換性のない依存関係を復元してしまいます。

### Lock ファイルを使用する

{:.no_toc}

依存関係管理ツールが扱う Lock ファイル (`Gemfile.lock` や `yarn.lock` など) のチェックサムは、キャッシュキーに適しています。

チェックサムの取得方法は、他にも `ls -laR your-deps-dir > deps_checksum` としたうえで、 {% raw %}`{{ checksum "deps_checksum" }}`{% endraw %} で参照するやり方もあります。 例えば Python で多くの固有キャッシュを取得する際には、`requirements.txt` ファイルのチェックサムを利用する以外にも、Python のプロジェクトルートで仮想環境 `venv` を使って依存関係をインストールし、`ls -laR venv > python_deps_checksum` を実行する手法が使えます。

### 異なる言語ごとに複数のキャッシュを使う

{:.no_toc}

複数のキャッシュにまたがる形でジョブを分けることにより、キャッシュミスの発生を抑えることも可能です。 異なるキーを用いた複数の `restore_cache` ステップを指定することで、1 つあたりのキャッシュサイズを小さくし、キャッシュミスによるパフォーマンスへの影響を最小限にします。 依存関係管理ツールがそれぞれどのようにファイルを保管しているのか、どのように更新しているか、あるいは依存関係をどのように確認しているのかを把握しているなら、言語 (npm、pip、bundler) ごとにキャッシュを分割することを検討してください。

### 処理コストの高いステップのキャッシュ

{:.no_toc}

いくつかの言語やフレームワークにおいては、キャッシュした方が望ましい、処理コストの高いステップが存在します。 Scala や Elixir は、コンパイルステップのキャッシュが顕著に影響する言語です。 Rails の開発者も同様に、フロントエンドのアセットをキャッシュすることがパフォーマンスアップに効果的であることを実感するはずです。

なんでもキャッシュするのではなく、コンパイルのような処理コストの高いステップにおいてキャッシュすることを*ぜひ*心がけてください。

## その他の参考資料

{:.no_toc}

[最適化]({{ site.baseurl }}/2.0/optimizations/)