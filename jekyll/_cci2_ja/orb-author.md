---
layout: classic-docs
title: "Orb のオーサリングプロセス"
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

この Orb オーサリングガイドは、[Orb の概要]({{site.baseurl}}/orb-intro) と [Orb オーサリングの概要]({{site.baseurl}}/orb-author-intro)のドキュメントを読み、名前空間を宣言していることを前提にしています。 これらが完了していれば、Orb の作成を開始できます。

Orb を初めて作成する方も、本番レベルで用意したい方も、[Orb 開発キット](#orb-development-kit)を使って Orb の開発を始めることをお勧めします。 または、Orb は[再利用可能な設定]({{site.baseurl}}/ja/reusing-config/)をパッケージにしたものなので、単体の `yaml` ファイルとして Orb を[手動で]({{site.baseurl}}/ja/orb-author-validate-publish)記述し、[CircleCI Orb 用の CLI]({{site.baseurl}}/ja/local-cli/#installation) を使用してパブリッシュすることも可能です。


## Orb 開発キット
{: #orb-development-kit }

Orb 開発キットは、相互に連携する複数のツールをセットにしたものです。キットを使うと CircleCI でのテストとデプロイが自動化されるため、Orb の開発プロセスが簡易化されます。 The `orb init` command is the key to using the Orb Development Kit. This command initiates a new orb project based on a template, and that template uses the other tools in the kit to automatically test and deploy your orb.

Orb 開発キットは、次の要素で構成されています。

* [Orb テンプレート](https://github.com/CircleCI-Public/Orb-Template)
* [CircleCI CLI](https://circleci-public.github.io/circleci-cli/)
    * [Orb Pack コマンド]({{site.baseurl}}/orb-concepts/#orb-packing)
    * [Orb Init コマンド](https://circleci-public.github.io/circleci-cli/circleci_orb_init.html)
* [Orb ツールの Orb](https://circleci.com/developer/orbs/orb/circleci/orb-tools)

The **orb template** is a repository with CircleCI's orb project template, which is automatically ingested and modified by the `orb init` command.

The **CircleCI CLI** contains two commands which are designed to work with the kit. The **orb init command** initializes a new orb project, and the **orb pack command** packs the orb source into a single `orb.yml` file.

The **orb tools orb** is an orb for creating orbs.

## Orb の作成、テスト、パブリッシュ
{: #create-test-and-publish-an-orb }

下記の手順に従って、Orb 開発キットを使って独自の Orb を作成、テスト、パブリッシュすることができます。

### はじめよう
{: #getting-started }

Orb 開発キットを使って新しい Orb の作成を始めるには、以下の手順を実行します。 最初に行うのは、[GitHub.com](https://github.com) でのリポジトリの新規作成です。

GitHub 上の組織 (Organization) が、Orb の作成先となる [CircleCI の名前空間]({{site.baseurl}}/ja/orb-concepts/#namespaces)のオーナーになります。 You can also view the video below learn more on getting started. 組織が個人のもので、ご自身が名前空間のオーナーであれば、問題ありません。

<div class="video-wrapper">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/5ta4RUwqOBI" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

1. **新しい_空の_ [GitHub リポジトリ](https://github.com/new)を作成します。**

    リポジトリの名前は、特に重要ではありませんが、"myProject-orb" のような分かりやすい名前を付けることをお勧めします。![新しい GitHub リポジトリ]({{site.baseurl}}/assets/img/docs/new_orb_repo_gh.png)

    **注:** リポジトリが完全に空であるようにしてください。 "README.md を追加する"、"ライセンスを選ぶ" といったオプションのチェックはすべて外してください。
    {: class="alert alert-warning"}

    必要な項目の設定が終わると、新しいリポジトリの内容を確認するページが開き、生成された Git の URL が表示されます。 この URL をメモしておいてください。 手順 4 で必要になります。 URL は SSH か HTTPS を選択できます。 どちらを選択しても認証を行えます。 ![Orb レジストリ]({{site.baseurl}}/assets/img/docs/github_new_quick_setup.png)

    **注:** Orb 用にローカルディレクトリを作成する必要がありますが、Orb リポジトリをプルする必要はありません。 このプロセスは`orb init` プロセスで完了するため、その前にこのリポジトリをプルすると問題が発生します。
    {: class="alert alert-warning"}

1. **CircleCI CLI を更新します。**

    最新バージョンの CircleCI CLI を使用していることを確認してください。 `v0.1.17087` 以降の CLI を使用している必要があります。

    ```shell
    $ circleci update

    $ circleci version
    ```

1. **Orb を初期化します。**

    ターミナルを開き、`orb init` CLI コマンドを使用して、新しい Orb プロジェクトを初期化します。

    CircleCI Server をご利用の場合は、</code>--private</code> フラグが使われており、Orb がインストール環境内でプライベートになっていることを確認してください。

    **[パブリック]({{site.baseurl}}/orb-intro/#public-orbs)** Orb を初期化する場合:

    ```shell
    circleci orb init /path/to/myProject-orb
    ```
    **[プライベート]({{site.baseurl}}/orb-intro/#private-orbs)** Orb を初期化する場合:
    ```shell
    circleci orb init /path/to/myProject-orb --private
    ```

    Orb は一旦初期化されると、**パブリックからプライペートに、またはその逆に変更することはできません。** プライベート Orb を作成したい場合は、必ず `--private` フラグをつけてください。
    {: class="alert alert-warning"}

    `circleci orb init` コマンドを、Orb プロジェクト用に作成して初期化するディレクトリを付けて呼び出します。 このディレクトリと Git のプロジェクト リポジトリには、同じ名前を使用することをお勧めします。


1. **Orb の完全自動セットアップ オプションを選択します。**

    ```shell
      ? Would you like to perform an automated setup of this orb?:
          ▸ Yes, walk me through the process.
      No, I'll handle everything myself.
    ```

    手動オプションを選択した場合は、[手動による Orb オーサリングプロセス]({{site.baseurl}}/ja/orb-author-validate-publish/)で Orb をパブリッシュする方法を参照してください。

    完全自動オプションを選択すると、[Orb-Template](https://github.com/CircleCI-Public/Orb-Template) がダウンロードされ、カスタマイズした設定内容が自動的に反映されます。 プロジェクトは CircleCI でフォローされ、自動化された CI/CD パイプラインが含められます。

    CI/CD パイプラインの詳細については、[Orb のパブリッシュ]({{site.baseurl}}/ja/creating-orbs/)を参照してください。

    または、[Orb テンプレート](https://github.com/CircleCI-Public/Orb-Template)をダウンロードするだけの便利な方法を選ぶ場合は、「すべて手動で行う」を選択します。

1. **指示に従って、Orb を設定し、セットアップを進めます。**

    バックグラウンドでは、入力内容に基づいて`orb init` コマンドが [Orb テンプレート](https://github.com/CircleCI-Public/Orb-Template)をコピーし、カスタマイズを実行します。 各ディレクトリにある詳細な `README.md` ファイルには、それぞれのディレクトリのコンテンツに関する有益な情報が記載されています。 手順 1 で取得したリモート Git リポジトリ の URL も、入力が求められます。

    [Orb テンプレート](https://github.com/CircleCI-Public/Orb-Template)には、完全な CI/CD パイプライン (詳細は、[Orb のパブリッシュプロセス]({{site.baseurl}}/ja/creating-orbs/)を参照) が含まれており、Orb の[パッケージ化]({{site.baseurl}}/ja/orb-concepts/#orb-packing)、[テスト]({{site.baseurl}}/ja/testing-orbs/)、[パブリッシュ](https://circleci.com/docs/ja/creating-orbs/)が自動的に実行されます。

    セットアッププロセスでは、[パーソナル API トークン]({{site.baseurl}}/ja/managing-api-tokens/)を `orb-publishing` [コンテキスト]({{site.baseurl}}/ja/contexts/)に保存するかどうかを尋ねられます。 Orb の開発版と安定版をパブリッシュするためには、このトークンを保存しておくことが必要です。 これまでに Orb を作成したことがある場合は、コンテキストが既に存在するためこの手順はスキップできます。

1. **コンテキストが制限されていることを確認します。**

    _[Organization Settings (組織設定)] > [Contexts (コンテキスト)]_ に移動して、コンテキストを制限します。

    Orb のセットアップが完了したら、`orb-publishing` という新しいコンテキストが表示されます。 この `orb-publishing` をクリックして、_セキュリティ グループ_を追加します。 セキュリティ グループを使うと、ジョブのトリガーを許可されたユーザーだけにアクセスを制限することができます。 プライベートの[パーソナル API トークン]({{site.baseurl}}/ja/managing-api-tokens/)にアクセスできるのも、これらのユーザーだけです。

    詳細については、「[コンテキストのガイド]({{site.baseurl}}/ja/contexts/#restricting-a-context)」を参照してください。
    {: class="alert alert-warning"}
    <div class="video-wrapper">
      <iframe width="560" height="315" src="https://www.youtube.com/embed/ImPE969yv08" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    </div>

6. **変更を Github にプッシュします。**

    このセットアッププロセスの間に、`orb init`コマンドは、自動 Orb 開発パイプラインを準備するための手順を実行します。 CLI が処理を続行し、circleci.com でプロジェクトを自動的にフォローするには、その前に、CLI によって生成された修正済みのテンプレート コードがリポジトリにプッシュされている必要があります。 これを実行するよう要求されたら、別のターミナルから以下のコマンドを、「default-branch」を実際のデフォルト ブランチの名前に置き換えて実行します。
    ```shell
    git push origin <default-branch>
    ```
    完了したら、元のターミナルに戻って、変更がプッシュされたことを確認します。

1. **セットアップを完了します。**

    変更がプッシュされたら、ターミナルに戻り、セットアッププロセスを続けます。 CLI が CircleCI のプロジェクトを自動的にフォローし、同じコードで Orb をビルドしテストするパイプラインのトリガーを試みます。

    CircleCI 上でプロジェクトのビルドへのリンクが表示され、全パイプラインを見ることができます。 また、 CLI によって自動的に ` alpha` という名前の新しい開発ブランチに移行されたことも確認できます。 ブランチ名は何でもかまいません。`alpha`だけで作成する必要はありません。

1. **ダイナミックコンフィグを有効にします。**

    CircleCI では[ダイナミックコンフィグ]({{site.baseurl}}/dynamic-config/)を使用しているため、まずこの機能を有効にする必要があります。 最初のパイプラインでは「この機能は有効になっていません。」というエラーメッセージを受け取ります。

    [ダイナミックコンフィグ入門ガイド]({{site.baseurl}}/ja/dynamic-config/#getting-started-with-dynamic-config-in-circleci)に従って、CircleCI でご自身の Orb の **Project Settings** を開き、**Advanced** に行き、**Enable dynamic config using setup workflows** ボタンをクリックします。

    有効化されると、その後のプロジェクトへのすべてのコミットは全パイプラインを介して実行され、Orb を実行します。 この時点で、パイプラインを手動で再実行することはできますが、現時点ではサンプルコードのみを使用しているため、必要ありません。

1.  **Orb を作成します。**

    デフォルト以外のブランチから (セットアップ時に` alpha`ブランチに自動的に移動します)、サンプル Orb コードを好みに合わせて変更します。 _プッシュする_たびに、Orb が自動的にビルドおよびテストされます。

    Orb コンポーネントのテスト方法を確認し、Orb の変更に伴ってテストを変更するには、必ず _[.circleci/test-deploy](https://github.com/CircleCI-Public/Orb-Template/blob/main/.circleci/test-deploy.yml)_ ファイルを参照してください。 Orb のテストに関する詳細は、[ Orb のテストに関するドキュメント]({{site.baseurl}}/ja/testing-orbs/)を参照してください。

    最初の本番バージョンの Orb をデプロイする準備ができたら、「[Orb のパブリッシュプロセス]({{site.baseurl}}/ja/creating-orbs/)」ガイドで変更事項のデプロイに関する情報を参照してください。
    <div class="video-wrapper">
      <iframe width="560" height="315" src="https://www.youtube.com/embed/kTeRJrwxShI" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    </div>

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

| タイプ                       | 名前                                                                                 |
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

| タイプ                        | 名前                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------ |
| <i class="fa fa-folder" aria-hidden="true"></i>  | [commands](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/commands)   |
| <i class="fa fa-folder" aria-hidden="true"></i> | [examples](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/examples)   |
| <i class="fa fa-folder" aria-hidden="true"></i> | [executors](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/executors) |
| <i class="fa fa-folder" aria-hidden="true"></i> | [jobs](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/jobs)           |
| <i class="fa fa-file-text-o" aria-hidden="true"></i> | [scripts](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/scripts)     |
| <i class="fa fa-file-text-o" aria-hidden="true"></i> | [@orb.yml](https://github.com/CircleCI-Public/Orb-Template/blob/main/src/%40orb.yml) |
{: class="table table-striped"}

上記のディレクトリは、作成した Orb に含まれる Orb コンポーネントを表しています。 @orb.yml は Orb のルートとしての役割を果たします。 Orb の yaml コンポーネントを表すディレクトリに加えて、 '[スクリプト](#scripts)' ディレクトリも表示されます。このディレクトリには、コンポーネントに挿入するコードを保存できます。

`src` 内の各ディレクトリは、[再利用可能な設定]({{site.baseurl}}/reusing-config)のコンポーネントタイプに対応しており、Orb から追加や削除することができます。 たとえば、作成した Orb に `executors` や `jobs` が必要ない場合は、これらのディレクトリを削除できます。

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

[再利用可能なコマンド]({{site.baseurl}}/reusing-config/#authoring-reusable-commands) をオーサリングして、`src/executors` ディレクトリに追加します。 このディレクトリ内の各 _YAML_ ファイルは、1 つの Orb コマンドとして扱われます。コマンド名にはファイル名が使用されます。

次の例は、単一の `run` ステップを含むシンプルなコマンドを示しています。このステップでは、"hello" をエコーし、値が `target` パラメーターで渡されます。

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

[使用例]({{site.baseurl}}/ja/orb-concepts/#usage-examples)をオーサリングして、`src/examples` ディレクトリに追加します。 使用例は、エンド ユーザーが自分のプロジェクトの設定ファイルにそのまま使用することを目的としたものではなく、Orb 開発者が [Orb レジストリ](https://circleci.com/developer/ja/orbs)でユースケースごとの例を共有し、他のユーザーが参照できるようにするための手段です。

このディレクトリ内の各 _YAML_ ファイルは、Orb 使用例として扱われます。名前にはファイル名が使用されます。

[Orb テンプレート](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/examples)で完全な使用例を確認できます。

##### Executor
{: #executors }
{:.no_toc}

[パラメーター化された Executor]({{site.baseurl}}/reusing-config/#authoring-reusable-executors) をオーサリングして、`src/executors` ディレクトリに追加します。

このディレクトリ内の各 _YAML_ ファイルは、1 つの Orb Executor として扱われます。名前にはファイル名が使用されます。

[Orb テンプレート](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/executors)で完全な使用例を確認できます。

##### ジョブ
{: #jobs }
{:.no_toc}

[パラメーター化されたジョブ]({{site.baseurl}}/reusing-config/#authoring-parameterized-jobs)をオーサリングして、`src/jobs` ディレクトリに追加します。

このディレクトリ内の各 _YAML_ ファイルは、Orb ジョブとして扱われます。名前にはファイル名が使用されます。

ジョブには、ユーザーが最小限の設定でタスクを完全に自動化できるように、Orb コマンドやステップを組み込むことができます。

以下は、[Orb テンプレート](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/jobs)に含まれている _[hello.yml](https://github.com/CircleCI-Public/Orb-Template/blob/main/src/jobs/hello.yml)_ ジョブの例です。

```yaml
description: >
  # ここには、このジョブの目的を記述します。
  # 短くわかりやすい説明を心がけます。

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

Orb 開発キットの大きな利点の一つは、[スクリプトのインクルード]({{site.baseurl}}/ja/orb-concepts/#file-include-syntax)機能です。 CLI で `circleci orb pack` コマンドを使用すると (Orb 開発キットを使用する場合は自動化されます)、Orb 設定ファイルコード内で任意のキーに `<<include(file)>>` という値を使用できます。この値を使用すると、指定したファイルの内容が Orb にそのまま組み込まれます。

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

Orb 開発キットと `<<include(file)>>` 構文を使用すると、既存のスクリプトを Orb にインポートして、Orb スクリプトをローカルで実行、テストでき、コードに対して本格的なテストフレームワークを利用することも可能になります。

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

すべてのソフトウェアと同様に、品質の高い更新を確実に行うためには変更をテストする必要があります。 Orb のテストには、簡単な検証から単体テストやインテグレーションテストまで様々な方法とツールがあります。

Orb 開発キットにより作成された`.circleci/` ディレクトリには、`config.yml` ファイルと `test-deploy.yml` ファイルが入っています。 `config.yml` ファイルには、リント、シェルチェク、レビュー、検証、そしてケースによっては、単体テストなどの Orb に用いる様々な静的なテスト方法が含まれています。 一方、`test-deploy.yml` 設定ファイルは、Orb の開発版のインテグレーションテストのために使用されます。

詳しくは、「[Orb のテスト手法]({{site.baseurl}}/ja/testing-orbs/)」をお読みください。

### Orb のパブリッシュ
{: #publishing-your-orb }

Orb 開発キットを使用すると、完全に自動化された CI/CD パイプラインが `.circleci/config.yml` 内に自動的に設定されます。 この設定により、Orb のセマンティックバージョニングによるリリースを簡単に自動デプロイできます。

詳細については、「[Orb のパブリッシュ]({{site.baseurl}}/creating-orbs/)」を参照してください。

### Orb の一覧表示
{: #listing-your-orbs }

CLI を使用して、公開されている Orb を一覧表示できます。

**[パブリック]({{site.baseurl}}/ja/orb-intro/#public-orbs)** Orb を一覧表示する場合:
```shell
circleci orb list <my-namespace>
```

**[プライベート]({{site.baseurl}}/ja/orb-intro/#private-orbs)** Orb を一覧表示する場合:
```shell
circleci orb list <my-namespace> --private

```

`circleci orb` コマンドの使用方法の詳細については、[CLI に関するドキュメント](https://circleci-public.github.io/circleci-cli/circleci_orb.html)を参照してください。

### Orb のカテゴリ設定
{: #categorizing-your-orb }

Orb のカテゴリ設定は CircleCI Server では**利用できません。**
{: class="alert alert-warning"}

作成した Orb を [Orb レジストリ](https://circleci.com/developer/ja/orbs)で見つけやすくするために、カテゴリを設定できます。 カテゴリを設定した Orb は、[Orb レジストリ](https://circleci.com/developer/ja/orbs)でカテゴリを指定して検索できるようになります。 Orb を見つけやすくするために、CircleCI が Orb のカテゴリ項目を作成、編集する場合もあります。

#### カテゴリの一覧表示
{: #listing-categories }

![CLI を使ったカテゴリリストの表示例](  {{ site.baseurl }}/assets/img/docs/orb-categories-list-categories.png)

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

![Orb カテゴリの追加](  {{ site.baseurl }}/assets/img/docs/orb-categories-add-to-category.png)

選んだカテゴリに Orb を追加するには、`circleci orb add-to-category <namespace>/<orb> "<category-name>"` を実行します。 このコマンドの詳細については、[こちら](https://circleci-public.github.io/circleci-cli/circleci_orb_add-to-category.html)を参照してください。

#### カテゴリからの Orb の削除
{: #remove-an-orb-from-a-category }

![カテゴリからの Orb の削除](  {{ site.baseurl }}/assets/img/docs/orb-categories-remove-from-category.png)

カテゴリから Orb を削除するには、`circleci orb remove-from-category <namespace>/<orb> "<category-name>"` を実行します。 このコマンドの詳細については、[こちら](https://circleci-public.github.io/circleci-cli/circleci_orb_remove-from-category.html)を参照してください。

#### Orb のカテゴリ項目の表示
{: #viewing-an-orbs-categorizations }

![Orb に追加されたカテゴリ項目の表示](  {{ site.baseurl }}/assets/img/docs/orb-categories-orb-info.png)

Orb に適用したカテゴリ項目を表示するには、`circleci orb info <namespace>/<orb>` を実行して表示される一覧を確認します。 このコマンドの詳細については、[こちら](https://circleci-public.github.io/circleci-cli/circleci_orb_info.html)を参照してください。
