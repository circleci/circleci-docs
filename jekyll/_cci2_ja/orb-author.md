---
layout: classic-docs
title: "Orb のオーサリング プロセス"
short-title: "Orb のオーサリング"
description: "CircleCI Orbs のオーサリングに関する入門ガイド"
categories:
  - getting-started
order: 1
version:
  - クラウド
---

* 目次
{:toc}

## はじめに

この Orb オーサリング ガイドは、事前に「[Orb の概要]({{site.baseurl}}/2.0/orb-intro)」を読み、名前空間の要求が終わっていることを前提としています。 これらが終わっていれば、Orb の開発準備は完了です。

初めて Orb を記述する方も、本番レベルで用意したい方も、[Orb 開発キット](#orb-development-kit)を使って Orb の開発を始めることをお勧めします。 一方で、Orb は[再利用可能な構成]({{site.baseurl}}/2.0/reusing-config)をパッケージにしたものなので、単体の `yaml` ファイルとして Orb を[手動で]({{site.baseurl}}/2.0/orb-author-validate-publish)記述し、[CircleCI Orbs 用の CLI]({{site.baseurl}}/2.0/local-cli/#%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB) を使用してパブリッシュすることもできます。

## Orb 開発キット

Orb 開発キットは、相互に連携する複数のツールをセットにしたものです。キットを使うと CircleCI でのテストとデプロイが自動化されるため、Orb の開発プロセスが容易になります。 Orb 開発キットは、次の要素で構成されています。

* [Orb プロジェクト テンプレート](https://github.com/CircleCI-Public/Orb-Project-Template)
* [Orb Pack]({{site.baseurl}}/2.0/orb-concepts/#orb-packing)
* [Orb Init](https://circleci-public.github.io/circleci-cli/circleci_orb_init.html)
* [Orb ツールの Orb](https://circleci.com/developer/orbs/orb/circleci/orb-tools)

<script id="asciicast-362192" src="https://asciinema.org/a/362192.js" async></script>

### Getting started

Orb 開発キットで新しい Orb の作成を始めるには、以下の手順を実行します。 最初に行うのは、[GitHub.com](https://github.com) でのリポジトリの新規作成です。

GitHub 上の組織 (Organization) が、Orb の作成先となる[名前空間]({{site.baseurl}}/2.0/orb-concepts/#%E5%90%8D%E5%89%8D%E7%A9%BA%E9%96%93)のオーナーになります。 組織が自分個人のもので、名前空間のオーナーが自分自身であれば、問題ありません。

1. **新しい [GitHub リポジトリ](https://github.com/new)を作成します。**<br /> リポジトリの名前は、特に重要な役割はありませんが、"myProject-orb" のようなわかりやすい名前を付けることをお勧めします。 ![Orb レジストリ]({{site.baseurl}}/assets/img/docs/new_orb_repo_gh.png)

    必要な項目の設定が終わると、新しいリポジトリの内容を確認するページが開き、生成された Git の URL が表示されます。 この URL をメモしておいてください。手順 4 で必要になります。 URL は SSH か HTTPS を選択できます。どちらを選択しても認証を行えます。 ![Orb レジストリ]({{site.baseurl}}/assets/img/docs/github_new_quick_setup.png)

1. **ターミナルを開き、`orb init` CLI コマンドを使用して新しい　Orb　プロジェクトを初期化します。**

To initialize a **[public](https://circleci.com/docs/2.0/orb-intro/#public-orbs)** orb:
```bash
circleci orb init /path/to/myProject-orb
```

To initialize a **[private](https://circleci.com/docs/2.0/orb-intro/#private-orbs)** orb:
```bash
circleci orb init /path/to/myProject-orb --private
```
The `circleci orb init` command is called, followed by a path that will be created and initialized for our orb project. It is best practice to use the same name for this directory and the git project repo.

1. **Orb の完全自動セットアップ オプションを選択します。**
```
? Would you like to perform an automated setup of this orb?:
  ▸ Yes, walk me through the process.
    No, I'll handle everything myself.
```
When choosing the fully automated option, the [Orb-Project-Template](https://github.com/CircleCI-Public/Orb-Project-Template) will be downloaded and automatically modified with your customized settings. The project will be followed on CircleCI with an automated CI/CD pipeline included. <br /><br /> For more information on the included CI/CD pipeline, see the [Orb Publishing Process]({{site.baseurl}}/2.0/creating-orbs/) documentation. Alternatively, if you would simply like a convenient way of downloading the [Orb-Project-Template](https://github.com/CircleCI-Public/Orb-Project-Template) you can opt to handle everything yourself.

1. **質問に答えて Orb の構成とセットアップを進めます。**<br /> バックグラウンドでは、`orb init` コマンドが [Orb プロジェクト テンプレート](https://github.com/CircleCI-Public/Orb-Project-Template)をコピーし、回答に基づいてカスタマイズを実行します。 各ディレクトリにある詳細な `README.md` ファイルには、それぞれのディレクトリのコンテンツに関する有益な情報が記載されています。 手順 1 でメモしておいたリモート Git リポジトリの URL も、ここで入力を求められます。<br /><br /> [Orb プロジェクト テンプレート](https://github.com/CircleCI-Public/Orb-Project-Template)には、完全な CI/CD パイプライン (詳細は「[Orb のパブリッシュ]({{site.baseurl}}/2.0/creating-orbs/)」を参照) が含まれており、Orb の[パッケージ化]({{site.baseurl}}/2.0/orb-concepts/#orb-packing)、[テスト]({{site.baseurl}}/2.0/testing-orbs/)、パブリッシュが自動的に実行されます。 <br /><br /> セットアップ プロセスでは、[パーソナル API トークン]({{site.baseurl}}/2.0/managing-api-tokens/)を `orb-publishing` [コンテキスト]({{site.baseurl}}/2.0/contexts/)に格納するかどうかを尋ねられます。 Orb の開発版と安定版をパブリッシュするために、このトークンを格納しておくことが必要になります。

    **コンテキストは必ず使用者を制限する**
    <br />
    _[Organization Settings (組織設定)] > [Contexts (コンテキスト)]_ に移動して、コンテキストを制限してください。 <br /><br /> Orb のセットアップが完了したら、`orb-publishing` という新しいコンテキストが表示されます。 この `orb-publishing` をクリックして、_セキュリティ グループ_を追加します。 セキュリティ グループを使うと、ジョブのトリガーを許可されたユーザーだけにアクセスを制限することができます。 プライベートの[パーソナル API トークン]({{site.baseurl}}/2.0/managing-api-tokens/)にアクセスできるのも、これらのユーザーだけです。 <br /><br /> 詳細については、「[コンテキストの使用]({{site.baseurl}}/2.0/contexts/#%E3%82%B3%E3%83%B3%E3%83%86%E3%82%AD%E3%82%B9%E3%83%88%E3%81%AE%E5%88%B6%E9%99%90)」を参照してください。
    {: class="alert alert-warning"}

1. **変更を GitHub にプッシュします。**<br /> セットアップ プロセス中に、`orb init` コマンドによって、自動化された Orb 開発パイプラインの準備が進められます。 CLI が処理を続行し、circleci.com でプロジェクトを自動的にフォローするには、その前に、CLI によって生成された修正済みのテンプレート コードがリポジトリにプッシュされている必要があります。 これを実行するよう要求されたら、別のターミナルから以下のコマンドを、「default-branch」を実際のデフォルト ブランチの名前に置き換えて実行します。
```bash
git push origin <default-branch>
```
Once complete, return to your terminal and confirm the changes have been pushed.

1. **Orb の記述を完了します。**<br /> 新しい Orb プロジェクトが CircleCI で自動的にフォローされ、テスト用に最初の開発バージョン `<namespace>/<orb>@dev:alpha` (hello-world サンプル) が生成されて、CLI が終了します。<br /><br /> CircleCI 上にビルドされたプロジェクトへのリンクが提供されます。そこで、バリデーション、パッケージ化、テスト、パブリッシュのプロセスを確認できます。 また、CLI によって自動的に `alpha` という新しい開発ブランチに移行したことも確認できます。<br /><br /> この新しいブランチから、変更を加えたりプッシュしたりすることができます。 これで、コミットするたびに、Orb がパッケージ化、バリデーション、テスト (任意) され、パブリッシュできるようになりました。<br /><br /> Orb の最初のメジャー バージョンをデプロイする準備が整ったら、「[Orb のパブリッシュ]({{site.baseurl}}/2.0/creating-orbs/)」で、セマンティック バージョニング (semver) を使った変更のデプロイに関する情報を確認してください。

### Writing your orb

Before you begin working on your orb, ensure you are on a non-default branch. We typically recommend starting your orb on the `alpha` branch.

```shell
$ git branch

* alpha
  main
```

If you have run the `circleci orb init` command, you will automatically be in the `alpha` branch and have a repository with `.circleci` and `src` directories.

**_Example: Orb Project Structure_**

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

#### Orb source

Navigate to the `src` directory to look at the included sections.

**_Example: Orb Project "src" Directory_**

| type                       | name                                                                                           |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| <i class="fa fa-folder" aria-hidden="true"></i>  | [commands](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/commands)   |
| <i class="fa fa-folder" aria-hidden="true"></i>  | [examples](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/examples)   |
| <i class="fa fa-folder" aria-hidden="true"></i> | [executors](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/executors) |
| <i class="fa fa-folder" aria-hidden="true"></i> | [jobs](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/jobs)           |
| <i class="fa fa-file-text-o" aria-hidden="true"></i> | [@orb.yml](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/%40orb.yml) |
{: class="table table-striped"}

The directories listed above represent orb components that can be included with your orb. @orb.yml acts as the root of your orb. You may additionally see [`scripts`](#scripts) and [`tests`](#testing-orbs) directories in your project for optional orb development enhancements, which we will cover in the [Scripts](#scripts) section and the [Orb Testing Methodologies]({{site.baseurl}}/2.0/testing-orbs/) guide.

Each directory within `src` corresponds with a [reusable configuration]({{site.baseurl}}/2.0/reusing-config) component type, which can be added or removed from the orb. If, for example, your orb does not require any `executors` or `jobs`, these directories can be deleted.

##### @orb.yml
{:.no_toc}

@orb.yml acts as the "root" to your orb project and contains the config version, the orb description, the display key, and imports any additional orbs if needed.

Use the `display` key to add clickable links to the orb registry for both your `home_url` (the home of the product or service), and `source_url` (the git repository URL).

```yaml
version: 2.1

description: >
  Sample orb description

display:
  home_url: "https://www.website.com/docs"
  source_url: "https://www.github.com/EXAMPLE_ORG/EXAMPLE_PROJECT"
```

##### コマンド
{:.no_toc}

Author and add [Reusable Commands]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-commands) to the `src/commands` directory. Each _YAML_ file within this directory will be treated as an orb command, with a name which matches its filename.

Below is the _[greet.yml](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/commands/greet.yml)_ command example from the [Orb Project Template](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src).

```yaml
description: >
  # What will this command do?
  # 短くわかりやすい説明を心がけます。
parameters:
  greeting:
    type: string
    default: "Hello"
    description: "Select a proper greeting"
steps:
  - run:
      name: Hello World
      command: echo << parameters.greeting >> world
```

##### 例
{:.no_toc}

Author and add [Usage Examples]({{site.baseurl}}/2.0/orb-concepts/#usage-examples) to the `src/examples` directory. Usage Examples are not for use directly by end users in their project configs, but they provide a way for you, the orb developer, to share use-case specific examples on the [Orb Registry](https://circleci.com/developer/orbs) for users to reference.

Each _YAML_ file within this directory will be treated as an orb usage example, with a name which matches its filename.

View a full example from the [Orb Project Template](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/examples).

##### Executor
{:.no_toc}

Author and add [Parameterized Executors]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-executors) to the `src/executors` directory.

Each _YAML_ file within this directory will be treated as an orb executor, with a name that matches its filename.

View a full example from the [Orb Project Template](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/executors).

##### ジョブ
{:.no_toc}

Author and add [Parameterized Jobs]({{site.baseurl}}/2.0/reusing-config/#authoring-parameterized-jobs) to the `src/jobs` directory.

Each _YAML_ file within this directory will be treated as an orb job, with a name that matches its filename.

Jobs can include orb commands and other steps to fully automate tasks with minimal user configuration.

View the _[hello.yml](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/jobs/hello.yml)_ job example from the [Orb Project Template](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/jobs).

```yaml
description: >
  # What will this job do?
  # Descriptions should be short, simple, and clear.

docker:
  - image: cimg/base:stable
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

One of the major benefits of the orb development kit is a script inclusion feature. When using the `circleci orb pack` command (automated when using the orb development kit), you can use the value `<<include(file)>>` within your orb config code, for any key, to include the file contents directly in the orb.

This is especially useful when writing complex orb commands, which might contain a lot of _bash_ code, _(although you could use python too!)_.

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
    description: "Hello to whom?"
steps:
  - run:
      name: Hello Greeting
      command: echo "Hello <<parameters.to>>"
```

##### スクリプトをインクルードする理由
{:.no_toc}

CircleCI configuration is written in `YAML`. Logical code such as `bash` can be encapsulated and executed on CircleCI through `YAML`, but, for developers, it is not convenient to write and test programmatic code within a non-executable format. Also, parameters can become cumbersome in more complex scripts as the `<<parameter>>` syntax is a CircleCI native YAML enhancement, and not something that can be interpreted and executed locally.

Using the orb development kit and the `<<include(file)>>` syntax, you can import existing scripts into your orb, locally execute and test your orb scripts, and even utilize true testing frameworks for your code.

##### スクリプトでのパラメーターの使用
{:.no_toc}

To keep your scripts portable and locally executable, it is best practice to expect a set of environment variables within your scripts and set them at the config level. The `greet.sh` file, which was included with the special `<<include(file)>>` syntax above in our `greet.yml` command file, looks like this:

```bash
echo Hello "${PARAM_TO}"
```

This way, you can both mock and test your scripts locally.

### Testing orbs

Much like any other software, there are multiple ways to test your code and it is entirely up to you as the developer to implement as many tests as desired. Within your config file right now there will be a job named [integration-test-1](https://github.com/CircleCI-Public/Orb-Project-Template/blob/96c5d2798114fffe7903e2f5c9f021023993f338/.circleci/config.yml#L27) that will need to be updated to test your orb components. This is a type of _integration testing_. Unit testing with orbs is possible as well.

Read our full [Orb Testing Methodologies]({{site.baseurl}}/2.0/testing-orbs/) documentation.

### Keeping a changelog

Deciphering the difference between two versions of an orb can prove tricky. Along with semantic versioning, we recommend leveraging a changelog to more clearly describe changes between versions. The orb template comes with the `CHANGELOG.md` file, which should be updated with each new version of your orb. The file uses the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.

### Publishing your orb

With the orb development kit, a fully automated CI and CD pipeline is automatically configured within `.circleci/config.yml`. This configuration makes it simple to automatically deploy semantically versioned releases of your orbs.

For more information, see the [Orb Publishing Process]({{site.baseurl}}/2.0/creating-orbs/) guide.

### Categorizing your orb

You can categorize your orb for better discoverability in the [Orb Registry](https://circleci.com/developer/orbs). Categorized orbs are searchable by category in the [Orb Registry](https://circleci.com/developer/orbs). CircleCI may, from time to time, create or edit orb categorizations to improve orb discoverability.

#### カテゴリの一覧表示

![](  {{ site.baseurl }}/assets/img/docs/orb-categories-list-categories.png)

You can select up to two categories for your orb. These are the available categories:

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

The list of categories can also be obtained by running the `circleci orb list-categories` CLI command. You can view the detailed docs for this command [here](https://circleci-public.github.io/circleci-cli/circleci_orb_list-categories.html).

#### カテゴリへの Orb の追加

![](  {{ site.baseurl }}/assets/img/docs/orb-categories-add-to-category.png)

Add your orb to your chosen category by running `circleci orb add-to-category <namespace>/<orb> "<category-name>"`. You can view the detailed docs for this command [here](https://circleci-public.github.io/circleci-cli/circleci_orb_add-to-category.html).

#### カテゴリからの Orb の削除

![](  {{ site.baseurl }}/assets/img/docs/orb-categories-remove-from-category.png)

Remove an orb from a category by running `circleci orb remove-from-category <namespace>/<orb> "<category-name>"`. You can view the detailed docs for this command [here](https://circleci-public.github.io/circleci-cli/circleci_orb_remove-from-category.html).

#### Orb のカテゴリ項目の表示

![](  {{ site.baseurl }}/assets/img/docs/orb-categories-orb-info.png)

To see which categorizations have been applied an orb, check the output of `circleci orb info <namespace>/<orb>` for a list. You can view the detailed docs for this command [here](https://circleci-public.github.io/circleci-cli/circleci_orb_info.html).

### Listing your orbs

List your available orbs using the CLI:

To list **[public](https://circleci.com/docs/2.0/orb-intro/#public-orbs)** orbs:
```sh
circleci orb list <my-namespace>
```

To list **[private](https://circleci.com/docs/2.0/orb-intro/#private-orbs)** orbs:
```sh
circleci orb list <my-namespace> --private
```

For more information on how to use the `circleci orb` command, see the CLI [documentation](https://circleci-public.github.io/circleci-cli/circleci_orb.html).