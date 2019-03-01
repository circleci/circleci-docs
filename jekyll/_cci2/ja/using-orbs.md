---
layout: classic-docs
title: "Orbs を使う"
short-title: "Orbs を使う"
description: "CircleCI Orbs 入門"
categories:
  - getting-started
order: 1
---
ここでは [Orb]({{ site.baseurl }}/2.0/orb-intro/) の基礎的なインポートの仕方とそれに関連する要素について、下記の流れで解説しています。

- 目次 {:toc}

## はじめに

Orbs は CircleCI を手早く使い始めるのに有用な設定用のパッケージです。 Orbs は設定をプロジェクト間で共有したり、設定の標準化を行ったり、設定方法を簡便にしたりするのに役立ちます。 最適な設定方法のサンプルとして Orbs を活用することもできます。 今すぐに使える Orbs を [CircleCI Orbs レジストリ](https://circleci.com/orbs/registry/) でご覧ください。

`orbs` キーを用いることで、バージョン 2.1 の [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/#orbs-requires-version-21) ファイルのなかで Orb を使えるようになります。 下記は `circleci` という名前空間にある [`hello-build`](https://circleci.com/orbs/registry/orb/circleci/hello-build) という Orb を呼び出している例です。

    version: 2.1
    
    orbs:
        hello: circleci/hello-build@0.0.5
    
    workflows:
        "Hello Workflow":
            jobs:
              - hello/hello-build
    

**※**バージョン 2.1 以前に作成したプロジェクトで Orbs を利用したいときは、[設定で Build Processing を有効化]({{ site.baseurl }}/2.0/build-processing/)したうえで `orbs` キーを呼び出します。

Orbs は下記の要素で構成されています。

- コマンド
- ジョブ
- Executor 

### コマンド

{:.no_toc}

steps の再利用を容易にする仕組みがコマンドです。ジョブのなかでパラメーター付きで呼び出すことができます。 下記の例のように `sayhello` というコマンドを呼び出すとき、`to` で指定したパラメーターを渡すことができます。

    jobs
      myjob:
        docker:
          - image: "circleci/node:9.6.1"
        steps:
          - myorb/sayhello:
              to: "Lev"
    

### ジョブ

{:.no_toc}

ジョブは 2 つのパートからなります。steps の定義と、それらを処理する実行環境の定義です。 ジョブはビルド設定の中、もしくは外部にある Orb の中で定義し、それぞれの `jobs` キーの直下でジョブ名を定義しておきます。

その後、`config.yml` ファイル内の Workflow から、サブキーとして必要なパラメーターを渡してジョブを呼び出す形とします。

### Executor

{:.no_toc}

Executor はジョブ内の steps を実行するための環境を定義します。 設定ファイルで `job` を宣言する際、実行環境（`docker`、`machine`、`macos`などの）の種類を定義したり、それらの環境における下記のようなパラメーターを指定したりするのに使います。

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

    version: 2.1
    executors:
      my-executor:
        docker:
          - image: circleci/ruby:2.4.0
    
    jobs:
      my-job:
        executor: my-executor
        steps:
          - run: echo Executor の外です
     ```
    
    この例では「my-executor」という Executor は「executor」キーの単独の値として渡すこととしています。
     もしくは「executor」の後に「name」キーを指定し、その値として「my-executor」を渡してもかまいません。
     こちらの方が Executor のパラメーター付き呼び出しにおいてよく使われる手法です。 例えば下記のように記述します。
    
    

jobs: my-job: executor: name: my-executor steps: - run: echo outside the executor ```

## キーコンセプト

Orbs を使い始める前に、まずは Orbs の軸となる基本コンセプトと、Orbs がどのように作られ、動作しているのかについて学んでおきましょう。 理解を深めることで、自身のプロジェクトでより簡単に Orbs を使えるようになり、活用も広がります。

### 開発版と リリース版の違い

{:.no_toc}

開発版の Orbs は下記のような名前でパブリッシュされます。 ```myorbnamespace/myorb@dev:foo``` これに対してリリース版はセマンティック・バージョニングされた `mynamespace/myorb@0.1.3` のような名前になります。 開発版の Orbs は内容が変更されることがあり、作成から 90 日後に期限切れとなります。 リリース版の Orbs は変更されることはなく、公開され続けることになります。

### 認証済みと サードパーティ製の違い

{:.no_toc}

CircleCI では該当プラットフォームにおける動作テスト・認証が済んだ Orbs を多数用意しています。 こうした Orbs についてはプラットフォームの一部として扱われることになりますが、それ以外はすべてサードパーティ製の Orbs とみなされます。 **※**サードパーティ製の Orbs を利用するには、組織において CircleCI の SETTINGS → Security ページで Orb Security Settings を「Yes」にする必要があります。

<aside class="notice">
あらゆる Orbs はオープンです。つまり、誰でも利用でき、誰でもそのソースコードを参照できます。 
</aside>

## 設計思想

Orbs を使うにあたり、Orbs の開発時に用いられた設計方針や手法が理解の一助となるでしょう。 Orbs は下記のような検討を経て設計されました。

- Orbs are transparent - If you can execute an orb, you and anyone else can view the source of that orb.
- Metadata is available - Every key can include a ```description``` key and an orb may include a `description` at the top level.
- Production orbs are always semantic versioned (semver'd) - CircleCI allows development orbs that have versions that start with `dev:`.
- Production orbs are immutable - Once an Orb has been published to a semantic version, the orb cannot be changed. This prevents unexpected breakage or changing behaviors in core orchestration.
- One registry (per install) - Each installation of CircleCI, including circleci.com, has only one registry where orbs can be kept.
- Organization Admins publish production orbs. Organization members publish development orbs - All namespaces are owned by an organization. Only the admin(s) of that organization can publish/promote a production orb. All organization members can publish development orbs.

## 関連情報

{:.no_toc}

- Refer to [Orb Introduction]({{site.baseurl}}/2.0/orb-intro/), for a high-level overview.
- Refer to [Creating Orbs]({{site.baseurl}}/2.0/creating-orbs/), where you will find step-by-step instructions on how to create your own orb.
- Refer to [Reusing Config]({{site.baseurl}}/2.0/reusing-config/) for more detailed examples of reusable orbs, commands, parameters, and executors.