---
layout: classic-docs
title: "Orb の概要"
short-title: "Orb の概要"
description: "CircleCI Orb の入門ガイド"
categories:
  - はじめよう
order: 1
version:
  - Cloud
---

* 目次
{:toc}

## クイック スタート
{: #quick-start }
{:.no_toc}

CircleCI Orb とは、[ジョブ]({{site.baseurl}}/2.0/reusing-config/#authoring-parameterized-jobs)、[コマンド]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-commands)、[Executor]({{site.baseurl}}/2.0/reusing-config/#executor) などの、パラメーター化および[再利用が可能な構成要素]({{site.baseurl}}/2.0/reusing-config/)をまとめた共有可能なオープン ソース パッケージです。 CircleCI Orb を使用すると、構成がシンプルになり、多くのプロジェクト間におけるソフトウェアやサービス スタックとの連携が素早く、容易に行えるようになります。

パブリッシュされている Orb を [CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs)から入手できるほか、[独自の Orb をオーサリングする]({{site.baseurl}}/2.0/orb-author-intro/)こともできます。

## プライベート Orb とパブリック Orb
{: #private-orbs-vs-public-orbs }

設定ファイルで使用できる Orb の種類は 2 つあり、ご希望のパブリッシュ方法によって使い分ける必要があります。 Orb を[CircleCI Orb レジストリ](https://circleci.com/developer/orbs)ではなく社内のみでパブリッシュする場合は、プライベート Orb  を使用します。 Orb を [CircleCI Orb レジストリ](https://circleci.com/developer/orbs)にパブリッシュする場合は、パブリック Orb を使用します。 それぞれの Orb について、以下のセクションで説明します。

### プライベート Orb
{: #private-orbs }


**メモ:** プライベート Orb 機能は、いずれかの有料[プラン](https://circleci.com/ja/pricing/)で利用いただけます。 パフォーマンスプランのお客様は、最大3つのプライベート Orb を作成することができ、スケールプランのお客様は、作成できるプライベート Orb の数に制限はありません。 詳細については、営業担当者へお問い合わせください。
{: class="alert alert-warning"}

プライベート Orb 機能と使うと、以下の状態で Orb をオーサリングできます。

* CircleCI Orb レジストリに公開されない。

* ご自分の組織以外のユーザーは閲覧、使用できない。

* ご自分の組織のものではないパイプラインでは使用できない。

パブリック Orb ではなくプライベート Orb を選択する場合、プライベート Orb 固有の制限事項を理解する必要があります。 具体的には次のとおりです。

* 設定ファイルのバリデーションに `circleci config validate` コマンドを使用できなくなります。 その代わり、Orb のコンテンツを設定ファイルの "Orb" スタンザにインラインで貼り付けるか、`circleci config validate --org-slug <your-org-slug> <path/to/config.yml>` コマンドを使用することで、設定ファイルをバリデーションできます。

* 組織の関係性にかかわらず、ある組織で作成されたプライベート Orb を、別の組織のパイプラインで使用することはできません。 それぞれの組織でコードのコミットとパイプラインの実行に必要なアクセス権を付与されている場合も例外ではなく、プライベート Orb をご自分の設定ファイル内で使うことはできますが、別の Orb からは参照できません。

### パブリック Orb
{: #public-orbs }

Orb をオーサリングして [CircleCI Orb レジストリ](https://circleci.com/developer/orbs)にパブリッシュする場合には、通常、パブリック Orb を使用します。 パブリック Orb をオーサリングすると、すべての CircleCI ユーザーがその Orb を設定ファイル内で使用できるようになります。
### Orb のオーサリング
{: #authoring-orbs }

パブリック Orb とプライベート Orb はいずれも、以下の2 つの方法でオーサリングできます。

* [Orb を手動でオーサリングする](https://circleci.com/docs/2.0/orb-author-validate-publish/)方法
* [Orb 開発キット](https://circleci.com/docs/2.0/orb-author/#orb-development-kit)を使用する方法 (推奨)

## Orb を使用するメリット
{: #benefits-of-using-orbs }

Orb により設定ファイルの要素をパラメーター化できるため、構成を大幅に簡素化できます。 例を使って説明しましょう。 以下は、Node.js アプリケーションをテストするための一般的な設定ファイルであり、ジョブの定義には、アプリケーションのテストに必要な複数のステップを実行する、または[circleci/node</code>](https://circleci.com/developer/orbs/orb/circleci/node) Orb が提供する `test` ジョブを使用します。 Orb を使用した場合、パラメーター化された構成を 1 回記述するだけで、それをいくつもの類似したプロジェクトで利用できるようになります。

{:.tab.nodeTest.Orbs}
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

{:.tab.nodeTest.Without-Orbs}
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
{: #the-orb-registry }

[Orb レジストリ](https://circleci.com/developer/ja/orbs)は、パブリッシュされたすべての Orb を掲載したオープン リポジトリです。 自分のスタックに適した Orb を検索できるだけでなく、[独自の Orb を開発してパブリッシュ]({{site.baseurl}}/2.0/orb-author-intro/)することもできます。

![Orb レジストリ]({{site.baseurl}}/assets/img/docs/orbs-registry.png)

レジストリの Orb には、次の 3 つのラベルのいずれかが表示されます。

| Certified | Written and tested by the CircleCI team | | Partner | Written by our technology partners | | Community | Written by the community |
{: class="table table-striped"}

**注:** _未承認の Orb を使用するには、組織の管理者が組織の **[Organization Settings (組織設定)] > [Security (セキュリティ)]** ページでサードパーティ製の未承認 Orb の使用をオプトインする必要があります。
{: class="alert alert-warning"}

それぞれのOrb には、Orb レジストリにリストされている説明とドキュメントが含まれています。 多くの場合、Orb には参考になる使用例が記載されています。

既存の Orb に貢献したり、Orb リポジトリに関する問題を報告するために、多くの Orb オーサーが Git リポジトリのリンクを掲載しています。

## Orb の指定
{: #identifying-orbs }
Orb は、_名前空間_と _Orb 名_から成る_スラッグ_で指定します。 名前空間は、Orb をオーサリングした組織を指す一意の識別子です。 Orb 名の後には、`@` 記号と、使用する Orb バージョンを指定する[セマンティック バージョン]({{site.baseurl}}/2.0/orb-concepts/#semantic-versioning)文字列が続きます。

Orb スラッグの例: `<namespace>/<orb-name>@1.2.3`

## Orb の使用
{: #using-orbs }

レジストリで公開されている Orb には、その Orb の最新バージョンをインポートするためのサンプルコード スニペットが用意されています。

以下の例に、`version: 2.1` の設定ファイルに Orb をインポートする方法を示します。 `orbs` キーの後に、インポートする Orb を表す orb-name キーを入力します。 orb-name キーの値には、Orb スラッグとバージョンを指定します。

```yaml
version: 2.1

orbs:
  orb-name: <namespace>/<orb-name>@1.2.3
```

設定ファイルに Orb をインポートしたら、その Orb が提供するエレメントを `<orb-name>/<element>` の形式で使用できます。 Orb エレメントは、[再利用可能な構成要素]({{site.baseurl}}/2.0/reusing-config/)と同じ方法で使用できます。 Orb のコマンドの使用方法について詳しくは、下記の Node の例をご覧ください。

### Node の例
{: #node-example }
{:.no_toc}

Node Orb には、[install-packages</code>](https://circleci.com/developer/orbs/orb/circleci/node#commands-install-packages) という Node パッケージをインストールしてキャッシュを自動的に有効にするコマンドがあります。 このコマンドには、パラメーターを使用して追加のオプションを指定できます。 `install-packages` コマンドを使用するには、ジョブの [steps](https://circleci.com/ja/docs/2.0/configuration-reference/#steps) にこのコマンドを記述します。

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
          password: $DOCKERHUB_PASSWORD  # コンテキスト / プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - node/install-packages # steps でコマンドを使用する
```


## 関連項目
{: #see-also }
{:.no_toc}

- [Orb のコンセプト]({{site.baseurl}}/2.0/orb-concepts/): CircleCI Orbs のハイレベルな情報
- [Orb に関するよくあるご質問]({{site.baseurl}}/2.0/orbs-faq/): CircleCI Orb の使用に際して発生している既知の問題や不明点
- [Orb リファレンス ガイド]({{site.baseurl}}/2.0/reusing-config/): 再利用可能な Orb、コマンド、パラメーター、および Executor の例
- [Orb のテスト手法]({{site.baseurl}}/2.0/testing-orbs/): 独自に作成した Orb のテスト方法
- [構成クックブック]({{site.baseurl}}/2.0/configuration-cookbook/): 設定ファイル内で CircleCI Orb を使用するためのレシピ

## Learn More
{: #learn-more }
Take the [orbs course](https://academy.circleci.com/orbs-course?access_code=public-2021) with CircleCI academy to learn more.
