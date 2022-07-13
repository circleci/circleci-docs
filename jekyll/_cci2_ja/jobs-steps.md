---
layout: classic-docs
title: "ジョブとステップ"
description: "CircleCI ジョブとステップの説明"
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

このドキュメントでは CircleCI のジョブとステップの概要について説明します。

* 目次
{:toc}

## ジョブの概要
{: #jobs-overview }

CircleCI のジョブはステップの集まりです。 ジョブ内のステップは、すべて 1 単位として新しいコンテナまたは仮想マシン内で実行されます。 Jobs are orchestrated using [workflows]({{ site.baseurl }}/workflows/).

下の図はジョブ間のデータフローを表したものです。
* ワークスペースは、同じワークフロー内のジョブ間でデータを維持します。
* キャッシュは、異なるワークフローの実行の同一のジョブ間でデータを永続化します。
* アーティファクトは、ワークフローの終了後にデータを永続化します。

![ジョブの概要]( {{ site.baseurl }}/assets/img/docs/jobs-overview.png)

**注**: 図に示されているジョブ名はただの例です。お好きな名前をつけていただけます。

ジョブは、Docker Executor を使って Docker コンテナで、または `machine` Executor を使って仮想マシンで、Linux、macOS、または Windows を使用して実行できます。 セカンダリコンテナや VM は、データベースなどのサービスをアタッチしてジョブと一緒に実行するように設定することができます。

Docker Executor を使用する場合、`docker` キーの下に記載されるイメージによりジョブで開始するコンテナを指定します。 Docker Executor では、Docker のすべてのパブリックイメージを使用できますが、CircleCI では様々なユースケースに役立つ CircleCI イメージを提供しています。 使用できる CircleCI イメージや VM イメージのフルリストは、[CircleCI Developer Hub](https://circleci.com/developer/images)でご確認いただけます。

See the [Introduction to Execution Environments]({{ site.baseurl }}/executor-intro/) document for a comparison of the different executor types, and links to further information for each option.

## ステップの概要
{: #steps-overview }

ステップは実行可能なコマンドの集まりであり、ジョブ内で実行されます。 コードをチェックアウトするには、`steps` の下に `checkout:` キーが必要であり、`run:` キーにより任意の複数行のシェルコマンドスクリプトを追加できます。  この `run:` キーに加えて、`save_cache:`、`restore_cache:`、`store_artifacts:`、`store_test_results:`、`add_ssh_keys` の各キーが steps の下に置かれます。 For a full list of step options see the [Configuration Reference Steps Key]({{ site.baseurl }}/configuration-reference/#steps).

## ジョブにパラメーターを渡す
{: #passing-parameters-to-jobs }

パラメーターを使うと、異なるパッケージバージョンや異なる実行環境などの複数のシナリオで一つのジョブを何度も実行することができます。 An extension of this functionality is [matrix jobs]({{site.baseurl}}/configuration-reference/#matrix-requires-version-21). 下記は実行時にパラメータをジョブに渡す基本的な例です。

```yml
version: 2.1
​
jobs:
  print-a-message:
    docker:
      - image: cimg/base:2022.03
    parameters:
      message:
        type: string
    steps:
      - run: echo << parameters.message >>
​
workflows:
  my-workflow:
    jobs:
      - print-a-message:
          message: Hello!
```

## Orb のジョブを使う
{: #using-a-job-from-an-orb }

Orb とは、プロジェクト内で使用できるパッケージまたは再利用可能な設定です。 Orb には通常ジョブ内で使用できるコマンドや、ワークフロー内でスケジュール実行できる全ジョブが含まれています。 [Slack Orb](https://circleci.com/developer/orbs/orb/circleci/slack) を例にとってみましょう。 この Orb は、[`on-hold`](https://circleci.com/developer/orbs/orb/circleci/slack#usage-on_hold_notification) というジョブを提供し、これはワークフローで使用できます。 このジョブは、手動承認を求めるワークフローを一時停止し、Slack 通知を送信します。 ワークフローで参照すると、このジョブを使用できます（10行目を参照）。

```yml
version: 2.1

orbs:
  slack: circleci/slack@4.1

workflows:
  on-hold-example:
    jobs:
      - my_test_job
      - slack/on-hold:
          context: slack-secrets
          requires:
            - my_test_job
      - pause_workflow:
          requires:
            - my_test_job
            - slack/on-hold
          type: approval
      - my_deploy_job:
          requires:
            - pause_workflow
```

## ジョブで Orb のコマンドを使う
{: #using-a-command-from-an-orb-in-a-job }

ここでも再び [Slack Orb](https://circleci.com/developer/orbs/orb/circleci/slack) を例に挙げます。この Orb には、`notify` というコマンドが含まれており、特定の Slack チャンネルの通知に使用されるコマンドです。 このコマンドはジョブでは以下のように使用されます（16行目を参照）。

**注**: この例では [Node Orb](https://circleci.com/developer/orbs/orb/circleci/node) も使用しています。

```yml
version: 2.1

orbs:
  node: 'circleci/node:4.1'
  slack: circleci/slack@4.1

jobs:
  deploy:
    executor:
      name: node/default
    steps:
      - checkout
      - node/install-packages
      - run:
          command: npm run deploy
      - slack/notify:
          channel: ABCXYZ
          event: fail
          template: basic_fail_1

workflows:
  deploy_and_notify:
    jobs:
      - deploy:
          context: slack-secrets
```


## 次のステップ
{: #next-steps }

- Read more about orchestrating jobs in the [Using Workflows to Schedule Jobs ]({{ site.baseurl }}/workflows) page.
- Read more about passing data between jobs in the [Using Workspaces to Share Data between Jobs ]({{ site.baseurl }}/workspaces) page.
