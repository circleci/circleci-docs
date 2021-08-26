---
layout: classic-docs
title: "Orb オーサリングに関するよくあるご質問"
short-title: "Orb オーサリングに関するよくあるご質問"
description: "Orb オーサリングに関してよく寄せられるご質問。"
order: 20
version:
  - Cloud
---

よく寄せられるご質問や技術的な問題など、Orb のオーサリングに役立つ情報をまとめました。

* 目次
{:toc}

## 名前空間を要求または Otb をパブリッシュしようとするとエラー
{: #errors-claiming-namespace-or-publishing-orbs }

* 質問: 名前空間を要求または安定版 Orb をパブリッシュしようとするとエラーが発生します。

* 回答: お客様は組織オーナーまたは管理者でない可能性があります。

組織が要求できる名前空間は 1 つだけです。 組織の名前空間を要求するには、認証中のユーザーがその組織内でオーナーまたは管理者の権限を持っている必要があります。

必要な権限レベルがない場合、下記のようなエラーが表示されることがあります。

```
Error: Unable to find organization YOUR_ORG_NAME of vcs-type GITHUB: Must have member permission.: the organization 'YOUR_ORG_NAME' under 'GITHUB' VCS-type does not exist. Did you misspell the organization or VCS?
```

詳細については、[Orb CLI の権限の一覧表]({{site.baseurl}}/2.0/orb-author-intro/#permissions-matrix)を参照してください。

## Orb の削除
{: #deleting-orbs }

* 作成した Orb を削除できますか？

* 回答: 削除できません。 Orb はデフォルトで公開されており、１つのバージョンの Orb をパブリッシュした後、変更することはできません。 これにより、ユーザーは既知のバージョンの Orb がすべての実行において当然同じ動作をすると想定することができます。 Orb を削除すると、ユーザーのプロジェクトにおけるパイプラインの失敗につながる恐れがあります。

ただし、Orb を[ Orb レジストリ](https://circleci.com/developer/orbs)から除外することは可能です。 リストから除外した Orb は、 API または CLI から見つけられますが、Orb レジストリの検索結果には表示されません。 これは、例えば、現在はメンテナンスを行っていない Orb などに適しています。

```
circleci orb unlist myOrb/myNamespace
```

## API トークンの保護
{: #secure-api-tokens }

* 質問: ユーザーの API トークンなどの機密情報を保護するにはどうしたらよいですか。

* 回答: API キーのパラメーターとして `env_var_name` パラメーター型を使用してください。 このパラメーター型は、有効な POSIX 環境変数名の文字列のみを入力値として受け入れます。 パラメーターの説明で、この環境変数を追加するようにユーザーに指示してください。

詳細はこちら:
* [環境変数名]({{site.baseurl}}/2.0/reusing-config/#environment-variable-name)
* [ベスト プラクティス]({{site.baseurl}}/2.0/orbs-best-practices/)

## 環境変数
{: #environment-variables }

* 質問: ユーザーに環境変数の追加を求めるにはどうしたらよいですか。

* 回答: 環境変数名のパラメーターを作成してください。_変更できない_静的な名前を持つ環境変数でも同じように対応します。 そして、そのパラメーターに正しいデフォルト値を割り当てます。 変更できない環境変数の場合は、その旨をパラメーターの説明に記載します。 また、変更できる環境変数かどうかを問わず、API キーの取得方法をユーザーに示してください。

必須の環境変数はバリデーションすることをお勧めします。 詳細については、[Orb のオーサリングのベスト プラクティス]({{site.baseurl}}/2.0/orbs-best-practices/#commands)」を参照してください。

詳細はこちら:
* [環境変数名パラメーター型]({{site.baseurl}}/2.0/reusing-config/#environment-variable-name)
* [ベスト プラクティス]({{site.baseurl}}/2.0/orbs-best-practices/)

## サポートされているプログラミング言語
{: #supported-programming-languages }

* 質問: Orb の記述にはどの言語を使用できますか。

* 回答: Orb は [CircleCI YAML 設定ファイル]({{site.baseurl}}/2.0/configuration-reference/)をパッケージ化したものです。

CircleCI Orbs では、再利用可能な CircleCI 設定ファイル</a>をパッケージ化しています。例えば、[コマンド]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-commands)は特定の [Executor]({{site.baseurl}}/2.0/executor-intro/) 内で実行できますが、その Executor は、カスタムジョブで_コマンド_を使用する場合はユーザー、[再利用可能なジョブ]({{site.baseurl}}/2.0/orb-concepts/#%E3%82%B8%E3%83%A7%E3%83%96)を使用する場合は Orb オーサーによって定義されます。 ロジックが実行される環境に応じて、使用する言語を決定してください。

* 質問: コマンド ロジックの記述にはどのプログラミング言語を使用できますか。

* 回答: 移植性と汎用性に最も優れているのは、POSIX 準拠の bash です。 Orb を共有する予定であれば、この言語を使用することをお勧めします。 ただし、Orb は高い柔軟性を誇り、他のプログラミング言語やツールも自由に実行できます。

**Bash**

bash は、すべての Executor において最もよく使用されているため、お勧めの言語です。 Bash can (and should) be easily written directly using the native [run]({{site.baseurl}}/2.0/configuration-reference/#run) command. The default shell on MacOS and Linux will be bash.

**Interactive Interpreter (or example, Python)**

For some use-cases an orb might only exist in a particular environment. For instance, if your orb is for a popular Python utility it may be reasonable to require Python as a dependency of your orb. Consider utilizing the [run]({{site.baseurl}}/2.0/configuration-reference/#run) command with a modified shell parameter.

```yaml
steps:
  - run:
    shell: /usr/bin/python3
    command: |
      place = "World"
      print("Hello " + place + "!")
```

**Binary**

This option is strongly discouraged wherever possible. Sometimes it may be necessary to fetch a remote binary file such as a CLI tool. These binaries should be fetched from a package manager or hosted by a VCS such as GitHub releases wherever possible. For example, installing Homebrew as a part of the [AWS Serverless orb](https://circleci.com/developer/orbs/orb/circleci/aws-serverless#commands-install)

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
{: #command-vs-job }

* Question: Should I create a command or a job?

* Answer: The answer might be both, but it will heavily depend on the task you want to accomplish.

An orb [command]({{site.baseurl}}/2.0/orb-concepts/#commands) can be utilized by the user, or even the orb developer, to perform some action within a job. The command itself has no knowledge of the job it is within as the user could utilize it however they wish. A command may be useful, for example, to automatically install a CLI application or go a step further and install and authenticate.

A [job]({{site.baseurl}}/2.0/orb-concepts/#jobs) defines a collection of steps and commands within a specific execution environment. A job is highly opinionated as it generally chooses the execution platform to run on and what steps to run. Jobs may offer a useful way to automate tasks such as deployments. A deployment job may select a certain execution platform that is known, such as _python_, and automatically checkout the users code, install a CLI, and run a deployment command, all with little to no additional configuration required from the user.

Read more:
* [Introduction To CircleCI Config Language]({{site.baseurl}}/2.0/config-intro/)
* [Reusable Config Reference]({{site.baseurl}}/2.0/reusing-config/)


## See also
{: #see-also }
- Refer to [Orbs Best Practices]({{site.baseurl}}/2.0/orbs-best-practices) for suggestions on creating a production-ready orb.
- Refer to [Orbs Concepts]({{site.baseurl}}/2.0/orb-concepts/) for high-level information about CircleCI orbs.
- Refer to [Orb Publishing Process]({{site.baseurl}}/2.0/creating-orbs/) for information about orbs that you may use in your workflows and jobs.
- Refer to [Orbs Reference]({{site.baseurl}}/2.0/reusing-config/) for examples of reusable orbs, commands, parameters, and executors.
- Refer to [Orb Testing Methodologies]({{site.baseurl}}/2.0/testing-orbs/) for information on how to test orbs you have created.
- Refer to [Configuration Cookbook]({{site.baseurl}}/2.0/configuration-cookbook/) for more detailed information about how you can use CircleCI orb recipes in your configurations.
