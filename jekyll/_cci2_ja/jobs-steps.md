---
layout: classic-docs
title: "ジョブとステップ"
description: "CircleCI ジョブとステップの説明."
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

このドキュメントでは CircleCI ジョブとステップの概要について説明します。

* 目次
{:toc}

## ジョブの概要
{: #jobs-overview }

CircleCI ジョブはステップの集まりです。 ジョブ内のステップは、すべて 1 単位として新しいコンテナまたは仮想マシン内で実行されます。 ジョブは [ワークフロー]({{ site.baseurl }}/2.0/workflows/)を使ってオーケストレーションされます。

下図はジョブ間のデータフローを表したものです。
* ワークスペースは、同じワークフロー内のジョブ間でデータを維持します。
* キャッシュは、異なるワークフローの実行における同じジョブ間でデータを永続化します。
* アーティファクトは、ワークフローの終了後にデータを永続化します。

![ジョブの概要]( {{ site.baseurl }}/assets/img/docs/jobs-overview.png)

**注**: 図に示されているジョブ名はただの例です。お好きな名前をつけていただけます。

ジョブは、Docker Executor を使って Docker コンテナで、または `machine` Executor を使って仮想マシンで、Linux、macOS、または Windows を使用して実行できます。 セカンダリコンテナや VM は、データベースなどのサービスをアタッチしてジョブと一緒に実行するように設定することができます。

Docker Executor を使用する場合、`docker` キーの下に記載されるイメージがジョブで開始するコンテナを指定します。 Any public Docker images can be used with the Docker executor, but CircleCI provides convenience images for a variety of use-cases. Full lists of available convenience and VM images are available in the [CircleCI Developer Hub](https://circleci.com/developer/images).

`docker` Executor と `machine` Executor の用途と違いについては、[コンテナ イメージの指定に関するドキュメント]({{ site.baseurl }}/ja/2.0/executor-types/)を参照してください。

## ステップの概要
{: #steps-overview }

Steps are collections of executable commands, which are run during a job. The `checkout:` key is required under `steps` to checkout your code and the `run:` key enables addition of arbitrary, multi-line shell command scripting.  In addition to the `run:` key, keys for `save_cache:`, `restore_cache:`, `store_artifacts:`, `store_test_results:`, and `add_ssh_keys` are nested under Steps. For a full list of step options see the [Configuration Reference Steps Key]({{ site.baseurl }}/2.0/configuration-reference/#steps).

## Passing parameters to jobs
{: #passing-parameters-to-jobs }

Using parameters allows you to run a single job multiple times for different scenarios, such as different package versions or execution environments. An extension of this functionality is [matrix jobs]({{site.baseurl}}/2.0/configuration-reference/#matrix-requires-version-21). Below is a basic example of passing a parameter to a job when it is run.

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

## Using a job from an orb
{: #using-a-job-from-an-orb }

Orbs are packages or reusable configuration that you can use in your projects. Orbs usually contain commands that you can use in your jobs, and whole jobs that you can schedule in your workflows. Take the [Slack orb](https://circleci.com/developer/orbs/orb/circleci/slack) as an example. This orb provides a job called [`on-hold`](https://circleci.com/developer/orbs/orb/circleci/slack#usage-on_hold_notification), which you can use in your workflows. This job pauses the workflow to require manual approval, and sends a slack notification. To use this job, just reference it in your workflow (see line 10):

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

## Using a command from an orb in a job
{: #using-a-command-from-an-orb-in-a-job }

Using the [Slack orb](https://circleci.com/developer/orbs/orb/circleci/slack) as an example again, this orb includes a command called `notify`, which is used to notify a specified slack channel. You can reference this command in your job as follows (see line 16):

**Note**: This example also uses the [node orb](https://circleci.com/developer/orbs/orb/circleci/node).

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

- Read more about orchestrating jobs in the [Using Workflows to Schedule Jobs ]({{ site.baseurl }}/2.0/workflows) page.
- Read more about passing data between jobs in the [Using Workspaces to Share Data between Jobs ]({{ site.baseurl }}/2.0/workspaces) page.
