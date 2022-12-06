---
layout: classic-docs
title: "Orb の概要"
description: "CircleCI Orb の使用に関する入門ガイド"
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
---

Orb を使用すると以下が可能です。

* 設定ファイル (`.circleci/_config.yml`) の簡略化
* 繰り返しのプロセスの自動化
* プロジェクトの設定の迅速化
* サードパーティー製ツールとの連携の簡素化

## 概要
{: #introduction }

Orb は、パラメーター化が可能な設定要素をまとめた再利用可能なパッケージであり、あらゆるプロジェクトで使用できます。 CircleCI Orb とは、[ジョブ]({{site.baseurl}}/reusing-config/#authoring-parameterized-jobs)、[コマンド]({{site.baseurl}}/reusing-config/#authoring-reusable-commands)、[Executor]({{site.baseurl}}/reusing-config/#executor) などの、再利用が可能な設定要素で構成されています。 Orb は多くの言語、プラットフォーム、サービス、ツールでご利用いただけます。 [CircleCI Orb レジストリ](https://circleci.com/developer/orbs)では、設定ファイルの簡素化に役立つ Orb を検索できます。

独自の Orb を作成する場合は、[Orb の作成方法]({{site.baseurl}}/ja/orb-author-intro/)のページをご覧ください。

## クイックスタート
{: #quickstart }

* Follow our [Node.js project quickstart guide](/docs/language-javascript/).
* Follow our [Python project quickstart guide](/docs/language-python/).
* Set up notifications using the [Slack orb](/docs/slack-orb-tutorial/).

## Use an orb
{: #use-an-orb }

An orb is identified by its _slug_ which contains the _namespace_, and _orb name_. 名前空間は、Orb を作成した組織を指す一意の識別子です。 Orb 名の後には、`@` 記号と、使用する Orb バージョンを指定する[セマンティック バージョン]({{site.baseurl}}/ja/orb-concepts/#semantic-versioning)文字列が続きます。 For example: `<namespace>/<orb-name>@1.2.3`.

Each orb within the [registry](https://circleci.com/developer/orbs) provides a [quickstart guide](https://circleci.com/developer/orbs/orb/circleci/node#quick-start), which contains a sample code snippet for importing that specific orb, with its most recent version, into your `.circleci/config.yml`.

The example below shows how to import any orb into your CircleCI configuration file. There are two tabs to show both a generic layout for importing any orb, and a specific example of importing the Node.JS orb:

{:.tab.nodeExample.Node}
```yaml
version: 2.1

orbs:
  node: circleci/node@5.0.3
```

{:.tab.nodeExample.Generic}
```yaml
version: 2.1

orbs:
  <orb-name>: <namespace>/<orb-name>@x.y.z
```

設定ファイルに Orb をインポートしたら、その Orb が提供するエレメントを `<orb-name>/<element>` の形式で使用できます。 Orb elements can include jobs, commands, and executors. The parameters available for each element are listed in the orb registry in a table under each element.

Most orbs will also include usage examples detailing common functionality, to further simplify the process of incorporating them into your projects. 多くの Orb 作成者が Git リポジトリのリンクを掲載しており、既存の Orb に貢献したり、Orb リポジトリに関する問題を報告することができます。

Orb エレメントは、[再利用可能な設定要素]({{site.baseurl}}/ja/reusing-config/)と同じ方法で使用できます。 The Node example below shows how to use an orb's default executor, and an orb command.

### Node の例
{: #node-example }

Node Orb には、[install-packages</code>](https://circleci.com/developer/orbs/orb/circleci/node#commands-install-packages) という Node パッケージをインストールしてキャッシュを自動的に有効にするコマンドがあります。 このコマンドには、パラメーターを使用して追加のオプションを指定できます。 `install-packages` コマンドを使用するには、ジョブの [steps]({{site.baseurl}}/ja/configuration-reference/#steps) にこのコマンドを記述します。

```yaml
version: 2.1

orbs:
  node: circleci/node@x.y # replace orb version

jobs:
  test:
    executor: node/default # use the default executor specified by the orb
    steps:
      - checkout
      - node/install-packages # Use a command from the orb in a job's steps
```


## Orb を使用するメリット
{: #benefits-of-using-orbs }

Orb により設定ファイルの要素をパラメーター化できるため、構成を大幅に簡素化できます。 To illustrate this, the following example shows a typical configuration for testing a Node.js application using the Node.JS orb (using the `test` job provided by the [`circleci/node`](https://circleci.com/developer/orbs/orb/circleci/node) orb), compared to the configuration required without using the orb (defining a job with the required steps for testing the application).

Orbs let you pull in pre-defined, parameterized configuration elements into your project configuration. Taking it a step further, authoring your own orb lets you define parameterized configuration elements once and utilize them across multiple similar projects.

{:.tab.nodeTest.Orbs}
```yaml
version: 2.1

orbs:
  node: circleci/node@x.y # replace orb version https://circleci.com/developer/orbs/orb/circleci/node#quick-start

workflows:
  test_my_app:
    jobs:
      - node/test:
          version: <node-version> # replace node version
```

{:.tab.nodeTest.Without-Orbs}
{% raw %}
```yaml
version: 2.1

jobs:
  test:
    docker:
      - image: cimg/node:<node-version>
    steps:
      - checkout
      - restore_cache:
          keys:
            - node-deps-v1-{{ .Branch }}-{{checksum "package-lock.json"}}
      - run:
          name: install packages
          command: npm ci
      - save_cache:
          key: node-deps-v1-{{ .Branch }}-{{checksum "package-lock.json"}}
          paths:
            - ~/.npm
      - run:
          name: Run Tests
          command: npm run test

workflows:
  test_my_app:
    jobs:
      - test

```
{% endraw %}

## Orb レジストリ
{: #the-orb-registry }

[Orb レジストリ](https://circleci.com/developer/ja/orbs)は、パブリッシュされたすべての Orb が掲載されたオープンリポジトリです。 自分のスタックに適した Orb を検索できるだけでなく、[独自の Orb を開発してパブリッシュ]({{site.baseurl}}/ja/orb-author-intro/)することもできます。

![Orb レジストリ]({{site.baseurl}}/assets/img/docs/orbs-registry.png)

### Orb designations
{: #orb-designation }

In order to use uncertified orbs (partner or community), your organization’s administrator must opt-in to allow uncertified orb usage on the **Organization Settings > Security** page for your org.
{: class="alert alert-warning"}

レジストリの Orb には、次の 3 つのラベルのいずれかが表示されます。

| Designation | 説明                                      |
| ----------- | --------------------------------------- |
| 承認済み        | Written and tested by the CircleCI team |
| パートナー       | Written by our technology partners      |
| コミュニティ      | Written by the community                |
{: class="table table-striped"}

### パブリックまたはプライベート
{: #public-or-private }
Orb は以下のいずれかの方法でパブリッシュすることができます。

* **Public**: Searchable in the orb registry, and available for anyone to use
* **Private**: Only available to use within your organization, and only findable in the registry with a direct URL and when authenticated

To understand these concepts further, read the [Public Orbs vs Private Orbs]({{site.baseurl}}/orb-concepts/#private-orbs-vs-public-orbs) section of the Orb Concepts page.


## CircleCI アプリの Orb ページ
{: #orbs-view}

CircleCI Web アプリの Orb ページは、現在 CircleCI Server ではご利用いただけません。
{: class="alert alert-warning"}

プライベート Orb の詳細ページを閲覧できるのは、ログインしている組織のメンバーのみです。 パブリッシュされていない Orb には詳細ページはリンクされません。
{: class="alert alert-info"}

Web アプリで Orb ページにアクセスするには、**Organization Settings** に移動し、サイドバーで **Orbs** を選択します。

Orb ページには、組織で作成した Orb の一覧があります。 下記の項目を確認できます。

* Orb の種類 (パブリックまたはプライベート)
* Orb の使用状況 (全設定ファイルで Orb が使用された回数)
* 最新バージョン
* 説明

Orb のソースなどの詳しい情報は、Orb 名をクリックするとアクセスできます。 この Orb の詳細ページでは、CircleCI Orb レジストリと同様に、Orb のコンテンツ、コマンド、使用例が確認できます。


## 関連項目
{: #see-also }

- CircleCI Orb の概要については、[Orb のコンセプト]({{site.baseurl}}/ja/orb-concepts/)を参照してください。
- [Orb に関するよく寄せられるご質問]({{site.baseurl}}/ja/orbs-faq/): CircleCI Orb の使用に際して発生している既知の問題やご質問
- [再利用可能な設定ファイルのリファレンス]({{site.baseurl}}/ja/reusing-config/): 再利用可能な Orb、コマンド、パラメーター、および Executor の例
- [Orb のテスト手法]({{site.baseurl}}/ja/testing-orbs/): 独自に作成した Orb のテスト方法
- CircleCI Academy の [Orb コース](https://academy.circleci.com/orbs-course?access_code=public-2021) を受講すると、さらに詳しく学ぶことができます。
