---
layout: classic-docs-experimental
title: "Configuring a Node.js Application on CircleCI"
short-title: "JavaScript"
description: "Building and Testing with JavaScript and Node.js on CircleCI"
categories:
  - language-guides
order: 5
version:
  - Cloud
  - Server v3.x
  - Server v2.x
---

ここでは、Node.js サンプル アプリケーションの [`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルを作成する方法の詳細を説明します。

* 目次
{:toc}

## クイックスタート: リファレンス用の JavaScript Node.js デモプロジェクト
{: #quickstart-demo-javascript-nodejs-reference-project }{: #quickstart-demo-javascript-nodejs-reference-project }

CircleCI 2.1 で React.js アプリケーションをビルドする方法の説明のために、リファレンス用のJavaScript プロジェクトを用意しています。

- [GitHub 上の JavaScript Node デモ プロジェクト](https://github.com/CircleCI-Public/circleci-demo-javascript-react-app)
- [CircleCI でビルドされた JavaScript Node デモ プロジェクト](https://circleci.com/gh/CircleCI-Public/circleci-demo-javascript-express){:rel="nofollow"}

このプロジェクトには、CircleCI 設定ファイル <a href="https://github.com/CircleCI-Public/circleci-demo-javascript-express/blob/master/.circleci/config.yml" target="_blank"><code>.circleci/config.yml</code></a> が含まれます。 このファイルでは、Node プロジェクトで CircleCI 2.1 を使用するためのベスト プラクティスを紹介しています。

## JavaScript Node のデモ プロジェクトのビルド
{: #build-the-demo-javascript-node-project-yourself }

CircleCI を初めて使用する際は、プロジェクトをご自身でビルドしてみることをお勧めします。 以下に、ご自身のアカウントでデモ プロジェクトをビルドする方法を示します。

1. GitHub 上のプロジェクトをお使いのアカウントにフォークします。
2. CircleCI で [Add Projects (プロジェクトの追加)] ページにアクセスし、フォークしたプロジェクトの横にある [Set up Project (プロジェクトの設定)] ボタンをクリックします。
3. 変更を加えるには、`.circleci/config.yml` ファイルを編集してコミットします。 コミットを GitHub にプッシュすると、CircleCI がそのプロジェクトをビルドしてテストします。


## 設定ファイルの例
{: #sample-configuration }

以下に、デモ プロジェクトの `.circleci/config.yml` ファイルを示します。

{% raw %}

```yaml
orbs: # 使用する Orb を宣言します。
  node: circleci/node@2.0.2 # the node orb provides common node-related configuration

version: 2.1 # 2.1を使用すると、Orb や他の機能にアクセスすることができます。 

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

[2.1 Node Orb ](https://circleci.com/developer/orbs/orb/circleci/node#jobs-test)を使用すると、CI 用にビルドされ、高度にキャッシュされた CircleCI イメージから Executor を設定し、使用する NodeJS のバージョンを設定することができます。 [Docker イメージのリスト](https://hub.docker.com/r/cimg/node/tags)にある利用可能なタグはすべて使用できます。

Node Orb の `test` コマンドにより、オプションのパラメータを使って 1 行のコマンドでコードをテストすることができます。

マトリックスジョブは、様々な Node 環境で Node アプリケーションをテストする簡単な方法です。 Node Orb によりマトリックスジョブを利用する方法の詳細な例は、 [マトリックスジョブ](https://circleci.com/blog/circleci-matrix-jobs/)に関する投稿を参照してください。 パイプラインパラメーターで Node のバージョンを設定する方法については、 [パイプラインパラメーターに関するドキュメント](https://circleci.com/docs/2.0/pipeline-variables/#pipeline-parameters-in-configuration) を参照してください。

成功です！ CircleCI 2.1 上に Node.js アプリケーションをビルドするための設定が完了しました。 CircleCI でビルドを行うとどのように表示されるかについては、プロジェクトの[パイプラインのページ](https://app.circleci.com/pipelines/github/CircleCI-Public/circleci-demo-javascript-react-app)を参照してください。

## 関連項目
{: #see-also }
{:.no_toc}

- デプロイ ターゲットの設定例については、[デプロイ]({{ site.baseurl }}/ja/2.0/deployment-integrations/)ドキュメントを参照してください。
- その他のパブリック JavaScript プロジェクトの設定例については、[設定例]({{ site.baseurl }}/2.0/examples/)のページを参照してください。
- If you're new to CircleCI, we recommend reading our [Project Walkthrough]({{ site.baseurl }}/2.0/project-walkthrough/) for a detailed explanation of our configuration using Python and Flask as an example.
