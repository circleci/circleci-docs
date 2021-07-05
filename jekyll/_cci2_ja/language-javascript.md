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
CircleCI 2.1 で Express.js アプリケーションをビルドする方法を示すために、JavaScript Node.js リファレンス プロジェクトが用意されています。

We maintain a reference JavaScript project to show how to build a React.js app on CircleCI with `version: 2.1` configuration:

- [GitHub 上の JavaScript Node デモ プロジェクト](https://github.com/CircleCI-Public/circleci-demo-javascript-react-app)
- [CircleCI でビルドされた JavaScript Node デモ プロジェクト](https://circleci.com/gh/CircleCI-Public/circleci-demo-javascript-express){:rel="nofollow"}

このプロジェクトには、CircleCI 設定ファイル <a href="https://github.com/CircleCI-Public/circleci-demo-javascript-express/blob/master/.circleci/config.yml" target="_blank"><code>.circleci/config.yml</code></a> が含まれます。 このファイルは、Node プロジェクトで CircleCI 2.1 を使用するためのベスト プラクティスを示しています。

## CircleCI のビルド済み Docker イメージ
セカンダリ「サービス」コンテナとして使用するデータベース イメージも提供されています。

CircleCI を初めて使用する際は、プロジェクトをご自身でビルドしてみることをお勧めします。 以下に、ユーザー自身のアカウントを使用してデモ プロジェクトをビルドする方法を示します。

1. GitHub 上のプロジェクトをお使いのアカウントにフォークします。
2. CircleCI で [[Add Projects (プロジェクトの追加)](https://circleci.com/add-projects){:rel="nofollow"}] ページにアクセスし、フォークしたプロジェクトの横にある [Build Project (プロジェクトのビルド)] ボタンをクリックします。
3. 変更を加えるには、`.circleci/config.yml` ファイルを編集してコミットします。 コミットを GitHub にプッシュすると、CircleCI がそのプロジェクトをビルドしてテストします。


## JavaScript Node のデモ プロジェクトのビルド
以下に、デモ プロジェクトのコメント付き `.circleci/config.yml` ファイルを示します。

Below is the `.circleci/config.yml` file in the demo project.

{% raw %}

```yaml
version: 2.1 # CircleCI 2.1 を使用します
jobs: # 一連のステップ
  build: # ワークフローを使用しない実行では、エントリポイントとして `build` ジョブが必要です
    working_directory: ~/mern-starter # ステップが実行されるディレクトリ
    docker: # Docker でステップを実行します

      - image: circleci/node:10.16.3 # このイメージをすべての `steps` が実行されるプライマリ コンテナとして使用します
      - image: mongo:4.2.0 # このイメージをセカンダリ サービス コンテナとして使用します
    steps: # 実行可能コマンドの集合
      - checkout # ソース コードを作業ディレクトリにチェックアウトする特別なステップ
      - run:
          name: update-npm
          command: 'sudo npm install -g npm@latest'
      - restore_cache: # 依存関係キャッシュを復元する特別なステップ
          # 依存関係キャッシュについては https://circleci.com/ja/docs/2.0/caching/ をお読みください
          key: dependency-cache-{{ checksum "package-lock.json" }}
      - run:
          name: install-npm-wee
          command: npm install
      - save_cache: # 依存関係キャッシュを保存する特別なステップ
          key: dependency-cache-{{ checksum "package-lock.json" }}
          paths:
            - ./node_modules
      - run: # テストを実行します
          name: test
          command: npm test
      - run: # カバレッジ レポートを実行します
          name: code-coverage
          command: './node_modules/.bin/nyc report --reporter=text-lcov'
      - store_artifacts: # テスト結果をアーティファクトとして保存する特別なステップ
          # アーティファクト (https://circleci.com/ja/docs/2.0/artifacts/) に表示するテスト サマリーをアップロードします 
          path: test-results.xml
          prefix: tests
      - store_artifacts: # アーティファクト (https://circleci.com/ja/docs/2.0/artifacts/) に表示するため
          path: coverage
          prefix: coverage
      - store_test_results: # テスト サマリー (https://circleci.com/ja/docs/2.0/collect-test-data/) に表示するため
          path: test-results.xml
      # デプロイ例については https://circleci.com/ja/docs/2.0/deployment-integrations/ を参照してください
```
{% endraw %}


## 設定ファイルの例
{: #config-walkthrough }

Using the [2.1 Node orb](https://circleci.com/developer/orbs/orb/circleci/node#jobs-test) sets an executor from CircleCI's highly cached convenience images built for CI and allows you to set the version of NodeJS to use. Any available tag in the [docker image list](https://hub.docker.com/r/cimg/node/tags) can be used.

ジョブの各ステップは [Executor]({{ site.baseurl }}/ja/2.0/executor-types/) という仮想環境で実行されます。

Matrix jobs are a simple way to test your Node app on various node environments. For a more in depth example of how the Node orb utilizes matrix jobs, see our blog on [matrix jobs](https://circleci.com/blog/circleci-matrix-jobs/). See [documentation on pipeline parameters](https://circleci.com/docs/2.0/pipeline-variables/#pipeline-parameters-in-configuration) to learn how to set a node version via Pipeline parameters.

完了です。 これで Node.js アプリケーション用に CircleCI 2.1 をセットアップできました。 CircleCI でビルドを行うとどのように表示されるかについては、プロジェクトの[ジョブ ページ](https://circleci.com/gh/CircleCI-Public/circleci-demo-javascript-express){:rel="nofollow"}を参照してください。

## See also
{: #see-also }
{:.no_toc}

- デプロイ ターゲットの構成例については、「[デプロイの構成]({{ site.baseurl }}/ja/2.0/deployment-integrations/)」を参照してください。
- その他のパブリック JavaScript プロジェクトの構成例については、「[CircleCI 設定ファイルのサンプル]({{ site.baseurl }}/ja/2.0/examples/)」を参照してください。
- CircleCI 2.0 を初めて使用する場合は、[プロジェクトのチュートリアル]({{ site.baseurl }}/ja/2.0/project-walkthrough/)に目を通すことをお勧めします。 ここでは、Python と Flask を使用した構成を例に詳しく解説しています。
