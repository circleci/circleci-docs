---
layout: classic-docs
title: "Jenkins コンバーターの紹介"
short-title: "Jenkins コンバーターの紹介"
description: "Jenkins コンバーターの使い方"
categories:
  - はじめよう
order: 1
noindex: true
sitemap: false
---

CircleCI の [Jenkins コンバーター](https://circleci.com/developer/tools/jenkins-converter)は、Jenkinsfile を CircleCI の config.yml に簡単に変換できる Web ツールです。CircleCI でのビルドを素早く簡単に開始していただけます。

現在、このコンバーターは宣言型の Jenkinsfile のみをサポートしています。 ご利用いただけるプラグインとステップの数は増え続けていますが、このツールの使用により、少なくとも 50%  の作業が開始でき、 CircleCI 上でのビルドを開始しやすくなることを願っています。

## 制限事項
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

## 変換後の次のステップ
{: #next-steps-after-conversion }

### Executor
{: #executors }

Jenkinsfile の入力で何が定義されていても、静的な Docker Executor である [cimg/base](https://github.com/CircleCI-Public/cimg-base) が [Executor]({{site.baseurl}}/ja/configuration-reference/#executors-requires-version-21) として挿入されます。

`cimg/base` は非常に偏ったイメージなため、プロジェクトに別のイメージが必要になる可能性が高くなります。 別のイメージを探すには、[CircleCI イメージ](https://circleci.com/developer/images/)が最適です。 独自のカスタムイメージを作成する高度な手順については、[カスタム Docker イメージ]({{site.baseurl}}/ja/custom-images/)を参照して下さい。

使用例によっては、アプリケーションで OS リソースとジョブ環境へのフルアクセスが必要な場合は、[macOS Executor]({{site.baseurl}}/ja/using-macos) または [Machine Executor]({{site.baseurl}}/ja/configuration-reference/#machine) が必要な場合があります。

### ワークフロー
{: #workflows }

[CircleCI ワークフロー]({{site.baseurl}}/ja/workflows/) (Jenkins のパイプラインに相当) がJenkinsfile から config.yml に転送されます。これにはブランチのフィルタリングも含まれます。 コンバーターは、意図しないビルドがトリガーされないように、[スケジュール化されたビルド]({{site.baseurl}}/ja/configuration-reference/#triggers)は転送しません。

### ジョブ
{: #jobs }

CircleCI ジョブの多くの設定オプションには、相当する Jenkins の製品がありません。  CircleCI でのエクスペリエンスを高めるには、次の機能から始めることをお勧めします。

- [コードのチェックアウト]({{site.baseurl}}/ja/configuration-reference/#checkout)
- [リソースクラス]({{site.baseurl}}/ja/configuration-reference/#resource_class)
- [並列実行]({{site.baseurl}}/ja/configuration-reference/#parallelism)
- キャッシュの[保存]({{site.baseurl}}/ja/configuration-reference/#save_cache)と[リストア]({{site.baseurl}}/ja/configuration-reference/#restore_cache)
- [アーティファクトの保存]({{site.baseurl}}/ja/configuration-reference/#store_artifacts)

### 手順
{: #steps }

Jenkinsfile のコンバーターはステップを直接変換しようとしますが、すべてのステップを完全に変換するわけではありません。 これに対処するために、 `JFC_STACK_TRACE `キーが追加され、出力 YAML 内の特定のステップを変換し、サポートされていないステップディレクティブを処理する方法についてのガイダンスが提供されました。

## サポートされている構文
{: #supported-syntax }

現在サポートされているのは宣言型 (パイプライン)の `jenkinsfile` のみです。

| Jenkinsfile 構文 | 近似する CircleCI 構文                                                                           | ステータス                                                                           |
| -------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| agent          | [Executor]({{site.baseurl}}/ja/configuration-reference/#executors-requires-version-21) | 静的                                                                              |
| post           | [when 属性]({{site.baseurl}}/ja/configuration-reference/#the-when-attribute)             | [when]({{site.baseurl}}/ja/configuration-reference/#the-when-attribute) を参照 |
| stage          | [workflow]({{site.baseurl}}/ja/workflows/)                                             | サポート                                                                            |
| step           | [step]({{site.baseurl}}/ja/jobs-steps/#steps-overview)                                 | 制限付き                                                                            |
| environment    | [environment]({{site.baseurl}}/ja/env-vars/)                                           | [非サポート](https://github.com/circleci/jenkinsfile-converter/issues/26)            |
| option         | 該当なし                                                                                       | [サポートされている Jenkins プラグイン](#supported-jenkins-plugins)を参照                        |
| parameter      | [parameter]({{site.baseurl}}/ja/reusing-config/#using-the-parameters-declaration)      | 非サポート                                                                           |
| trigger        | [cron]({{site.baseurl}}/ja/workflows/#scheduling-a-workflow)                           | 非サポート                                                                           |
| stage          | [job]({{site.baseurl}}/ja/configuration-reference/#jobs)                               | サポート                                                                            |
{: class="table table-striped"}

## サポートされている Jenkins プラグイン
{: #supported-jenkins-plugins }

**注: 下記に記載されていないプラグインに依存する Jenkinsfile は変換できません**。 サポートされていないプラグイン（`options`など）に依存するスタンザは削除してください。そうしないと、**"Unknown" または "Invalid" というエラーメッセージが表示されます**。 プラグインの追加を依頼したい場合は、サポートセンターにチケットを提出して下さい。

- Trilead API Plugin (`trilead-api`)
- Folders Plugin (`cloudbees-folder`)
- OWASP Markup Formatter Plugin (`antisamy-markup-formatter`)
- Script Security Plugin (`script-security`)
- Oracle Java SE Development Kit Installer Plugin (`jdk-tool`)
- Command Agent Launcher Plugin (`command-launcher`)
- Structs Plugin (`structs`)
- Pipeline: Step API (`workflow-step-api`)
- Token Macro Plugin (`token-macro`)
- bouncycastle API Plugin (`bouncycastle-api`)
- Build Timeout (`build-timeout`)
- Credentials Plugin (`credentials`)
- Plain Credentials Plugin (`plain-credentials`)
- SSH Credentials Plugin (`ssh-credentials`)
- Credentials Binding Plugin (`credentials-binding`)
- SCM API Plugin (`scm-api`)
- Pipeline: API (`workflow-api`)
- Timestamper (`timestamper`)
- Pipeline: Supporting APIs (`workflow-support`)
- Durable Task Plugin (`durable-task`)
- Pipeline: Nodes and Processes (`workflow-durable-task-step`)
- JUnit Plugin (`junit`)
- Matrix Project Plugin (`matrix-project`)
- Resource Disposer Plugin (`resource-disposer`)
- Jenkins Workspace Cleanup Plugin (`ws-cleanup`)
- Ant Plugin (`ant`)
- JavaScript GUI Lib: ACE Editor bundle plugin (`ace-editor`)
- JavaScript GUI Lib: jQuery bundles (jQuery and jQuery UI) plugin (`jquery-detached`)
- Pipeline: SCM Step (`workflow-scm-step`)
- Pipeline: Groovy (`workflow-cps`)
- Pipeline: Job (`workflow-job`)
- Jenkins Apache HttpComponents Client 4.x API Plugin (`apache-httpcomponents-client-4-api`)
- Display URL API (`display-url-api`)
- Jenkins Mailer Plugin (`mailer`)
- Pipeline: Basic Steps (`workflow-basic-steps`)
- Gradle Plugin (`gradle`)
- Pipeline: Milestone Step (`pipeline-milestone-step`)
- Jackson 2 API Plugin (`jackson2-api`)
- Pipeline: Input Step (`pipeline-input-step`)
- Pipeline: Stage Step (`pipeline-stage-step`)
- Pipeline Graph Analysis Plugin (`pipeline-graph-analysis`)
- Pipeline: REST API Plugin (`pipeline-rest-api`)
- JavaScript GUI Lib: Handlebars bundle plugin (`handlebars`)
- JavaScript GUI Lib: Moment.js bundle plugin (`momentjs`)
- Pipeline: Stage View Plugin (`pipeline-stage-view`)
- Pipeline: Build Step (`pipeline-build-step`)
- Pipeline: Model API (`pipeline-model-api`)
- Pipeline: Declarative Extension Points API (`pipeline-model-extensions`)
- Jenkins JSch dependency plugin (`jsch`)
- Jenkins Git client plugin (`git-client`)
- Jenkins GIT server Plugin (`git-server`)
- Pipeline: Shared Groovy Libraries (`workflow-cps-global-lib`)
- Branch API Plugin (`branch-api`)
- Pipeline: Multibranch (`workflow-multibranch`)
- Authentication Tokens API Plugin (`authentication-tokens`)
- Docker Commons Plugin (`docker-commons`)
- Docker Pipeline (`docker-workflow`)
- Pipeline: Stage Tags Metadata (`pipeline-stage-tags-metadata`)
- Pipeline: Declarative Agent API (`pipeline-model-declarative-agent`)
- Pipeline: Declarative (`pipeline-model-definition`)
- Lockable Resources plugin (`lockable-resources`)
- Pipeline (`workflow-aggregator`)
- GitHub API Plugin (`github-api`)
- Jenkins Git plugin (`git`)
- GitHub plugin (`github`)
- GitHub Branch Source Plugin (`github-branch-source`)
- Pipeline: GitHub Groovy Libraries (`pipeline-github-lib`)
- MapDB API Plugin (`mapdb-api`)
- Jenkins Subversion Plug-in (`subversion`)
- SSH Build Agents plugin (`ssh-slaves`)
- Matrix Authorization Strategy Plugin (`matrix-auth`)
- PAM Authentication plugin (`pam-auth`)
- LDAP Plugin (`ldap`)
- Email Extension Plugin (`email-ext`)
- H2 API Plugin (`h2-api`)
- Config File Provider Plugin (`config-file-provider`)
- Pipeline Maven Integration Plugin (`pipeline-maven`)
- Pipeline Utility Steps (`pipeline-utility-steps`)

## フィードバック
{: #feedback }

このプロジェクトに関するフィードバックを共有するには、サポートチームにチケットを提出して下さい。
