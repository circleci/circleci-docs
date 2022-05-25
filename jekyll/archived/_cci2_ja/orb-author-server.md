---
layout: classic-docs
title: "サーバーでの Orb オーサリングプロセス"
description: "サーバーでの CircleCI Orb のオーサリング入門ガイド."
categories: [はじめよう]
order: 1
version:
  - Server v3.x
---

* TOC
{:toc}

## はじめに
{: #introduction }

この Orb オーサリングガイドは、[Orb の概要]({{site.baseurl}}/2.0/orb-intro) と [Orb オーサリングの概要]({{site.baseurl}}/2.0/orb-author-intro)のドキュメントを読み、名前空間を宣言していることを前提にしています。 これらが完了していれば、Orb の作成を開始できます。

Orb を初めて作成する方も、本番レベルで準備する方も、[Orb 開発キット](#orb-development-kit)を使って Orb の作成を開始することをお勧めします。 または、Orb は[再利用可能な設定]({{site.baseurl}}/ja/2.0/reusing-config)をパッケージにしたものなので、単体の `yaml` ファイルとして Orb を[手動で]({{site.baseurl}}/ja/2.0/orb-author-validate-publish)記述し、[CircleCI Orb 用の CLI]({{site.baseurl}}/ja/2.0/local-cli/#installation) を使用してパブリッシュすることも可能です。

## Orb 開発キット
{: #orb-development-kit }

キットを使うと CircleCI でのテストとデプロイが自動化されるため、Orb の開発プロセスが容易になります。 Orb 開発キットは、次の要素で構成されています。

* [Orb プロジェクト テンプレート](https://github.com/CircleCI-Public/Orb-Project-Template)
* [Orb パッケージ]({{site.baseurl}}/ja/2.0/orb-concepts/#orb-packing)
* [Orb Init](https://circleci-public.github.io/circleci-cli/circleci_orb_init.html)
* [Orb ツールの Orb](https://circleci.com/developer/orbs/orb/circleci/orb-tools)

### はじめよう
{: #getting-started }

Orb 開発キットで新しい Orb の作成を始めるには、以下の手順を実行します。 最初に行うのは、[GitHub.com](https://github.com) でのリポジトリの新規作成です。

GitHub 上の組織 (Organization) が、Orb の作成先となる[CircleCI の名前空間]({{site.baseurl}}/2.0/orb-concepts/#namespaces)のオーナーになります。 組織が自分個人のもので、名前空間のオーナーが自分自身であれば、問題ありません。

`--host` オプションを使用してローカルリポジトリの場所を指定することで、パブリッククラウドの Orb ではなくローカルサーバーの Orb にアクセスできます。 例えば、サーバーの場所が `http://circleci.somehostname.com` である場合、 `--host \http://cirlceci.somehostname.com` を渡すと、その Orb リポジトリに対してローカルで Orb コマンドを実行できます。

1. **新しい [GitHub リポジトリ](https://github.com/new)を作成します。**
<br>
リポジトリの名前は、特に重要ではありませんが、"myProject-orb" のような分かりやすい名前を付けることをお勧めします。![Orb レジストリ]({{site.baseurl}}/assets/img/docs/new_orb_repo_gh.png)

    完了すると、新しいリポジトリの内容を確認するページが開き、生成された Git の URL が表示されます。 この URL をメモしておいてください。 手順 4 で必要になります。 URL は SSH か HTTPS を選択できます。 どちらを選択しても認証を行えます。 ![Orb レジストリ]({{site.baseurl}}/assets/img/docs/github_new_quick_setup.png)

    **注: **Orb 用にローカルディレクトリを作成する必要がありますが、Orb リポジトリをプルする必要はありません。 このプロセスは`orb init` プロセスで完了するため、その前にこのリポジトリをプルすると問題が発生します。
    {: class="alert alert-warning"}

1. **ターミナルを開き、`orb init` CLI コマンドを使って新しい Orb プロジェクトを初期化します。 ****CircleCI Server をご使用の場合は、必ずここで `--private` フラグを使って Orb をプライベートな状態に設定します。
<br>
**[パブリック]({{site.baseurl}}/2.0/orb-intro/#public-orbs)** Orb を初期化する場合:
<!---->
```shell
circleci orb init /path/to/myProject-orb --host <your-server-installation-domain>
```
**[プライベート]({{site.baseurl}}/2.0/orb-intro/#private-orbs)** Orb を初期化する場合:
```shell
circleci orb init /path/to/myProject-orb --private --host <your-server-installation-domain>
```
<!---->
    Orb は一旦初期化されると、**パブリックからプライペートに、またはその逆に変更することはできません。** プライベート Orb を作成したい場合は、必ず `--private` フラグをつけてください。

    `circleci orb init` コマンドを、Orb プロジェクト用に作成して初期化するディレクトリを付けて呼び出します。 このディレクトリと Git のプロジェクト リポジトリには、同じ名前を使用することをお勧めします。

1. **Orb 完全自動設定オプションを選択します。** <br>
<!---->
```shell
  ? Would you like to perform an automated setup of this orb?:
      ▸ Yes, walk me through the process.
  No, I'll handle everything myself.
```
<!---->
    手動オプションを選択した場合は、[手動による Orb オーサリングプロセス]({{site.baseurl}}/ja/2.0/orb-author-validate-publish/)で Orb をパブリッシュする方法を参照してください。

    完全自動オプションを選択すると、[Orb-Project-Template](https://github.com/CircleCI-Public/Orb-Project-Template) がダウンロードされ、カスタマイズした設定内容が自動的に反映されます。 プロジェクトは CircleCI でフォローされ、自動化された CI/CD パイプラインが含められます。
    
    含められる CI/CD パイプラインに関する詳細は、 [Orb のパブリッシュプロセス]({{site.baseurl}}/ja/2.0/creating-orbs/) を参照してください。
    
    または、[Orb-Project-Template](https://github.com/CircleCI-Public/Orb-Project-Template) をダウンロードするだけの便利な方法を選ぶ場合は、「すべて手動で行う」を選択します。

1. **質問に答えて、Orb を設定し、セットアップを進めます。**
<br>
    バックグラウンドでは、入力内容に基づいて`orb init` コマンドが [Orb プロジェクトテンプレート](https://github.com/CircleCI-Public/Orb-Project-Template)をコピーし、カスタマイズを実行します。 各ディレクトリにある詳細な `README.md` ファイルには、それぞれのディレクトリのコンテンツに関する有益な情報が記載されています。 手順 1 で取得したリモート Git リポジトリ の URL も、入力が求められます。

    [Orb プロジェクトテンプレート](https://github.com/CircleCI-Public/Orb-Project-Template)には、完全な CI/CD パイプライン (詳細は、[Orb のパブリッシュプロセス]({{site.baseurl}}/ja/2.0/creating-orbs/)を参照) が含まれており、Orb の[パッケージ化]({{site.baseurl}}/ja/2.0/orb-concepts/#orb-packing)、[テスト]({{site.baseurl}}/ja/2.0/testing-orbs/)、パブリッシュが自動的に実行されます。

    セットアッププロセスでは、[パーソナル API トークン]({{site.baseurl}}/ja/2.0/managing-api-tokens/)を `orb-publishing` <a href="{{site.baseurl}}/ja/2.0/contexts/>コンテキスト</a>に保存するかどうかを尋ねられます。 Orb の開発版と安定版をパブリッシュするためには、このトークンを保存しておくことが必要です。

    **注: コンテキストの制限**
    <br/>
    _[Organization Settings (組織設定)] > [Contexts (コンテキスト)]_ に移動して、コンテキストを制限してください。 <br/><br/> Orb のセットアップが完了したら、`orb-publishing` という新しいコンテキストが表示されます。 この `orb-publishing` をクリックして、_セキュリティ グループ_を追加します。 セキュリティ グループを使うと、ジョブのトリガーを許可されたユーザーだけにアクセスを制限することができます。 プライベートの[パーソナル API トークン]({{site.baseurl}}/ja/2.0/managing-api-tokens/)にアクセスできるのも、これらのユーザーだけです。 詳細については、「[コンテキストの使用]({{site.baseurl}}/ja/2.0/contexts/#restricting-a-context)」を参照してください。
    {: class="alert alert-warning"}

1. **変更を Github にプッシュします。**
<br>
    このセットアッププロセスの間に、`orb init`コマンドは、自動 Orb 開発パイプラインを準備するための手順を実行します。 CLI が処理を続行し、circleci.com でプロジェクトを自動的にフォローするには、その前に、CLI によって生成された修正済みのテンプレートコードがリポジトリにプッシュされている必要があります。 これを実行するよう要求されたら、別のターミナルから以下のコマンドを、「default-branch」を実際のデフォルトブランチの名前に置き換えて実行します。
    ```shell
    git push origin <default-branch>
    ```
    完了したら、元のターミナルに戻って、変更がプッシュされたことを確認します。

1. **完了して Orb を記述します。**
<br>
    CLI は、自動的に CircleCI 上の新しい Orb プロジェクトに従ってテスト用の最初の開発バージョン `<namespace >/<orb>@dev:alpha` を生成し終了します (hello-world サンプル)。

    CircleCI でビルドしているプロジェクトへのリンクが表示され、確認、パッケージ化、テスト、パブリッシュプロセスを確認できます。 また、 CLI によって自動的に ` alpha` という名前の新しい開発ブランチに移行されたことも確認できます。

    新しいブランチから、変更を行いプッシュする準備が整いました。 この時点から、コミットごとに、Orb のパッケージ化、確認、テスト (オプション) が行われ、パブリッシュできます。

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

`src` 内の各ディレクトリは、[再利用可能な設定]({{site.baseurl}}/ja/2.0/reusing-config)のコンポーネント タイプに対応しており、Orb から追加や削除をすることができます。 たとえば、作成した Orb に `executors` や `jobs` が必要ない場合は、これらのディレクトリを削除できます。

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

ジョブには、ユーザーが最小限の設定でタスクを完全に自動化できるように、Orb コマンドやステップを組み込むことができます。

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

### 更新履歴の記録更新履歴
{: #keeping-a-changelog }

Orb のバージョン間の違いは、ときに判別しにくいものです。 そのため、セマンティック バージョニングと合わせて、バージョン間の変更内容をわかりやすく示した更新履歴の提供もお勧めします。 Orb プロジェクト テンプレートに `CHANGELOG.md` ファイルが含まれています。Orb のバージョン更新のたびに、このファイルも更新してください。 ファイルは、[Keep a Changelog](https://keepachangelog.com/ja/1.0.0/) の形式を基にしています。

### Orb のパブリッシュ
{: #publishing-your-orb }

Orb 開発キットを使用すると、完全に自動化された CI/CD パイプラインが `.circleci/config.yml` 内に自動的に設定されます。 この設定により、Orb のセマンティック バージョニングによるリリースを簡単に自動デプロイできます。

詳細については、「[Orb のパブリッシュ]({{site.baseurl}}/2.0/creating-orbs/)」を参照してください。

### Orb の一覧表示
{: #listing-your-orbs }

CLI を使用して、公開中の Orb を一覧表示します。

**[パブリック]({{site.baseurl}}/2.0/orb-intro/#public-orbs)** Orb を一覧表示する場合:
```shell
circleci orb list <my-namespace> --host <your-server-hostname>
```

**[プライベート]({{site.baseurl}}/2.0/orb-intro/#private-orbs)** Orb を一覧表示する場合:
```shell
circleci orb list <my-namespace> --private --host <your-server-hostname>
```

`circleci orb` コマンドの使用方法の詳細については、[CLI に関するドキュメント](https://circleci-public.github.io/circleci-cli/circleci_orb.html)を参照してください。

## 次のステップ
{: #next-steps }

* CircleCI Server で Orb を管理する方法に関する詳細は、[Orb の管理]({{site.baseurl}}/ja/2.0/server-3-operator-orbs/)ガイドを参照してください。
