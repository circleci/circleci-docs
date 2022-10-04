---
layout: classic-docs
title: "キャッシュ戦略"
description: "このドキュメントでは、依存関係のキャッシュを管理するための様々なキャッシュ戦略について説明します。"
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

キャッシュは、CircleCI でのジョブを高速化する最も効果的な方法の 1 つです。 また、以前のジョブからデータを再利用することでフェッチ操作のコストを下げることができます。 キャッシュはプロジェクト固有であり、様々なキャッシュ戦略によりキャッシュを最適化して有効性を高めることができます。

* TOC
{:toc}

## キャッシュストレージのカスタマイズ
{: #caching-and-self-hosted-runner }

セルフホストランナーを使用する場合、プランに含まれるネットワークとストレージ使用量には制限があります。 キャッシュに関連するアクションには、ネットワークとストレージの使用が発生するものがあります。 お客様の使用量が制限を超えた場合、料金が発生します。

キャッシュを長期間保存すると、ストレージコストに影響が及ぶため、キャッシュを保存する理由やユースケースに応じた必要なキャッシュの保存期間を明確にすることをお勧めします。 ニーズに合う場合は、キャッシュのストレージ保存期間を短く設定し、コストを削減しましょう。

[CircleCI Web アプリ](https://app.circleci.com/)で **Plan > Usage Controls** に移動し、キャッシュのストレージ使用量や保存期間をカスタマイズすることができます。 ネットワークとストレージ使用量の管理の詳細については、[データの永続化]({{site.baseurl}}/ja/persist-data/#managing-network-and-storage-use)のページを参照してください。

## キャッシュの最適化
{: #cache-optimization }

プロジェクトのキャッシュを設定する際は、 10 ～ 20 倍の ROI (投資収益率) を目標にします。 つまり、リストアされたキャッシュの量が、保存されたキャッシュの 10 倍から 20 倍になるような状況を目指すということです。 下記はそれを達成するためのヒントです。

### 厳密なキャッシュキーは使用しない
{: #avoid-strict-cache-keys }

厳密すぎるキャッシュキーを使用すると、ワークフローのキャッシュヒット数が最小限になってしまいます。 たとえば、`CIRCLE_SHA1`キー  (現在のパイプラインの最後のコミットの SHA ）を使用した場合、1 つのワークフローに対して一致するのは一回のみです。 より多くのキャッシュヒットを得るには、厳密すぎないキャッシュキーを使用してください。

### 不必要なワークフローの再実行を避ける
{: #avoid-unnecessary-workflow-reruns }

プロジェクトに「結果が不安定なテスト」がある場合、ワークフローが不必要に再実行される場合があります。 これによりクレジットが消費され、ストレージの使用量も増加してしまいます。 この状況を避けるために、不安定なテストを検出します。 不安定なテストの検出については、[テストインサイト]({{ site.baseurl }}/ja/insights-tests/#flaky-tests)を参照してください。 ワークフロー全体の再実行ではなく失敗したジョブだけを再実行するようにプロジェクトを設定することも可能です。 これは `when` ステップを使って実行できます。 詳細は[設定ファイルのリファレンス]({{ site.baseurl }}/ja/configuration-reference/#the-when-attribute)をご覧ください。

### ディレクトリごとにキャッシュキーを分ける
{: #split-cache-keys-by-directory }

1 つのキャッシュキーの下に複数のディレクトリがあると、キャッシュが変更される可能性が高くなります。 下記の例では、最初の 2 つのディレクトリには変更があっても、` a `または `b `ディレクトリには変更がない場合があります。 この 4 つのディレクトリをすべて 1 つのキャッシュキー下に保存すると、ストレージ使用量が増えてしまいます。 キャッシュのリストアステップでも、すべてのファイルがリストアされるため必要以上に時間がかかってしまいます。

```yaml
dependency_cache_paths:
  - /mnt/ramdisk/node_modules
  - /mnt/ramdisk/.cache/yarn
  - /mnt/ramdisk/apps/a/node_modules
  - /mnt/ramdisk/apps/b/node_modules
```

### 可能な場合はジョブを統合する
{: #combine-jobs-when-possible }

たとえば、並行して実行される以下の 3 つのジョブを含むワークフローの場合:

* lint ( 20 秒)
* code-cov (30 秒)
* test (8 秒)

すべてのジョブが類似する以下のステップを実行します。

* チェックアウト
* キャッシュのリストア
* ビルド
* キャッシュの保存
* 実行コマンド

この `lint` と `code-cov` を統合してもワークフローの長さは変わりませんが、重複するステップの分を節約できます。

### 有意義なワークフローを作成するためのジョブの実行順序
{: #order-jobs-to-create-meaningful-workflows }

ワークフローにおけるジョブの順序を定義しないと、すべてのジョブが同時に実行されます。 すべてのジョブに`save_cache` ステップがある場合、ファイルが何度もアップロードされてしまう可能性があります。 ワークフロー内のジョブの順序を再定義することにより、以前のジョブで作成したアセットを後続のジョブで使用できます。

### 言語固有のキャッシュのヒントを確認
{: #check-for-language-specific-caching-tips }

[部分的な依存関係キャッシュの使用方法](#partial-dependency-caching-strategies) を参照して、使用している言語に関するヒントがあるかどうかを確認します。

### キャッシュがリストアされ、保存されていることを確認
{: #check-cache-is-being-restored-as-well-as-saved }

キャッシュがリストアされていない場合は、[こちらのサポート記事](https://support.circleci.com/hc/en-us/articles/360004632473-No-Cache-Found-and-Skipping-Cache-Generation)でヒントをお探しください。

### 未使用または余分な依存関係のキャッシュ
{: #cache-unused-or-superfluous-dependencies }

ご使用の言語およびパッケージ管理システムによっては、不要な依存関係をクリアまたは「削除」するツールを利用できる場合があります。

たとえば、 node-prune パッケージは、`node_modules` から不要なファイル (マークダウン、TypeScript ファイルなど) を削除します。

### ジョブのプルーニングが必要かどうかの確認
{: #check-if-jobs-need-pruning}

キャッシュの使用率が高く使用率を下げたい場合は以下をお試しください。

* `.circleci/config.yml` ファイルで `save_cache` コマンドと `restore_cache` コマンドでキャッシュを使用するすべてのジョブを検索し、キャッシュの削除が必要かどうかを判断する。
* キャッシュの範囲を大きなディレクトリから特定のファイルの小さなサブセットに縮小する。
* キャッシュの `key` が[ベストプラクティス]({{ site.baseurl}}/ja/caching/#further-notes-on-using-keys-and-templates)に従っているかを確認する。

  {% raw %}
  ```sh
      - save_cache:
          key: brew-{{epoch}}
          paths:
            - /Users/distiller/Library/Caches/Homebrew
            - /usr/local/Homebrew
  ```
  {% endraw %}

  上記の例は、ベストプラクティスに従っていません。 `brew-{{ epoch }}` はビルドごとに変更され、値が変更されていない場合でも毎回アップロードされます。 この方法では結局コストもかかり、時間も短縮できません。 代わりに、次のようなキャッシュ `key` を選択します。

  {% raw %}
  ```sh
      - save_cache:
          key: brew-{{checksum “Brewfile”}}
          paths:
            - /Users/distiller/Library/Caches/Homebrew
            - /usr/local/Homebrew
  ```
  {% endraw %}

  この場合、要求された依存関係のリストが変更された場合にのみ変更されます。 これでは新しいキャッシュのアップロードの頻度が十分でないという場合は、依存関係にバージョン番号を含めます。

  キャッシュをやや古い状態にします。 新しい依存関係がロックファイルに追加された時や依存関係のバージョンが変更された時に新しいキャッシュがアップロードされる上記の方法とは対照的に、あまり正確に追跡しない方法を用います。

  アップロードする前にキャッシュを削除しますが、キャッシュキーを生成するものはすべて削除してください。

## 部分的な依存関係キャッシュの使用方法
{: #partial-dependency-caching-strategies }

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

### Bundler (Ruby)
{: #bundler-ruby }

**部分キャッシュリストアを使用しても安全でしょうか？** はい。ただし、注意点があります。

Bundler では、明示的に指定されないシステム gem が使用されるため、確定的でなく、部分キャッシュ リストアの信頼性が低下することがあります。

この問題を解決するには、キャッシュから依存関係をリストアする前に Bundler をクリーンアップするステップを追加します。

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
        # lock ファイルが変更されると、より広範囲にマッチする 2 番目以降のパターンがキャッシュのリストアに使われます。
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
        # lock ファイルが変更されると、より広範囲にマッチする 2 番目以降のパターンがキャッシュのリストアに使われます。
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
       # lock ファイルが変更されると、より広範囲にマッチする 2 番目以降のパターンがキャッシュのリストアに使われます。
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

**部分キャッシュリストアを使用しても安全でしょうか？** はい。 ただし、NPM5 以降を使用する必要があります。

NPM5 以降でロックファイルを使用すると、部分キャッシュリストアを安全に行うことができます。

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
       # lock ファイルが変更されると、より広範囲にマッチする 2 番目以降のパターンがキャッシュのリストアに使われます
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

**部分キャッシュリストアを使用しても安全でしょうか？** はい。ただし、Pipenv を使用する必要があります。

Pip では、`requirements.txt` で明示的に指定されていないファイルを使用できます。 [Pipenv](https://docs.pipenv.org/) を使用するには、ロックファイルでバージョンを明示的に指定する必要があります。

{% raw %}

```yaml
steps:
  - restore_cache:
      keys:
       # lock ファイルが変更されると、より広範囲にマッチする 2 番目以降のパターンがキャッシュのリストアに使われます。
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
      # lock ファイルが変更されると、より広範囲にマッチする 2 番目以降のパターンがキャッシュのリストアに使われます。
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

キャッシュをリストアするためのキーを複数列挙すると、部分キャッシュがヒットする可能性が高くなります。 ただし、`restore_cache`の対象が時間的に広がることで、さらに多くの混乱を招く危険性もあります。 たとえば、アップグレードしたブランチに Node v6 の依存関係がある一方で、他のブランチでは Node v5 の依存関係が使用されている場合は、他のブランチを検索する `restore_cache` ステップで、アップグレードしたブランチとは互換性がない依存関係がリストアされる可能性があります。

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

- [データの永続化]({{site.baseurl}}/ja/persist-data)
- [依存関係のキャッシュ]({{site.baseurl}}/ja/caching)
- [ワークスペース]({{site.baseurl}}/ja/workspaces)
- [アーティファクト]({{site.baseurl}}/ja/artifacts)
- [最適化の概要]({{site.baseurl}}/ja/optimizations)

