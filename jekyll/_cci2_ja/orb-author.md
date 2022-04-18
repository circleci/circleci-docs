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

この Orb オーサリングガイドは、[Orb の概要]({{site.baseurl}}/2.0/orb-intro) と [Orb オーサリングの概要]({{site.baseurl}}/2.0/orb-author-intro)のドキュメントを読み、名前空間を宣言していることを前提にしています。 これらが完了していれば、Orb の作成を開始できます。

Orb を初めて作成する方も、本番レベルで用意したい方も、[Orb 開発キット](#orb-development-kit)を使って Orb の開発を始めることをお勧めします。 または、Orb は[再利用可能な設定]({{site.baseurl}}/ja/2.0/reusing-config)をパッケージにしたものなので、単体の `yaml` ファイルとして Orb を[手動で]({{site.baseurl}}/ja/2.0/orb-author-validate-publish)記述し、[CircleCI Orb 用の CLI]({{site.baseurl}}/ja/2.0/local-cli/#installation) を使用してパブリッシュすることも可能です。

## Orb の作成、テスト、パブリッシュ
{: #create-test-and-publish-an-orb }

下記の手順に従って、Orb 開発キットを使って独自の Orb を作成、テスト、パブリッシュすることができます。

Orb 開発キットは、相互に連携する複数のツールをセットにしたものです。キットを使うと CircleCI でのテストとデプロイが自動化されるため、Orb の開発プロセスが容易になります。 Orb 開発キットは、次の要素で構成されています。

* [Orb テンプレート](https://github.com/CircleCI-Public/Orb-Template)
* [CircleCI CLI](https://circleci-public.github.io/circleci-cli/)
    * [Orb Pack コマンド]({{site.baseurl}}/2.0/orb-concepts/#orb-packing)
    * [Orb Init コマンド](https://circleci-public.github.io/circleci-cli/circleci_orb_init.html)
* [Orb ツールの Orb](https://circleci.com/developer/orbs/orb/circleci/orb-tools)

### はじめよう
{: #getting-started }

Orb 開発キットで新しい Orb の作成を始めるには、以下の手順を実行します。 最初に行うのは、[GitHub.com](https://github.com) でのリポジトリの新規作成です。

GitHub 上の組織 (Organization) が、Orb の作成先となる[CircleCI の名前空間]({{site.baseurl}}/2.0/orb-concepts/#namespaces)のオーナーになります。 組織が自分個人のもので、名前空間のオーナーが自分自身であれば、問題ありません。

1. **新しい [GitHub リポジトリ](https://github.com/new)を作成します。**

    リポジトリの名前は、特に重要ではありませんが、"myProject-orb" のような分かりやすい名前を付けることをお勧めします。![New GitHub Repo]({{site.baseurl}}/assets/img/docs/new_orb_repo_gh.png)

    必要な項目の設定が終わると、新しいリポジトリの内容を確認するページが開き、生成された Git の URL が表示されます。 この URL をメモしておいてください。 手順 4 で必要になります。 URL は SSH か HTTPS を選択できます。 どちらを選択しても認証を行えます。 ![Orb レジストリ]({{site.baseurl}}/assets/img/docs/github_new_quick_setup.png)

    **注: **Orb 用にローカルディレクトリを作成する必要がありますが、Orb リポジトリをプルする必要はありません。 このプロセスは`orb init` プロセスで完了するため、その前にこのリポジトリをプルすると問題が発生します。
    {: class="alert alert-warning"}

1. **CircleCI CLI を更新します。**

    最新バージョンの CircleCI CLI を使用していることを確認してください。 `v0.1.17087`以降の CLI を使用している必要があります。

    ```shell
    $ circleci update

    $ circleci version
    ```

2. ** Orb を起動します。**

    ターミナルを開き、`orb init` CLI コマンドを使用して、新しい Orb プロジェクトを初期化します。

    CircleCI Server をご利用の場合は、</code>--private</code> フラグが使われており、Orb がインストール環境内でプライベートになっていることを確認してください。

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

    完全自動オプションを選択すると、[Orb-Template](https://github.com/CircleCI-Public/Orb-Template) がダウンロードされ、カスタマイズした設定内容が自動的に反映されます。 プロジェクトは CircleCI でフォローされ、自動化された CI/CD パイプラインが含められます。

    CI/CD パイプラインの詳細については、[Orb のパブリッシュ]({{site.baseurl}}/ja/2.0/creating-orbs/)を参照してください。

    または、[Orb テンプレート](https://github.com/CircleCI-Public/Orb-Template)をダウンロードするだけの便利な方法を選ぶ場合は、「すべて手動で行う」を選択します。

4. **指示に従って、Orb を設定し、セットアップを進めます。**

    バックグラウンドでは、入力内容に基づいて`orb init` コマンドが [Orb テンプレート](https://github.com/CircleCI-Public/Orb-Template)をコピーし、カスタマイズを実行します。 各ディレクトリにある詳細な `README.md` ファイルには、それぞれのディレクトリのコンテンツに関する有益な情報が記載されています。 手順 1 で取得したリモート Git リポジトリ の URL も、入力が求められます。

    [Orb テンプレート](https://github.com/CircleCI-Public/Orb-Template)には、完全な CI/CD パイプライン (詳細は、[Orb のパブリッシュプロセス]({{site.baseurl}}/ja/2.0/creating-orbs/)を参照) が含まれており、Orb の[パッケージ化]({{site.baseurl}}/ja/2.0/orb-concepts/#orb-packing)、[テスト]({{site.baseurl}}/ja/2.0/testing-orbs/)、[パブリッシュ](https://circleci.com/docs/2.0/creating-orbs/)が自動的に実行されます。

    セットアッププロセスでは、[パーソナル API トークン]({{site.baseurl}}/ja/2.0/managing-api-tokens/)を `orb-publishing` <a href="{{site.baseurl}}/ja/2.0/contexts/>コンテキスト</a>に保存するかどうかを尋ねられます。 Orb の開発版と安定版をパブリッシュするためには、このトークンを保存しておくことが必要です。 これまでに Orb を作成したことがある場合は、コンテキストが既に存在するためこの手順はスキップできます。

5. **コンテキストが制限されていることを確認します。**

    _[Organization Settings (組織設定)] > [Contexts (コンテキスト)]_ に移動して、コンテキストを制限します。

    Orb のセットアップが完了したら、`orb-publishing` という新しいコンテキストが表示されます。 この `orb-publishing` をクリックして、_セキュリティ グループ_を追加します。 セキュリティ グループを使うと、ジョブのトリガーを許可されたユーザーだけにアクセスを制限することができます。 プライベートの[パーソナル API トークン]({{site.baseurl}}/2.0/managing-api-tokens/)にアクセスできるのも、これらのユーザーだけです。

    詳細については、「[コンテキストのガイド]({{site.baseurl}}/ja/2.0/contexts/#restricting-a-context)」を参照してください。
    {: class="alert alert-warning"}

6. **変更を Github にプッシュします。**

    このセットアッププロセスの間に、`orb init`コマンドは、自動 Orb 開発パイプラインを準備するための手順を実行します。 CLI が処理を続行し、circleci.com でプロジェクトを自動的にフォローするには、その前に、CLI によって生成された修正済みのテンプレート コードがリポジトリにプッシュされている必要があります。 これを実行するよう要求されたら、別のターミナルから以下のコマンドを、「default-branch」を実際のデフォルト ブランチの名前に置き換えて実行します。
    ```shell
    git push origin <default-branch>
    ```
    完了したら、元のターミナルに戻って、変更がプッシュされたことを確認します。

7. **セットアップを完了します。**

    変更がプッシュされたら、ターミナルに戻り、セットアッププロセスを続けます。 CLI が CircleCI のプロジェクトを自動的にフォローし、同じコードで Orb をビルドしテストするパイプラインのトリガーを試みます。

    CircleCI 上でプロジェクトのビルドへのリンクが表示され、全パイプラインを見ることができます。 また、 CLI によって自動的に ` alpha` という名前の新しい開発ブランチに移行されたことも確認できます。 ブランチ名は何でもかまいません。`alpha`だけで作成する必要はありません。

8. **ダイナミックコンフィグを有効にします。**

    CircleCI では[ダイナミックコンフィグ]({{site.baseurl}}/2.0/dynamic-config/)を使用しているため、まずこの機能を有効にする必要があります。 最初のパイプラインでは「この機能は有効になっていません。」というエラーメッセージを受け取ります。

    [ダイナミックコンフォぐ入門ガイド]({{site.baseurl}}/ja/2.0/dynamic-config/#getting-started-with-dynamic-config-in-circleci)に従って、CircleCI でご自身の Orb の **Project Settings** を開き、**Advanced** に行き、**Enable dynamic config using setup workflows** ボタンをクリックします。

    有効化されると、その後のプロジェクトへのすべてのコミットは全パイプラインを介して実行され、Orb を実行します。 この時点で、パイプラインを手動で再実行することはできますが、現時点ではサンプルコードのみを使用しているため、必要ありません。

9. **Orb を作成します。**

    デフォルト以外のブランチから (セットアップ時に` alpha`ブランチに自動的に移動します)、サンプル Orb コードを好みに合わせて変更します。 _push_のたびに、Orb が自動的にビルドおよびテストされます。

    Orb コンポーネントのテスト方法を確認し、Orb の変更に伴ってテストを変更するには、必ず _[.circleci/test-deploy](https://github.com/CircleCI-Public/Orb-Template/blob/main/.circleci/test-deploy.yml)_ ファイルを参照してください。 Orb のテストに関する詳細は、[ Orb のテストに関するドキュメント]({{site.baseurl}}/ja/2.0/testing-orbs/)を参照してください。

    最初の本番バージョンの Orb をデプロイする準備ができたら、「[Orb のパブリッシュプロセス]({site.basel}}/ja/2.0/creating-orbs/)」ガイドで変更事項のデプロイに関する情報を参照してください。

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

| type                      | 名前                                                                                 |
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