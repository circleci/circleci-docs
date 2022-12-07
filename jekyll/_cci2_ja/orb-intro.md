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

Orb は、パラメーター化が可能な設定要素をまとめた再利用可能なパッケージであり、あらゆるプロジェクトで使用できます。 [ジョブ]({{site.baseurl}}/reusing-config/#authoring-parameterized-jobs)、[コマンド]({{site.baseurl}}/reusing-config/#authoring-reusable-commands)、[Executor]({{site.baseurl}}/reusing-config/#executor) などの再利用可能な設定要素で構成されています。 Orb は多くの言語、プラットフォーム、サービス、ツールでご利用いただけます。 [CircleCI Orb レジストリ](https://circleci.com/developer/orbs)では、設定ファイルの簡素化に役立つ Orb を検索できます。

独自の Orb を作成する場合は、[Orb の作成方法]({{site.baseurl}}/ja/orb-author-intro/)のページをご覧ください。

## クイックスタート
{: #quickstart }

* [Node.js プロジェクトのクイックスタートガイド](/docs/language-javascript/)に従ってください。
* [Python プロジェクトのクイックスタートガイド](/docs/language-python/)に従ってください。
* [Slack Orb](/docs/slack-orb-tutorial/) を使って通知を設定してください。

## Orb の使用
{: #use-an-orb }

Orb は、_名前空間_と _Orb 名_から成る_スラッグ_で指定します。 名前空間は、Orb を作成した組織を指す一意の識別子です。 Orb 名の後には、`@` 記号と、使用する Orb バージョンを指定する[セマンティックバージョン]({{site.baseurl}}/ja/orb-concepts/#semantic-versioning)の文字列が続きます。 例: `<namespace>/<orb-name>@1.2.3`

[レジストリ](https://circleci.com/developer/orbs)で公開されている各 Orb には[クイックスタートガイド](https://circleci.com/developer/orbs/orb/circleci/node#quick-start)が提供されており、その Orb の最新バージョンを`.circleci/config.yml`にインポートするためのサンプルコードスニペットが含まれています。

以下のコード例では、CircleCI の設定ファイルに Orb をインポートする方法を紹介します。 Orb をインポートするための一般的なレイアウトと、Node.js Orb をインポートする場合の例の両方を表示する 2 つのタブがあります。

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

設定ファイルに Orb をインポートしたら、その Orb が提供するエレメントを `<orb-name>/<element>` の形式で使用できます。 Orb エレメントにはジョブ、コマンド、Exectuor が含まれます。 各エレメントで使用できるパラメーターは、各エレメントの下にある表の Orb レジストリに一覧表示されています。

多くの Orb には、一般的な機能の詳細が分かる使用例も含まれており、プロジェクトに組み込むプロセスをさらに簡素化できます。 多くの Orb 作成者が Git リポジトリのリンクを掲載しており、既存の Orb に貢献したり、Orb リポジトリに関する問題を報告することができます。

Orb エレメントは、[再利用可能な設定要素]({{site.baseurl}}/ja/reusing-config/)と同じ方法で使用できます。 下記の Node の例では、Orb のデフォルトの Executor と Orb コマンドの使い方を紹介します。

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

Orb により設定要素をパラメーター化できるため、設定ファイルを大幅に簡素化できます。 例を使って説明しましょう。以下は、Node.js アプリケーションをテストするために Node. JS Orb を使った一般的な設定ファイルです ([`circleci/node` ](https://circleci.com/developer/orbs/orb/circleci/node)Orb が提供する `test` ジョブを使用)。Orb を使用しない場合に必要な設定ファイルと比較してみましょう (アプリケーションのテストに必要なステップでジョブを定義)。

Orb を使用すると、事前定義されたパラメーター化された設定要素をプロジェクトの設定ファイルに取り込むことができます。 さらに一歩進んで独自の Orb を作成すると、パラメーター化された設定要素を一度定義することにより複数の類似プロジェクトで使用できます。

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

### Orb のラベル
{: #orb-designation }

未承認の Orb (パートナー製またはコミュニティー製) を使用するには、組織の管理者が組織の **Organization Settings > Security** のページで未承認 Orb の使用をオプトインする必要があります。
{: class="alert alert-warning"}

レジストリの Orb には、次の 3 つのラベルのいずれかが表示されます。

| ラベル    | 説明                      |
| ------ | ----------------------- |
| 承認済み   | CircleCI チームが作成し、テストを実施 |
| パートナー  | テクノロジーパートナーが作成          |
| コミュニティ | コミュニティーが作成              |
{: class="table table-striped"}

### パブリックまたはプライベート
{: #public-or-private }
Orb は以下のいずれかの方法でパブリッシュすることができます。

* **パブリック**: Orb レジストリで検索でき、誰でも使用できます。
* **プライベート**: 組織内でのみ使用することができ、直接 URL を使って認証されている場合のみレジストリ内で表示されます。

詳細については、Orb の概要のページの [パブリック Orb vs プライベート Orb ]({{site.baseurl}}/ja/orb-concepts/#private-orbs-vs-public-orbs)をお読みください。


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
