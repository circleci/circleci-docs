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
---

* 目次
{:toc}

## はじめに
{: #introduction }

This orb authoring guide assumes you have read the [Introduction to orbs]({{site.baseurl}}/2.0/orb-intro) document, the [Introduction to authoring an orb]({{site.baseurl}}/2.0/orb-author-intro) document, and claimed your namespace. これらが終わっていれば、Orb の開発準備は完了です。

Orb を初めて作成する方も、本番レベルで準備する方も、[Orb 開発キット](#orb-development-kit)を使って Orb の開発を始めることをお勧めします。 一方で、Orb は[再利用可能な構成]({{site.baseurl}}/2.0/reusing-config)をパッケージにしたものなので、単体の `yaml` ファイルとして Orb を[手動で]({{site.baseurl}}/2.0/orb-author-validate-publish)記述し、[CircleCI Orb 用の CLI]({{site.baseurl}}/2.0/local-cli/#%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB) を使用してパブリッシュすることもできます。

## Orb 開発キット
{: #orb-development-kit }

キットを使うと CircleCI でのテストとデプロイが自動化されるため、Orb の開発プロセスが容易になります。 Orb 開発キットは、次の要素で構成されています。

* [Orb プロジェクト テンプレート](https://github.com/CircleCI-Public/Orb-Project-Template)
* [Orb パッケージ]({{site.baseurl}}/ja/2.0/orb-concepts/#orb-packing)
* [Orb Init](https://circleci-public.github.io/circleci-cli/circleci_orb_init.html)
* [Orb ツールの Orb](https://circleci.com/developer/orbs/orb/circleci/orb-tools)

### はじめよう
{: #getting-started }

**注:** 以下の手順は GitHub についてのみ記載されていますが、Orb 開発キットは Bitbucket レポジトリでもご使用いただけます。

Orb 開発キットで新しい Orb の作成を始めるには、以下の手順を実行します。 最初に行うのは、[GitHub.com](https://github.com) でのリポジトリの新規作成です。

Ensure the organization on GitHub is the owner for the [CircleCI namespace]({{site.baseurl}}/2.0/orb-concepts/#namespaces) for which you are developing your orb. 組織が自分個人のもので、名前空間のオーナーが自分自身であれば、問題ありません。

1. **Create a new [GitHub repository](https://github.com/new).**
<br>
The name of your repository is not critical, but we recommend something similar to "myProject-orb". ![Orb レジストリ]({{site.baseurl}}/assets/img/docs/new_orb_repo_gh.png)

    必要な項目の設定が終わると、新しいリポジトリの内容を確認するページが開き、生成された Git の URL が表示されます。 この URL をメモしておいてください。 手順 4 で必要になります。 URL は SSH か HTTPS を選択できます。 どちらを選択しても認証を行えます。 ![Orb レジストリ]({{site.baseurl}}/assets/img/docs/github_new_quick_setup.png)

    **Note:** While you must create a local directory for your orb before initializing, it is not necessary to pull down the orb repository. This process will be completed in the `orb init` process and pulling the repository beforehand will cause issues.
    {: class="alert alert-warning"}

1. **Open a terminal and initialize your new orb project using the `orb init` CLI command.** **If you are using CircleCI server, you should ensure the `--private` flag is used here to keep your orbs private within your installation.**
<br>
To initialize a **[public]({{site.baseurl}}/2.0/orb-intro/#public-orbs)** orb:
<!---->
```shell
circleci orb init /path/to/myProject-orb
```
To initialize a **[private]({{site.baseurl}}/2.0/orb-intro/#private-orbs)** orb:
```shell
circleci orb init /path/to/myProject-orb --private
```
<!---->
    Once an orb is initialized, it **cannot be switched from public to private or vice versa**. Please make sure to add the `--private` flag if you intend to create a private orb.

    The `circleci orb init` command is called, followed by a path that will be created and initialized for our orb project. このディレクトリと Git のプロジェクト リポジトリには、同じ名前を使用することをお勧めします。

1. **Choose the fully automated orb setup option.** <br>
<!---->
```shell
  ? Would you like to perform an automated setup of this orb?:
      ▸ Yes, walk me through the process.
  No, I'll handle everything myself.
```
<!---->
    When choosing the manual option, see [Manual Orb Authoring Process]({{site.baseurl}}/2.0/orb-author-validate-publish/) for instructions on how to publish your orb.

    When choosing the fully automated option, the [Orb-Project-Template](https://github.com/CircleCI-Public/Orb-Project-Template) will be downloaded and automatically modified with your customized settings. プロジェクトは CircleCI でフォローされ、自動化された CI/CD パイプラインが含められます。

    For more information on the included CI/CD pipeline, see the [Orb Publishing Process]({{site.baseurl}}/2.0/creating-orbs/) documentation.

    Alternatively, if you would simply like a convenient way of downloading the [Orb-Project-Template](https://github.com/CircleCI-Public/Orb-Project-Template) you can opt to handle everything yourself.

1. **Answer questions to configure and set up your orb.**
<br>
    In the background, the `orb init` command will be copying and customizing the [Orb Project Template](https://github.com/CircleCI-Public/Orb-Project-Template) based on your inputs. 各ディレクトリにある詳細な `README.md` ファイルには、それぞれのディレクトリのコンテンツに関する有益な情報が記載されています。 You will also be asked for the remote git repository URL that you obtained back in step 1.

    The [Orb Project Template](https://github.com/CircleCI-Public/Orb-Project-Template) contains a full CI/CD pipeline (described in [Orb Publishing Process]({{site.baseurl}}/2.0/creating-orbs/)) which automatically [packs]({{site.baseurl}}/2.0/orb-concepts/#orb-packing), [tests]({{site.baseurl}}/2.0/testing-orbs/), and publishes your orb.

    In the setup process you will be asked if you would like to save your [Personal API Token]({{site.baseurl}}/2.0/managing-api-tokens/) into an `orb-publishing` [context]({{site.baseurl}}/2.0/contexts/). Orb の開発版と安定版をパブリッシュするためには、このトークンを保存しておくことが必要です。

    **注: コンテキストの制限**
    <br/>
    _[Organization Settings (組織設定)] > [Contexts (コンテキスト)]_ に移動して、コンテキストを制限してください。 <br/><br/> Orb のセットアップが完了したら、`orb-publishing` という新しいコンテキストが表示されます。 この `orb-publishing` をクリックして、_セキュリティ グループ_を追加します。 セキュリティ グループを使うと、ジョブのトリガーを許可されたユーザーだけにアクセスを制限することができます。 プライベートの[パーソナル API トークン]({{site.baseurl}}/2.0/managing-api-tokens/)にアクセスできるのも、これらのユーザーだけです。 詳細については、「[コンテキストの使用]({{site.baseurl}}/2.0/contexts/#%E3%82%B3%E3%83%B3%E3%83%86%E3%82%AD%E3%82%B9%E3%83%88%E3%81%AE%E5%88%B6%E9%99%90)」を参照してください。
    {: class="alert alert-warning"}

1. **Push the changes up to Github.**
<br>
    During the setup process, the `orb init` command takes steps to prepare your automated orb development pipeline. CLI が処理を続行し、circleci.com でプロジェクトを自動的にフォローするには、その前に、CLI によって生成された修正済みのテンプレート コードがリポジトリにプッシュされている必要があります。 これを実行するよう要求されたら、別のターミナルから以下のコマンドを、「default-branch」を実際のデフォルト ブランチの名前に置き換えて実行します。
    ```shell
    git push origin <default-branch>
    ```
    完了したら、元のターミナルに戻って、変更がプッシュされたことを確認します。

1. **Complete and write your orb.**
<br>
    The CLI will finish by automatically following your new orb project on CircleCI and generating the first development version `<namespace>/<orb>@dev:alpha` for testing (a hello-world sample).

    You will be provided with a link to the project building on CircleCI where you can view the validation, packing, testing, and publication process. You should also see the CLI has automatically migrated you into a new development branch, named `alpha`.

    From your new branch you are now ready to make and push changes. From this point on, on every commit, your orb will be packed, validated, tested (optional), and can be published.

    When you are ready to deploy the first major version of your orb, find information on deploying changes with semver versioning in the [Orb Publishing Process]({{site.baseurl}}/2.0/creating-orbs/) guide.

### Orb の記述
{: #writing-your-orb }

Orb の作成を始める前に、デフォルト以外のブランチにいることを確認してください。 通常は、`alpha` ブランチで Orb の作業を始めることをお勧めします。

```shell
$ git branch

* alpha
  main
```

`circleci orb init` コマンドを実行すると、自動的に `alpha` ブランチに移動し、リポジトリに `.circleci` ディレクトリと `src` ディレクトリが作成されます。

**_例: Orb プロジェクトの構造_**

| type                      | name                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| <i class="fa fa-folder" aria-hidden="true"></i> | [.circleci](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/.circleci)       |
| <i class="fa fa-folder" aria-hidden="true"></i> | [.github](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/.github)           |
| <i class="fa fa-folder" aria-hidden="true"></i> | [src](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src)                   |
| <i class="fa fa-file-text-o" aria-hidden="true"></i> | [.gitignore](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/.gitignore)     |
| <i class="fa fa-file-text-o" aria-hidden="true"></i> | [CHANGELOG.md](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/CHANGELOG.md) |
| <i class="fa fa-file-text-o" aria-hidden="true"></i> | [LICENSE](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/LICENSE)           |
| <i class="fa fa-file-text-o" aria-hidden="true"></i> | [README.md](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/README.md)       |
{: class="table table-striped"}

#### Orb のソース
{: #orb-source }

`src` ディレクトリに移動すると、含まれているセクションを確認できます。

**_例: Orb プロジェクトの "src" ディレクトリ_**

| type                       | name                                                                                           |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| <i class="fa fa-folder" aria-hidden="true"></i>  | [commands](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/commands)   |
| <i class="fa fa-folder" aria-hidden="true"></i>  | [examples](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/examples)   |
| <i class="fa fa-folder" aria-hidden="true"></i>  | [executors](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/executors) |
| <i class="fa fa-folder" aria-hidden="true"></i> | [jobs](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/jobs)           |
| <i class="fa fa-file-text-o" aria-hidden="true"></i> | [@orb.yml](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/%40orb.yml) |
{: class="table table-striped"}

上記のディレクトリは、作成した Orb に含まれる Orb コンポーネントを表しています。Orb によっては、一部のコンポーネントが含まれない場合もあります。 @orb.yml は Orb のルートの役割を果たします。 任意で Orb 開発を強化するための [`scripts`](#scripts) ディレクトリと [`tests`](#testing-orbs) ディレクトリがプロジェクトに含まれている場合もあります。これらのディレクトリについては、このページの「[スクリプト](#scripts)」セクションと、「[Orb のテスト手法]({{site.baseurl}}/2.0/testing-orbs/)」ガイドに解説があります。

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

[再利用可能なコマンド]({{site.baseurl}}/ja/2.0/reusing-config/#authoring-reusable-commands)を自分でオーサリングして、`src/commands` ディレクトリに追加することができます。 このディレクトリ内の各 _YAML_ ファイルは、1 つの Orb コマンドとして扱われます。コマンド名にはファイル名が使用されます。

以下は、[Orb プロジェクト テンプレート](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src)に含まれているサンプル コマンドの _[greet.yml](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/commands/greet.yml)_ です。

```yaml
description: >
  # ここには、このコマンドの目的を記述します。
  # 短くわかりやすい説明を心がけます。
parameters:
  greeting:
    type: string
    default: "Hello"
    description: "適切なあいさつの選択"
steps:
  - run:
      name: あいさつを選択して Hello World を実行
      command: echo << parameters.greeting >> world
```

##### 使用例
{: #examples }
{:.no_toc}

[使用例]({{site.baseurl}}/2.0/orb-concepts/#usage-examples)をオーサリングして、`src/examples` ディレクトリに追加できます。 使用例は、エンド ユーザーが自分のプロジェクトの設定ファイルにそのまま使用することを目的としたものではなく、Orb 開発者が [Orb レジストリ](https://circleci.com/developer/ja/orbs)でユースケースごとの例を共有し、他のユーザーが参照できるようにするための手段です。

このディレクトリ内の各 _YAML_ ファイルは、1 つの Orb 使用例として扱われます。名前にはファイル名が使用されます。

[Orb プロジェクト テンプレート](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/examples)で完全なサンプルを確認できます。

##### Executor
{: #executors }
{:.no_toc}

[パラメーター化された Executor]({{site.baseurl}}/ja/2.0/reusing-config/#authoring-reusable-executors) をオーサリングして、`src/executors` ディレクトリに追加できます。

このディレクトリ内の各 _YAML_ ファイルは、1 つの Orb Executor として扱われます。名前にはファイル名が使用されます。

[Orb プロジェクト テンプレート](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/executors)で完全なサンプルを確認できます。

##### ジョブ
{: #jobs }
{:.no_toc}

[パラメーター化されたジョブ]({{site.baseurl}}/ja/2.0/reusing-config/#authoring-parameterized-jobs) をオーサリングして、`src/jobs` ディレクトリに追加できます。

このディレクトリ内の各 _YAML_ ファイルは、1 つの Orb ジョブとして扱われます。名前にはファイル名が使用されます。

ジョブには、ユーザーが最小限の構成でタスクを完全に自動化できるように、Orb コマンドやステップを組み込むことができます。

以下は、[Orb プロジェクト テンプレート](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/jobs)に含まれているサンプル ジョブの _[hello.yml](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/jobs/hello.yml)_ です。

```yaml
description: >
  # ここには、このジョブの目的を記述します。
  # 短くわかりやすい説明を心がけます。

docker:
  - image: cimg/base:stable
parameters:
  greeting:
    type: string
    default: "Hello"
    description: "適切なあいさつの選択"
steps:
  - greet:
      greeting: "<< parameters.greeting >>"
```

#### スクリプト
{: #scripts }

Orb 開発キットが備える大きな利点の 1 つが、スクリプトのインクルード機能です。 `circleci orb pack` コマンドを使用すると (Orb 開発キットを使用する場合は自動化されます)、Orb 設定ファイル コード内で任意のキーに `<<include(file)>>` という値を使用できます。この値を使用すると、指定したファイルの内容が Orb にそのまま組み込まれます。

これは、_bash_ コードが多数含まれるような、複雑な Orb コマンドを記述する際に特に便利です _(もちろん、Python を使用することもできます!)_。

{:.tab.scripts.Orb_Development_Kit_Packing}
```yaml
parameters:
  to:
    type: string
    default: "World"
    description: "あいさつする相手"
steps:
  - run:
      environment:
        PARAM_TO: <<parameters.to>>
      name: greet ファイルで指定した相手にあいさつ
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

Orb 開発キットと `<<include(file)>>` 構文を使用すると、既存のスクリプトを Orb にインポートして、Orb スクリプトをローカルで実行、テストでき、コードに対して本格的なテスト フレームワークを利用することも可能になります。

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

他のソフトウェアと同様、コードをテストする方法は複数あります。どれだけのテストを実装するかは、開発者が決めることができます。 この時点で、設定ファイル内には　[integration-test-1](https://github.com/CircleCI-Public/Orb-Project-Template/blob/96c5d2798114fffe7903e2f5c9f021023993f338/.circleci/config.yml#L27) という名前のジョブがあります。作成した Orb コンポーネントをテストするには、このジョブを更新する必要があります。 これは一種の_結合テスト_で、 Orb の単体テストも可能です。

詳しくは、「[Orb のテスト手法]({{site.baseurl}}/2.0/testing-orbs/)」をお読みください。

### 更新履歴の記録
{: #keeping-a-changelog }

Orb のバージョン間の違いは、ときに判別しにくいものです。 そのため、セマンティック バージョニングと合わせて、バージョン間の変更内容をわかりやすく示した更新履歴の提供もお勧めします。 Orb プロジェクト テンプレートに `CHANGELOG.md` ファイルが含まれています。Orb のバージョン更新のたびに、このファイルも更新してください。 ファイルは、[Keep a Changelog](https://keepachangelog.com/ja/1.0.0/) の形式を基にしています。

### Orb のパブリッシュ
{: #publishing-your-orb }

Orb 開発キットを使用すると、完全に自動化された CI/CD パイプラインが `.circleci/config.yml` 内に自動的に構成されます。 この構成により、Orb のセマンティック バージョニングによるリリースを簡単に自動デプロイできます。

詳細については、「[Orb のパブリッシュ]({{site.baseurl}}/2.0/creating-orbs/)」を参照してください。

### Orb のカテゴリ設定
{: #categorizing-your-orb }

作成した Orb を [Orb レジストリ](https://circleci.com/developer/ja/orbs)で見つけやすくするために、カテゴリを設定できます。 カテゴリを設定した Orb は、[Orb レジストリ](https://circleci.com/developer/ja/orbs)でカテゴリを指定して検索できるようになります。 Orb を見つけやすくするために、CircleCI が Orb のカテゴリ項目を作成、編集する場合もあります。

#### カテゴリの一覧表示
{: #listing-categories }

![](  {{ site.baseurl }}/assets/img/docs/orb-categories-list-categories.png)

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

![](  {{ site.baseurl }}/assets/img/docs/orb-categories-add-to-category.png)

選んだカテゴリに Orb を追加するには、`circleci orb add-to-category <namespace>/<orb> "<category-name>"` を実行します。 このコマンドの詳細については、[こちら](https://circleci-public.github.io/circleci-cli/circleci_orb_add-to-category.html)を参照してください。

#### カテゴリからの Orb の削除
{: #remove-an-orb-from-a-category }

![](  {{ site.baseurl }}/assets/img/docs/orb-categories-remove-from-category.png)

カテゴリから Orb を削除するには、`circleci orb remove-from-category <namespace>/<orb> "<category-name>"` を実行します。 このコマンドの詳細については、[こちら](https://circleci-public.github.io/circleci-cli/circleci_orb_remove-from-category.html)を参照してください。

#### Orb のカテゴリ項目の表示
{: #viewing-an-orbs-categorizations }

![](  {{ site.baseurl }}/assets/img/docs/orb-categories-orb-info.png)

Orb に適用したカテゴリ項目を表示するには、`circleci orb info <namespace>/<orb>` を実行して表示される一覧を確認します。 このコマンドの詳細については、[こちら](https://circleci-public.github.io/circleci-cli/circleci_orb_info.html)を参照してください。

### Orb の一覧表示
{: #listing-your-orbs }

CLI を使用して、公開中の Orb を一覧表示します。

To list **[public]({{site.baseurl}}/2.0/orb-intro/#public-orbs)** orbs:
```shell
circleci orb list <my-namespace>
```

To list **[private]({{site.baseurl}}/2.0/orb-intro/#private-orbs)** orbs:
```shell
circleci orb list <my-namespace> --private
```

`circleci orb` コマンドの使用方法の詳細については、[CLI に関するドキュメント](https://circleci-public.github.io/circleci-cli/circleci_orb.html)を参照してください。
