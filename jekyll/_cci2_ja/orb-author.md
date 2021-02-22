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

この Orb オーサリング ガイドは、事前に「[Orb の概要]({{site.baseurl}}/ja/2.0/orb-intro)」を読み、名前空間の要求が終わっていることを前提としています。 これらが終わっていれば、Orb の開発準備は完了です。

初めて Orb を記述する方も、本番レベルで用意したい方も、[Orb 開発キット](#orb-%E9%96%8B%E7%99%BA%E3%82%AD%E3%83%83%E3%83%88)を使って Orb の開発を始めることをお勧めします。 一方で、Orb は[再利用可能な構成]({{site.baseurl}}/ja/2.0/reusing-config)をパッケージにしたものなので、単体の `yaml` ファイルとして Orb を[手動で]({{site.baseurl}}/ja/2.0/orb-author-validate-publish)記述し、[CircleCI Orbs 用の CLI]({{site.baseurl}}/ja/2.0/local-cli/#%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB) を使用してパブリッシュすることもできます。

## Orb 開発キット

Orb 開発キットは、相互に連携する複数のツールをセットにしたものです。キットを使うと CircleCI でのテストとデプロイが自動化されるため、Orb の開発プロセスが容易になります。 Orb 開発キットは、次の要素で構成されています。

* [Orb プロジェクト テンプレート](https://github.com/CircleCI-Public/Orb-Project-Template)
* [Orb Pack]({{site.baseurl}}/ja/2.0/orb-concepts/)
* [Orb Init](https://circleci-public.github.io/circleci-cli/circleci_orb_init.html)
* [Orb ツールの Orb](https://circleci.com/developer/ja/orbs/orb/circleci/orb-tools)

<script id="asciicast-362192" src="https://asciinema.org/a/362192.js" async></script>

### はじめに

Orb 開発キットで新しい Orb の作成を始めるには、以下の手順を実行します。 最初に行うのは、[GitHub.com](https://github.com) でのリポジトリの新規作成です。

GitHub 上の組織 (Organization) が、Orb の作成先となる[名前空間]({{site.baseurl}}/ja/2.0/orb-concepts/#%E5%90%8D%E5%89%8D%E7%A9%BA%E9%96%93)のオーナーになります。 組織が自分個人のもので、名前空間のオーナーが自分自身であれば、問題ありません。

1. **新しい [GitHub リポジトリ](https://github.com/new)を作成します。**<br /> リポジトリの名前は、特に重要な役割はありませんが、"myProject-orb" のようなわかりやすい名前を付けることをお勧めします。 ![Orb レジストリ]({{site.baseurl}}/assets/img/docs/new_orb_repo_gh.png)

    必要な項目の設定が終わると、新しいリポジトリの内容を確認するページが開き、生成された Git の URL が表示されます。 この URL をメモしておいてください。手順 4 で必要になります。 URL は SSH か HTTPS を選択できます。どちらを選択しても認証を行えます。 ![Orb レジストリ]({{site.baseurl}}/assets/img/docs/github_new_quick_setup.png)

1. **ターミナルを開き、`orb init` CLI コマンドを使用して新しい　Orb　プロジェクトを初期化します。**
```bash
circleci orb init /path/to/myProject-orb
```
`circleci orb init` コマンドを、Orb プロジェクト用に作成して初期化するディレクトリを付けて呼び出します。 このディレクトリと Git のプロジェクト リポジトリには、同じ名前を使用することをお勧めします。

1. **Orb の完全自動セットアップ オプションを選択します。**
```
? Would you like to perform an automated setup of this orb?:
  ▸ Yes, walk me through the process.
    No, I'll handle everything myself.
```
完全自動オプションを選択すると、[Orb-Project-Template](https://github.com/CircleCI-Public/Orb-Project-Template) がダウンロードされ、カスタマイズした設定内容が自動的に反映されます。 プロジェクトは CircleCI でフォローされ、自動化された CI/CD パイプラインが含められます。 <br /><br /> 含められる CI/CD パイプラインの詳細については、「[Orb のパブリッシュ]({{site.baseurl}}/ja/2.0/creating-orbs/)」を参照してください。 または、[Orb プロジェクト テンプレート](https://github.com/CircleCI-Public/Orb-Project-Template)をダウンロードするだけに留める場合は、「No, I'll handle everything myself (すべて手動で行う)」を選択します。

1. **質問に答えて Orb の構成とセットアップを進めます。**<br /> バックグラウンドでは、`orb init` コマンドが [Orb プロジェクト テンプレート](https://github.com/CircleCI-Public/Orb-Project-Template)をコピーし、回答に基づいてカスタマイズを実行します。 各ディレクトリにある詳細な `README.md` ファイルには、それぞれのディレクトリのコンテンツに関する有益な情報が記載されています。 手順 1 でメモしておいたリモート Git リポジトリの URL も、ここで入力を求められます。<br /><br /> [Orb プロジェクト テンプレート](https://github.com/CircleCI-Public/Orb-Project-Template)には、完全な CI/CD パイプライン (詳細は「[Orb のパブリッシュ]({{site.baseurl}}/ja/2.0/creating-orbs/)」を参照) が含まれており、Orb の[パッケージ化]({{site.baseurl}}/ja/2.0/orb-concepts/)、[テスト]({{site.baseurl}}/ja/2.0/testing-orbs/)、パブリッシュが自動的に実行されます。 <br /><br /> セットアップ プロセスでは、[パーソナル API トークン]({{site.baseurl}}/ja/2.0/managing-api-tokens/)を `orb-publishing` [コンテキスト]({{site.baseurl}}/ja/2.0/contexts/)に格納するかどうかを尋ねられます。 Orb の開発版と安定版をパブリッシュするために、このトークンを格納しておくことが必要になります。

    **コンテキストは必ず使用者を制限する**
    <br />
    _[Organization Settings (組織設定)] > [Contexts (コンテキスト)]_ に移動して、コンテキストを制限してください。 <br /><br /> Orb のセットアップが完了したら、`orb-publishing` という新しいコンテキストが表示されます。 この `orb-publishing` をクリックして、_セキュリティ グループ_ を追加します。 セキュリティ グループを使うと、ジョブのトリガーを許可されたユーザーだけにアクセスを制限することができます。 プライベートの[パーソナル API トークン]({{site.baseurl}}/ja/2.0/managing-api-tokens/)にアクセスできるのも、これらのユーザーだけです。 <br /><br /> 詳細については、「[コンテキストの使用]({{site.baseurl}}/ja/2.0/contexts/#%E3%82%B3%E3%83%B3%E3%83%86%E3%82%AD%E3%82%B9%E3%83%88%E3%81%AE%E5%88%B6%E9%99%90)」を参照してください。
    {: class="alert alert-warning"}

1. **変更を GitHub にプッシュします。**<br /> セットアップ プロセス中に、`orb init` コマンドによって、自動化された Orb 開発パイプラインの準備が進められます。 CLI が処理を続行し、circleci.com でプロジェクトを自動的にフォローするには、その前に、CLI によって生成された修正済みのテンプレート コードがリポジトリにプッシュされている必要があります。 これを実行するよう要求されたら、別のターミナルから以下のコマンドを、「default-branch」を実際のデフォルト ブランチの名前に置き換えて実行します。
```bash
git push origin <default-branch>
```
完了したら、元のターミナルに戻って、変更がプッシュされたことを確認します。

1. **Orb の記述を完了します。**<br /> 新しい Orb プロジェクトが CircleCI で自動的にフォローされ、テスト用に最初の開発バージョン `<namespace>/<orb>@dev:alpha` (hello-world サンプル) が生成されて、CLI が終了します。<br /><br /> CircleCI 上にビルドされたプロジェクトへのリンクが提供されます。そこで、バリデーション、パッケージ化、テスト、パブリッシュのプロセスを確認できます。 また、CLI によって自動的に `alpha` という新しい開発ブランチに移行したことも確認できます。<br /><br /> この新しいブランチから、変更を加えたりプッシュしたりすることができます。 これで、コミットするたびに、Orb がパッケージ化、バリデーション、テスト (任意) され、パブリッシュできるようになりました。<br /><br /> Orb の最初のメジャー バージョンをデプロイする準備が整ったら、「[Orb のパブリッシュ]({{site.baseurl}}/ja/2.0/creating-orbs/)」で、セマンティック バージョニング (semver) を使った変更のデプロイに関する情報を確認してください。

### Orb の記述

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

`src` ディレクトリに移動すると、含まれているセクションを確認できます。

**_例: Orb プロジェクトの "src" ディレクトリ_**

| 種類                         | 名前                                                                                             |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| <i class="fa fa-folder" aria-hidden="true"></i>  | [commands](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/commands)   |
| <i class="fa fa-folder" aria-hidden="true"></i>  | [examples](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/examples)   |
| <i class="fa fa-folder" aria-hidden="true"></i> | [executors](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/executors) |
| <i class="fa fa-folder" aria-hidden="true"></i> | [jobs](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/jobs)           |
| <i class="fa fa-file-text-o" aria-hidden="true"></i> | [@orb.yml](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/%40orb.yml) |
{: class="table table-striped"}

上記のディレクトリは、作成した Orb に含まれる Orb コンポーネントを表しています。Orb によっては、一部のコンポーネントが含まれない場合もあります。 @orb.yml は Orb のルートの役割を果たします。 任意で Orb 開発を強化するための [`scripts`](#%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%97%E3%83%88) ディレクトリと [`tests`](#orb-%E3%81%AE%E3%83%86%E3%82%B9%E3%83%88) ディレクトリがプロジェクトに含まれている場合もあります。これらのディレクトリについては、このページの「[スクリプト](#%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%97%E3%83%88)」セクションと、「[Orb のテスト手法]({{site.baseurl}}/ja/2.0/testing-orbs/)」ガイドに解説があります。

`src` 内の各ディレクトリは、[再利用可能な構成]({{site.baseurl}}/ja/2.0/reusing-config)のコンポーネント タイプに対応しており、Orb から追加や削除をすることができます。 たとえば、作成した Orb に `executors` や `jobs` が必要ない場合は、これらのディレクトリを削除できます。

##### @orb.yml
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
{:.no_toc}

[再利用可能なコマンド]({{site.baseurl}}/ja/2.0/reusing-config/#%E5%86%8D%E5%88%A9%E7%94%A8%E5%8F%AF%E8%83%BD%E3%81%AA%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89%E3%81%AE%E3%82%AA%E3%83%BC%E3%82%B5%E3%83%AA%E3%83%B3%E3%82%B0)を自分でオーサリングして、`src/commands` ディレクトリに追加することができます。 このディレクトリ内の各 _YAML_ ファイルは、1 つの Orb コマンドとして扱われます。コマンド名にはファイル名が使用されます。

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

##### 例
{:.no_toc}

[使用例(英語)]({{site.baseurl}}/2.0/orb-concepts/#usage-examples)をオーサリングして、`src/examples` ディレクトリに追加できます。 使用例は、エンド ユーザーが自分のプロジェクトの設定ファイルにそのまま使用することを目的としたものではなく、Orb 開発者が [Orb レジストリ](https://circleci.com/developer/ja/orbs)でユースケースごとの例を共有し、他のユーザーが参照できるようにするための手段です。

このディレクトリ内の各 _YAML_ ファイルは、1 つの Orb 使用例として扱われます。名前にはファイル名が使用されます。

[Orb プロジェクト テンプレート](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/examples)で完全なサンプルを確認できます。

##### Executor
{:.no_toc}

[パラメーター化された Executor]({{site.baseurl}}/ja/2.0/reusing-config/#%E5%86%8D%E5%88%A9%E7%94%A8%E5%8F%AF%E8%83%BD%E3%81%AA-executor-%E3%81%AE%E3%82%AA%E3%83%BC%E3%82%B5%E3%83%AA%E3%83%B3%E3%82%B0) をオーサリングして、`src/executors` ディレクトリに追加できます。

このディレクトリ内の各 _YAML_ ファイルは、1 つの Orb Executor として扱われます。名前にはファイル名が使用されます。

[Orb プロジェクト テンプレート](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/executors)で完全なサンプルを確認できます。

##### ジョブ
{:.no_toc}

[パラメーター化されたジョブ]({{site.baseurl}}/ja/2.0/reusing-config/#%E3%83%91%E3%83%A9%E3%83%A1%E3%83%BC%E3%82%BF%E3%83%BC%E5%8C%96%E3%81%95%E3%82%8C%E3%81%9F%E3%82%B8%E3%83%A7%E3%83%96%E3%81%AE%E3%82%AA%E3%83%BC%E3%82%B5%E3%83%AA%E3%83%B3%E3%82%B0) をオーサリングして、`src/jobs` ディレクトリに追加できます。

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
{:.no_toc}

CircleCI の設定ファイルは `YAML` 形式で記述されています。 `bash` などの論理的なコードは、カプセル化して、`YAML` を介して CircleCI 上で実行できますが、開発者にとっては実行形式ではないファイル内にプログラム コードを記述してテストするのは不便です。 また、`<<parameter>>` 構文は CircleCI ネイティブの YAML 機能強化であり、ローカルで解釈、実行されるものではないため、複雑なスクリプトではパラメーターの扱いが煩雑になることがあります。

Orb 開発キットと `<<include(file)>>` 構文を使用すると、既存のスクリプトを Orb にインポートして、Orb スクリプトをローカルで実行、テストでき、コードに対して本格的なテスト フレームワークを利用することも可能になります。

##### スクリプトでのパラメーターの使用
{:.no_toc}

スクリプトの移植性やローカルでの実行可能性を維持するために、スクリプト内で使用する環境変数を事前に検討し、設定ファイル レベルで設定することをお勧めします。 前述の `greet.yml` コマンド ファイルに特別な `<<include(file)>>` 構文でインクルードされた `greet.sh` ファイルは、次のようなものです。

```bash
echo Hello "${PARAM_TO}"
```

これで、スクリプトをローカルでモックしてテストできます。

### Orb のテスト

他のソフトウェアと同様、コードをテストする方法は複数あります。どれだけのテストを実装するかは、開発者が決めることができます。 この時点で、設定ファイル内には　[integration-test-1](https://github.com/CircleCI-Public/Orb-Project-Template/blob/96c5d2798114fffe7903e2f5c9f021023993f338/.circleci/config.yml#L27) という名前のジョブがあります。作成した Orb コンポーネントをテストするには、このジョブを更新する必要があります。 これは一種の _結合テスト_ で、 Orb の単体テストも可能です。

詳しくは、「[Orb のテスト手法]({{site.baseurl}}/ja/2.0/testing-orbs/)」をお読みください。

### Orb のパブリッシュ

Orb 開発キットを使用すると、完全に自動化された CI/CD パイプラインが `.circleci/config.yml` 内に自動的に構成されます。 この構成により、Orb のセマンティック バージョニングによるリリースを簡単に自動デプロイできます。

詳細については、「[Orb のパブリッシュ]({{site.baseurl}}/ja/2.0/creating-orbs/)」を参照してください。

### Orb のカテゴリ設定

作成した Orb を [Orb レジストリ](https://circleci.com/developer/ja/orbs)で見つけやすくするために、カテゴリを設定できます。 カテゴリを設定した Orb は、[Orb レジストリ](https://circleci.com/developer/ja/orbs)でカテゴリを指定して検索できるようになります。 Orb を見つけやすくするために、CircleCI が Orb のカテゴリ項目を作成、編集する場合もあります。

#### カテゴリの一覧表示

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

![](  {{ site.baseurl }}/assets/img/docs/orb-categories-add-to-category.png)

選んだカテゴリに Orb を追加するには、`circleci orb add-to-category <namespace>/<orb> "<category-name>"` を実行します。 このコマンドの詳細については、[こちら](https://circleci-public.github.io/circleci-cli/circleci_orb_add-to-category.html)を参照してください。


#### カテゴリからの Orb の削除

![](  {{ site.baseurl }}/assets/img/docs/orb-categories-remove-from-category.png)

カテゴリから Orb を削除するには、`circleci orb remove-from-category <namespace>/<orb> "<category-name>"` を実行します。 このコマンドの詳細については、[こちら](https://circleci-public.github.io/circleci-cli/circleci_orb_remove-from-category.html)を参照してください。

#### Orb のカテゴリ項目の表示

![](  {{ site.baseurl }}/assets/img/docs/orb-categories-orb-info.png)

Orb に適用したカテゴリ項目を表示するには、`circleci orb info <namespace>/<orb>` を実行して表示される一覧を確認します。 このコマンドの詳細については、[こちら](https://circleci-public.github.io/circleci-cli/circleci_orb_info.html)を参照してください。
