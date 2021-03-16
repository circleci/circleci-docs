---
layout: classic-docs
title: "Orb の概要"
short-title: "Orb の概要"
description: "CircleCI Orb の入門ガイド"
categories:
  - getting-started
order: 1
version:
  - Cloud
---

- 目次
{:toc}

## クイック スタート
{:.no_toc}

CircleCI Orbs とは、[ジョブ]({{site.baseurl}}/ja/2.0/reusing-config/#%E3%83%91%E3%83%A9%E3%83%A1%E3%83%BC%E3%82%BF%E3%83%BC%E5%8C%96%E3%81%95%E3%82%8C%E3%81%9F%E3%82%B8%E3%83%A7%E3%83%96%E3%81%AE%E3%82%AA%E3%83%BC%E3%82%B5%E3%83%AA%E3%83%B3%E3%82%B0)、[コマンド]({{site.baseurl}}/ja/2.0/reusing-config/#%E5%86%8D%E5%88%A9%E7%94%A8%E5%8F%AF%E8%83%BD%E3%81%AA%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89%E3%81%AE%E3%82%AA%E3%83%BC%E3%82%B5%E3%83%AA%E3%83%B3%E3%82%B0)、[Executor]({{site.baseurl}}/2.0/reusing-config/#executor) などの、パラメーター化および[再利用可能な構成要素]({{site.baseurl}}/2.0/reusing-config/)をまとめた共有可能なオープン ソース パッケージです。 Orbs を使用すると、構成がシンプルになり、多くのプロジェクトにまたがってソフトウェアやサービス スタックとの連携を素早く、容易に行えるようになります。

公開されている Orbs を [CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs)から入手できるほか、[独自の Orb をオーサリングする]({{site.baseurl}}/2.0/orb-author-intro/)こともできます。

## プライベート Orbs と パブリック Orbs の比較

設定ファイルで使用できる Orbs の種類は 2 つあり、Orb の公開方法によって使い分ける必要があります。 Orb を [CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs)ではなく社内のみに公開する場合は、プライベート Orbs を使用します。 Orb を [CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs)にパブリッシュする場合は、パブリック Orbs を使用します。 それぞれの Orbs について、以下のセクションで説明します。

### プライベート Orbs

**メモ:** プライベート Orbs 機能は、[Scale プラン](https://circleci.com/ja/pricing)で利用できます。 Scale プランへのお申し込み方法については、営業担当者へお問い合わせください。

プライベート Orbs 機能と使うと、以下のような特徴を持つ Orb をオーサリングできます。

- CircleCI Orb レジストリに公開されない。

- 作成元組織以外のユーザーは閲覧、使用できない。

- 作成元組織のものではないパイプラインでは使用できない。

パブリック Orbs ではなくプライベート Orbs を選択する場合には、プライベート Orbs ならではの制限事項も理解する必要があります。具体的には次のとおりです。

- 設定ファイルのバリデーションに `circleci config validate` コマンドを使用できなくなります。 その代わり、Orb のコンテンツを設定ファイルの "orbs" スタンザにインラインで貼り付けるか、`circleci config validate --org-slug <your-org-slug> <path/to/config.yml>` コマンドを使用することで、設定ファイルをバリデーションできます。

- 組織間の関係性にかかわらず、ある組織で作成されたプライベート Orbs を、別の組織のパイプラインで使用することはできません。 それぞれの組織でコードのコミットとパイプラインの実行に必要なアクセス権を付与されている場合も例外ではなく、プライベート Orbs を設定ファイル内で使うことはできますが、別の Orb からは参照できません。

### パブリック Orbs

Orb をオーサリングして [CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs)にパブリッシュする場合には、通常、パブリック Orbs を使用します。 パブリック Orb をオーサリングすると、すべての CircleCI ユーザーがその Orb を設定ファイル内で使用できるようになります。

### Orb のオーサリング

パブリック Orbs とプライベート Orbs はいずれも、2 種類の方法でオーサリングできます。

- [Orb を手動でオーサリングする](https://circleci.com/ja/docs/2.0/orb-author-validate-publish/)方法
- [Orb 開発キット](https://circleci.com/ja/docs/2.0/orb-author/#orb-%E9%96%8B%E7%99%BA%E3%82%AD%E3%83%83%E3%83%88)を使用する方法 (推奨)

## Orbs を使用するメリット

Orbs では設定ファイルの要素をパラメーター化できるため、構成を大幅に簡素化できます。 例を使って説明しましょう。以下は、Node.js アプリケーションをテストするための一般的な設定ファイルであり、ジョブの定義には、アプリケーションのテストに必要なステップが複数含まれています。一方、CircleCI Orbs を使用する場合は、[`circleci/node`](https://circleci.com/developer/ja/orbs/orb/circleci/node) Orb に含まれる `test` ジョブを使用します。 Orbs を使用すれば、パラメーター化された構成を 1 回記述するだけで、それをいくつもの類似したプロジェクトで利用できるようになります。

{:.tab.nodeTest.Orb を使用}

```yaml
version: 2.1

orbs:
  node: circleci/node@x.y #Orb バージョン

workflows:
  test_my_app:
    jobs:

      - node/test:
          version: <node-version>
```

{:.tab.nodeTest.Orbs なし}
{% raw %}
```yaml
version: 2.1

jobs:
  test:
    docker:
      - image: cimg/node:<node-version>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - restore_cache:
          keys:
            - node-deps-v1-{{ .Branch }}-{{checksum "package-lock.json"}}
      - run:
          name: パッケージのインストール
          command: npm ci
      - save_cache:
          key: node-deps-v1-{{ .Branch }}-{{checksum "package-lock.json"}}
          paths:
            - ~/.npm
      - run:
          name: テストの実行
          command: npm run test

workflows:
  test_my_app:
    jobs:
      - test

```
{% endraw %}

## Orb レジストリ

[Orb レジストリ](https://circleci.com/developer/ja/orbs)は、公開されたすべての Orbs を掲載したオープン リポジトリです。 自分のスタックに適した Orb を検索できるだけでなく、[独自の Orb を開発して公開]({{site.baseurl}}/2.0/orb-author-intro/)することもできます。

![Orb レジストリ]({{site.baseurl}}/assets/img/docs/orbs-registry.png)

レジストリの Orb には、次の 3 つのラベルのいずれかが一緒に表示されます。

| Certified (承認済み) | CircleCI チームが作成してテスト済み | | Partner (パートナー製) | CircleCI のテクノロジー パートナーが作成 | | Community (コミュニティ) | コミュニティが作成 |
{: class="table table-striped"}

**メモ:** *未承認の Orb を使用するには、組織の管理者が組織の **[Organization Settings (組織設定)] > [Security (セキュリティ)]** ページでサードパーティ製の未承認 Orb の使用をオプトインする必要があります。*
{: class="alert alert-warning"}

それぞれの Orb には、Orb レジストリにリストされている説明とドキュメントが含まれています。 多くの場合、Orb には参考になる使用例が記載されています。

既存の Orb に対する貢献や、Orb リポジトリに関する問題の報告を受けるために、Orb の著者の多くは Git リポジトリのリンクを記載しています。

## Orbs の指定

Orb は、*名前空間*と *Orb 名*から成る*スラッグ*で指定します。 名前空間は、Orb をオーサリングした組織を指す一意の識別子です。 Orb 名の後には、`@` 記号と、使用する Orb バージョンを指定する[セマンティック バージョン]({{site.baseurl}}/2.0/orb-concepts/#semantic-versioning)文字列を続けます。

Orb スラッグの例: `<namespace>/<orb-name>@1.2.3`

## Orbs の使用

レジストリで公開されている Orb には、その Orb の最新バージョンをインポートするためのサンプルコード スニペットが用意されています。

以下の例に、`version: 2.1` の設定ファイルに Orb をインポートする方法を示します。 `orbs` キーの後に、インポートする Orb を表す orb-name キーを記述します。 orb-name キーの値には、Orb スラッグとバージョンを指定します。

```yaml
version: 2.1

orbs:
  orb-name: <namespace>/<orb-name>@1.2.3
```

設定ファイルに Orb をインポートしたら、その Orb が提供するエレメントを `<orb-name>/<element>` の形式で使用できます。 Orb エレメントは、[再利用可能な構成要素]({{site.baseurl}}/2.0/reusing-config/)と同じ方法で使用できます。 Orb のコマンドの使用方法について詳しくは、下記の Node の例をご覧ください。

### Node の例
{:.no_toc}

Node Orb には、[`install-packages`](https://circleci.com/developer/ja/orbs/orb/circleci/node#commands-install-packages) という Node パッケージをインストールしてキャッシュを自動的に有効にするコマンドがあります。このコマンドには、パラメーターを使用して追加のオプションを指定できます。 `install-packages` コマンドを使用するには、ジョブの [steps](https://circleci.com/ja/docs/2.0/configuration-reference/#steps) にこのコマンドを記述します。

```yaml
version: 2.1

orbs:
  node: circleci/node@x.y #orb バージョン

jobs:
  test:
    docker:
      - image: cimg/node:<node-version>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - node/install-packages # steps でコマンドを使用する
```

## 関連項目
{:.no_toc}

- [Orbs のコンセプト]({{site.baseurl}}/2.0/orb-concepts/): CircleCI Orbs の基本的な概念
- [Orbs に関するよくあるご質問]({{site.baseurl}}/2.0/orbs-faq/): CircleCI Orbs の使用に際して発生している既知の問題や不明点
- [Orbs リファレンス ガイド]({{site.baseurl}}/2.0/reusing-config/): 再利用可能な Orb、コマンド、パラメーター、および Executors の例
- [Orb のテスト手法]({{site.baseurl}}/2.0/testing-orbs/): 独自に作成した Orb のテスト方法
- [構成クックブック]({{site.baseurl}}/2.0/configuration-cookbook/): 設定ファイル内で CircleCI Orbs を使用するためのレシピ