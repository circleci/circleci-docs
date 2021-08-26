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

CircleCI Orbs とは、[ジョブ]({{site.baseurl}}/2.0/reusing-config/#authoring-parameterized-jobs)、[コマンド]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-commands)、[Executor]({{site.baseurl}}/2.0/reusing-config/#executor) などの、パラメーター化および[再利用が可能な構成要素]({{site.baseurl}}/2.0/reusing-config/)をまとめた共有可能なオープン ソース パッケージです。 Orbs を使用すると、構成がシンプルになり、多くのプロジェクト間におけるソフトウェアやサービス スタックとの連携が素早く、容易に行えるようになります。

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

パブリック Orb ではなくプライベート Orb を選択する場合、プライベート Orb 固有の制限事項を理解する必要があります。具体的には次のとおりです。

* 設定ファイルのバリデーションに `circleci config validate` コマンドを使用できなくなります。 その代わり、Orb のコンテンツを設定ファイルの "orbs" スタンザにインラインで貼り付けるか、`circleci config validate --org-slug <your-org-slug> <path/to/config.yml>` コマンドを使用することで、設定ファイルをバリデーションできます。

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

Orb により設定ファイルの要素をパラメーター化できるため、構成を大幅に簡素化できます。 例を使って説明しましょう。以下は、Node.js アプリケーションをテストするための一般的な設定ファイルであり、ジョブの定義には、アプリケーションのテストに必要な複数のステップを実行する、または[circleci/node</code>](https://circleci.com/developer/orbs/orb/circleci/node) Orb が提供する `test` ジョブを使用します。 Orb を使用すれば、パラメーター化された構成を 1 回記述するだけで、それをいくつもの類似したプロジェクトで利用できるようになります。

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

The [Orb Registry](https://circleci.com/developer/orbs) is an open repository of all published orbs. Find the orb for your stack or consider developing and [publishing your own orb]({{site.baseurl}}/2.0/orb-author-intro/).

![Orb Registry]({{site.baseurl}}/assets/img/docs/orbs-registry.png)

Orbs in the registry will appear with one of three different namespace designations:

| Certified | Written and tested by the CircleCI team | | Partner | Written by our technology partners | | Community | Written by the community |
{: class="table table-striped"}

**Note:** _In order to use uncertified orbs, your organization’s administrator must opt-in to allow 3rd-party uncertified orb usage on the **Organization Settings > Security** page for your org._
{: class="alert alert-warning"}

Each orb contains its own description and documentation listed in the orb registry. Often, orbs will have a set of usage examples to get you started.

If you would like to contribute to an existing orb or file an issue on the orb's repository, many orb authors will include the git repository link.

## Orbs の指定
{: #identifying-orbs }
An orb is identified by its _slug_ which contains the _namespace_ and _orb name_. A namespace is a unique identifier referring to the organization authoring a set of orbs. The orb name will be followed be an `@` symbol and a [semantic version]({{site.baseurl}}/2.0/orb-concepts/#semantic-versioning) string, identifying which version of the orb is being used.

Example orb slug: `<namespace>/<orb-name>@1.2.3`

## Orbs の使用
{: #using-orbs }

Each orb within the registry provides a sample code snippet for importing that specific orb with its most recent version.

The example below shows how to import an orb into your `version: 2.1` config file. Create an `orbs` key followed by the orb-name key to reference which orb you want to import. The value for the orb-name key should then be the orb slug and version.

```yaml
version: 2.1

orbs:
  orb-name: <namespace>/<orb-name>@1.2.3
```

After the orb has been imported into the configuration file, the elements provided by the orb are available as `<orb-name>/<element>`. Orb elements can be used in the same way as [reusable configuration]({{site.baseurl}}/2.0/reusing-config/) elements. The Node example below shows how to use an orb command.

### Node の例
{: #node-example }
{:.no_toc}

The Node orb provides a command, [`install-packages`](https://circleci.com/developer/orbs/orb/circleci/node#commands-install-packages), to install your node packages, automatically enable caching, and provide additional options through the use of parameters. To use the `install-packages` command, reference it in a job's [steps](https://circleci.com/docs/2.0/configuration-reference/#steps).

```yaml
version: 2.1

orbs:
  node: circleci/node@x.y #orb version

jobs:
  test:
    docker:
      - image: cimg/node:<node-version>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - node/install-packages # Utilize commands in steps
```


## 関連項目
{: #see-also }
{:.no_toc}

- [Orbs のコンセプト]({{site.baseurl}}/2.0/orb-concepts/): CircleCI Orbs の基本的な概念
- [Orbs に関するよくあるご質問]({{site.baseurl}}/2.0/orbs-faq/): CircleCI Orbs の使用に際して発生している既知の問題や不明点
- [Orbs リファレンス ガイド]({{site.baseurl}}/2.0/reusing-config/): 再利用可能な Orb、コマンド、パラメーター、および Executors の例
- [Orb のテスト手法]({{site.baseurl}}/2.0/testing-orbs/): 独自に作成した Orb のテスト方法
- [構成クックブック]({{site.baseurl}}/2.0/configuration-cookbook/): 設定ファイル内で CircleCI Orbs を使用するためのレシピ
