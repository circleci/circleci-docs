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

CircleCI Orb とは、[ジョブ]({{site.baseurl}}/2.0/reusing-config/#authoring-parameterized-jobs)、[コマンド]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-commands)、[Executor]({{site.baseurl}}/2.0/reusing-config/#executor) などの、パラメーター化および[再利用が可能な構成要素]({{site.baseurl}}/2.0/reusing-config/)をまとめた共有可能なオープン ソース パッケージです。 Orbs を使用すると、構成がシンプルになり、多くのプロジェクトにまたがってソフトウェアやサービス スタックとの連携を素早く、容易に行えるようになります。

パブリッシュされている Orb を [CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs)から入手できるほか、[独自の Orb をオーサリングする]({{site.baseurl}}/2.0/orb-author-intro/)こともできます。

## Orb を使用するメリット
{: #benefits-of-using-orbs }

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

レジストリの Orb には、次の 3 つのラベルのいずれかが一緒に表示されます。

| Certified | Written and tested by the CircleCI team | | Partner | Written by our technology partners | | Community | Written by the community |
{: class="table table-striped"}

**Note:** _In order to use uncertified orbs (partner or community), your organization’s administrator must opt-in to allow uncertified orb usage on the **Organization Settings > Security** page for your org._
{: class="alert alert-warning"}

それぞれのOrb には、Orb レジストリにリストされている説明とドキュメントが含まれています。 多くの場合、Orbs には参考になる使用例が記載されています。

If you would like to contribute to an existing orb, or file an issue on the orb's repository, many orb authors will include the git repository link.

## Public or private
{: #public-or-private }
Orbs can be published in one of two ways:

* **Publicly**: Searchable in the orb registry, and available for anyone to use
* **Privately**: Only available to use within your organization, and only findable in the registry with a direct URL and when authenticated

To understand these concepts further read the [Public Orbs vs Private Orbs]({{site.baseurl}}/2.0/orb-concepts/#private-orbs-vs-public-orbs) section of the Orb Concepts page.

## Orb の指定
{: #identifying-orbs }
Orb は、_名前空間_と _Orb 名_から成る_スラッグ_で指定します。 名前空間は、Orb をオーサリングした組織を指す一意の識別子です。 Orb 名の後には、`@` 記号と、使用する Orb バージョンを指定する[セマンティック バージョン]({{site.baseurl}}/2.0/orb-concepts/#semantic-versioning)文字列を続けます。

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

設定ファイルに Orb をインポートしたら、その Orb が提供するエレメントを `<orb-name>/<element>` の形式で使用できます。 Orb エレメントは、[再利用可能な構成要素]({{site.baseurl}}/2.0/reusing-config/)と同じ方法で使用できます。 Orb のコマンドの使用方法について詳しくは、下記の Node の例をご覧ください。

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

## Orbs page in the CircleCI app
{: #orbs-view}

The Orbs page gives users visibility into the orbs their organization has created. Users can review the orb type (public or private), orb usage (how many times the orb is used across all configurations), latest version, and description directly from the list view on the page.

To access the Orbs page, navigate to Organization Settings in the app.

Full orb details, including orb source, are accessible by clicking on the orb name. The orb details page is similar to the CircleCI Orb Registry in that the details page provides the orb's contents, commands, and usage examples. Note: Private orb details pages may only be viewed by logged-in members of your organization. Unpublished orbs will not have linked details pages.


## 関連項目
{: #see-also }
{:.no_toc}

- [Orb のコンセプト]({{site.baseurl}}/2.0/orb-concepts/): CircleCI Orbs の基本的な概念
- [Orbs に関するよくあるご質問]({{site.baseurl}}/2.0/orbs-faq/): CircleCI Orbs の使用に際して発生している既知の問題や不明点
- [Orb リファレンス ガイド]({{site.baseurl}}/2.0/reusing-config/): 再利用可能な Orb、コマンド、パラメーター、および Executor の例
- [Orb のテスト手法]({{site.baseurl}}/ja/2.0/testing-orbs/): 独自に作成した Orbs のテスト方法
- [構成クックブック]({{site.baseurl}}/2.0/configuration-cookbook/): 設定ファイル内で CircleCI Orbs を使用するためのレシピ

## 詳しく見る
{: #learn-more }
Take the [orbs course](https://academy.circleci.com/orbs-course?access_code=public-2021) with CircleCI academy to learn more.
