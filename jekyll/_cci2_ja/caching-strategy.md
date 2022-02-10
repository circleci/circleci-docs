---
layout: classic-docs
title: "キャッシュの活用方法"
description: "This document is a guide to the various caching strategies available for managing dependency caches in CircleCI."
categories:
  - 最適化
order: 50
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

キャッシュは、CircleCI でのジョブを高速化する最も効果的な方法の 1 つです。 また、以前のジョブからデータを再利用することでフェッチ操作のコストを下げることができます。 Caching is project-specific, and there are a number of strategies to help optimize caches for effectiveness and storage optimization.

* TOC
{:toc}

## Cache optimization
{: #cache-optimization }

When setting up caches for your projects, the goal is a 10x - 20x ROI (return on investment). This means you are aiming for a situation where the amount of cache restored is 10x - 20x the cache saved. The following tips can help you achieve this.

### Avoid strict cache keys
{: #avoid-strict-cache-keys }

Using cache keys that are too strict can mean that you will only get a minimal number of cache hits for a workflow. For example, if you used the key `CIRCLE_SHA1` (SHA of the last commit of the current pipeline), this would only get matched once for a workflow. Consider using cache keys that are less strict to ensure more cache hits.

### Avoid unnecessary workflow reruns
{: #avoid-unnecessary-workflow-reruns }

If your project has "flaky tests," workflows might be rerun unnecessarily. This will both use up your credits and increase your storage usage. To avoid this situation, address flaky tests. For help with identifying them, see [Test Insights]({{ site.baseurl }}/2.0/insights-tests/#flaky-tests)). You can also consider configuring your projects to only rerun failed jobs rather than entire workflows. To achieve this you can use the `when` step. For further information see the [Configuration Reference]({{ site.baseurl }}/2.0/configuration-reference/#the-when-attribute).

### Split cache keys by directory
{: #split-cache-keys-by-directory }

Having multiple directories under a single cache key increases the chances of there being a change to the cache. In the example below, there may be changes in the first two directories but no changes in the `a` or `b` directory. Saving all four directories under one cache key increases the potential storage usage. The cache restore step will also take longer than needed as all four sets of files will be restored.

```yml
dependency_cache_paths:
  - /mnt/ramdisk/node_modules
  - /mnt/ramdisk/.cache/yarn
  - /mnt/ramdisk/apps/a/node_modules
  - /mnt/ramdisk/apps/b/node_modules
```

### Combine jobs when possible
{: #combine-jobs-when-possible }

As an example, a workflow including three jobs running in parallel:

* lint (20 seconds)
* code-cov (30 seconds)
* test (8 mins)

All running a similar set of steps:

* checkout
* restore cache
* build
* save cache
* run command

The `lint` and `code-cov` jobs could be combined with no affect on workflow length, but saving on duplicate steps.

### Order jobs to create meaningful workflows
{: #order-jobs-to-create-meaningful-workflows }

If no job ordering is used in a workflow all jobs run concurrently. If all the jobs have a `save_cache` step, they could be uploading files multiple times. Consider reordering jobs in a workflow so subsequent jobs can make use of assets created in previous jobs.

### Check for language-specific caching tips
{: #check-for-language-specific-caching-tips }

Check #partial-dependency-caching-strategies to see if there are tips for the language you are using.

### Check cache is being restored as well as saved
{: #check-cache-is-being-restored-as-well-as-saved }

If you find that a cache is not being restored, see [this support article](https://support.circleci.com/hc/en-us/articles/360004632473-No-Cache-Found-and-Skipping-Cache-Generation) for tips.

## 部分的な依存関係キャッシュの使用方法
{: #partial-dependency-caching-strategies }

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

カスケードフォールバックの代わりに、以下のように単一バージョンのプレフィックスが付いたキャッシュ キーを使用することで、動作の信頼性が高まります。

**メモ:** `chown` コマンドを使用して、依存関係の場所へのアクセスを CircleCI に許可します。

```yaml
steps:
  - restore_cache:
      keys:
        - v1-gem-cache-{{ arch }}-{{ .Branch }}-{{ checksum "Gemfile.lock" }}
```

`run` ステップを使用して、テスト スイートを実行します。

キャッシュは変更不可なので、この方法でバージョン番号を増やすことで、すべてのキャッシュを再生成できます。 この方法は、以下のような場合に便利です。

- `npm` などの依存関係管理ツールのバージョンを変えたとき
- Ruby などの開発言語のバージョンを変えたとき
- プロジェクトにおいて依存関係ファイルを追加・削除したとき

The stability of partial dependency caching relies on your dependency manager. 以下に、一般的な依存関係管理ツールについて、推奨される部分キャッシュの使用方法をその理由と共に示します。

### Bundler (Ruby)
{: #bundler-ruby }

**部分キャッシュ リストアを使用しても安全でしょうか？** はい。ただし、注意点があります。

Bundler では、明示的に指定されないシステム gem が使用されるため、確定的でなく、部分キャッシュ リストアの信頼性が低下することがあります。

この問題を解決するには、キャッシュから依存関係を復元する前に Bundler をクリーンアップするステップを追加します。

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
        # lock ファイルが変更されると、より広範囲にマッチする 2 番目以降のパターンがキャッシュの復元に使われます
        - v1-gem-cache-{{ arch }}-{{ .Branch }}-{{ checksum "Gemfile.lock" }}
        - v1-gem-cache-{{ arch }}-{{ .Branch }}-
        - v1-gem-cache-{{ arch }}-
  - run: bundle install
  - run: bundle clean --force
  - save_cache:
      paths:
        - ~/.bundle
      key: v1-gem-cache-{{ arch }}-{{ .Branch }}-{{ checksum "Gemfile.lock" }}
```

{% endraw %}

### Gradle (Java)
{: #gradle-java }

**部分キャッシュリストアを使用しても安全でしょうか？** はい。

Gradle リポジトリは、規模が大きく、一元化や共有が行われることが想定されています。 生成されたアーティファクトのクラスパスに実際に追加されるライブラリに影響を与えることなく、一部のキャッシュをリストアできます。

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

### Maven (Java) および Leiningen (Clojure)
{: #maven-java-and-leiningen-clojure }

**部分キャッシュリストアを使用しても安全でしょうか？** はい。

Maven リポジトリは、規模が大きく、一元化や共有が行われることが想定されています。 生成されたアーティファクトのクラスパスに実際に追加されるライブラリに影響を与えることなく、一部のキャッシュをリストアできます。

Leiningen も内部で Maven を利用しているため、同様に動作します。

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

### npm (Node)
{: #npm-node }

**部分キャッシュ リストアを使用しても安全でしょうか？** はい。 ただし、NPM5 以降を使用する必要があります。

NPM5 以降でロック ファイルを使用すると、部分キャッシュ リストアを安全に行うことができます。

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

### pip (Python)
{: #pip-python }

**部分キャッシュ リストアを使用しても安全でしょうか？** はい。ただし、Pipenv を使用する必要があります。

Pip では、`requirements.txt` で明示的に指定されていないファイルを使用できます。 [Pipenv](https://docs.pipenv.org/) を使用するには、ロック ファイルでバージョンを明示的に指定する必要があります。

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

### Yarn (Node)
{: #yarn-node }

**部分キャッシュリストアを使用しても安全でしょうか？** はい。

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

以下の 2 つの理由から、`yarn --frozen-lockfile --cache-folder ~/.cache/yarn` を使うことをお勧めします。

1) `--frozen-lockfile` を指定すると新しいロックファイルが作成されるので、既存のロックファイルの変更を防止できます。 これにより、チェックサムが保たれ、依存関係が開発環境のものと完全に一致します。

2) デフォルトのキャッシュの保存場所は OS によって異なります。 `--cache-folder ~.cache/yarn` により、目的のキャッシュの保存場所を明示的に指定できます。

{% endraw %}

## キャッシュ戦略のトレードオフ
{: #caching-strategy-tradeoffs }

使用言語のビルド ツールが依存関係を難なく処理できる場合は、ゼロ キャッシュ リストアよりも部分キャッシュ リストアの方がパフォーマンス上は有利です。 ゼロキャッシュリストアでは、依存関係をすべて再インストールしなければならないため、パフォーマンスが低下することがあります。 これを避けるためには、一から作り直すのではなく、依存関係の大部分を古いキャッシュからリストアする方法が有効です。

一方、それ以外の言語では、部分キャッシュリストアを実行すると、宣言された依存関係と矛盾するコード依存関係が作成されるリスクがあり、キャッシュなしでビルドを実行するまでその矛盾は解決されません。 依存関係が頻繁に変更されない場合は、ゼロ キャッシュ リストア キーをリストの最初に配置してみてください。

次に時間の経過に伴うコストを追跡します。 時間の経過に伴いゼロキャッシュリストア (*キャッシュミス*) のパフォーマンスコストが大幅に増加することがわかった場合には、部分キャッシュリストアキーの追加を検討してください。

キャッシュをリストアするためのキーを複数列挙すると、部分キャッシュがヒットする可能性が高くなります。 ただし、`restore_cache`の対象が時間的に広がることで、さらに多くの混乱を招く危険性もあります。 たとえば、アップグレードしたブランチに Node v6 の依存関係がある一方で、他のブランチでは Node v5 の依存関係が使用されている場合は、他のブランチを検索する `restore_cache` ステップで、アップグレードしたブランチとは互換性がない依存関係が復元される可能性があります。

## ロックファイルの使用
{: #using-a-lock-file }

依存関係管理ツールが扱う Lock ファイル (`Gemfile.lock` や `yarn.lock` など) のチェックサムは、キャッシュキーに適しています。

また、`ls -laR your-deps-dir > deps_checksum` を実行し、{% raw %}`{{ checksum "deps_checksum" }}`{% endraw %} で参照するという方法もあります。 たとえば、Python で `requirements.txt` ファイルのチェックサムよりも限定的なキャッシュを取得するには、プロジェクト ルート `venv` の virtualenv 内に依存関係をインストールし、`ls -laR venv > python_deps_checksum` を実行します。

## 言語ごとに異なるキャッシュを使用する
{: #using-multiple-caches-for-different-languages }

ジョブを複数のキャッシュに分割することで、キャッシュ ミスのコストを抑制できます。 異なるキーを使用して複数の `restore_cache` ステップを指定することで、各キャッシュのサイズを小さくし、キャッシュ ミスによるパフォーマンスへの影響を抑えることができます。 それぞれの依存関係管理ツールによるファイルの保存方法、ファイルのアップグレード方法、および依存関係のチェック方法がわかっている場合は、言語ごとに (npm、pip、bundler) キャッシュを分割することを検討してください。

## 高コストのステップのキャッシュ
{: #caching-expensive-steps }
{:.no_toc}

言語やフレームワークによっては、キャッシュ可能で、キャッシュする方が望ましいものの、大きなコストがかかるステップがあります。 たとえば、Scala や Elixir では、コンパイル ステップをキャッシュすることで、効率が大幅に向上します。 Rails の開発者も、フロントエンドのアセットをキャッシュするとパフォーマンスが大幅に向上することをご存じでしょう。

すべてをキャッシュするのではなく、コンパイルのようなコストがかかるステップをキャッシュすることを*お勧めします*。

## 関連項目
{: #see-also }
{:.no_toc}

[最適化]({{ site.baseurl }}/2.0/optimizations/)
