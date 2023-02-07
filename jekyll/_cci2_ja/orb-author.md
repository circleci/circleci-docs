---
layout: classic-docs
title: "Orb の作成プロセス"
short-title: "Orb の作成"
description: "CircleCI Orb の作成に関する入門ガイド"
categories:
  - はじめよう
order: 1
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
---

* 目次
{:toc}

## はじめに
{: #introduction }

この Orb 作成ガイドは、[Orb の概要]({{site.baseurl}}/ja/orb-intro) と [Orb の作成の概要]({{site.baseurl}}/ja/orb-author-intro)のドキュメントを読み、名前空間を宣言していることを前提にしています。 これらが完了していれば、Orb の作成を開始できます。

初めて Orb を記述する方も、本番レベルで用意したい方も、[Orb 開発キット](#orb-development-kit)を使って Orb の開発を始めることをお勧めします。 または、Orb は[再利用可能な設定]({{site.baseurl}}/ja/reusing-config/)をパッケージにしたものなので、単体の `yaml` ファイルとして Orb を[手動で]({{site.baseurl}}/ja/orb-author-validate-publish)記述し、[CircleCI Orb 用の CLI]({{site.baseurl}}/ja/local-cli/#installation) を使用してパブリッシュすることも可能です。


## Orb 開発キット
{: #orb-development-kit }

Orb 開発キットは、相互に連携する複数のツールをセットにしたものです。キットを使うと CircleCI でのテストとデプロイが自動化されるため、Orb の開発プロセスが簡易化されます。 `orb init` コマンドにより Orb 開発キットを使用できます。 このコマンドは、テンプレートに基づいて新しい Orb プロジェクトを開始します。このテンプレートはキット内の他のツールを使って Orb を自動的にテストしデプロイします。

Orb 開発キットは、次の要素で構成されています。

* [Orb テンプレート](https://github.com/CircleCI-Public/Orb-Template)
* [CircleCI CLI](https://circleci-public.github.io/circleci-cli/)
    * [orb pack コマンド](https://circleci-public.github.io/circleci-cli/circleci_orb_pack.html)
    * [orb init コマンド](https://circleci-public.github.io/circleci-cli/circleci_orb_init.html)
* [Orb Tools Orb](https://circleci.com/developer/orbs/orb/circleci/orb-tools)

**Orb テンプレート**は、CircleCI の Orb プロジェクトテンプレートを含むレポジトリで、`orb init` により自動的に取り込まれ変更されます。

**CircleCI CLI** には、このキットと連動するように設計された 2    つのコマンドが含まれています。  **orb init コマンド** により、新しい Orb プロジェクトが開始され、**orb pack コマンド**により、Orb ソースが一つの `orb.yml` ファイルにパッケージ化されます。

**orb tools orb** は、Orb を作成するための Orb です。

## Orb の作成、テスト、パブリッシュ
{: #create-test-and-publish-an-orb }

下記の手順に従って、Orb 開発キットを使って独自の Orb を作成、テスト、パブリッシュすることができます。

### はじめよう
{: #getting-started }

To get started with orb authoring, first follow the [Create an orb tutorial](/docs/create-an-orb).

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

| 種類                        | 名前                                                                                 |
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

| タイプ                        | name                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------ |
| <i class="fa fa-folder" aria-hidden="true"></i>  | [commands](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/commands)   |
| <i class="fa fa-folder" aria-hidden="true"></i>  | [examples](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/examples)   |
| <i class="fa fa-folder" aria-hidden="true"></i>  | [Executor](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/executors)  |
| <i class="fa fa-folder" aria-hidden="true"></i>  | [jobs](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/jobs)           |
| <i class="fa fa-file-text-o" aria-hidden="true"></i> | [scripts](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/scripts)     |
| <i class="fa fa-file-text-o" aria-hidden="true"></i> | [@orb.yml](https://github.com/CircleCI-Public/Orb-Template/blob/main/src/%40orb.yml) |
{: class="table table-striped"}

上記のディレクトリは、作成した Orb に含まれる Orb コンポーネントを表しています。 @orb.yml は Orb の root としての役割を果たします。 Orb の yaml コンポーネントを表すディレクトリに加えて、 '[scripts](#scripts)' ディレクトリも表示されます。このディレクトリには、コンポーネントに挿入するコードを保存できます。

`src` 内の各ディレクトリは、[再利用可能な設定]({{site.baseurl}}/ja/reusing-config)のコンポーネントタイプに対応しており、Orb から追加や削除することができます。 例えば、作成した Orb に `Executor` や `Job` が必要ない場合は、これらのディレクトリを削除できます。

##### @orb.yml
{: #orbyml }
{:.no_toc}

@orb.yml は Orb プロジェクトの "root" に相当し、設定ファイルのバージョン、Orb の説明、display キーが記述されており、必要に応じて追加の Orb をインポートできます。

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

[再利用可能なコマンド]({{site.baseurl}}/ja/reusing-config/#authoring-reusable-commands)を自分で作成して、`src/commands` ディレクトリに追加することができます。 このディレクトリ内の各 _YAML_ ファイルは、1 つの Orb コマンドとして扱われます。 コマンド名にはファイル名が使用されます。

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

[使用例]({{site.baseurl}}/ja/orb-concepts/#usage-examples)を作成して、`src/examples` ディレクトリに追加します。 使用例は、エンド ユーザーが自分のプロジェクトの設定ファイルにそのまま使用することを目的としたものではなく、Orb 開発者が [Orb レジストリ](https://circleci.com/developer/ja/orbs)でユースケースごとの例を共有し、他のユーザーが参照できるようにするための手段です。

このディレクトリ内の各 _YAML_ ファイルは、Orb 使用例として扱われます。名前にはファイル名が使用されます。

[Orb テンプレート](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/examples)で完全な使用例を確認できます。

##### Executor
{: #executors }
{:.no_toc}

Author and add [Parameterized Executors]({{site.baseurl}}/reusing-config/#authoring-reusable-executors) to the `src/executors` directory.

このディレクトリ内の各 _YAML_ ファイルは、1 つの Orb Executor として扱われます。 名前にはファイル名が使用されます。

[Orb テンプレート](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/executors)で完全な使用例を確認できます。

##### ジョブ
{: #jobs }
{:.no_toc}

[パラメーター化されたジョブ]({{site.baseurl}}/ja/reusing-config/#authoring-parameterized-jobs)を作成して、`src/jobs` ディレクトリに追加します。

このディレクトリ内の各 _YAML_ ファイルは、Orb ジョブとして扱われます。名前にはファイル名が使用されます。

ジョブには、ユーザーが最小限の設定でタスクを完全に自動化できるように、Orb コマンドやステップを組み込むことができます。

以下は、[Orb テンプレート](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/jobs)に含まれている _[hello.yml](https://github.com/CircleCI-Public/Orb-Template/blob/main/src/jobs/hello.yml)_ ジョブの例です。

```yaml
description: >
  # ここには、このジョブの目的を記述します。
  # 短くわかりやすい説明を心がけます。

docker:
  - image: cimg/base:current
    auth:
      username: mydockerhub-user
      password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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

これは、_bash_ コードが多数含まれるような、複雑な Orb コマンドを記述する際に特に便利です _(もちろん、Python を使用することもできます！)_。

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

Orb 開発キットと `<<include(file)>>` 構文を使用すると、既存のスクリプトを Orb にインポートして、Orb スクリプトをローカルで実行、テストでき、コードに対して本格的なテスト フレームワークを利用することも可能になります。

##### スクリプトでのパラメーターの使用
{: #using-parameters-with-scripts }
{:.no_toc}

スクリプトの移植性やローカルでの実行可能性を維持するために、スクリプト内で使用する環境変数を事前に検討し、設定ファイル レベルで設定することをお勧めします。 以下は、前述の `greet.yml` コマンド ファイルに特別な `<<include(file)>>` 構文でインクルードされた `greet.sh` ファイルの例です。

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

詳細については、「[Orb のパブリッシュ]({{site.baseurl}}/ja/creating-orbs/)」を参照してください。

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
