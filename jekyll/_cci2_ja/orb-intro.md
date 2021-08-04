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

* TOC
{:toc}

## クイック スタート
{: #quick-start }
{:.no_toc}

CircleCI orbs are open-source, shareable packages of parameterizable [reusable configuration]({{site.baseurl}}/2.0/reusing-config/) elements, including [jobs]({{site.baseurl}}/2.0/reusing-config/#authoring-parameterized-jobs), [commands]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-commands), and [executors]({{site.baseurl}}/2.0/reusing-config/#executor). Use orbs to reduce configuration complexity and help you integrate with your software and services stack quickly and easily across many projects.

Published orbs can be found on our [Orb Registry](https://circleci.com/developer/orbs), or you can [author your own orb]({{site.baseurl}}/2.0/orb-author-intro/).

## Private orbs vs. public orbs
{: #private-orbs-vs-public-orbs }

There are two different types of orbs you can use in your configuration, depending on how you want to publish your orbs. If you prefer to publish your orb internally, and not to the [CircleCI Orb Registry](https://circleci.com/developer/orbs), you will want to use a private orb. However, if you want to publish your orb to the [CircleCI Orb Registry](https://circleci.com/developer/orbs), use a public orb. Each type of orb is described in the sections below.

### プライベート Orbs
{: #private-orbs }


**メモ:** プライベート Orbs 機能は、いずれかの有料[プラン](https://circleci.com/ja/pricing/)で利用いただけます。 パフォーマンスプランのお客様は最大3つのプライベート Orbs まで作成でき、スケールプランのお客様はプライベート Orbs の作成上限数に制限はありません。 詳細については、営業担当者へお問い合わせください。
{: class="alert alert-warning"}

Using a private orb enables you to author an orb while ensuring the following:

* CircleCI Orb レジストリに公開されない。

* 作成元組織以外のユーザーは閲覧、使用できない。

* 作成元組織のものではないパイプラインでは使用できない。

By choosing to use a private orb instead of a public orb, you also need to understand certain limitations inherent in using private orbs, which include:

* 設定ファイルのバリデーションに `circleci config validate` コマンドを使用できなくなります。 その代わり、Orb のコンテンツを設定ファイルの "orbs" スタンザにインラインで貼り付けるか、`circleci config validate --org-slug <your-org-slug> <path/to/config.yml>` コマンドを使用することで、設定ファイルをバリデーションできます。

* 組織間の関係性にかかわらず、ある組織で作成されたプライベート Orbs を、別の組織のパイプラインで使用することはできません。 それぞれの組織でコードのコミットとパイプラインの実行に必要なアクセス権を付与されている場合も例外ではなく、プライベート Orbs を設定ファイル内で使うことはできますが、別の Orb からは参照できません。

### パブリック Orbs
{: #public-orbs }

Public orbs are used by most users when authoring and publishing orbs to the [CircleCI Orb Registry](https://circleci.com/developer/orbs). When authoring a public orb, you are enabling all  CircleCI users to use your orb in their own configurations.
### Orb のオーサリング
{: #authoring-orbs }

Both public and private orbs can be authored in two ways:

* [Orb を手動でオーサリングする](https://circleci.com/ja/docs/2.0/orb-author-validate-publish/)方法
* [Orb 開発キット](https://circleci.com/ja/docs/2.0/orb-author/#orb-%E9%96%8B%E7%99%BA%E3%82%AD%E3%83%83%E3%83%88)を使用する方法 (推奨)

## Orbs を使用するメリット
{: #benefits-of-using-orbs }

Orbs provide parameterizable configuration elements that can greatly simplify your configuration. To illustrate this, the following example shows a typical configuration for testing a Node.js application – defining a job with the required steps for testing the application – versus using the `test` job provided by the [`circleci/node`](https://circleci.com/developer/orbs/orb/circleci/node) orb. With orbs, it is possible to write a parameterized configuration once and utilize it across multiple similar projects.

{:.tab.nodeTest.Orbs}
```yaml
version: 2.1

orbs:
  node: circleci/node@x.y #orb version

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
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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
