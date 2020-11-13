---
layout: classic-docs
title: "Orb のオーサリングのベスト プラクティス"
short-title: "Orb オーサー向けベスト プラクティス"
description: "Orb のオーサリングに関するベスト プラクティス ガイド"
categories:
  - getting-started
order: 1
version:
  - クラウド
---

* 目次
{:toc}

## 全般

#### Orb にわかりやすい名前を付ける
{:.no_toc}

Orb のスラッグ "slug" は、_名前空間_と _Orb_ 名をスラッシュで区切って指定します。 名前空間には Orb を所有し管理するユーザー、会社、または組織を指定し、Orb 名自体には、その Orb で提供するプロダクトやサービス、アクションを記述します。

| 適切な Orb スラッグ  | 不適切な Orb スラッグ     |
| ------------- | ----------------- |
| circleci/node | circleci/node-orb |
| company/orb   | company/company   |
{: class="table table-striped"}

#### Orb にカテゴリを設定する
{:.no_toc}

Orb にカテゴリを付けると、[Orb レジストリ](https://circleci.com/developer/ja/orbs)でカテゴリを指定して検索できるようになります。 CircleCI CLI を使用して Orb のカテゴリを設定する方法は、「[Orb のオーサリング プロセス]({{site.baseurl}}/2.0/orb-author/#categorizing-your-orb)」の該当セクションを参照してください。

#### Orb のすべてのコンポーネントに説明を付ける
{:.no_toc}

コマンド、ジョブ、Executor、使用例、パラメーターのすべてに説明を付けることができます。 Orb の各コンポーネントにわかりやすい説明を付けるとともに、必要に応じて補足のドキュメントを提供してください。

```yaml
description: "このコマンドは UI のステップで Hello と出力するために使用します。"
steps:
  - run:
      name: "echo コマンドの実行"
      command: echo "Hello"
```

Orb コンポーネントのメリットと使用法がよくわかる詳しい説明を記載してください。 また、説明には、各コンポーネントに関連する詳細なドキュメントへのリンクを記載することもお勧めします。

#### Orb のパブリッシュのコンテキストは制限付きにする
{:.no_toc}

Orb 開発キットを使うと、CircleCI パーソナル アクセス トークンは組織のコンテキストに保存されます。 このコンテキストにアクセスするジョブが承認済みのユーザーによりトリガーまたは承認されたとき以外に実行されないように、コンテキストを制限してください。 詳細については、「[コンテキストの使用]({{site.baseurl}}/2.0/contexts/#%E3%82%B3%E3%83%B3%E3%83%86%E3%82%AD%E3%82%B9%E3%83%88%E3%81%AE%E5%88%B6%E9%99%90)」を参照してください。

## 構成

### @orb.yml

`@orb.yml` ファイルはプロジェクトの "ルート" であり、Orb レジストリと CLI に表示される Orb のメタデータの大部分をここに記載します。

#### すべての Orb に説明を含める
{:.no_toc}

Orb レジストリにパブリッシュされた Orb は、名前と説明で検索可能になります。 適切な説明を付けると、ユーザーにとって Orb の用途や機能がわかりやすくなるだけでなく、検索で見つけてもらえる可能性も上がります。

#### display リンクを設定する
{:.no_toc}

Orb の特殊な設定キー [`display`]({{site.baseurl}}/2.0/orb-author/#orbyml) では、`source_url` に、Orb のソース コードが載っている Git リポジトリへのリンクを設定できます。また、`home_url` には、必要に応じてプロダクトやサービスのホーム ページへのリンクを設定できます。

```yaml
display:
  home_url: "https://www.website.com/docs"
  source_url: "https://www.github.com/EXAMPLE_ORG/EXAMPLE_PROJECT"
```

### コマンド

#### 一部の例外を除き、Orb にはコマンドを 1 つ以上含める
{:.no_toc}

ほとんどの Orb には、コマンドを少なくとも 1 つ含めます。 コマンドは、ユーザーを介さずにシェル コマンドや CircleCI の特殊なステップを自動的に実行するために使用します。 例外として、ツールで特定の Docker コンテナを使用する_必要がある_場合などは、Orb にコマンドを含めずジョブだけを設定してもかまいません。

#### 使用するステップの数は必要最低限に抑える
{:.no_toc}

Orb 用に[再利用可能なコマンド]({{site.baseurl}}/2.0/reusing-config/#%E5%86%8D%E5%88%A9%E7%94%A8%E5%8F%AF%E8%83%BD%E3%81%AA%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89%E3%81%AE%E3%82%AA%E3%83%BC%E3%82%B5%E3%83%AA%E3%83%B3%E3%82%B0)を作成する場合、任意の数の[ステップ]({{site.baseurl}}/2.0/configuration-reference/#steps)を設定することが可能です。 ステップの名前はユーザーの UI に表示されるので、各ステップには適切な名前を付けてください。 UI が "ノイズ" 過多にならないよう、使用するステップの数はできるだけ少なくしてください。

{:.tab.minsteps.Deploy_Command_GOOD}
```yaml

description: "CLI のインストール、アプリケーションの認証とデプロイを行うデモ用コマンド。"
parameters:
  api-token:
    type: env_var_name
    default: MY_SECRET_TOKEN
steps:
  - run:
      name: "アプリケーションのデプロイ"
      command: |
        pip install example
        example login $<<parameters.api-token>>
        example deploy my-app
```

{:.tab.minsteps.Deploy_Command_BAD}
```yaml

description: "不適切なデプロイ コマンドの例。 可能であればステップには名前を付け、まとめるようにしてください。"
parameters:
  api-token:
    type: env_var_name
    default: MY_SECRET_TOKEN
steps:
  - run: pip install example
  - run: example login $<<parameters.api-token>>
  - run: example deploy my-app
```

#### root ユーザーかどうかを確認する
{:.no_toc}

コマンドに "sudo" を付ける場合、まずユーザーが既に root であるかどうかを確認してください。 この確認は、環境変数を用いることで動的に行なえます。

```bash
if [[ $EUID == 0 ]]; then export SUDO=""; else # root ユーザーかどうかを確認
  export SUDO="sudo";
fi

$SUDO do_command
```

### ジョブ

#### パラメーターを "パススルー" する
{:.no_toc}

ジョブ内でコマンドまたは Executor を使用する場合は、ジョブ内にこれらのコンポーネントそれぞれのパラメーターのコピーを含めてください。 こうすることで、ジョブで指定したパラメーターを、それらのパラメーターを参照する各コンポーネントに "パススルー" することが可能です。

例として、[Node Orb に含まれる `test` ジョブ](https://circleci.com/developer/ja/orbs/orb/circleci/node#jobs-test)のスニペットの一部を次に示します。

{:.tab.nodeParam.Test_Job}
```yaml
description: |
  Node.js アプリケーションを自動的にテストするシンプルなドロップイン ジョブ。
parameters:
  version:
    default: 13.11.0
    description: >
      完全なバージョン タグを指定してください。 例: "13.11.0"。リリースの全一覧は
      次を参照してください: https://nodejs.org/en/download/releases
    type: string
executor:
  name: default
  tag: << parameters.version >>
```

{:.tab.nodeParam.Default_Executor}
```yaml
description: >
  使用する Node.js のバージョンを選択します。 CI 向けにキャッシュを活用して開発された
  CircleCI 製コンビニエンス イメージを使用します。

  次のリストにあるすべてのタグを使用できます。
  https://circleci.com/developer/images/image/cimg/node
docker:
  - image: 'cimg/node:<<parameters.tag>>'
parameters:
  tag:
    default: '13.11'
    description: >
      cimg/node イメージのバージョン タグを次から選択してください。
      https://circleci.com/developer/images/image/cimg/node
    type: string
```

上記のように、このジョブでは、`version` パラメーターを取る `default` という名前の Executor を使用しています。 _Executor_ の `version` パラメーターをこの_ジョブ_のユーザーが設定できるようにするには、ジョブ内に該当するパラメーターを作成し、そのパラメーターを他の Orb コンポーネントに渡す必要があります。

#### Docker イメージのパラメーターが Executor に適していないか検討する
{:.no_toc}
Orb に特定の実行環境が必要なジョブを複数設定しているのであれば、 カスタム Executor を実装することをお勧めします。 ジョブの実行環境のほとんどが Linux プラットフォームである場合には、 ジョブ内で直接 `Docker` Executor を使用し、イメージをパラメーター化することを検討してください。

#### _事後_ステップ、_事前_ステップ、ステップ型パラメーターを使用する
{:.no_toc}

CircleCI のジョブでは、その実行前後にステップを挿入することができます。また、パラメーターを使用することでジョブ内にステップを挿入することも可能です。 一般的に、カスタム ジョブにコマンドを組み込む (該当する場合) よりも、ジョブを設定する方がユーザーにとっては容易です。 挿入可能なステップを用いると、ジョブの柔軟性が高まるだけでなく、Orb で新機能を試しやすくなります。

詳しくは次を参照してください。
* [事前ステップと事後ステップ]({{site.baseurl}}/2.0/configuration-reference/#pre-steps-and-post-steps-requires-version-21)
* [ステップ型パラメーター]({{site.baseurl}}/2.0/reusing-config/#steps)

### Executor

#### Orb には Executor を含めなくてもよい
{:.no_toc}
Orb の開発で、特定の実行環境でしか実行できないジョブを複数設定する場合は、Executor を使用してその環境を提供または利用することが一般的です。 たとえば、Orb で特定の Docker コンテナを利用しジョブを 2 つ含め、コマンドは含めない場合には、両方のジョブ用にこの実行環境を 1 つの[再利用可能な Exeuctor]({{site.baseurl}}/2.0/reusing-config/#%E5%86%8D%E5%88%A9%E7%94%A8%E5%8F%AF%E8%83%BD%E3%81%AA-executor-%E3%81%AE%E3%82%AA%E3%83%BC%E3%82%B5%E3%83%AA%E3%83%B3%E3%82%B0) として抽象化すると便利です。

Executor は、Orb 以外でも、特にカスタム ジョブの[マトリックス テスト](https://circleci.com/ja/blog/circleci-matrix-jobs/)を作成するのに役立ちます。

### 使用例を付ける

Orb のオーサーにとって Orb の[使用例]({{site.baseurl}}/2.0/orb-concepts/#usage-examples)は、コミュニティにユースケースやベスト プラクティスを伝える最適な手段です。 使用例は、Orb を利用するユーザーが参照する主要なドキュメントになるので、わかりやすく役立つ例を載せることが重要です。

#### すべての公開版 Orb には使用例を 1 つ以上含める
{:.no_toc}

他組織に提供する Orb には、少なくとも 1 つの使用例と説明を付けてください。

#### ユースケースに合わせた使用例を書く
{:.no_toc}

各使用例には、タスクの実行方法を紹介するユースケースに応じた名前を付けてください。 たとえば、`install_cli_and_deploy`、`scan_docker_container`、`test_application_with_this-tool` などです。

#### 正確な Orb のバージョンを記載する
{:.no_toc}

各使用例では、インポートする Orb の記載なども含め、完全な例を示してください。 使用例で示すバージョン番号は、パブリッシュする最新の Orb のものと一致させる必要があります。 たとえば、現在の Orb のバージョンが `0.1.0` であり、プル リクエストを作成してバージョン `1.0.0` をパブリッシュする場合は、使用例を更新し、使用する Orb のバージョン番号を `1.0.0` に変更します。

### パラメーター

#### シークレットの直接入力は_絶対に避ける_
{:.no_toc}

API キーや認証トークン、パスワードなど、"シークレット" に該当する情報はすべて、パラメーター値として直接入力しないようにしてください。 その代わりに、[env_var_name]({{site.baseurl}}/2.0/reusing-config/#%E7%92%B0%E5%A2%83%E5%A4%89%E6%95%B0%E5%90%8D) パラメーター型を使用して環境変数の名前を文字列値として指定し、この変数に機密情報を指定します。

#### インストール パスはパラメーター化する
{:.no_toc}

未知のユーザー定義の Docker イメージにバイナリをインストールする場合、利用可能な権限を知ることは困難です。 可能であれば、`install-path` パラメーターを設定し (`/usr/local/bin` のデフォルト値が理想的)、このパスにバイナリをインストールします。 多くの場合、こうすることで、"root" 権限が認められていない環境でこの権限を要求してしまう事態を回避できます。

## デプロイメント

#### 必ずセマンティック バージョニングを厳格に守る
{:.no_toc}

セマンティック バージョニングに従うと、バージョン番号からバグの修正やパッチ、新機能の追加、互換性を損なう変更のいずれが行われたかわかるので、更新やリリースではこの手法に従うことが重要です。 たとえば、互換性を損なう変更をパッチとして導入すると、Orb のユーザーに対し、CI プロセスの妨げになる更新プログラムが自動で配信されてしまう可能性があります。 Orb を更新する前に、[セマンティック バージョニング]({{site.baseurl}}/2.0/orb-concepts/#orbs-%E3%81%A7%E3%81%AE%E3%82%BB%E3%83%9E%E3%83%B3%E3%83%86%E3%82%A3%E3%83%83%E3%82%AF-%E3%83%90%E3%83%BC%E3%82%B8%E3%83%A7%E3%83%8B%E3%83%B3%E3%82%B0)に関する記事をよく読み、この手法を身につけてください。

## 宣伝

#### オーサリングした Orb をコミュニティで宣伝する
{:.no_toc}

Orb レジストリに Orb をパブリッシュした場合は、 ぜひ、 [CircleCI Discuss](https://discuss.circleci.com/c/ecosystem/orbs) フォーラムに紹介記事を投稿してください。
