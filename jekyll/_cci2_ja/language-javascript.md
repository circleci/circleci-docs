---
layout: classic-docs
title: "Node.js - JavaScript チュートリアル"
short-title: "JavaScript"
description: "CircleCI 2.0 での JavaScript および Node.js を使用したビルドとテスト"
categories:
  - language-guides
order: 5
version:
  - Cloud
  - Server v2.x
---

ここでは、Node.js サンプル アプリケーションの [`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルを作成する方法を詳細に説明します。

* 目次
{:toc}

## クイックスタート: デモ用の JavaScript Node.js リファレンス プロジェクト
{: #quickstart-demo-javascript-nodejs-reference-project }

CircleCI 2.1 で React.js アプリケーションをビルドする方法を示すために、JavaScriptリファレンス プロジェクトが用意されています。

- [GitHub 上の JavaScript Node デモ プロジェクト](https://github.com/CircleCI-Public/circleci-demo-javascript-react-app)
- [CircleCI でビルドされた JavaScript Node デモ プロジェクト](https://circleci.com/gh/CircleCI-Public/circleci-demo-javascript-express){:rel="nofollow"}

このプロジェクトには、CircleCI 設定ファイル <a href="https://github.com/CircleCI-Public/circleci-demo-javascript-express/blob/master/.circleci/config.yml" target="_blank"><code>.circleci/config.yml</code></a> が含まれます。 このファイルは、Node プロジェクトで CircleCI 2.1 を使用するためのベスト プラクティスを示しています。

## JavaScript Node のデモ プロジェクトのビルド
{: #build-the-demo-javascript-node-project-yourself }

CircleCI を初めて使用する際は、プロジェクトをご自身でビルドしてみることをお勧めします。 以下に、ユーザー自身のアカウントを使用してデモ プロジェクトをビルドする方法を示します。

1. GitHub 上のプロジェクトをお使いのアカウントにフォークします。
2. CircleCI で [[Add Projects (プロジェクトの追加)](https://circleci.com/add-projects){:rel="nofollow"}] ページにアクセスし、フォークしたプロジェクトの横にある [Build Project (プロジェクトのビルド)] ボタンをクリックします。
3. 変更を加えるには、`.circleci/config.yml` ファイルを編集してコミットします。 コミットを GitHub にプッシュすると、CircleCI がそのプロジェクトをビルドしてテストします。


## 設定ファイルの例
{: #sample-configuration }

以下に、デモ プロジェクトのコメント付き `.circleci/config.yml` ファイルを示します。

{% raw %}

```yaml
orbs: # declare what orbs we are going to use
  node: circleci/node@2.0.2 # the node orb provides common node-related configuration

version: 2.1 # using 2.1 provides access to orbs and other features

workflows:
  matrix-tests:
    jobs:
      - node/test:
          version: 13.11.0
      - node/test:
          version: 12.16.0
      - node/test:
          version: 10.19.0
```
{% endraw %}


## 設定ファイルの例
{: #config-walkthrough }

Using the [2.1 Node orb](https://circleci.com/developer/orbs/orb/circleci/node#jobs-test) sets an executor from CircleCI's highly cached convenience images built for CI and allows you to set the version of NodeJS to use. Any available tag in the [docker image list](https://hub.docker.com/r/cimg/node/tags) can be used.

ジョブの各ステップは [Executor]({{ site.baseurl }}/ja/2.0/executor-types/) という仮想環境で実行されます。

Matrix jobs are a simple way to test your Node app on various node environments. For a more in depth example of how the Node orb utilizes matrix jobs, see our blog on [matrix jobs](https://circleci.com/blog/circleci-matrix-jobs/). See [documentation on pipeline parameters](https://circleci.com/docs/2.0/pipeline-variables/#pipeline-parameters-in-configuration) to learn how to set a node version via Pipeline parameters.

完了です。 これで Node.js アプリケーション用に CircleCI 2.1 をセットアップできました。 CircleCI でビルドを行うとどのように表示されるかについては、プロジェクトの[ジョブ ページ](https://circleci.com/gh/CircleCI-Public/circleci-demo-javascript-express){:rel="nofollow"}を参照してください。

## 関連項目
{: #see-also }
{:.no_toc}

- デプロイ ターゲットの構成例については、「[デプロイの構成]({{ site.baseurl }}/ja/2.0/deployment-integrations/)」を参照してください。
- その他のパブリック JavaScript プロジェクトの構成例については、「[CircleCI 設定ファイルのサンプル]({{ site.baseurl }}/ja/2.0/examples/)」を参照してください。
- CircleCI 2.0 を初めて使用する場合は、[プロジェクトのチュートリアル]({{ site.baseurl }}/ja/2.0/project-walkthrough/)に目を通すことをお勧めします。 ここでは、Python と Flask を使用した構成を例に詳しく解説しています。
