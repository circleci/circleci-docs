---
layout: classic-docs
title: "Orb オーサリングに関するよくあるご質問"
short-title: "Orb オーサリングに関するよくあるご質問"
description: "Orb オーサリングに関するよくあるご質問"
order: 20
version:
  - Cloud
---

よく寄せられるご質問や技術的な問題など、Orbs のオーサリングに役立つ情報をまとめました。

* 目次
{:toc}

## Errors Claiming Namespace or Publishing Orbs

* 質問: 名前空間を要求または安定版 Orb をパブリッシュしようとするとエラーが発生します。

* 回答: 組織オーナーまたは管理者でない可能性があります。

Organizations can only claim a single namespace. In order to claim a namespace for an organization the authenticating user must have owner/admin privileges within the organization.

If you do not have the required permission level you might see an error similar to below:

```
Error: Unable to find organization YOUR_ORG_NAME of vcs-type GITHUB: Must have member permission.: the organization 'YOUR_ORG_NAME' under 'GITHUB' VCS-type does not exist. Did you misspell the organization or VCS?
```

Read more in the [Orb CLI Permissions Matrix]({{site.baseurl}}/2.0/orb-author-intro/#permissions-matrix).

## API トークンの保護

* 質問: ユーザーの API トークンなどの機密情報を保護するにはどうしたらよいですか。

* Answer: Use the `env_var_name` parameter type for the API key parameter. This parameter type will only accept valid POSIX environment variable name strings as input. In the parameter description, it is best practice to mention to the user to add this environment variable.

詳細については、以下を参照してください。
* [環境変数名]({{site.baseurl}}/2.0/reusing-config/#環境変数名)
* [Orb のベスト プラクティス]({{site.baseurl}}/2.0/orbs-best-practices/)

## 環境変数

* Question: How can I require a user to add an environment variable?

* Answer: Create a parameter for the environment variable name, even if it is a statically named environment variable the user _should not_ change. Then, assign it the correct default value. In the parameter description let the user know if this value should not be changed. Either way, consider instructing the user on how they can obtain their API key.

必須の環境変数はバリデーションすることをお勧めします。 See more in the [Orb Author Best Practices]({{site.baseurl}}/2.0/orbs-best-practices/#commands) guide.

詳細については、以下を参照してください。
* [環境変数名パラメーター型]({{site.baseurl}}/2.0/reusing-config/#環境変数名)
* [Orb のベスト プラクティス]({{site.baseurl}}/2.0/orbs-best-practices/)

## サポートされているプログラミング言語

* Question: What language do I use to write an orb?

* Answer: Orbs are packages of [CircleCI YAML configuration]({{site.baseurl}}/2.0/configuration-reference/).

CircleCI orbs package [CircleCI reusable config]({{site.baseurl}}/2.0/reusing-config/), such as [commands]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-commands), which can execute within a given [executor]({{site.baseurl}}/2.0/executor-intro/) defined by either, the user if using a _command_ within a custom job, or by the orb author if using a [reusable job]({{site.baseurl}}/2.0/orb-concepts/#jobs). ロジックが実行される環境に応じて、使用する言語を決定してください。

* Question: What programming languages can I write my Command logic in?

* Answer: POSIX compliant bash is the most portable and universal language. This is the recommended option when you intend to share your orb. Orbs do, however, come with the flexibility and freedom to run other programming languages or tools.

**Bash**

Bash は、すべての Executor において最もよく使用されているため、お勧めの言語です。 Bash can (and should) be easily written directly using the native [run]({{site.baseurl}}/2.0/configuration-reference/#run) command. The default shell on MacOS and Linux will be bash.

**Interactive Interpreter (or example, Python)**

For some use-cases an orb might only exist in a particular environment. たとえば、Orb が一般的な Python ユーティリティとして使用される場合は、Python を Orb の依存関係として要求した方が合理的です。 Consider utilizing the [run]({{site.baseurl}}/2.0/configuration-reference/#run) command with a modified shell parameter.

```yaml
steps:
  - run:
    shell: /usr/bin/python3
    command: |
      place = "World"
      print("Hello " + place + "!")
```

**バイナリ**

This option is strongly discouraged wherever possible. 時に、CLI ツールなどのリモート バイナリ ファイルをフェッチしなければならない場合があります。 These binaries should be fetched from a package manager or hosted by a VCS such as GitHub releases wherever possible. For example, installing Homebrew as a part of the [AWS Serverless orb](https://circleci.com/orbs/registry/orb/circleci/aws-serverless#commands-install)

```yaml
steps:
  - run:
    command: >
      curl -fsSL
      "https://raw.githubusercontent.com/Linuxbrew/install/master/install.sh" | bash
      /home/linuxbrew/.linuxbrew/bin/brew shellenv >> $BASH_ENV
    name: Install Homebrew (for Linux)
```

## Command vs Job

* Question: Should I create a command or a job?

* Answer: The answer might be both, but it will heavily depend on the task you want to accomplish.

An orb [command]({{site.baseurl}}/2.0/orb-concepts/#commands) can be utilized by the user, or even the orb developer, to perform some action within a job. The command itself has no knowledge of the job it is within as the user could utilize it however they wish. A command may be useful, for example, to automatically install a CLI application or go a step further and install and authenticate.

A [job]({{site.baseurl}}/2.0/orb-concepts/#jobs) defines a collection of steps and commands within a specific execution environment. A job is highly opinionated as it generally chooses the execution platform to run on and what steps to run. Jobs may offer a useful way to automate tasks such as deployments. A deployment job may select a certain execution platform that is known, such as _python_, and automatically checkout the users code, install a CLI, and run a deployment command, all with little to no additional configuration required from the user.

Read more:
* [Introduction To CircleCI Config Language]({{site.baseurl}}/2.0/config-intro/)
* [Reusable Config Reference]({{site.baseurl}}/2.0/reusing-config/)


## See Also
- Refer to [Orbs Best Practices]({{site.baseurl}}/2.0/orbs-best-practices) for suggestions on creating a production-ready orb.
- Refer to [Orbs Concepts]({{site.baseurl}}/2.0/orb-concepts/) for high-level information about CircleCI orbs.
- Refer to [Orb Publishing Process]({{site.baseurl}}/2.0/creating-orbs/) for information about orbs that you may use in your workflows and jobs.
- Refer to [Orbs Reference]({{site.baseurl}}/2.0/reusing-config/) for examples of reusable orbs, commands, parameters, and executors.
- Refer to [Orb Testing Methodologies]({{site.baseurl}}/2.0/testing-orbs/) for information on how to test orbs you have created.
- Refer to [Configuration Cookbook]({{site.baseurl}}/2.0/configuration-cookbook/) for more detailed information about how you can use CircleCI orb recipes in your configurations.
