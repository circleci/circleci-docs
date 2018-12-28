---
layout: classic-docs
title: "依存関係のキャッシュ"
short-title: "依存関係のキャッシュ"
description: "依存関係のキャッシュ"
categories: [optimization]
order: 50
---
キャッシュは、ジョブを高速化する手段として最も効果的な方法の 1 つです。CircleCI においては、高コストな処理が必要なデータを過去のジョブから再利用することが可能になっています。

* TOC
{:toc}

初回のジョブを実行すると、その後のジョブインスタンスでは前回と同じ処理が不要になるため、その分高速化される仕組みです。

![データフローのキャッシュ]({{ site.baseurl }}/assets/img/docs/Diagram-v3-Cache.png)

わかりやすい例としては、Yarn や Bundler、Pip といった依存関係管理ツールが挙げられます。 キャッシュから依存関係を読み込むことで、複数のモジュールからなるパッケージであっても、`yarn install` などのコマンドは新たに必要になった依存ファイルのみダウンロードするだけでよくなります。

## キャッシュ設定の例
{:.no_toc}

キャッシュを利用する際のキー設定は簡単です。下記の例では、`pom.xml` ファイルの内容が書き換えられ、そのチェックサムが変わった時にキャッシュを更新します。

{% raw %}

```yaml
    steps:
      - restore_cache:
         keys:
           - m2-{{ checksum "pom.xml" }}
           - m2- # チェックサムが変わった時はこちらが使われる
```
{% endraw %}

## はじめに
{:.no_toc}

CircleCI 2.0 では依存関係のキャッシュの自動化には対応していません。ビルドの高速化を狙ってキャッシュの積極利用を図ろうとしているときは注意が必要です。 ただし、CicleCI 2.0 ではより優れたキャッシュ活用を手動設定で実現できます。

ここでは、そのメリットとデメリットも含め、正しく利用するためのキャッシュの手動設定の仕方について説明しています。
**注：** CircleCI 2.0 のジョブ実行に使われる Docker イメージは、サーバーインフラ上で自動的にキャッシュされる場合があります。

Docker イメージの未変更レイヤー部分を再利用する有償のキャッシュ機能については、[Docker レイヤーキャッシュの利用]({{ site.baseurl }}/ja/2.0/docker-layer-caching/)をご覧ください。

## 概要
{:.no_toc}

キャッシュはキーで指定したファイル群の階層構造を保存するものです。 ジョブを高速化するためのデータを保存するのがキャッシュの目的です。ただし、Npm や Gem、Maven といった依存関係管理ツールのパッケージディレクトリをキャッシュするときのように、キャッシュミスやキャッシュを一から作り直す場合のジョブも問題なく実行されます。

キャッシュは信頼性をとるか (期限切れ、もしくは不正なキャッシュのときは使用しない)、あるいは最大のパフォーマンスを得るか (ビルド時に毎回キャッシュをフルで使う) という、安全と性能のトレードオフを考慮して設定します。

通常は、高速化と引き換えに古い依存関係を残したまま不確実なビルドになる危険を犯すよりも、信頼性を担保できる設定にするのが無難とされます。 そのため理想としては、高い信頼性を維持しながらパフォーマンスを高められるバランスの良い設定を目指します。

## ライブラリのキャッシュ

ジョブ処理における依存関係でキャッシュが最も効果的に働くのは、プロジェクトで使われているライブラリです。 例えば、Python の `pip` や Node.js の `npm` のような依存関係管理ツールがインストールするライブラリをキャッシュするというものです。 これら `pip` や `npm` などの依存関係管理ツールは、依存関係のインストール先となるディレクトリを個別に用意しています。 自身のプロジェクトや環境に応じた詳しい情報については、下記の開発言語ごとのガイドマニュアルとデモプロジェクトをご覧ください。
<https://circleci.com/docs/ja/2.0/demo-apps/>

現在のプロジェクトで必要になるツールがわからない場合でも、Docker イメージが解決してくれます。 CircleCI があらかじめ用意しているビルド済み Docker イメージには、そのプロジェクトで使われている開発言語に合わせて一般的に必要となるツールが含まれています。 たとえば、`circleci/ruby:2.4.1` というビルド済みイメージには git、openssh-client、gzip がプリインストールされています。

## ソースコードのキャッシュ

git リポジトリのキャッシュは、あらゆる場面でメリットが得られます。特にプロジェクトが大規模なほど `checkout` ステップの処理時間の短縮に効果を発揮します。 ソースコードのキャッシュ方法は下記を参考にしてください。

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

ソースコードの更新が頻繁に行われるようなら、指定するファイルをさらに絞り込むと良いでしょう。 そうすることで、現在のブランチや git のリビジョンの変更が頻繁に行われる場合でも、より細やかなソースコードのキャッシュ管理を実現できます。

`restore_cache` で（{% raw %}`source-v1-{{ .Branch }}-{{ .Revision }}`{% endraw %} のように）狭い範囲を指定したときでも、ソースコードのキャッシュはかなり有効に働きます。例えば ([APIでトリガーされたビルド](https://circleci.com/docs/api/v1-reference/#new-build) を用いるなどして) 同一の git リビジョンでビルドを繰り返す場合、もしくは Workflow 内のジョブごとにリポジトリを一度だけ `checkout` する Workflow を使う場合です。

とはいえ、ソースコードのキャッシュの有無によってビルド速度が向上するかどうかは検証した方が良い場合もあります。例えば `restore_cache` するより `git clone` を実行する方が高速な場合も多々あります。

## Workflow におけるキャッシュの指定方法

Workflow では、ジョブ間でキャッシュを共有することができます。異なる複数のジョブにまたがったキャッシュによって、いわゆるレースコンディションが発生しうる可能性があることに注意してください。

キャッシュは書き換え不可です。`node-cache-master` のような特殊なキーに対してキャッシュが一度書き込まれると、さらに書き込むことはできません。 仮に、並列動作するジョブ 1 とジョブ 2 に依存する ジョブ 3 がある、という構成の Workflow ({Job1, Job2} -> Job3) を想定したとき、 それら 3 つのジョブはすべて同じキャッシュキーについて読み書きを行います。

Workflow の実行中は、最後の ジョブ 3 はジョブ 1 もしくはジョブ 2 のどちらかが書き込んだキャッシュを使用します。 ただし、キャッシュは書き換え不可のため、ジョブ 1 とジョブ 2 のどちらかが最初に書き込んだキャッシュを使うことになります。 これは通常期待される動作ではありません。実行時に最初に書き込むのがジョブ 1 になるか、ジョブ 2 になるかがその時々で変わり、一意の結果が得られなくなるためです。 しかしながら、ジョブの依存関係を工夫することで Workflow の結果の一意性を担保することが可能です。ジョブ 1 とジョブ 2 それぞれが異なるキャッシュに書き込み、ジョブ 3 がそのどちらか一方のキャッシュを読み込むようにする、というのが 1 つ。あるいは、ジョブ 1 → ジョブ 2 → ジョブ 3 と、依存関係が 1 対 1 になるように順序を整理する方法もあります。

さらに複雑なケースもあります。{% raw %}`node-cache-{{ checksum "package-lock.json" }}`{% endraw %} のような可変キーで保存し、`node-cache-` のような部分マッチのキーで復元する場合です。 レースコンディションが発生する可能性はあるものの、そうならない場合もあります。 例えば、後の方で実行されるジョブが、継続実行しているジョブのキャッシュを使うようなケースもあります。

ジョブ間で共有するキャッシュでレースコンディションが発生することもあります。 依存リンクのない、ジョブ 1 とジョブ 2 からなる Workflow を考えてみましょう。 ジョブ 2 はジョブ 1 で保存したキャッシュを使うこととします。 ジョブ 1 がキャッシュを保存していても、ジョブ 2 はそのキャッシュを復元することもあれば、キャッシュがないことを検出することもあります。 ジョブ 2 はさらに直前の Workflow からキャッシュを読み込むこともあります。 このケースでは、ジョブ 1 がキャッシュを保存する前に、ジョブ 2 がそれを読み込もうとしていると考えられます。 これを解決するには、ジョブ 1 → ジョブ 2 という関係性の依存 Workflow を作成する方法が挙げられます。 こうすることで、ジョブ 1 が処理を終えるまでジョブ 2 が強制的に待機することになります。

## キャッシュの復元

CircleCI は、`restore_cache` ステップの keys 内で記述している順番通りにキャッシュを復元しようとします。 キャッシュキーはプロジェクトに名前空間をもち、検索時は文字列の前方一致となります。 最初にマッチしたキーのキャッシュ内容が復元され、 複数マッチした場合は最も新しく生成されたキャッシュが使用されます。

2 つのキーを用いた例は下記の通りです。

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

keys 内の 2 番目の項目が 1 番目よりも短いのは、その方が現在の状態と生成された最新のキャッシュとの間で差分が生じやすいためです。 npm のような依存関係管理ツールを実行すると、古くなった依存関係を見つけ、更新します。 これは **部分キャッシュリストア** とも呼ばれます。

### キャッシュのクリア
{:.no_toc}

開発言語や依存関係管理ツールのバージョンアップ時などにキャッシュをクリアしたいときは、先述のサンプルコードにあったような命名規則にしたうえで、`config.yml` に記述したキャッシュキー名を変え、コミットします。

<div class="alert alert-info" role="alert">
<b>ヒント：</b>キャッシュは書き換え不可のため、キャッシュキー名の先頭にバージョン名などを入れておくと好都合です。例えば <code class="highlighter-rouge">v1-...</code> のようにします。 こうすると、そのバージョン名の数字を増やすだけでキャッシュ全体を再生成できることになります。
</div>

下記のような状況では、キャッシュキーの名前を変えることによるキャシュのクリアを検討してみてください。

* npm コマンドがバージョンアップするなど、依存関係管理ツールのバージョンが変更になった
* Ruby がバージョンアップするなど、開発言語のバージョンが変わった
* プロジェクトから依存関係が削除された

<div class="alert alert-info" role="alert">
  <b>ヒント:</b> 特別なキャラクターや予約されたキャラクターをキャッシューに使う際はビルドの際に問題が発生する可能性があるため注意してください。(例:
  <code class="highlighter-rouge">:, ?, &, =, /, #</code>) 一般的にキャッシュのプリフィックスキーは [a-z][A-Z] の範囲のキャラクターを使うようにします。
</div>

## 依存関係のキャッシュにおける基礎

CircleCI 2.0 で利用できる、強力でカスタマイズ性の高い依存関係のキャッシュを活用するには、何を、どうキャッシュするかという明確な目的をもっていなくてはなりません。具体例は CircleCI の設定方法のページ内にある [キャッシュの保存]({{ site.baseurl }}/ja/2.0/configuration-reference/#save_cache) のセクションをご覧ください。

ファイルやディレクトリのキャッシュを保存するには、`.circleci/config.yml` ファイルで指定している ジョブに `save_cache` ステップを追加します。

```yaml
    steps:
      - save_cache:
          key: my-cache
          paths:
            - my-file.txt
            - my-project/my-dependencies-directory
```

ディレクトリはジョブにおける `working_directory` への相対パス、または絶対パスを指定します。

**注：**
特別な [`persist_to_workspace`]({{ site.baseurl }}/ja/2.0/configuration-reference/#persist_to_workspace) ステップとは違って `save_cache` も `restore_cache` も `paths` キーに対してワイルドカードによるグロブをサポートしません。

## キーとテンプレートを使用する

キャッシュキーにテンプレート値を埋め込む場合、キャッシュの保存に制限がかかることに注意してください。CircleCI のストレージにキャッシュをアップロードするためには時間がかかります。 ビルドのたびに新しいキャッシュを生成したくないときは、変更があった場合にのみ新しいキャッシュを生成するキーを指定します。

まず初めに、プロジェクトにおいて一意となる値のキーを用いて、キャッシュを保存・復元するタイミングを決めます。 ビルド番号が増えたとき、リビジョンが上がったとき、依存マニフェストファイルのハッシュ値が変わったときなどが考えられます。

いくつかのキャッシュの設定例を下記に挙げてみます。

* {% raw %}`myapp-{{ checksum "package-lock.json" }}`{% endraw %} - `package-lock.json` の内容が変わるたびにキャッシュが毎回生成されます。このプロジェクトの別のブランチも、同じキャッシュキーを生成します
* {% raw %}`myapp-{{ .Branch }}-{{ checksum "package-lock.json" }}`{% endraw %} - `package-lock.json` の内容が変わるたびにキャッシュが毎回生成されます。このプロジェクトの別のブランチは、それごとに異なるキャッシュキーを生成します
* {% raw %}`myapp-{{ epoch }}`{% endraw %} - ビルドごとに異なるキャッシュキーを生成します

ステップの処理では、以上のようなテンプレートの部分は実行時に値が置き換えられ、その置換後の文字列が`キー`の値として使われます。 CirlceCI のキャッシュ`キー`で利用可能なテンプレートを下記の表にまとめました。

テンプレート | 解説
----|----------
{% raw %}`{{ .Branch }}`{% endraw %} | 現在ビルドを実行しているバージョン管理システムのブランチ名。
{% raw %}`{{ .BuildNum }}`{% endraw %} | 実行中のビルドにおける CircleCI のジョブ番号。
{% raw %}`{{ .Revision }}`{% endraw %} | 現在ビルドを実行しているバージョン管理システムのリビジョン。
{% raw %}`{{ .Environment.variableName }}`{% endraw %} | `variableName` で示される環境変数 ([定義済み環境変数]({{ site.baseurl }}/ja/2.0/env-vars/)、もしくは[コンテキスト]({{ site.baseurl }}/ja/2.0/contexts)を指定できますが、ユーザー定義の環境変数は使えません)。
{% raw %}`{{ checksum "filename" }}`{% endraw %} | filename で指定したファイル内容の SHA256 ハッシュを Base64 エンコードしたもの。ファイル内容に変更があるとキャッシュキーも新たに生成されます。 ここで指定できるのはリポジトリでコミットされているファイルに限られるため、 `package-lock.json` や `pom.xml`、もしくは `project.clj` などの依存関係を定義しているマニフェストファイルを使うことも検討してください。 また、`restore_cache` から `save_cache` までの処理でファイル内容が変わらないようにします。そうしないと `restore_cache` のタイミングで使われるファイルとは異なるキャッシュキーを元にキャッシュが保存されることになります。
{% raw %}`{{ epoch }}`{% endraw %} | 協定世界時 (UTC) における 1970 年 1 月 1 日午前 0 時 0 分 0 秒からの経過秒数。POSIX 時間や UNIX 時間と同じです。
{% raw %}`{{ arch }}`{% endraw %} | OS と CPU の種類。 OS や CPU アーキテクチャに合わせてコンパイル済みバイナリをキャッシュするような場合に用います。`darwin amd64` あるいは `linux amd64` のような文字列になります。 CircleCI で利用可能な CPU については[こちら]({{ site.baseurl }}/ja/2.0/faq/#which-cpu-architectures-does-circleci-support)を参照してください
{: class="table table-striped"}

**注：** キャッシュに対してユニークな識別子を定義する際には、{% raw %}`{{ epoch }}`{% endraw %} のような厳密すぎる値になるテンプレートをむやみに使わないよう注意してください。 {% raw %}`{{ .Branch }}`{% endraw %} や {% raw %}`{{ checksum "filename" }}`{% endraw %} といった汎用性の高い値になるテンプレートを使うと、使われるキャッシュの数は増えます。 これについては、以降で説明するようにトレードオフの関係にあると言えます。

### キャッシュの保存・復元の参考例
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
      # 複数のキャッシュを作ってキャッシュヒットしやすくします

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
      # 複数のキャッシュを作ってキャッシュヒットしやすくします

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

**部分キャッシュリストアは安全？**
はい。(条件付き)

Bundler は明示的に指定されないシステム上の gem を扱うことから、部分キャッシュが一意に決まることがなく、部分キャッシュリストアは信頼性の点で懸念があります。

この問題を解決するには、キャッシュから依存関係を復元する前に Bundler を clean するステップを追加します。

{% raw %}

```yaml
steps:
  - run: bundle install & bundle clean
  - restore_cache:
      keys:
        # lock ファイルが変更されると、より広範囲にマッチする 2 番目以降のパターンがキャッシュの復元に使われます
        - v1-gem-cache-{{ arch }}-{{ .Branch }}-{{ checksum "Gemfile.lock" }}
        - v1-gem-cache-{{ arch }}-{{ .Branch }}-
        - v1-gem-cache-{{ arch }}-
  - save_cache:
      paths:
        - ~/.bundle
      key: v1-gem-cache-{{ arch }}-{{ .Branch }}-{{ checksum "Gemfile.lock" }}
```

{% endraw %}

#### Gradle (Java)
{:.no_toc}

**部分キャッシュリストアは安全？**
はい。

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

**部分キャッシュリストアは安全？**
はい。

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

**部分キャッシュリストアは安全？**
はい。(NPM5 以降)

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

**部分キャッシュリストアは安全？**
はい。 (要 Pipenv)

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

**部分キャッシュリストアは安全？**
はい。

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

## 制限

`save_cache` で作られたキャッシュは最大で30日間保存されます。

## キャッシュのメリットとデメリット

依存関係のスマートな制御機能を実装している開発言語では、ビルド時のパフォーマンス上の要因からキャッシュを一から作り直すことは避け、部分キャッシュリストアを推奨するケースがあります。 キャッシュを一から作り直すには、依存関係をすべて再インストールする必要があり、パフォーマンスの低下にもつながります。 これを避けるためには、一から作り直すのではなく、依存関係の大部分を古いキャッシュから復元する方法が有効です。

一方で、そうではない別の開発言語においては、部分キャッシュは宣言済みの依存関係と矛盾するコード依存を生むリスクをはらんでおり、キャッシュなしでビルドを実行するまでそれをリセットできない問題もあります。 依存関係がそれほど頻繁に変わらないのなら、一からキャッシュを作り直すためのキーをリストの最初に入れてみてください。 その状態でビルドにどれだけ時間がかかるか検証します。 キャッシュを作り直した (*キャッシュミス* ともみなせる) 場合にパフォーマンスが大幅に低下することが確かであれば、部分キャッシュリストアを行うキーの追加を検討してください。

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

## 関連情報
{:.no_toc}

[最適化]({{ site.baseurl }}/ja/2.0/optimizations/)
