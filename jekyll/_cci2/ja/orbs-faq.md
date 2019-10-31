---
layout: classic-docs
title: "Orbs FAQ"
short-title: "Orbs FAQ"
description: "Orbs に関するよくあるご質問"
categories:
  - configuring-jobs
order: 20
---

This document describes various questions and technical issues that you may find helpful when working with orbs.

- 目次
{:toc}

## Downloading, Integrating, and Testing Orbs
{:.no_toc}

- 質問：Orbs をダウンロード、統合、テストする方法を教えてください。

- Answer: You can import orbs using the `orbs` stanza in version 2.1 or higher of a CircleCI configuration. For example, if you want to publish an orb called `hello-build` in the namespace `circleci` and have a published version `0.0.1`, import an orb like the example shown below:

    orbs:
         hello: circleci/hello-build@0.0.1
    

You may then invoke elements of the orb in your configuration by referencing elements under the key `hello`. たとえば、Orb に `hello-build` というジョブが含まれている場合、以下の例のようにワークフローでそのジョブを呼び出すことができます。

    workflows:
      info:
        jobs:
          - hello/hello-build
    

CircleCI では Web ベースのレジストリビューアがパブリッシュされているため、Orbs に関するドキュメントを自動的に生成できます。 You can always pull the source of orbs directly as well. たとえば、`circleci orb source circleci/hello-build@0.01` を実行できます。

## Build Error When Testing Locally

- 質問：ローカルでのテストで以下のエラーが表示されるのはなぜですか？

    circleci build -c .circleci/jobs.yml --job test
    

    Error:
    You attempted to run a local build with version 2.1 of configuration.
    

- 回答：このエラーを解決するには、設定で `circleci config process` を実行し、その設定をディスクに保存します。 次に、処理された設定に対して `circleci local execute` を実行します。

## Rerun Error

- 質問：同じワークフローを再実行すると以下のエラーが表示されるのはなぜですか？

    only certified orbs are permitted in this project.
    

- 回答：スペースを挿入してから削除するなど、何らかの変更を加えてください。 変更が発生しない限り、設定は再コンパイルされません。 設定の処理が行われてから、コンパイルされたコードがワークフローコンダクターに渡されます。 このため、リビルドをトリガーしたワークフローコンダクターには、元の 2.1 コンフィグに関する情報は伝わっていません。

## Environment Variables Not Being Passed at Runtime

設定を 2.0 互換の形式に変換しようとすると、実行時に環境変数が渡されないことがあります。 たとえば、GitHub リポジトリ (`https://github.com/yourusername/circle-auto/blob/master/.circleci/echo.yml` など) でシンプルな設定を作成した場合は、以下のように指定してコンフィグを呼び出します。

    export AUTO_FILE=/Users/yourusername/Desktop/apkpure_app_887.apk
    export AUTO_DIR=.
    circleci build -c .circleci/echo.yml --job test
    

The config shows:

```yaml
version: 2.1
jobs:
  build:
    docker:
    - image: circleci/openjdk:8-jdk
    steps:
    - checkout
  test:
    docker:
    - image: circleci/openjdk:8-jdk
    environment:
    - TERM: dumb
    steps:
    - checkout
    - run:
        command: "echo file ${AUTO_FILE} dir ${AUTO_DIR}"
workflows:
  version: 2
  workflow:
    jobs:
    - build
    - test
```

実行時には、以下の応答が表示されます。

    #!bin/bash -eo pipefail
    echo file $(AUTO_FILE) dir $(AUTO_DIR)
    file directlySuccess!
    

## Logging Outputs

- Question: Is there a standard way to log output? For example, Jenkins plugins provide console links to show the log output and provide hooks to log those messages. It is possible to log `stdout`, but is there a better way to log those log messages?

- 回答：CircleCI では、実行されたステップはすべてログに記録されるため、ステップからの出力はコンソールに表示されます。 SSH を使用し、`echo` によって直接出力することができます。 CircleCI には、コンソールへの出力以外にログ機能はありません。

## Failing Builds

- 質問：Orb を呼び出すジョブを Orb 内部から意図的に失敗させるには、どうしたらよいですか？

- 回答：シェルから 0 以外のステータスコードを返すことで、ジョブをいつでも失敗させることができます。 また、`run: circleci-agent step halt` をステップとして使用して、ジョブを失敗させずに終了することも可能です。

## Private Installation of CircleCI When Using Orbs

- 質問：Orbs で作業する際に CircleCI Server のプライベート環境を使用できますか？

- 回答：いいえ。 CircleCI Server does not currently support the use of orbs.

## Using Orb Elements For Other Orbs

- 質問：Orb を独自に作成する際に、別の Orb のエレメントを使用することはできますか?

- 回答：はい。他の Orbs のエレメントを直接使用して Orbs を構成できます。 たとえば、以下のようになります。

```yaml
  version: 2.1
  orbs:
    some-orb: some-ns/some-orb@volatile
  executors:
    my-executor: some-orb/their-executor
  commands:
    my-command: some-orb/their-command
  jobs:
    my-job: some-orb/their-job
    another-job:
      executor: my-executor
      steps:
        - my-command:
            param1: "hello"
  ```

## Using 3rd Party Orbs

* Question: Why do I receive an error message when trying to use a 3rd party orb?

* Answer: When using a 3rd party orb, you must first opt-in to using 3rd party orbs. If you use a 3rd party orb before opting in, you will receive the following error message:

```

"Orb {orb@version} not loaded. To use this orb, an organization admin must opt-in to using third party orbs in Organization Security settings." ```

Users are blocked from using orbs from the registry until they have turned on the ability to use orbs for their organization and accepted the [Code Sharing Terms of Service](https://circleci.com/legal/code-sharing-terms/). CircleCI requires organizations to do so, since by using orbs, an organization is asking CircleCI to inject configuration into its build that was authored by a 3rd party.

To resolve this issue, go to "Settings -> Security -> Allow uncertified orbs" and enable this setting.

![Enable 3rd Party Orbs]({{ site.baseurl }}/assets/img/docs/third-party-orbs.png)

**メモ：**承認済み Orbs (CircleCI によるレビューと承認を経てパブリッシュされた Orbs) を使用する場合、この設定は必要ありません。 サードパーティによってオーサリングされた Orbs の認証プログラムはまだ提供されていませんが、近いうちに整備される予定です。

## See Also

- Refer to [Orbs Concepts]({{site.baseurl}}/2.0/using-orbs/) for high-level information about CircleCI orbs.
- Refer to [Orb Publishing Process]({{site.baseurl}}/2.0/creating-orbs/) for information about orbs that you may use in your workflows and jobs.
- Refer to [Orbs Reference]({{site.baseurl}}/2.0/reusing-config/) for examples of reusable orbs, commands, parameters, and executors.
- Refer to [Orb Testing Methodologies]({{site.baseurl}}/2.0/testing-orbs/) for information on how to test orbs you have created.
- Refer to [Configuration Cookbook]({{site.baseurl}}/2.0/configuration-cookbook/#configuration-recipes) for more detailed information about how you can use CircleCI orb recipes in your configurations.