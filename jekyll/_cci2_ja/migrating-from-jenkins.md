---
layout: classic-docs
title: Jenkins との相違点
categories:
  - migration
description: Jenkins との相違点
---

Jenkins を長年使用されていた方向けに、CircleCI に移行するうえで把握しておきたい基本的なコンセプトについて、以下のセクションに沿って説明します。

* 目次
{:toc}

## クイックスタート
{: #quick-start }
{:.no_toc}

CircleCI は、Jenkins とは大きく異なる製品であり、CI および CD の管理方法についても多くの相違点が見られます。 ただし、Jenkins のビルドの基本的な機能を CircleCI に移行するだけなら、それほど時間はかかりません。 すばやく移行に取り掛かれるよう、以下のいずれかをお試しください。

1. **Getting Started:** Run your first green build on CircleCI using the [getting started video and steps]({{ site.baseurl }}/2.0/).

2. **Execute Shell のコマンドをコピー & ペーストする:** Jenkins 内のプロジェクトをそのまま複製して使用できる場合は、以下の内容のファイルを `config.yml` という名前でプロジェクトの `.circleci/` ディレクトリに追加します。

```yaml
    steps:
      - run: "Add any bash command you want here"
      - run:
          command: |
            echo "Arbitrary multi-line bash"
            echo "Copy-paste from 'Execute Shell' in Jenkins"
```

いくつかのプログラムとユーティリティは [CircleCI イメージにプリインストール]({{ site.baseurl }}/ja/2.0/circleci-images/#プリインストール-ツール)されていますが、他にビルドに必要な項目があれば `run` `step` でインストールする必要があります。 プロジェクトの依存関係は、次回のビルドに備え、`save_cache` と `restore_cache` `steps` を使用して[キャッシュ]({{ site.baseurl }}/ja/2.0/caching/)することができます。 こうしておくと、全体のダウンロードとインストールが一度だけで済むようになります。

**手動構成:** Jenkins の Execute Shell 以外のプラグインまたはオプションを使用してビルド ステップを実行していた場合は、Jenkins からビルドを手動で移植する必要があります。 すべての CircleCI 構成キーの詳細については、「[CircleCI を設定する]({{ site.baseurl }}/ja/2.0/configuration-reference/)」を参照してください。

## ジョブの構成
{: #job-configuration }

通常、Jenkins のプロジェクトは Jenkins の Web UI で設定され、その設定は Jenkins サーバーのファイル システムに保存されています。 そのため、チームや組織内で構成情報を共有することは困難です。 GitHub または Bitbucket リポジトリをクローンしても、Jenkins に保存された情報はコピーできません。 また、Jenkins サーバーに設定を保存すると、すべての Jenkins サーバーを定期的にバックアップする必要が生じます。

CircleCI のビルドに関する設定の大部分は、各プロジェクトのルートにある `.circleci/config.yml` という名前のファイルに保存されます。 CI の構成も他のソース コードと同様に扱われるため、バックアップや共有が簡単に行えます。 ソース コードに格納すべきではないシークレットなどのごく一部のプロジェクト設定は、暗号化された状態で CircleCI のアプリケーションに保存されます。

### ビルド マシンへのアクセス
{: #access-to-build-machines }
{:.no_toc}

Jenkins サーバーの管理は、運用部門のメンバーやチームに委ねられているケースがほとんどです。 その担当者は、依存関係のインストールやトラブルシューティングなど、CI メンテナンスに関するさまざまなタスクに日々追われています。

It is never necessary to access a CircleCI environment to install dependencies because every build starts in a fresh environment where custom dependencies must be installed automatically (ensuring that the entire build process is truly automated). Troubleshooting in the execution environment can be done easily and securely by any developer using CircleCI’s [SSH feature]({{ site.baseurl }}/2.0/ssh-access-jobs/).

If you install CircleCI on your own hardware, the divide between the host OS (at the “metal”/VM level) and the containerized execution environments can be extremely useful for security and ops (see Your Builds in Containers below). 運用部門のメンバーは、ビルドに支障をきたすことなくホスト OS 上で必要な作業を行うことができ、開発者にアクセス権を付与する必要はありません。 また開発者は、CircleCI の SSH 機能を使用して、運用に支障をきたすことなく任意のコンテナレベルでビルドをデバッグできます。

## Web UI
{: #web-ui }
{:.no_toc}

CircleCI は、高速かつ魅力的なユーザー エクスペリエンスを提供するシングルページ Web アプリケーションです。 CircleCI のチームは CircleCI の UI を継続的に更新して改善を図っています。 CircleCI のモダンな UI はたいへんご好評を頂いておりますが、日々変わり続けるテクノロジーやユーザーのニーズを踏まえ、チームでは常に UI の向上に努めています。

## プラグイン
{: #plugins }

You’ve almost certainly worked with plugins if you’ve used Jenkins. These plugins are Java-based like Jenkins itself and a bit complicated. They interface with any of several hundred possible extension points in Jenkins and can generate web views using JSP-style tags and views. You also have to use plugins to do almost anything with Jenkins. Even checking out a Git repository requires a plugin.

All core CI functionality is built into CircleCI. Features such as checking out source from GitHub or Bitbucket, running builds and tests with your favorite tools, parsing test output, and storing artifacts are first-class and plugin-free. When you do need to add custom functionality to your builds and deployments, you can do so with a couple snippets of bash in appropriate places.

## 分散ビルド
{: #distributed-builds }

It is possible to make a Jenkins server distribute your builds to a number of “agent” machines to execute the jobs, but this takes a fair amount of work to set up. According to Jenkins’ [docs on the subject](https://wiki.jenkins-ci.org/display/JENKINS/Distributed+builds), “Jenkins is not a clustering middleware, and therefore it doesn't make this any easier.”

CircleCI distributes builds to a large fleet of builder machines by default. If you use SaaS-based circleci.com, then this just happens for you, your builds don’t queue unless you are using all the build capacity in your plan, and that’s that. If you use CircleCI installed in your own environment, then you will appreciate that CircleCI does manage your cluster of builder machines without the need for any extra tools.

## コンテナと Docker
{: #containers-and-docker }

Talking about containerization in build systems can be complicated because arbitrary build and test commands can be run inside of containers as part of the implementation of the CI system, and some of these commands may themselves involve running containers. Both of these points are addressed below. Also note that Docker is an extremely popular tool for running containers, but it is not the only one. Both the terms “container” (general) and “Docker” (specific) will be used.


### ビルド内のコンテナ
{: #containers-in-your-builds }
{:.no_toc}


If you use a tool like Docker in your workflow, you will likely also want to run it on CI. Jenkins does not provide any built-in support for this, and it is up to you to make sure it is installed and available within your execution environment.

Docker has long been one of the tools that is pre-installed on CircleCI, so you can access Docker in your builds by adding `docker` as an executor in you `config.yml` file. See the [Choosing an Executor Type]({{ site.baseurl }}/2.0/executor-types/) and [Docker]({{ site.baseurl }}/2.0/build/#docker) documents for more info.

### コンテナ内のビルド
{: #your-builds-in-containers }
{:.no_toc}


Jenkins normally runs your build in an ordinary directory on the build server, which can cause lots of issues with dependencies, files, and other state gathering on the server over time. There are plugins that offer alternatives, but they must be manually installed.


CircleCI runs all Linux and Android builds in dedicated containers, which are destroyed immediately after use (macOS builds run in single-use VMs). This creates a fresh environment for every build, preventing unwanted cruft from getting into builds. One-off environments also promote a disposable mindset that ensures all dependencies are documented in code and prevents “snowflake” build servers.


If you run builds on your own hardware with [CircleCI](https://circleci.com/enterprise/), running all builds in containers allows you to heavily utilize the hardware available to run builds.

## 並列処理
{: #parallelism }

It is possible to run multiple tests in parallel on a Jenkins build using techniques like multithreading, but this can cause subtle issues related to shared resources like databases and filesystems.

CircleCI lets you increase the parallelism in any project’s settings so that each build for that project uses multiple containers at once. Tests are evenly split between containers allowing the total build to run in a fraction of the time it normally would. Unlike with simple multithreading, tests are strongly isolated from each other in their own environments. You can read more about parallelism on CircleCI in the [Running Tests in Parallel]({{ site.baseurl }}/2.0/parallelism-faster-jobs/) document.

## Jenkinsfile converter
{: #jenkinsfile-converter }
CircleCI manages a Jenkinsfile Converter, a web tool that allows you to easily convert a Jenkinsfile to a CircleCI `config.yml` file, to help you get started with CircleCI quickly and easily. Access [Jenkins Converter](https://circleci.com/developer/tools/jenkins-converter).

**Note:** The converter only supports declarative Jenkinsfiles. The number of supported plug-ins and steps will be expanded, this preview of the converter may help you to convert half of the Jenkinsfile to make it easier for you to get started with CircleCI.

Instructions on how to use the Jenkinsfile converter, its features, and limitations are located in the [Introduction to Jenkins Converter documentation](https://circleci.com/docs/2.0/jenkins-converter/).
