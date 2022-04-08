---
layout: classic-docs-experimental
title: "CircleCI での Node.js アプリケーションの設定"
short-title: "JavaScript"
description: "CircleCI  での JavaScript と Node.js を使用したビルドとテスト"
categories:
  - language-guides
order: 5
version:
  - Cloud
  - Server v3.x
  - Server v2.x
---

ここでは、Node.js サンプル アプリケーションの [`.circleci/config.yml`]({{site.baseurl}}/ja/2.0/configuration-reference/) ファイルを作成する方法の詳細を説明します。

* 目次
{:toc}

## クイックスタート: リファレンス用の JavaScript Node.js デモプロジェクト
{: #quickstart-demo-javascript-nodejs-reference-project }{: #quickstart-demo-javascript-nodejs-reference-project }

CircleCI 2.1 で React.js アプリケーションをビルドする方法の説明のために、リファレンス用のJavaScript プロジェクトを用意しています。

- [GitHub 上の JavaScript Node デモ プロジェクト](https://github.com/CircleCI-Public/circleci-demo-javascript-react-app)
- [CircleCI でビルドされた JavaScript Node デモ プロジェクト](https://circleci.com/gh/CircleCI-Public/circleci-demo-javascript-express){:rel="nofollow"}

In the project, you will find a CircleCI configuration file [`.circleci/config.yml`](https://github.com/CircleCI-Public/circleci-demo-javascript-react-app/blob/master/.circleci/config.yml). This file shows best practice for using `version 2.1` config with Node projects.

## JavaScript Node のデモ プロジェクトのビルド
{: #build-the-demo-javascript-node-project-yourself }

CircleCI を初めて使用する際は、プロジェクトをご自身でビルドしてみることをお勧めします。 以下に、ご自身のアカウントでデモ プロジェクトをビルドする方法を示します。

1. GitHub 上のプロジェクトをお使いのアカウントにフォークします。
2. Go to the **Projects** page on the [CircleCI web app](https://app.circleci.com/), and click the **Set Up Project** button next to the project you just forked.
3. To make changes, you can edit the `.circleci/config.yml` file and make a commit. コミットを GitHub にプッシュすると、CircleCI がそのプロジェクトをビルドしてテストします。


## 設定ファイルの例
{: #sample-configuration }

以下に、デモ プロジェクトの `.circleci/config.yml` ファイルを示します。

{% raw %}

```yaml
orbs: # declare what orbs we are going to use
  node: circleci/node@2.0.2 # the Node orb provides common Node-related configuration

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


## 設定の詳細
{: #config-walkthrough }

The [2.1 Node orb](https://circleci.com/developer/orbs/orb/circleci/node#jobs-test) sets an executor from CircleCI's highly cached convenience images built for CI and allows you to set the version of Node to use. [Docker イメージのリスト](https://hub.docker.com/r/cimg/node/tags)にある利用可能なタグはすべて使用できます。

The Node orb `test` command will test your code with a one-line command, with optional parameters.

Matrix jobs are a simple way to test your Node app on various Node environments. For a more in-depth example of how the Node orb utilizes matrix jobs, see our blog on [matrix jobs](https://circleci.com/blog/circleci-matrix-jobs/). See [documentation on pipeline parameters]({{site.baseurl}}/2.0/pipeline-variables/#pipeline-parameters-in-configuration) to learn how to set a Node version with Pipeline parameters.

成功です！ You just set up a Node app to build on CircleCI with `version: 2.1` configuration. CircleCI でビルドを行うとどのように表示されるかについては、プロジェクトの[パイプラインのページ](https://app.circleci.com/pipelines/github/CircleCI-Public/circleci-demo-javascript-react-app)を参照してください。

## 関連項目
{: #see-also }
{:.no_toc}

- See the [Deploy]({{site.baseurl}}/2.0/deployment-integrations/) page for example deploy target configurations.
- その他のパブリック JavaScript プロジェクトの設定例については、[設定例]({{site.baseurl}}/2.0/examples/)のページを参照してください。
- If you're new to CircleCI, we recommend reading our [Project Walkthrough]({{site.baseurl}}/2.0/project-walkthrough/) page for a detailed explanation of our configuration using Python and Flask as an example.
