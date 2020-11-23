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

## Quick start
{:.no_toc}

CircleCI は、Jenkins とは大きく異なる製品であり、CI および CD の管理方法についても多くの相違点が見られます。ただし、Jenkins のビルドの基本的な機能を CircleCI に移行するだけなら、それほど時間はかかりません。 すばやく移行に取り掛かれるよう、以下のいずれかをお試しください。

1. **入門用資料を確認する:** [入門用のビデオや手順]({{ site.baseurl }}/2.0/)を参照しながら、CircleCI 2.0 で最初のビルドを実行し、成功させましょう。

2. **Execute Shell のコマンドをコピー & ペーストする:** Jenkins 内のプロジェクトをそのまま複製して使用できる場合は、以下の内容のファイルを `config.yml` という名前でプロジェクトの `.circleci/` ディレクトリに追加します。

```yaml
    steps:
      - run: "Add any bash command you want here"
      - run:
          command: |
            echo "Arbitrary multi-line bash"
            echo "Copy-paste from 'Execute Shell' in Jenkins"
```

Some programs and utilities are [pre-installed on CircleCI Images]({{ site.baseurl }}/2.0/circleci-images/#pre-installed-tools), but anything else required by your build must be installed with a `run` `step`. プロジェクトの依存関係は、次回のビルドに備え、`save_cache` と `restore_cache` `steps` を使用して[キャッシュ]({{ site.baseurl }}/2.0/caching/)することができます。こうしておくと、全体のダウンロードとインストールが一度だけで済むようになります。

**手動構成:** Jenkins の Execute Shell 以外のプラグインまたはオプションを使用してビルド ステップを実行していた場合は、Jenkins からビルドを手動で移植する必要があります。 すべての CircleCI 構成キーの詳細については、「[CircleCI を設定する]({{ site.baseurl }}/2.0/configuration-reference/)」を参照してください。

## Job configuration

通常、Jenkins のプロジェクトは Jenkins の Web UI で設定され、その設定は Jenkins サーバーのファイル システムに保存されています。 そのため、チームや組織内で構成情報を共有することは困難です。 GitHub または Bitbucket リポジトリをクローンしても、Jenkins に保存された情報はコピーできません。 また、Jenkins サーバーに設定を保存すると、すべての Jenkins サーバーを定期的にバックアップする必要が生じます。

CircleCI のビルドに関する設定の大部分は、各プロジェクトのルートにある `.circleci/config.yml` という名前のファイルに保存されます。 CI の構成も他のソース コードと同様に扱われるため、バックアップや共有が簡単に行えます。 ソース コードに格納すべきではないシークレットなどのごく一部のプロジェクト設定は、暗号化された状態で CircleCI のアプリケーションに保存されます。

### Access to build machines
{:.no_toc}

Jenkins サーバーの管理は、運用部門のメンバーやチームに委ねられているケースがほとんどです。 その担当者は、依存関係のインストールやトラブルシューティングなど、CI メンテナンスに関するさまざまなタスクに日々追われています。

CircleCI では、カスタムの依存関係が自動的にインストールされる (ビルド プロセス全体が確実に自動化される) フレッシュな環境で各ビルドが開始されるため、依存関係をインストールするために CircleCI 環境にアクセスする必要はありません。 また、ビルド環境でのトラブルシューティングは、CircleCI の [SSH 機能]({{ site.baseurl }}/2.0/ssh-access-jobs/)を使用して、開発者が簡単かつ安全に実行できます。

CircleCI を独自のハードウェアにインストールする場合、(「物理」レベルまたは VM レベルの) ホスト OS とコンテナ化されたビルド環境を分けておくと、セキュリティと運用の面できわめて有用です (詳細については、以下のセクション「コンテナ内のビルド」を参照してください)。 運用部門のメンバーは、ビルドに支障をきたすことなくホスト OS 上で必要な作業を行うことができ、開発者にアクセス権を付与する必要はありません。 また開発者は、CircleCI の SSH 機能を使用して、運用に支障をきたすことなく任意のコンテナレベルでビルドをデバッグできます。

## Web UI
{:.no_toc}

CircleCI は、高速かつ魅力的なユーザー エクスペリエンスを提供するシングルページ Web アプリケーションです。 CircleCI のチームは CircleCI の UI を継続的に更新して改善を図っています。 CircleCI のモダンな UI はたいへんご好評を頂いておりますが、日々変わり続けるテクノロジーやユーザーのニーズを踏まえ、チームでは常に UI の向上に努めています。

![]({{ site.baseurl }}/assets/img/docs/circle-ui.png)

## プラグイン

Jenkins を使用しているなら、ほとんどの場合でプラグインも使用されています。 Jenkins のプラグインは Jenkins 本体と同様に Java ベースで、やや複雑な作りになっています。 Jenkins 内の数百もの拡張ポイントとやり取りを行い、JSP 形式のタグやビューを使用して Web ビューを生成します。 Jenkins で何か作業を行うときも、たいていの場合はプラグインを使用する必要があります。 また、Git リポジトリをチェック アウトするにもプラグインが必要です。

CircleCI にはすべてのコア CI 機能が組み込まれています。 GitHub や Bitbucket からのソースのチェック アウト、お気に入りのツールを使用したビルドやテストの実行、テスト出力の解析、アーティファクトの保存などの機能は、主要なタスクとして扱われ、プラグインを必要としません。 ビルドやデプロイにカスタム機能を追加するには、適切な場所でいくつかの bash スニペットを使用します。

## Distributed builds

Jenkins サーバーでも、ビルドを複数の「エージェント」マシンに分散させてジョブを実行することはできますが、事前に多くの作業を要します。 この点については [Jenkins の Wiki](https://wiki.jenkins.io/display/JA/Distributed+builds) に、Jenkins はクラスタリング ミドルウェアではないため、事前の準備は容易ではないと説明されています。

CircleCI は、デフォルトでビルドを大規模なビルド マシン フリートに分散させます。 SaaS ベースの circleci.com を使用すれば、分散が自動的に行われます。プラン内で処理できるビルド数に達しない限り、ビルドがキューイングされることはありません。 CircleCI を独自の環境にインストールして使用する場合も、CircleCI で Builder マシン クラスタが管理されるため、余計なツールを使用せずに済み、たいへん便利です。

## コンテナと Docker

ビルドシステム内のコンテナ化は複雑になる傾向があります。CI システムの実装を構成するコンテナ内で任意のビルド コマンドやテスト コマンドが実行され、それらのコマンド自体にコンテナの実行が含まれることもあるためです。 これらの点については、以下で詳しく説明します。 また、コンテナを実行するツールとしては Docker が絶大な人気を誇りますが、それ以外にもさまざまなツールが存在します。 ここでは、一般的な「コンテナ」と製品名である「Docker」という用語を使い分けながら説明していきます。

### Containers in your builds
{:.no_toc}


ワークフローに Docker などのツールを使用されている場合、CI にも同じように使用したいとお思いになるでしょう。 Jenkins にはこうしたツールが組み込みでサポートされていないため、ユーザー自身がツールをビルド環境にインストールする必要があります。

CircleCI にはかねてから Docker がプリインストールされており、`config.yml` ファイルに Executor として `docker` を追加するだけで、ビルド内で Docker にアクセスできます。 詳細については、「[Executor タイプの選び方]({{ site.baseurl }}/2.0/executor-types/)」と「[Docker]({{ site.baseurl }}/2.0/build/#docker)」を参照してください。

### Your builds in containers
{:.no_toc}


Jenkins は一般に、ビルド サーバーの通常のディレクトリ内でビルドを実行するため、依存関係、ファイル、サーバーからの経時状態収集などに関して多くの問題が発生する可能性があります。 代替機能を提供するプラグインもありますが、手動でインストールしなければなりません。

CircleCI では、すべての Linux および Android のビルドが専用コンテナで実行され、コンテナは使用後に直ちに破棄されます (macOS ビルドは使い捨ての VM で実行されます)。 これにより、ビルドごとにフレッシュな環境が作成され、ビルドに不正なデータが入り込むことを防止できます。 このように 1 回限りの環境を使用して、使い捨ての概念を浸透させることで、すべての依存関係がコードに記述されるようになり、ビルド サーバーがそれぞれに少しずつ異なってしまう「スノーフレーク化」の問題を防止できます。

独自のハードウェアで [CircleCI](https://circleci.jp/enterprise/) を使用してビルドを実行する場合は、すべてのビルドをコンテナで実行することで、ビルドを実行するためのハードウェアを有効に活用できます。

## 並列処理

マルチスレッドなどの手法を利用すれば、Jenkins のビルドでも複数のテストを並列に実行できますが、データベースやファイル システムなどの共有リソースに関して軽微な問題が発生する可能性があります。

CircleCI では、プロジェクトの設定で並列に処理できる数を増やせるため、プロジェクトの各ビルドで一度に複数のコンテナを使用できます。 各コンテナにテストが均等に割り振られることで、通常よりも大幅に短い時間で全体のビルドが完了します。 単純なマルチスレッドの場合とは異なり、各テストはそれぞれ独自の環境に置かれ、他のテストから完全に分離されています。 CircleCI の並列処理の詳細については、「[テストの並列実行]({{ site.baseurl }}/2.0/parallelism-faster-jobs/)」を参照してください。

## Jenkinsfile converter

CircleCI manages a Jenkinsfile Converter, a web tool that allows you to easily convert a Jenkinsfile to a CircleCI ```config.yml``` file, to help you get started with CircleCI quickly and easily. It can be accessed on [CircleCI's developer hub](https://circleci.com/developer/tools/jenkins-converter).

**Note:** The converter only supports declarative Jenkinsfiles. The number of supported plug-ins and steps will be expanded, this preview of the converter may help you to convert half of the Jenkinsfile to make it easier for you to get started with CircleCI.

Instructions on how to use the Jenkinsfile converter, its features, and limitations are located in the [Introduction to Jenkins Converter documentation](https://circleci.com/docs/2.0/jenkins-converter/).