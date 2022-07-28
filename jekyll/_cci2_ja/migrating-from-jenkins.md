---
layout: classic-docs
title: Jenkins からの移行
categories:
  - migration
description: 移行ガイドでの CircleCI と Jenkins の違い。
redirect_from: /ja/jenkins-converter
version:
  - クラウド
  - Server v3.x
---

Jenkins を長年使用されていた方向けに、CircleCI に移行するうえで把握しておきたい基本的なコンセプトについて説明します。

* 目次
{:toc}

## クイックスタート
{: #quick-start }

CircleCI は、Jenkins とは大きく異なる製品であり、CI/CD の管理方法についても多くの相違点が見られます。ただし、Jenkins のビルドの基本的な機能を CircleCI に移行するだけなら、それほど時間はかかりません。 移行を迅速に始めるために、以下のステップをお試しください。

1. **スタートガイド:** [ガイド]({{site.baseurl}}/ja/getting-started) を参照しながら、CircleCI で最初のビルドを実行し、成功させましょう。

2. **Execute Shell のコマンドをコピー & ペーストする:** Jenkins 内のプロジェクトをそのまま複製して使用できる場合は、以下の内容のファイルを `config.yml` という名前でプロジェクトの `.circleci/` ディレクトリに追加します。

```yaml
    steps:
      - run: "Add any bash command you want here"
      - run:
          command: |
            echo "Arbitrary multi-line bash"
            echo "Copy-paste from 'Execute Shell' in Jenkins"
```

いくつかのプログラムとユーティリティは [CircleCI イメージにプリインストール]({{site.baseurl}}/ja/circleci-images/#pre-installed-tools)されていますが、他にビルドに必要な項目があれば `run` ステップでインストールする必要があります。 プロジェクトの依存関係は、次回のビルドに備え、`save_cache` と `restore_cache` ステップを使用して[キャッシュ]({{site.baseurl}}/ja/caching/)することができます。こうしておくと、全体のダウンロードとインストールが一度だけで済むようになります。

**手動設定:** Jenkins の Execute Shell 以外のプラグインまたはオプションを使用してビルドステップを実行していた場合は、Jenkins からビルドを手動で移植する必要があります。 すべての CircleCI 設定キーの詳細については、「[CircleCI を設定する]({{site.baseurl}}/ja/configuration-reference/)」を参照してください。

## ジョブの設定
{: #job-configuration }

通常、Jenkins のプロジェクトは Jenkins の Web UI で設定され、その設定は Jenkins サーバーのファイルシステムに保存されています。 そのため、チームや組織内で構成情報を共有することは困難です。 VCS からリポジトリをクローンしても Jenkins に保存された情報はコピーされません。 また、Jenkins サーバーに設定を保存すると、すべての Jenkins サーバーを定期的にバックアップする必要が生じます。

CircleCI のビルドに関する設定の大部分は、各プロジェクトのルートディレクトリにある `.circleci/config.yml` という名前のファイルに保存されます。 CI/CD の設定も他のソースコードと同様に扱われるため、バックアップや共有が簡単に行えます。 ソースコードに格納すべきではないシークレットなどのごく一部のプロジェクト設定は、暗号化された状態で CircleCI アプリに保存されます。

### ビルドマシンへのアクセス
{: #access-to-build-machines }

Jenkins サーバーの管理は、運用部門のメンバーやチームに委ねられているケースがほとんどです。 その担当者は、依存関係のインストールやトラブルシューティングなど、CI/CD メンテナンスに関するさまざまなタスクに日々追われています。

CircleCI では、ビルドプロセス全体が確実に自動化されるようにするために、カスタムの依存関係が自動的にインストールされるフレッシュな環境で各ビルドが開始されるため、依存関係をインストールするために CircleCI 環境にアクセスする必要はありません。 また、実行環境でのトラブルシューティングは、CircleCI の [SSH 機能]({{site.baseurl}}/ja/ssh-access-jobs/)を使ってすべての開発者が簡単かつ安全に実行することができます。

CircleCI をご自身のハードウェアにインストールする場合、(メタルレベルまたは VM レベルの) ホスト OS とコンテナ化されたビルド環境を分けておくと、セキュリティと運用の面できわめて有用です (詳細については、以下のセクション「[コンテナ内のビルド](#your-builds-in-containers)」を参照してください)。 運用部門のメンバーは、ビルドに支障をきたすことなくホスト OS 上で必要な作業を行うことができ、開発者にアクセス権を付与する必要はありません。 また開発者は、CircleCI の SSH 機能を使用して、運用に支障をきたすことなく任意のコンテナレベルでビルドをデバッグできます。

## プラグイン
{: #plugins }

You have to use plugins to do almost anything with Jenkins, including checking out a Git repository. Like Jenkins itself, its plugins are Java-based, and a bit complicated. Jenkins 内の数百もの拡張ポイントとやり取りを行い、JSP 形式のタグやビューを使用して Web ビューを生成します。

CircleCI にはすべてのコア CI 機能が組み込まれています。 Features such as checking out source from a VCS, running builds and tests with your favorite tools, parsing test output, and storing artifacts are plugin-free. ビルドやデプロイにカスタム機能を追加するには、適切な場所でいくつかの bash スニペットを使用します。

Below is a table of supported plugins that you can convert using the [CircleCI Jenkins converter tool](https://circleci.com/developer/tools/jenkins-converter) ([see Jenkins converter section](#jenkinsfile-converter)).

**Jenkinsfiles relying on plugins not listed below cannot be converted**. Please remove stanzas relying on those unsupported plugins (for example `options`), otherwise you will see an error message saying something is `Unknown` or `Invalid`. Please [submit a ticket](https://support.circleci.com/hc/en-us/requests/new) with our support center if you have a request to add a plugin to the list.
{: class="alert alert-info" }

- Ant Plugin (`ant`)
- Authentication Tokens API Plugin (`authentication-tokens`)
- Bouncy Castle API Plugin (`bouncycastle-api`)
- Branch API Plugin (`branch-api`)
- Build Timeout (`build-timeout`)
- Command Agent Launcher Plugin (`command-launcher`)
- Config File Provider Plugin (`config-file-provider`)
- Credentials Binding Plugin (`credentials-binding`)
- Credentials Plugin (`credentials`)
- Display URL API (`display-url-api`)
- Docker Commons Plugin (`docker-commons`)
- Docker Pipeline (`docker-workflow`)
- Durable Task Plugin (`durable-task`)
- Email Extension Plugin (`email-ext`)
- Folders Plugin (`cloudbees-folder`)
- GitHub API Plugin (`github-api`)
- GitHub Branch Source Plugin (`github-branch-source`)
- GitHub plugin (`github`)
- Gradle Plugin (`gradle`)
- H2 API Plugin (`h2-api`)
- JUnit Plugin (`junit`)
- Jackson 2 API Plugin (`jackson2-api`)
- JavaScript GUI Lib: ACE Editor bundle plugin (`ace-editor`)
- JavaScript GUI Lib: Handlebars bundle plugin (`handlebars`)
- JavaScript GUI Lib: Moment.js bundle plugin (`momentjs`)
- JavaScript GUI Lib: jQuery bundles (jQuery and jQuery UI) plugin (`jquery-detached`)
- Jenkins Apache HttpComponents Client 4.x API Plugin (`apache-httpcomponents-client-4-api`)
- Jenkins GIT server Plugin (`git-server`)
- Jenkins Git client plugin (`git-client`)
- Jenkins Git plugin (`git`)
- Jenkins JSch dependency plugin (`jsch`)
- Jenkins Mailer Plugin (`mailer`)
- Jenkins Subversion Plug-in (`subversion`)
- Jenkins Workspace Cleanup Plugin (`ws-cleanup`)
- LDAP Plugin (`ldap`)
- Lockable Resources plugin (`lockable-resources`)
- MapDB API Plugin (`mapdb-api`)
- Matrix Authorization Strategy Plugin (`matrix-auth`)
- Matrix Project Plugin (`matrix-project`)
- OWASP Markup Formatter Plugin (`antisamy-markup-formatter`)
- Oracle Java SE Development Kit Installer Plugin (`jdk-tool`)
- PAM Authentication plugin (`pam-auth`)
- Pipeline (`workflow-aggregator`)
- Pipeline Graph Analysis Plugin (`pipeline-graph-analysis`)
- Pipeline Maven Integration Plugin (`pipeline-maven`)
- Pipeline Utility Steps (`pipeline-utility-steps`)
- Pipeline: API (`workflow-api`)
- Pipeline: Basic Steps (`workflow-basic-steps`)
- Pipeline: Build Step (`pipeline-build-step`)
- Pipeline: Declarative (`pipeline-model-definition`)
- Pipeline: Declarative Agent API (`pipeline-model-declarative-agent`)
- Pipeline: Declarative Extension Points API (`pipeline-model-extensions`)
- Pipeline: GitHub Groovy Libraries (`pipeline-github-lib`)
- Pipeline: Groovy (`workflow-cps`)
- Pipeline: Input Step (`pipeline-input-step`)
- Pipeline: Job (`workflow-job`)
- Pipeline: Milestone Step (`pipeline-milestone-step`)
- Pipeline: Model API (`pipeline-model-api`)
- Pipeline: Multibranch (`workflow-multibranch`)
- Pipeline: Nodes and Processes (`workflow-durable-task-step`)
- Pipeline: REST API Plugin (`pipeline-rest-api`)
- Pipeline: SCM Step (`workflow-scm-step`)
- Pipeline: Shared Groovy Libraries (`workflow-cps-global-lib`)
- Pipeline: Stage Step (`pipeline-stage-step`)
- Pipeline: Stage Tags Metadata (`pipeline-stage-tags-metadata`)
- Pipeline: Stage View Plugin (`pipeline-stage-view`)
- Pipeline: Step API (`workflow-step-api`)
- Pipeline: Supporting APIs (`workflow-support`)
- Plain Credentials Plugin (`plain-credentials`)
- Resource Disposer Plugin (`resource-disposer`)
- SCM API Plugin (`scm-api`)
- SSH Build Agents plugin (`ssh-slaves`)
- SSH Credentials Plugin (`ssh-credentials`)
- Script Security Plugin (`script-security`)
- Structs Plugin (`structs`)
- Timestamper (`timestamper`)
- Token Macro Plugin (`token-macro`)
- Trilead API Plugin (`trilead-api`)

## 分散ビルド
{: #distributed-builds }

It is possible to make a Jenkins server distribute your builds to a number of "agent" machines to execute the jobs, but this takes a fair amount of work to set up. According to Jenkins’ [docs](https://wiki.jenkins-ci.org/display/JENKINS/Distributed+builds), “Jenkins is not a clustering middleware, and therefore it doesn't make this any easier.”

CircleCI は、デフォルトでビルドを大規模なビルド マシン フリートに分散させます。 If you use CircleCI cloud, then this just happens for you - your builds do not queue unless you are using all the build capacity in your plan. If you use CircleCI server, then you will appreciate that CircleCI does manage your cluster of builder machines without the need for any extra tools.

## コンテナと Docker
{: #containers-and-docker }

Talking about containerization in build systems can be complicated, because arbitrary build and test commands can be run inside of containers as part of the implementation of the CI/CD system, and some of these commands may involve running containers. これらの点については、以下で詳しく説明します。 また、コンテナを実行するツールとしては Docker が絶大な人気を誇りますが、それ以外にもさまざまなツールが存在します。 Both the terms "container" (general) and "Docker" (specific) will be used.

### ビルド内のコンテナ
{: #containers-in-your-builds }

If you use a tool like Docker in your workflow, you will likely also want to run it on CI/CD. Jenkins にはこうしたツールが組み込みでサポートされていないため、ユーザー自身がツールを実行環境にインストールする必要があります。

Docker has long been one of the tools that is pre-installed on CircleCI, so you can access Docker in your builds by adding `docker` as an executor in your `.circleci/config.yml` file. See the [Introduction to Execution Environments]({{site.baseurl}}/executor-intro/) page for more info.

### コンテナ内のビルド
{: #your-builds-in-containers }

Jenkins は一般に、ビルド サーバーの通常のディレクトリ内でビルドを実行するため、依存関係、ファイル、サーバーからの経時状態収集などに関して多くの問題が発生する可能性があります。 代替機能を提供するプラグインもありますが、手動でインストールしなければなりません。

CircleCI では、すべての Linux および Android のビルドが専用コンテナで実行され、コンテナは使用後に直ちに破棄されます (macOS ビルドは使い捨ての VM で実行されます)。 これにより、ビルドごとにフレッシュな環境が作成され、ビルドに不正なデータが入り込むことを防止できます。 このように 1 回限りの環境を使用して、使い捨ての概念を浸透させることで、すべての依存関係がコードに記述されるようになり、ビルド サーバーがそれぞれに少しずつ異なってしまう「スノーフレーク化」の問題を防止できます。

独自のハードウェアで [CircleCI](https://circleci.jp/enterprise/) を使用してビルドを実行する場合は、すべてのビルドをコンテナで実行することで、ビルドを実行するためのハードウェアを有効に活用できます。

## 並列実行
{: #parallelism }

マルチスレッドなどの手法を利用すれば、Jenkins のビルドでも複数のテストを並列に実行できますが、データベースやファイル システムなどの共有リソースに関して軽微な問題が発生する可能性があります。

CircleCI では、プロジェクトの設定で並列に処理できる数を増やせるため、プロジェクトの各ビルドで一度に複数のコンテナを使用できます。 各コンテナにテストが均等に割り振られることで、通常よりも大幅に短い時間で全体のビルドが完了します。 単純なマルチスレッドの場合とは異なり、各テストはそれぞれ独自の環境に置かれ、他のテストから完全に分離されています。 You can read more about parallelism on CircleCI in the [Running Tests in Parallel]({{site.baseurl}}/parallelism-faster-jobs/) document.

## Jenkinsfile コンバーター
{: #jenkinsfile-converter }

The CircleCI [Jenkins Converter](https://circleci.com/developer/tools/jenkins-converter) is a web tool that allows you to easily convert a Jenkinsfile to a `.circleci/config.yml` file, helping you to get started building on CircleCI quickly and easily.

**The converter only supports declarative Jenkinsfiles**. ご利用いただけるプラグインとステップの数は増え続けていますが、このツールの使用により、少なくとも 50%  の作業が開始でき、 CircleCI 上でのビルドを開始しやすくなることを願っています。

### サポートされている構文
{: #supported-syntax }

現在サポートされているのは宣言型 (パイプライン)の `jenkinsfile` のみです。

| Jenkinsfile 構文 | 近似する CircleCI 構文                                                                    | ステータス                                                                       |
| -------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| agent          | [Executor]({{site.baseurl}}/configuration-reference/#executors-requires-version-21) | 静的                                                                          |
| post           | [when 属性]({{site.baseurl}}/configuration-reference/#the-when-attribute)             | [when]({{site.baseurl}}/configuration-reference/#the-when-attribute) を参照    |
| stage          | [workflows]({{site.baseurl}}/workflows/)                                            | サポート対象                                                                      |
| steps          | [step]({{site.baseurl}}/jobs-steps/#steps-overview)                                 | 制限付き                                                                        |
| environment    | [environment]({{site.baseurl}}/env-vars/)                                           | [サポートされない監査ログ](https://github.com/circleci/jenkinsfile-converter/issues/26) |
| option         | N/A                                                                                 | [サポートされている Jenkins プラグイン](#supported-jenkins-plugins)を参照                    |
| parameters     | [parameters]({{site.baseurl}}/reusing-config/#using-the-parameters-declaration)     | サポートされない監査ログ                                                                |
| triggers       | [cron]({{site.baseurl}}/workflows/#scheduling-a-workflow)                           | サポートされない監査ログ                                                                |
| stage          | [job]({{site.baseurl}}/configuration-reference/#jobs)                               | サポート対象                                                                      |
{: class="table table-striped"}

### 制限事項
{: #limitations }

* サポートされている構文やプラグインは限られています。 Jenkinsfile がサポートされていない構文とプラグインに依存している場合は変換できません。 それらを手動で削除して下さい。

* 1 つのリクエストにつき受け付けられるのは１つの Jenkinsfile のみです。 つまり、[共有ライブラリ](https://www.jenkins.io/doc/book/pipeline/shared-libraries/)では解決されず、結果として得られる `config.yml` は不完全な場合があります。 場合によっては、解決不可能な共有ライブラリが存在してもコンバーターがエラーを発しないことがあるのでご注意ください。

* [`tools` ブロック](https://www.jenkins.io/doc/book/pipeline/syntax/#tools)では、`maven`、`jdk`、`gradle` にはツール名として `Default` のみがサポートされています。それ以外の名前だと変換に失敗します。 その場合は以下のように設定するか、手動で削除して下さい。

  例えば、以下のスタンザは、
  ```groovy
  tools {
    maven 'Maven 3.6.3'
    jdk 'Corretto 8.232'
  }
  ```
  以下のように変更する必要があります。
  ```groovy
  tools {
    maven 'Default'
    jdk 'Default'
  }
  ```

### 変換後の次のステップ
{: #next-steps-after-conversion }

The following sections describe next steps with various aspects of the CircleCI pipeline.

#### Executor
{: #executors }

Jenkinsfile の入力で何が定義されていても、静的な Docker Executor である [cimg/base](https://github.com/CircleCI-Public/cimg-base) が [Executor]({{site.baseurl}}/ja/configuration-reference/#executors-requires-version-21) として挿入されます。

Given that `cimg/base` is a very lean image, it is highly likely that your project will require a different image. 別のイメージを探すには、[CircleCI イメージ](https://circleci.com/developer/images/)が最適です。 独自のカスタムイメージを作成する高度な手順については、[カスタム Docker イメージ]({{site.baseurl}}/custom-images/)を参照して下さい。

使用例によっては、アプリケーションで OS リソースとジョブ環境へのフルアクセスが必要な場合は、[macOS Executor]({{site.baseurl}}/using-macos) または [Machine Executor]({{site.baseurl}}/configuration-reference/#machine) が必要な場合があります。

#### ワークフロー
{: #workflows }

[CircleCI Workflows]({{site.baseurl}}/workflows/) (the equivalent of Jenkins pipelines) are transferred from your Jenkinsfile to the `.circleci/config.yml`, including branch filters. コンバーターは、意図しないビルドがトリガーされないように、[スケジュール化されたビルド]({{site.baseurl}}/configuration-reference/#triggers)は転送しません。

#### ジョブ
{: #jobs }

Many of the configuration options within CircleCI jobs do not have equivalents to Jenkins' offerings. CircleCI でのエクスペリエンスを高めるには、次の機能から始めることをお勧めします。

- [Checkout code (コードのチェックアウト)]({{site.baseurl}}/configuration-reference/#checkout)
- [リソースクラス]({{site.baseurl}}/configuration-reference/#resource_class)
- [並列実行]({{site.baseurl}}/configuration-reference/#parallelism)
- キャッシュの[保存]({{site.baseurl}}/configuration-reference/#save_cache)と[リストア]({{site.baseurl}}/configuration-reference/#restore_cache)
- [アーティファクトの保存]({{site.baseurl}}/configuration-reference/#store_artifacts)

#### 手順
{: #steps }

Jenkinsfile のコンバーターはステップを直接変換しようとしますが、すべてのステップを完全に変換するわけではありません。 これに対処するために、 `JFC_STACK_TRACE `キーが追加され、出力 YAML 内の特定のステップを変換し、サポートされていないステップディレクティブを処理する方法についてのガイダンスが提供されました。

## 次のステップ
{: #next-steps }

* [Introduction to the CircleCI Web App]({{site.baseurl}}/introduction-to-the-circleci-web-app)
