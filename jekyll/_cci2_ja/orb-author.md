---
layout: classic-docs
title: "Orb のオーサリング プロセス"
short-title: "Orb のオーサリング"
description: "CircleCI Orb のオーサリングに関する入門ガイド"
categories:
  - はじめよう
order: 1
version:
  - クラウド
  - Server v3.x
---

* 目次
{:toc}

## はじめに
{: #introduction }

この Orb オーサリングガイドは、[Orb の概要]({{site.baseurl}}/2.0/orb-intro) と [Orb オーサリングの概要]({{site.baseurl}}/2.0/orb-author-intro)のドキュメントを読み、名前空間を宣言していることを前提にしています。 Now you are ready to develop an orb.

Whether you are writing your first orb or getting ready for production level, we recommend using our [Orb Development Kit](#orb-development-kit) to get started. または、Orb は[再利用可能な設定]({{site.baseurl}}/ja/2.0/reusing-config)をパッケージにしたものなので、単体の `yaml` ファイルとして Orb を[手動で]({{site.baseurl}}/ja/2.0/orb-author-validate-publish)記述し、[CircleCI Orb 用の CLI]({{site.baseurl}}/ja/2.0/local-cli/#installation) を使用してパブリッシュすることも可能です。

## Create, test and publish an orb
{: #create-test-and-publish-an-orb }

Follow the steps below to create, test and publish your own orb, using the Orb Development Kit.

The Orb Development Kit refers to a suite of tools that work together to simplify the orb development process, with automatic testing and deployment on CircleCI. The Orb Development Kit is made up of the following components:

* [Orb Template](https://github.com/CircleCI-Public/Orb-Template)
* [CircleCI CLI](https://circleci-public.github.io/circleci-cli/)
    * [Orb Pack Command]({{site.baseurl}}/2.0/orb-concepts/#orb-packing)
    * [Orb Init Command](https://circleci-public.github.io/circleci-cli/circleci_orb_init.html)
* [Orb ツールの Orb](https://circleci.com/developer/orbs/orb/circleci/orb-tools)

### はじめよう
{: #getting-started }

To begin creating your new orb with the Orb Development Kit, follow the steps below. 最初に行うのは、[GitHub.com](https://github.com) でのリポジトリの新規作成です。

GitHub 上の組織 (Organization) が、Orb の作成先となる[CircleCI の名前空間]({{site.baseurl}}/2.0/orb-concepts/#namespaces)のオーナーになります。 組織が自分個人のもので、名前空間のオーナーが自分自身であれば、問題ありません。

1. **新しい [GitHub リポジトリ](https://github.com/new)を作成します。**

    リポジトリの名前は、特に重要ではありませんが、"myProject-orb" のような分かりやすい名前を付けることをお勧めします。![New GitHub Repo]({{site.baseurl}}/assets/img/docs/new_orb_repo_gh.png)

    必要な項目の設定が終わると、新しいリポジトリの内容を確認するページが開き、生成された Git の URL が表示されます。 この URL をメモしておいてください。 手順 4 で必要になります。 You can select SSH or HTTPS, whichever you can authenticate with. ![Orb レジストリ]({{site.baseurl}}/assets/img/docs/github_new_quick_setup.png)

    **注: **Orb 用にローカルディレクトリを作成する必要がありますが、Orb リポジトリをプルする必要はありません。 このプロセスは`orb init` プロセスで完了するため、その前にこのリポジトリをプルすると問題が発生します。
    {: class="alert alert-warning"}

1. **Update the CircleCI CLI**

    Ensure you are using the latest version of the CircleCI CLI. You must be using version `v0.1.17087` of the CLI or later.

    ```shell
    $ circleci update

    $ circleci version
    ```

2. **Initialize your orb**

    ターミナルを開き、`orb init` CLI コマンドを使用して、新しい Orb プロジェクトを初期化します。

    If you are using CircleCI server, you should ensure the `--private` flag is used here to keep your orbs private within your installation.

    **[パブリック]({{site.baseurl}}/2.0/orb-intro/#public-orbs)** Orb を初期化する場合:

    ```shell
    circleci orb init /path/to/myProject-orb
    ```
    **[プライベート]({{site.baseurl}}/2.0/orb-intro/#private-orbs)** Orb を初期化する場合:
    ```shell
    circleci orb init /path/to/myProject-orb --private
    ```

    Orb は一旦初期化されると、**パブリックからプライペートに、またはその逆に変更することはできません。** プライベート Orb を作成したい場合は、必ず `--private` フラグをつけてください。
    {: class="alert alert-warning"}

    `circleci orb init` コマンドを、Orb プロジェクト用に作成して初期化するディレクトリを付けて呼び出します。 このディレクトリと Git のプロジェクト リポジトリには、同じ名前を使用することをお勧めします。


3. **Orb の完全自動セットアップ オプションを選択します。**

    ```shell
      ? Would you like to perform an automated setup of this orb?:
          ▸ Yes, walk me through the process.
      No, I'll handle everything myself.
    ```

    手動オプションを選択した場合は、[手動による Orb オーサリングプロセス]({{site.baseurl}}/ja/2.0/orb-author-validate-publish/)で Orb をパブリッシュする方法を参照してください。

    When choosing the fully automated option, the [Orb-Template](https://github.com/CircleCI-Public/Orb-Template) will be downloaded and automatically modified with your customized settings. プロジェクトは CircleCI でフォローされ、自動化された CI/CD パイプラインが含められます。

    For more information on the included CI/CD pipeline, see the [Orb Publishing Process]({{site.baseurl}}/2.0/creating-orbs/) documentation.

    Alternatively, if you would simply like a convenient way of downloading the [Orb-Template](https://github.com/CircleCI-Public/Orb-Template) you can opt to handle everything yourself.

4. **Follow the prompts to configure and set up your orb.**

    In the background, the `orb init` command will be copying and customizing the [Orb Template](https://github.com/CircleCI-Public/Orb-Template) based on your inputs. 各ディレクトリにある詳細な `README.md` ファイルには、それぞれのディレクトリのコンテンツに関する有益な情報が記載されています。 手順 1 で取得したリモート Git リポジトリ の URL も、入力が求められます。

    The [Orb Template](https://github.com/CircleCI-Public/Orb-Template) contains a full CI/CD pipeline (described in [Orb Publishing Process]({{site.baseurl}}/2.0/creating-orbs/)) which automatically [packs]({{site.baseurl}}/2.0/orb-concepts/#orb-packing), [tests]({{site.baseurl}}/2.0/testing-orbs/), and [publishes](https://circleci.com/docs/2.0/creating-orbs/) your orb.

    セットアッププロセスでは、[パーソナル API トークン]({{site.baseurl}}/ja/2.0/managing-api-tokens/)を `orb-publishing` <a href="{{site.baseurl}}/ja/2.0/contexts/>コンテキスト</a>に保存するかどうかを尋ねられます。 Orb の開発版と安定版をパブリッシュするためには、このトークンを保存しておくことが必要です。 If you have already made an orb in the past, you can skip this step, as the context will already exist.

5. **注: コンテキストの制限**

    _[Organization Settings (組織設定)] > [Contexts (コンテキスト)]_ に移動して、コンテキストを制限してください。

    After completing your orb, you should see a new context called `orb-publishing`. この `orb-publishing` をクリックして、_セキュリティ グループ_を追加します。 セキュリティ グループを使うと、ジョブのトリガーを許可されたユーザーだけにアクセスを制限することができます。 プライベートの[パーソナル API トークン]({{site.baseurl}}/2.0/managing-api-tokens/)にアクセスできるのも、これらのユーザーだけです。

    For more information, see the [Contexts]({{site.baseurl}}/2.0/contexts/#restricting-a-context) guide.
    {: class="alert alert-warning"}

6. **変更を Github にプッシュします。**

    このセットアッププロセスの間に、`orb init`コマンドは、自動 Orb 開発パイプラインを準備するための手順を実行します。 CLI が処理を続行し、circleci.com でプロジェクトを自動的にフォローするには、その前に、CLI によって生成された修正済みのテンプレート コードがリポジトリにプッシュされている必要があります。 これを実行するよう要求されたら、別のターミナルから以下のコマンドを、「default-branch」を実際のデフォルト ブランチの名前に置き換えて実行します。
    ```shell
    git push origin <default-branch>
    ```
    完了したら、元のターミナルに戻って、変更がプッシュされたことを確認します。

7. **Complete the setup**

    Once the changes have been pushed, return to your terminal and continue the setup process. The CLI will now automatically follow the project on CircleCI, and attempt to trigger a pipeline to build and test your orb with sample code.

    You will be provided with a link to the project building on CircleCI where you can view the full pipeline. また、 CLI によって自動的に ` alpha` という名前の新しい開発ブランチに移行されたことも確認できます。 You can use any branch naming you would like, you do not need to exclusively develop on `alpha`.

8. **Enable Dynamic Configuration**

    Because we are making use of [dynamic configuration]({{site.baseurl}}/2.0/dynamic-config/), we must first enable this feature. You will receive an error on your first pipeline that will state that this feature is not yet enabled.

    Following the [Getting started with dynamic config in CircleCI]({{site.baseurl}}/2.0/dynamic-config/#getting-started-with-dynamic-config-in-circleci), open the **Project Settings** page for your orb on CircleCI, navigate to the **Advanced** tab, and click on the **Enable dynamic config using setup workflows** button.

    Once enabled, all future commits to your project will run through the full pipeline and test your orb. We could manually re-run the pipeline at this point, but since we are only working with sample code at this moment, we don't need to.

9. **Develop your orb**

    From a non-default branch (you will be moved to the `alpha` branch automatically at setup), begin modifying the sample orb code to your liking. On each _push_, your orb will be automatically built and tested.

    Be sure to view the _[.circleci/test-deploy](https://github.com/CircleCI-Public/Orb-Template/blob/main/.circleci/test-deploy.yml)_ file to view how your orb components are being tested, and modify your tests as you change your orb. Learn more about testing your orb in the [Orb Testing documentation]({{site.baseurl}}/2.0/testing-orbs/).

    When you are ready to deploy the first production version of your orb, find information on deploying changes in the [Orb Publishing Process]({{site.baseurl}}/2.0/creating-orbs/) guide.

### Orb の記述
{: #writing-your-orb }

Orb の作成を始める前に、デフォルト以外のブランチにいることを確認してください。 通常は、`alpha` ブランチで Orb の作業を始めることをお勧めします。

```shell
$ git branch

* alpha
  main
```

`circleci orb init` コマンドを実行すると、自動的に `alpha` ブランチに移動し、リポジトリに `.circleci` ディレクトリと `src` ディレクトリが作成されます。

**_Example: Orb Project Structure_**

| type                      | name                                                                               |
| ------------------------- | ---------------------------------------------------------------------------------- |
| <i class="fa fa-folder" aria-hidden="true"></i> | [.circleci](https://github.com/CircleCI-Public/Orb-Template/tree/main/.circleci)   |
| <i class="fa fa-folder" aria-hidden="true"></i> | [.github](https://github.com/CircleCI-Public/Orb-Template/tree/main/.github)       |
| <i class="fa fa-folder" aria-hidden="true"></i> | [src](https://github.com/CircleCI-Public/Orb-Template/tree/main/src)               |
| <i class="fa fa-file-text-o" aria-hidden="true"></i> | [.gitignore](https://github.com/CircleCI-Public/Orb-Template/blob/main/.gitignore) |
| <i class="fa fa-file-text-o" aria-hidden="true"></i> | [LICENSE](https://github.com/CircleCI-Public/Orb-Template/blob/main/LICENSE)       |
| <i class="fa fa-file-text-o" aria-hidden="true"></i> | [README.md](https://github.com/CircleCI-Public/Orb-Template/blob/main/README.md)   |
{: class="table table-striped"}

#### Orb のソース
{: #orb-source }

`src` ディレクトリに移動すると、含まれているセクションを確認できます。

**_例: Orb プロジェクトの "src" ディレクトリ_**

| type                       | name                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------ |
| <i class="fa fa-folder" aria-hidden="true"></i>  | [commands](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/commands)   |
| <i class="fa fa-folder" aria-hidden="true"></i>  | [examples](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/examples)   |
| <i class="fa fa-folder" aria-hidden="true"></i>  | [executors](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/executors) |
| <i class="fa fa-folder" aria-hidden="true"></i>  | [jobs](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/jobs)           |
| <i class="fa fa-file-text-o" aria-hidden="true"></i> | [スクリプト](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/scripts)       |
| <i class="fa fa-file-text-o" aria-hidden="true"></i> | [@orb.yml](https://github.com/CircleCI-Public/Orb-Template/blob/main/src/%40orb.yml) |
{: class="table table-striped"}

上記のディレクトリは、作成した Orb に含まれる Orb コンポーネントを表しています。Orb によっては、一部のコンポーネントが含まれない場合もあります。 @orb.yml は Orb のルートの役割を果たします。 In addition to the directories representing your orb's yaml components, you will also see a '[scripts/](#scripts)' directory where we can store code we want to inject into our components.

`src` 内の各ディレクトリは、[再利用可能な構成]({{site.baseurl}}/2.0/reusing-config)のコンポーネント タイプに対応しており、Orb から追加や削除をすることができます。 たとえば、作成した Orb に `executors` や `jobs` が必要ない場合は、これらのディレクトリを削除できます。

##### @orb.yml
{: #orbyml }
{:.no_toc}

@orb.yml は Orb プロジェクトの "ルート" に相当し、設定ファイルのバージョン、Orb の説明、display キーが記述されており、必要に応じて追加の Orb をインポートできます。

`display` キーは、`home_url` (プロダクトやサービスのホーム) と `source_url` (Git リポジトリの URL) に Orb レジストリへのクリック可能なリンクを追加するために使用します。

```yaml
version: 2.1

description: >
  サンプルの Orb の説明

display:
  home_url: "https://www.website.com/docs"
  source_url: "https://www.github.com/EXAMPLE_ORG/EXAMPLE_PROJECT"
```

##### コマンド
{: #commands }
{:.no_toc}

[再利用可能なコマンド]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-commands) をオーサリングして、`src/executors` ディレクトリに追加します。 このディレクトリ内の各 _YAML_ ファイルは、1 つの Orb コマンドとして扱われます。コマンド名にはファイル名が使用されます。

This example shows a simple command which contains a single `run` step, which will echo "hello" and the value passed in the `target` parameter.

```yaml
description: >
  # ここには、このコマンドの目的を記述します。
  # 短くわかりやすい説明を心がけます。
parameters:
  target:
    type: string
    default: "Hello"
    description: "To whom to greet?"
steps:
  - run:
      name: Hello World
      environment:
        ORB_PARAM_TARGET: << parameters.target >>
      command: echo "Hello ${ORB_PARAM_TARGET}"
```

##### 使用例
{: #examples }
{:.no_toc}

[使用例]({{site.baseurl}}/2.0/orb-concepts/#usage-examples)をオーサリングして、`src/examples` ディレクトリに追加できます。 使用例は、エンド ユーザーが自分のプロジェクトの設定ファイルにそのまま使用することを目的としたものではなく、Orb 開発者が [Orb レジストリ](https://circleci.com/developer/ja/orbs)でユースケースごとの例を共有し、他のユーザーが参照できるようにするための手段です。

このディレクトリ内の各 _YAML_ ファイルは、1 つの Orb 使用例として扱われます。名前にはファイル名が使用されます。

View a full example from the [Orb Template](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/examples).

##### Executor
{: #executors }
{:.no_toc}

[パラメーター化された Executor]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-executors) をオーサリングして、`src/executors` ディレクトリに追加します。

このディレクトリ内の各 _YAML_ ファイルは、1 つの Orb Executor として扱われます。名前にはファイル名が使用されます。

View a full example from the [Orb Template](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/executors).

##### ジョブ
{: #jobs }
{:.no_toc}

[パラメーター化されたジョブ]({{site.baseurl}}/2.0/reusing-config/#authoring-parameterized-jobs) をオーサリングして、`src/jobs` ディレクトリに追加します。

このディレクトリ内の各 _YAML_ ファイルは、1 つの Orb ジョブとして扱われます。名前にはファイル名が使用されます。

ジョブには、ユーザーが最小限の構成でタスクを完全に自動化できるように、Orb コマンドやステップを組み込むことができます。

View the _[hello.yml](https://github.com/CircleCI-Public/Orb-Template/blob/main/src/jobs/hello.yml)_ job example from the [Orb Template](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/jobs).

```yaml
description: >
  # ここには、このジョブの目的を記述します。
  # Descriptions should be short, simple, and clear.

docker:
  - image: cimg/base:current
parameters:
  greeting:
    type: string
    default: "Hello"
    description: "Select a proper greeting"
steps:
  - greet:
      greeting: "<< parameters.greeting >>"
```

#### スクリプト
{: #scripts }

One of the major benefits of the Orb Development Kit is a [script inclusion]({{site.baseurl}}/2.0/orb-concepts/#file-include-syntax) feature. When using the `circleci orb pack` command in the CLI (automated when using the Orb Development Kit), you can use the value `<<include(file)>>` within your orb config code, for any key, to include the file contents directly in the orb.

これは、_bash_ コードが多数含まれるような、複雑な Orb コマンドを記述する際に特に便利です _(もちろん、Python を使用することもできます!)_。

{:.tab.scripts.Orb_Development_Kit_Packing}
```yaml
parameters:
  to:
    type: string
    default: "World"
    description: "Hello to whom?"
steps:
  - run:
      environment:
        PARAM_TO: <<parameters.to>>
      name: Hello Greeting
      command: <<include(scripts/greet.sh)>>
```

{:.tab.scripts.Standard_YAML_Config}
```yaml
parameters:
  to:
    type: string
    default: "World"
    description: "あいさつする相手"
steps:
  - run:
      name: 指定した相手にあいさつ
      command: echo "Hello <<parameters.to>>"
```

##### スクリプトをインクルードする理由
{: #why-include-scripts }
{:.no_toc}

CircleCI の設定ファイルは `YAML` 形式で記述されています。 `bash` などの論理的なコードは、カプセル化して、`YAML` を介して CircleCI 上で実行できますが、開発者にとっては実行形式ではないファイル内にプログラム コードを記述してテストするのは不便です。 また、`<<parameter>>` 構文は CircleCI ネイティブの YAML 機能強化であり、ローカルで解釈、実行されるものではないため、複雑なスクリプトではパラメーターの扱いが煩雑になることがあります。

Using the Orb Development Kit and the `<<include(file)>>` syntax, you can import existing scripts into your orb, locally execute and test your orb scripts, and even utilize true testing frameworks for your code.

##### スクリプトでのパラメーターの使用
{: #using-parameters-with-scripts }
{:.no_toc}

スクリプトの移植性やローカルでの実行可能性を維持するために、スクリプト内で使用する環境変数を事前に検討し、設定ファイル レベルで設定することをお勧めします。 前述の `greet.yml` コマンド ファイルに特別な `<<include(file)>>` 構文でインクルードされた `greet.sh` ファイルは、次のようなものです。

```shell
echo Hello "${PARAM_TO}"
```

これで、スクリプトをローカルでモックしてテストできます。

### Orb のテスト
{: #testing-orbs }

Much like any software, to ensure quality updates, we must test our changes. There are a variety of methods and tools available for testing your orb from simple validation, to unit and integration testing.

In the `.circleci/` directory created by the Orb Development Kit, you will find a `config.yml` file and a `test-deploy.yml` file. You will find in the `config.yml` file, the different static testing methods we apply to orbs, such as linting, shellchecking, reviewing, validating, and in some cases, unit testing. While, the `test-deploy.yml` config file is used to test a development version of the orb for integration testing.

詳しくは、「[Orb のテスト手法]({{site.baseurl}}/2.0/testing-orbs/)」をお読みください。

### Orb のパブリッシュ
{: #publishing-your-orb }

With the Orb Development Kit, a fully automated CI and CD pipeline is automatically configured within `.circleci/config.yml`. この構成により、Orb のセマンティック バージョニングによるリリースを簡単に自動デプロイできます。

詳細については、「[Orb のパブリッシュ]({{site.baseurl}}/2.0/creating-orbs/)」を参照してください。

### Orb の一覧表示
{: #listing-your-orbs }

List your available orbs using the CLI:

To list **[public]({{site.baseurl}}/2.0/orb-intro/#public-orbs)** orbs:
```shell
circleci orb list <my-namespace>
```

To list **[private]({{site.baseurl}}/2.0/orb-intro/#private-orbs)** orbs:
```shell
circleci orb list <my-namespace> --private
```

For more information on how to use the `circleci orb` command, see the CLI [documentation](https://circleci-public.github.io/circleci-cli/circleci_orb.html).

### Orb のカテゴリ設定
{: #categorizing-your-orb }

<div class="alert alert-warning" role="alert">
Orb のカテゴリ設定は CircleCI Server では<strong>利用できません。</strong>
</div>

作成した Orb を [Orb レジストリ](https://circleci.com/developer/ja/orbs)で見つけやすくするために、カテゴリを設定できます。 カテゴリを設定した Orb は、[Orb レジストリ](https://circleci.com/developer/ja/orbs)でカテゴリを指定して検索できるようになります。 Orb を見つけやすくするために、CircleCI が Orb のカテゴリ項目を作成、編集する場合もあります。

#### カテゴリの一覧表示
{: #listing-categories }

![Example of showing listing categories using the CLI](  {{ site.baseurl }}/assets/img/docs/orb-categories-list-categories.png)

Orb には最大 2 つのカテゴリを選択できます。 使用できるカテゴリは以下のとおりです。

- Artifacts/Registry (アーティファクト/レジストリ)
- Build (ビルド)
- Cloud Platform (クラウド プラットフォーム)
- Code Analysis (コード解析)
- Collaboration (コラボレーション)
- Containers (コンテナ)
- Deployment (デプロイメント)
- Infra Automation (インフラ自動化)
- Kubernetes
- Language/Framework (言語/フレームワーク)
- Monitoring (モニタリング)
- Notifications (通知)
- Reporting (レポート)
- Security (セキュリティ)
- Testing (テスト)

カテゴリの一覧は、CLI コマンド `circleci orb list-categories` を実行して表示することもできます。 このコマンドの詳細については、[こちら](https://circleci-public.github.io/circleci-cli/circleci_orb_list-categories.html)を参照してください。

#### カテゴリへの Orb の追加
{: #add-an-orb-to-a-category }

![Adding an orb category](  {{ site.baseurl }}/assets/img/docs/orb-categories-add-to-category.png)

選んだカテゴリに Orb を追加するには、`circleci orb add-to-category <namespace>/<orb> "<category-name>"` を実行します。 このコマンドの詳細については、[こちら](https://circleci-public.github.io/circleci-cli/circleci_orb_add-to-category.html)を参照してください。

#### カテゴリからの Orb の削除
{: #remove-an-orb-from-a-category }

![Removing an orb from a category](  {{ site.baseurl }}/assets/img/docs/orb-categories-remove-from-category.png)

カテゴリから Orb を削除するには、`circleci orb remove-from-category <namespace>/<orb> "<category-name>"` を実行します。 このコマンドの詳細については、[こちら](https://circleci-public.github.io/circleci-cli/circleci_orb_remove-from-category.html)を参照してください。

#### Orb のカテゴリ項目の表示
{: #viewing-an-orbs-categorizations }

![Show which categorizations have been added to an orb](  {{ site.baseurl }}/assets/img/docs/orb-categories-orb-info.png)

Orb に適用したカテゴリ項目を表示するには、`circleci orb info <namespace>/<orb>` を実行して表示される一覧を確認します。 このコマンドの詳細については、[こちら](https://circleci-public.github.io/circleci-cli/circleci_orb_info.html)を参照してください。