---
layout: classic-docs
title: "ジョブとステップ"
description: "CircleCI ジョブとステップの説明"
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
    - Server v2.x
---

このドキュメントでは CircleCI のジョブとステップの概要について説明します。

## ジョブの概要
{: #jobs-overview }

CircleCI のジョブはステップの集まりです。 ジョブ内のステップは、すべて 1 単位として新しいコンテナまたは仮想マシン内で実行されます。 Jobs are orchestrated using [workflows](/docs/workflows/).

下の図はジョブ間のデータフローを表したものです。
* Workspaces persist data between jobs in a single workflow.
* Caching persists data between the same job in different workflows runs.
* Artifacts persist data after a workflow has finished.

![Jobs overview](/docs/assets/img/docs/jobs-overview.png)

The job names shown in this diagram are just examples. You can name your jobs whatever you want.
{: class="alert alert-info" }

Jobs can be run in Docker containers, using the Docker executor, or in virtual machines using the `machine` executor, with Linux, macOS, or Windows images. Secondary containers or VMs can be configured to attach services, such as databases, to run alongside your jobs.

When using the Docker executor, images listed under the `docker` key specify the containers you want to start for your job. Any public Docker images can be used with the Docker executor, but CircleCI provides convenience images for a variety of use-cases. Full lists of available convenience and VM images are available in the [CircleCI Developer Hub](https://circleci.com/developer/images).

See the [Introduction to Execution Environments](/docs/executor-intro/) document for a comparison of the different executor types, and links to further information for each option.

## ステップの概要
{: #steps-overview }

Steps are collections of executable commands, which are run during a job.

The `checkout` key is required under `steps` to checkout your code. The `run` key enables addition of arbitrary, multi-line shell command scripting.

In addition to the `run` key, keys for `save_cache`, `restore_cache`, `store_artifacts`, `store_test_results`, and `add_ssh_keys` are nested under Steps. For a full list of step options see the [Steps key](/docs/configuration-reference/#steps) section of the Configuration Reference.

## ジョブにパラメーターを渡す
{: #passing-parameters-to-jobs }

Using parameters allows you to run a single job multiple times for different scenarios, such as different package versions or execution environments. An extension of this functionality is [matrix jobs](/docs/configuration-reference/#matrix-requires-version-21). Below is a basic example of passing a parameter to a job when it is run.

```yml
version: 2.1
​
jobs:
  print-a-message:
    docker:
      - image: cimg/base:2022.03
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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

Orbs are packages or reusable configuration that you can use in your projects. Orbs usually contain commands that you can use in your jobs, as well as whole jobs that you can schedule in your workflows.

Take the [Slack orb](https://circleci.com/developer/orbs/orb/circleci/slack) as an example. This orb provides a job called [`on-hold`](https://circleci.com/developer/orbs/orb/circleci/slack#usage-on_hold_notification), which you can use in your workflows. This job pauses the workflow to require manual approval, and sends a slack notification. To use this job, reference it in your workflow (see line 10):

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

Using the [Slack orb](https://circleci.com/developer/orbs/orb/circleci/slack) as an example again, this orb includes a command called `notify`, which is used to notify a specified slack channel. You can reference this command in your job as follows (see line 16):

This example also uses the [Node orb](https://circleci.com/developer/orbs/orb/circleci/node).
{: class="alert alert-info" }

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

- Read more about orchestrating jobs in the [Using Workflows to Schedule Jobs ](/docs/workflows/) page.
- Read more about passing data between jobs in the [Using Workspaces to Share Data between Jobs ](/docs/workspaces/) page.
