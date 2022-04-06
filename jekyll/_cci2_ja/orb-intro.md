---
layout: classic-docs
title: "Orb の概要"
short-title: "Orb の概要"
description: "CircleCI Orb の入門ガイド"
categories:
  - はじめよう
order: 1
version:
  - クラウド
  - Server v3.x
---

* 目次
{:toc}

CircleCI Orb とは、[ジョブ]({{site.baseurl}}/ja/2.0/reusing-config/#authoring-parameterized-jobs)、[コマンド]({{site.baseurl}}/ja/2.0/reusing-config/#authoring-reusable-commands)、[Executor]({{site.baseurl}}/ja/2.0/reusing-config/#executor) などの、パラメーター化および[再利用が可能な設定要素]({{site.baseurl}}/ja/2.0/reusing-config/)をまとめた共有可能なオープンソースパッケージです。 Orb を使用すると、設定がシンプルになり、多くのプロジェクトにまたがってソフトウェアやサービス スタックとの連携を素早く、容易に行えるようになります。

パブリッシュされている Orb を [CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs)から入手できるほか、[独自の Orb をオーサリングする]({{site.baseurl}}/2.0/orb-author-intro/)こともできます。

## Orb を使用するメリット
{: #benefits-of-using-orbs }

Orb では設定ファイルの要素をパラメーター化できるため、設定を大幅に簡素化できます。 例を使って説明しましょう。以下は、Node.js アプリケーションをテストするための一般的な設定ファイルであり、ジョブの定義には、アプリケーションのテストに必要なステップが複数含まれています。一方、CircleCI Orb を使用する場合は、[`circleci/node`](https://circleci.com/developer/ja/orbs/orb/circleci/node) Orb に含まれる `test` ジョブを使用します。 Orb を使用すれば、パラメーター化された設定を 1 回記述するだけで、それをいくつもの類似したプロジェクトで利用できるようになります。

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

**注:** 未承認の Orb (パートナーまたはコミュニティー) を使用するには、組織の管理者が組織の **[Organization Settings (組織設定)] > [Security (セキュリティ)]** ページで未承認 Orb の使用をオプトインする必要があります。
{: class="alert alert-warning"}

それぞれの Orb には、Orb レジストリにリストされている説明とドキュメントが含まれています。 多くの場合、Orb には参考になる使用例が記載されています。

多くの Orb オーサーが Git リポジトリのリンクを掲載しており、既存の Orb に貢献したり、Orb リポジトリに関する問題を報告することができます。

## パブリックまたはプライベート
{: #public-or-private }
Orb は以下のいずれかの方法でパブリッシュすることができます。

* **パブリック**: Orb レジストリで検索でき、誰でも使用できます。
* **プライベート**: 組織内でのみ使用することができ、直接 URL を使って認証されている場合のみレジストリ内で表示されます。

Orb の概要のページの [パブリック Orb vs プライベート Orb ]({{site.baseurl}}/ja/2.0/orb-concepts/#private-orbs-vs-public-orbs)を読み、これらの概念をご理解ください。

## Orb の指定
{: #identifying-orbs }
Orb は、_名前空間_と _Orb 名_から成る_スラッグ_で指定します。 名前空間は、Orb をオーサリングした組織を指す一意の識別子です。 Orb 名の後には、`@` 記号と、使用する Orb バージョンを指定する[セマンティック バージョン]({{site.baseurl}}/ja/2.0/orb-concepts/#semantic-versioning)文字列が続きます。

Orb スラッグの例: `<namespace>/<orb-name>@1.2.3`

## Orb の使用
{: #using-orbs }

レジストリで公開されている Orb には、その Orb の最新バージョンをインポートするためのサンプルコード スニペットが用意されています。

以下の例に、`version: 2.1` の設定ファイルに Orb をインポートする方法を示します。 `orbs` キーの後に、インポートする Orb を表す orb-name キーを記述します。 orb-name キーの値には、Orb スラッグとバージョンを指定します。

```yaml
version: 2.1

orbs:
  orb-name: <namespace>/<orb-name>@1.2.3
```

設定ファイルに Orb をインポートしたら、その Orb が提供するエレメントを `<orb-name>/<element>` の形式で使用できます。 Orb エレメントは、[再利用可能な設定要素]({{site.baseurl}}/ja/2.0/reusing-config/)と同じ方法で使用できます。 Orb のコマンドの使用方法について詳しくは、下記の Node の例をご覧ください。

### Node の例
{: #node-example }
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
          password: $DOCKERHUB_PASSWORD  # コンテキスト / プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - node/install-packages # steps でコマンドを使用する
```

## CircleCI アプリ上の Orb ページ
{: #orbs-view}

この Orb のページを読むと、組織が作成した Orb についてよく分かります。 ユーザーはこのページのリストビューで、Orb がパブリックなのかプライベートなのか、Orb の使用状況 (その Orb が全設定ファイルにおいて使用された回数)、最新バージョンや説明を直接確認することができます。

この Orb ページにアクセスするには、アプリの Organization Settings を開きます。

Orb のソースなどの詳しい情報は、Orb の名前をクリックするとアクセスすることができます。 この Orb の詳細ページでは、CircleCI Orb レジストリと同様に、Orb のコンテンツ、コマンド、使用例を紹介しています。 注: プライベート Orb の詳細ページは、ログインしている組織のメンバーのみ閲覧できます。 パブリッシュされていない Orb には詳細ページはリンクされません。


## 関連項目
{: #see-also }
{:.no_toc}

- [Orb のコンセプト]({{site.baseurl}}/ja/2.0/orb-concepts/): CircleCI Orbs の基本的な概念
- [Orb に関するよくあるご質問]({{site.baseurl}}/ja/2.0/orbs-faq/): CircleCI Orb の使用に際して発生している既知の問題やご質問
- [Orb リファレンス ガイド]({{site.baseurl}}/ja/2.0/reusing-config/): 再利用可能な Orb、コマンド、パラメーター、および Executor の例
- [Orb のテスト手法]({{site.baseurl}}/ja/2.0/testing-orbs/): 独自に作成した Orb のテスト方法
- [設定クックブック]({{site.baseurl}}/ja/2.0/configuration-cookbook/): 設定ファイル内で CircleCI Orb を使用するためのレシピ

## 詳しく見る
{: #learn-more }
CircleCI Academy の [Orb コース](https://academy.circleci.com/orbs-course?access_code=public-2021) を受講すると、さらに詳しく学ぶことができます。
