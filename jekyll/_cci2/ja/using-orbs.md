---
layout: classic-docs
title: "Orbs を使う"
short-title: "Using Orbs"
description: "CircleCI Orbs 入門"
categories:
  - getting-started
order: 1
---
ここでは [Orb]({{ site.baseurl }}/ja/2.0/orb-intro/) の基礎的なインポートして使用する例とそれに関連する要素について、下記の流れで解説しています。

- TOC
{:toc}

## はじめに

Orbs は CircleCI を手早く使い始めるのに便利なコンフィグパッケージです。 Orbs はコンフィグをプロジェクト間で共有したり、標準化を行ったり、簡便にしたりするのに役立ちます。 最適なコンフィグのサンプルとして Orbs を活用することもできます。 今すぐに使える Orbs を [CircleCI Orbs レジストリ](https://circleci.com/orbs/registry/) でご覧ください。

`orbs` キーを用いることで、バージョン 2.1 の [`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/#orbs-requires-version-21) ファイルのなかで Orb を使えるようになります。 下記は `circleci` という名前空間にある [`hello-build` orb](https://circleci.com/orbs/registry/orb/circleci/hello-build) を呼び出している例です。

```yaml
version: 2.1

orbs:
    hello: circleci/hello-build@0.0.5

workflows:
    "Hello Workflow":
        jobs:
          - hello/hello-build
```

**注 :** CircleCI 2.1 以前のバージョンで作成されたプロジェクトでは、[Build Processing 設定]({{ site.baseurl }}/ja/2.0/build-processing/) を有効にすることで `orbs` キーを使えるようになります。

Orbs は下記の要素で構成されています。

- コマンド
- ジョブ
- Executors 

### Commands
{:.no_toc}

steps の再利用を容易にする仕組みがコマンドです。ジョブのなかでパラメーター付きで呼び出すことができます。 下記の例のように `sayhello` というコマンドを呼び出すとき、`to` で指定したパラメーターを渡すことができます。

```yaml
version: 2.1
jobs:
  myjob:
    docker:
      - image: "circleci/node:9.6.1"
    steps:
      - myorb/sayhello:
          to: "Lev"
```

### Jobs
{:.no_toc}

ジョブは 2 つのパートからなります。steps の定義と、それらを処理する実行環境の定義です。 ジョブはビルド設定もしくは orb の中で定義され、それぞれの `jobs` キーの直下、もしくは外部にある orb の中でジョブ名を定義できます。

その後、`config.yml` ファイル内の Workflow から、サブキーとして必要なパラメーターを渡してジョブを呼び出す形とします。

### Executors
{:.no_toc}

Executors はジョブ内の steps を実行するための環境を定義します。 設定で `job` を宣言する際、実行環境（`docker`、`machine`、`macos` などの）の種類を定義したり、それらの環境における下記のようなパラメーターを指定したりするのに使います。

- データ保存に使う環境変数
- 使用するシェル
- 使用する `resource_class` のサイズ

特定の `jobs` 以外のところで Executor を宣言しても、その宣言のスコープ内であれば他の全てのジョブにおいて有効です。こうすることで、1 つの Executor の宣言を複数のジョブで共有することが可能になります。

Executor を宣言し定義する際には下記のキーが使えます（このうちいくつかは `job` の宣言時にも使えます）。

- `docker`、`machine`、`macos` のうちいずれか
- `environment`
- `working_directory`
- `shell`
- `resource_class`

下記は Executor を使った簡単なサンプルです。

```yaml version: 2.1 executors: my-executor: docker: - image: circleci/ruby:2.4.0

jobs: my-job: executor: my-executor steps: - run: echo outside the executor ```

Notice in the above example that the executor `my-executor` is passed as the single value of the key `executor`. Alternatively, you can pass `my-executor` as the value of a `name` key under `executor`. This method is primarily employed when passing parameters to executor invocations. An example of this method is shown in the example below.

    yaml
    version: 2.1
    jobs:
      my-job:
        executor:
          name: my-executor
        steps:
          - run: echo outside the executor

## キーコンセプト

Before using orbs, you should first familiarize yourself with some basic core concepts of orbs and how they are structured and operate. Gaining a basic understanding of these core concepts will enable you to leverage orbs and use them easily in your own environments.

### 開発版と リリース版の違い
{:.no_toc}

Orbs may be published either as ```myorbnamespace/myorb@dev:foo``` or as a semantically versioned production orb `mynamespace/myorb@0.1.3`. Development orbs are mutable and expire after 90 days. Production orbs are immutable and durable.

### 認証済みと サードパーティ製の違い
{:.no_toc}

CircleCI has available a number of individual orbs that have been tested and certified to work with the platform. These orbs will be treated as part of the platform; all other orbs are considered 3rd-party orbs. **Note:** The Admin of your org must opt-in to 3rd-party uncertified orb usage on the Settings > Security page for your org.

<aside class="notice">
あらゆる Orbs はオープンです。つまり、誰でも利用でき、誰でもそのソースコードを参照できます。 
</aside>

## 設計思想

Before using orbs, you may find it helpful to understand the various design decisions and methodologies that were used when these orbs were designed. Orbs were designed with the following considerations:

- Orbsは透過的であること - Orb を実行できるということは、自分も他の誰かもそのソースを見ることができるということ。
- 説明用のメタデータが使える - どのキーにおいても ```description``` キーを記述でき、Orb でもその一番上に `description` を記述しておける。
- リリース版の Orbs は必ずセマンティック バージョニングされる - 開発版の Orbs については `dev:` から始まるバージョン命名規則が用いられる。
- Production orbs are immutable - Once an orb has been published to a semantic version, the orb cannot be changed. これは、オーケストレーションツールの核となる部分における意図しない破綻や挙動の変化を防ぐ。
- レジストリは（1 インストールにつき）1 つ限り - circleci.com も含め、CircleCI のインストールごとに所有できる Orbs のレジストリは 1 つのみとなる。
- Org 管理者がリリース版の Orbs をパブリッシュし、 管理者ではないメンバーが開発版の Orbs をパブリッシュする - 名前空間は Org が管理するものとし、 Org の管理者だけがリリース版の Orb をパブリッシュ・運用できる。 開発版の Orbs のパブリッシュは組織内の全メンバーができるものとする。

## See Also
{:.no_toc}

- Orbs の具体的な使用方法については「[Orbs とは]({{site.baseurl}}/ja/2.0/orb-intro/)」をご覧ください。
- 新たに Orb を作成する詳しい手順は「[Orbs を作成する]({{site.baseurl}}/ja/2.0/creating-orbs/)」をご覧ください。
- 再利用が可能な Orbs、コマンド、パラメータ、Executors の詳しい例については「[コンフィグを再利用する]({{site.baseurl}}/ja/2.0/reusing-config/)」をご覧ください。