---
layout: classic-docs
title: "Orb のオーサリング プロセス"
short-title: "Orb のオーサリング"
description: "CircleCI Orb のオーサリングに関する入門ガイド"
categories:
  - はじめよう
order: 1
version:
  - Cloud
---

* 目次
{:toc}

## はじめに
{: #introduction }

この Orb オーサリング ガイドは、事前に「[Orb の概要]({{site.baseurl}}/2.0/orb-intro)」を読み、名前空間の要求が終わっていることを前提としています。 これらが終わっていれば、Orb の開発準備は完了です。

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

GitHub 上の組織 (Organization) が、Orb の作成先となる[名前空間]({{site.baseurl}}/2.0/orb-concepts/#%E5%90%8D%E5%89%8D%E7%A9%BA%E9%96%93)のオーナーになります。 組織が自分個人のもので、名前空間のオーナーが自分自身であれば、問題ありません。

1. **新しい [GitHub リポジトリ](https://github.com/new)を作成します。 **<br/> リポジトリの名前は、特に重要な役割はありませんが、"myProject-orb" のような分かりやすい名前を付けることをお勧めします。 ![Orb レジストリ]({{site.baseurl}}/assets/img/docs/new_orb_repo_gh.png)

    必要な項目の設定が終わると、新しいリポジトリの内容を確認するページが開き、生成された Git の URL が表示されます。 この URL をメモしておいてください。 手順 4 で必要になります。 URL は SSH か HTTPS を選択できます。 どちらを選択しても認証を行えます。 ![Orb レジストリ]({{site.baseurl}}/assets/img/docs/github_new_quick_setup.png)

    **Note:** While you must create a local directory for your orb before initializing, it is not necessary to pull down the orb repository. This process will be completed in the `orb init` process and pulling the repository beforehand will cause issues.
    {: class="alert alert-warning"}

1. **ターミナルを開き、`orb init` CLI コマンドを使用**して、**[パブリック](https://circleci.com/docs/ja/2.0/orb-intro/#public-orbs)**Orb を初期化します。
```bash
circleci orb init /path/to/myProject-orb
```
**[プライベート](https://circleci.com/docs/ja/2.0/orb-intro/#private-orbs)** Orb を初期化する場合:
```bash
circleci orb init /path/to/myProject-orb --private
```
`circleci orb init` コマンドを、Orb プロジェクト用に作成して初期化するディレクトリを付けて呼び出します。 このディレクトリと Git のプロジェクト リポジトリには、同じ名前を使用することをお勧めします。

1. **Orb の完全自動セットアップ オプションを選択します。**
```
? Would you like to perform an automated setup of this orb?:（ Orb の自動セットアップを実行しますか？）
  ▸ Yes, walk me through the process. （はい、手順を教えてください。)
    )
    )
    No, I'll handle everything myself.（いいえ、すべて手動で行います。
```
When choosing the manual option, see [Manual Orb Authoring Process](https://circleci.com/docs/2.0/orb-author-validate-publish/) for instructions on how to publish your orb.

完全自動オプションを選択すると、[Orb プロジェクト テンプレート](https://github.com/CircleCI-Public/Orb-Project-Template) がダウンロードされ、カスタマイズした設定内容が自動的に反映されます。 プロジェクトは CircleCI でフォローされ、自動化された CI/CD パイプラインが含まれます。 <br/><br/> 含まれる CI/CD パイプラインの詳細については、「[Orb のパブリッシュ]({{site.baseurl}}/2.0/creating-orbs/)」を参照してください。 または、[Orb プロジェクト テンプレート](https://github.com/CircleCI-Public/Orb-Project-Template)を便利な方法でダウンロードするだけに留める場合は、「No, I'll handle everything myself (すべて手動で行う)」を選択します。

1. **質問に答えて Orb の構成とセットアップを進めます。 **<br/> バックグラウンドでは、回答に基づいて`orb init` コマンドが [Orb プロジェクト テンプレート](https://github.com/CircleCI-Public/Orb-Project-Template)をコピーし、カスタマイズを実行します。 各ディレクトリにある詳細な `README.md` ファイルには、それぞれのディレクトリのコンテンツに関する有益な情報が記載されています。 手順 1 でメモしておいたリモート Git リポジトリの URL も、ここで入力を求められます。 <br/><br/> [Orb プロジェクト テンプレート](https://github.com/CircleCI-Public/Orb-Project-Template)には、完全な CI/CD パイプライン (詳細は「[Orb のパブリッシュ]({{site.baseurl}}/2.0/creating-orbs/)」を参照) が含まれており、Orb の[パッケージ化]({{site.baseurl}}/2.0/orb-concepts/#orb-packing)、[テスト]({{site.baseurl}}/2.0/testing-orbs/)、パブリッシュが自動的に実行されます。 <br/><br/> セットアップ プロセスでは、[パーソナル API トークン]({{site.baseurl}}/2.0/managing-api-tokens/)を `orb-publishing` [コンテキスト]({{site.baseurl}}/2.0/contexts/)に保存するかどうかを尋ねられます。 Orb の開発版と安定版をパブリッシュするためには、このトークンを保存しておくことが必要です。

    **注: コンテキストの制限**
    <br/>
    _[Organization Settings (組織設定)] > [Contexts (コンテキスト)]_ に移動して、コンテキストを制限してください。 <br/><br/> Orb のセットアップが完了したら、`orb-publishing` という新しいコンテキストが表示されます。 この `orb-publishing` をクリックして、_セキュリティ グループ_を追加します。 セキュリティ グループを使うと、ジョブのトリガーを許可されたユーザーだけにアクセスを制限することができます。 プライベートの[パーソナル API トークン]({{site.baseurl}}/2.0/managing-api-tokens/)にアクセスできるのも、これらのユーザーだけです。 詳細については、「[コンテキストの使用]({{site.baseurl}}/2.0/contexts/#%E3%82%B3%E3%83%B3%E3%83%86%E3%82%AD%E3%82%B9%E3%83%88%E3%81%AE%E5%88%B6%E9%99%90)」を参照してください。
    {: class="alert alert-warning"}

1. **変更を GitHub にプッシュします。 **<br/> セットアップ プロセス中に、`orb init` コマンドによって、自動化された Orb 開発パイプラインの準備が進められます。 CLI が処理を続行し、circleci.com でプロジェクトを自動的にフォローするには、その前に、CLI によって生成された修正済みのテンプレート コードがリポジトリにプッシュされている必要があります。 これを実行するよう要求されたら、別のターミナルから以下のコマンドを、「default-branch」を実際のデフォルト ブランチの名前に置き換えて実行します。
```bash
git push origin <default-branch>
```
完了したら、元のターミナルに戻って、変更がプッシュされたことを確認します。

1. **Orb の記述を完了します。 **<br/> 新しい Orb プロジェクトが CircleCI で自動的にフォローされ、テスト用に最初の開発バージョン `<namespace>/<orb>@dev:alpha` (hello-world サンプル) が生成されて、CLI が終了します。 <br/><br/> CircleCI 上にビルドされたプロジェクトへのリンクが提供されます。 そこで、バリデーション、パッケージ化、テスト、パブリッシュのプロセスを確認できます。 また、CLI によって自動的に `alpha` という新しい開発ブランチに移行したことも確認できます。 <br/><br/> この新しいブランチから、変更を加えたりプッシュしたりすることができます。 これで、コミットするたびに、Orb がパッケージ化、バリデーション、テスト (任意) され、パブリッシュできるようになりました。 <br/><br/> Orb の最初のメジャー バージョンをデプロイする準備が整ったら、[Orb のパブリッシュ]({{site.baseurl}}/2.0/creating-orbs/)で、セマンティック バージョニング (semver) を使った変更のデプロイに関する情報を確認してください。

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

| 種類                        | 名前                                                                                               |
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

| 種類                         | 名前                                                                                             |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| <i class="fa fa-folder" aria-hidden="true"></i>  | [commands](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/commands)   |
| <i class="fa fa-folder" aria-hidden="true"></i>  | [examples](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/examples)   |
| <i class="fa fa-folder" aria-hidden="true"></i>  | [executors](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/executors) |
| <i class="fa fa-folder" aria-hidden="true"></i> | [jobs](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/jobs)           |
| <i class="fa fa-file-text-o" aria-hidden="true"></i> | [@orb.yml](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/%40orb.yml) |
{: class="table table-striped"}

上記のディレクトリは、作成した Orb に含まれる Orb コンポーネントを表しています。 @orb.yml は Orb のルートの役割を果たします。 任意で Orb 開発を強化するための [`scripts`](#scripts) ディレクトリと [`tests`](#testing-orbs) ディレクトリがプロジェクトに含まれている場合もあります。 これらのディレクトリについては、このページの「[スクリプト](#scripts)」セクションと、「[Orb のテスト手法]({{site.baseurl}}/2.0/testing-orbs/)」ガイドをご覧くさだい。

`src` 内の各ディレクトリは、[再利用可能な構成]({{site.baseurl}}/2.0/reusing-config)のコンポーネント タイプに対応しており、Orb から追加や削除をすることができます。 例えば、作成した Orb に `Executor` や `Job` が必要ない場合は、これらのディレクトリを削除できます。

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

[再利用可能なコマンド]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-commands) をオーサリングして、`src/executors` ディレクトリに追加します。 このディレクトリ内の各 _YAML_ ファイルは、1 つの Orb コマンドとして扱われます。 コマンド名にはファイル名が使用されます。

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
      name: Hello World
      command: echo << parameters.greeting >> world
```

##### 使用例
{: #examples }
{:.no_toc}

[使用例]({{site.baseurl}}/2.0/orb-concepts/#usage-examples)をオーサリングして、`src/examples` ディレクトリに追加します。 使用例は、エンド ユーザーが自分のプロジェクトの設定ファイルにそのまま使用することを目的としたものではなく、Orb 開発者が [Orb レジストリ](https://circleci.com/developer/ja/orbs)でユースケースごとの例を共有し、他のユーザーが参照できるようにするための手段です。

このディレクトリ内の各 _YAML_ ファイルは、1 つの Orb 使用例として扱われます。 名前にはファイル名が使用されます。

[Orb プロジェクト テンプレート](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/examples)で完全なサンプルを確認できます。

##### Executor
{: #executors }
{:.no_toc}

[パラメーター化された Executor]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-executors) をオーサリングして、`src/executors` ディレクトリに追加します。

このディレクトリ内の各 _YAML_ ファイルは、1 つの Orb Executor として扱われます。 名前にはファイル名が使用されます。

[Orb プロジェクト テンプレート](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/executors)で完全なサンプルを確認できます。

##### ジョブ
{: #jobs }
{:.no_toc}

[パラメーター化されたジョブ]({{site.baseurl}}/2.0/reusing-config/#authoring-parameterized-jobs) をオーサリングして、`src/jobs` ディレクトリに追加します。

このディレクトリ内の各 _YAML_ ファイルは、1 つの Orb ジョブとして扱われます。 名前にはファイル名が使用されます。

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

Orb 開発キットが備える大きな利点の 1 つが、スクリプトのインクルード機能です。 `circleci orb pack` コマンドを使用すると (Orb 開発キットを使用する場合は自動化されます)、Orb 設定ファイル コード内で任意のキーに `<<include(file)>>` という値を使用できます。

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

```bash
echo Hello "${PARAM_TO}"
```

これで、スクリプトをローカルでモックしてテストできます。

### Orb のテスト
{: #testing-orbs }

他のソフトウェアと同様、コードをテストする方法は複数あります。 どれだけのテストを実装するかは、開発者が決めることができます。 この時点で、設定ファイル内には　[integration-test-1](https://github.com/CircleCI-Public/Orb-Project-Template/blob/96c5d2798114fffe7903e2f5c9f021023993f338/.circleci/config.yml#L27) という名前のジョブがあります。 作成した Orb コンポーネントをテストするには、このジョブを更新する必要があります。 これは一種の_インテグレーション テスト_で、 Orb の単体テストも可能です。 Orb の単体テストも可能です。

詳しくは、「[Orb のテスト手法]({{site.baseurl}}/2.0/testing-orbs/)」をお読みください。

### 更新履歴の記録
{: #keeping-a-changelog }

Orb のバージョン間の違いは、ときに判別しにくいものです。 そのため、セマンティック バージョニングと合わせて、バージョン間の変更内容をわかりやすく示した更新履歴の活用もお勧めします。 Orb プロジェクト テンプレートに `CHANGELOG.md` ファイルが含まれています。 Orb のバージョン更新のたびに、このファイルも更新してください。 ファイルは、[更新履歴の記録](https://keepachangelog.com/ja/1.0.0/) の形式を基にしています。

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

CLI を使用して、公開されている Orb を一覧表示できます。

**[パブリック](https://circleci.com/docs/2.0/orb-intro/#public-orbs)** Orb を一覧表示する場合:
```sh
circleci orb list <my-namespace>
```

**[プライベート](https://circleci.com/docs/2.0/orb-intro/#private-orbs)** Orb を一覧表示する場合:
```sh
circleci orb list <my-namespace> --private
```

`circleci orb` コマンドの使用方法の詳細については、[CLI に関するドキュメント](https://circleci-public.github.io/circleci-cli/circleci_orb.html)を参照してください。
