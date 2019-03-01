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

When you declare an executor in a configuration outside of `jobs`, you can use these declarations for all jobs in the scope of that declaration, enabling you to reuse a single executor definition across multiple jobs.

An executor definition has the following keys available (some of which are also available when using the `job` declaration):

- `docker`, `machine`, or `macos`
- `environment`
- `working_directory`
- `shell`
- `resource_class`

The example below shows a simple example of using an executor:

    version: 2.1
    executors:
      my-executor:
        docker:
          - image: circleci/ruby:2.4.0
    
    jobs:
      my-job:
        executor: my-executor
        steps:
          - run: echo outside the executor
     ```
    
    Notice in the above example that the executor `my-executor` is passed as the single value of the key `executor`. Alternatively, you can pass `my-executor` as the value of a `name` key under `executor`. This method is primarily employed when passing parameters to executor invocations. An example of this method is shown in the example below.
    
    

jobs: my-job: executor: name: my-executor steps: - run: echo outside the executor ```

## Key Concepts

Before using orbs, you should first familiarize yourself with some basic core concepts of Orbs and how they are structured and operate. Gaining a basic understanding of these core concepts will enable you to leverage Orbs and use them easily in your own environments.

### Development vs. Production Orbs

{:.no_toc}

Orbs may be published either as ```myorbnamespace/myorb@dev:foo``` or as a semantically versioned production orb `mynamespace/myorb@0.1.3`. Development orbs are mutable and expire after 90 days. Production Orbs are immutable and durable.

### Certified vs. 3rd-Party Orbs

{:.no_toc}

CircleCI has available a number of individual orbs that have been tested and certified to work with the platform. These orbs will be treated as part of the platform; all other orbs are considered 3rd-party orbs. **Note:** The Admin of your org must opt-in to 3rd-party uncertified orb usage on the Settings > Security page for your org.

<aside class="notice">
All orbs are open, meaning that anyone can use them and see their source. 
</aside>

## Design Methodology

Before using orbs, you may find it helpful to understand the various design decisions and methodologies that were used when these Orbs were designed. Orbs were designed with the following considerations:

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