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

ここでは、Node.js サンプル アプリケーションの [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) ファイルを作成する方法を詳細に説明します。

* TOC
{:toc}

## Quickstart: demo JavaScript Node.js reference project
{: #quickstart-demo-javascript-nodejs-reference-project }

We maintain a reference JavaScript project to show how to build a React.js app on CircleCI with `version: 2.1` configuration:

- [GitHub 上の JavaScript Node デモ プロジェクト](https://github.com/CircleCI-Public/circleci-demo-javascript-react-app)
- [Demo JavaScript Node Project building on CircleCI](https://app.circleci.com/pipelines/github/CircleCI-Public/circleci-demo-javascript-react-app){:rel="nofollow"}

In the project you will find a CircleCI configuration file [`.circleci/config.yml`](https://github.com/CircleCI-Public/circleci-demo-javascript-react-app/blob/master/.circleci/config.yml). This file shows best practice for using version 2.1 config with Node projects.

## Build the demo JavaScript Node project yourself
{: #build-the-demo-javascript-node-project-yourself }

A good way to start using CircleCI is to build a project yourself. Here's how to build the demo project with your own account:

1. Fork the project on GitHub to your own account.
2. Go to the Add Projects page in the CircleCI application and click the Set Up Project button next to the project you just forked.
3. 変更を加えるには、`.circleci/config.yml` ファイルを編集してコミットします。 コミットを GitHub にプッシュすると、CircleCI がそのプロジェクトをビルドしてテストします。


## Sample configuration
{: #sample-configuration }

Below is the `.circleci/config.yml` file in the demo project.

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


## Config walkthrough
{: #config-walkthrough }

Using the [2.1 Node orb](https://circleci.com/developer/orbs/orb/circleci/node#jobs-test) sets an executor from CircleCI's highly cached convenience images built for CI and allows you to set the version of NodeJS to use. Any available tag in the [docker image list](https://hub.docker.com/r/cimg/node/tags) can be used.

The Node Orb `test` command will test your code with a one-line command, with optional parameters.

Matrix jobs are a simple way to test your Node app on various node environments. For a more in depth example of how the Node orb utilizes matrix jobs, see our blog on [matrix jobs](https://circleci.com/blog/circleci-matrix-jobs/). See [documentation on pipeline parameters](https://circleci.com/docs/2.0/pipeline-variables/#pipeline-parameters-in-configuration) to learn how to set a node version via Pipeline parameters.

Success! You just set up a Node.js app to build on CircleCI with version: 2.1 configuration. Check out [our project’s pipeline page](https://app.circleci.com/pipelines/github/CircleCI-Public/circleci-demo-javascript-react-app) to see how this looks when building on CircleCI.

## See also
{: #see-also }
{:.no_toc}

- デプロイ ターゲットの構成例については、「[デプロイの構成]({{ site.baseurl }}/2.0/deployment-integrations/)」を参照してください。
- その他のパブリック JavaScript プロジェクトの構成例については、「[CircleCI 設定ファイルのサンプル]({{ site.baseurl }}/2.0/examples/)」を参照してください。
- CircleCI 2.0 を初めて使用する場合は、[プロジェクトのチュートリアル]({{ site.baseurl }}/2.0/project-walkthrough/)に目を通すことをお勧めします。ここでは、Python と Flask を使用した構成を例に詳しく解説しています。
