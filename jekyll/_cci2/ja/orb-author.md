---
layout: classic-docs
title: "Orb のオーサリング プロセス"
short-title: "Orb のオーサリング"
description: "CircleCI Orbs のオーサリングに関する入門ガイド"
categories:
  - getting-started
order: 1
version:
  - Cloud
---

## はじめに

CircleCI Orb を使用するようにプラットフォームを構成したら、独自の Orb のオーサリングを開始できます。 CircleCI では、ユーザーの皆様が混乱することなく新しい Orb をすばやく作成できるよう、インライン テンプレートなどの事前構成済みテンプレートを提供することで、シンプルで簡単なオーサリング プロセスの実現を目指しています。 以下の各セクションでは、独自の Orb をオーサリングするプロセスを説明します。

## Orb クイックスタート

最初の Orb 作成を開始する前に、以下の注意事項をお読みください。

* Orb は名前空間に存在します。
* Each organization or username can claim one unique namespace, and **namespaces cannot be deleted.**
* 名前空間は CircleCI Orb レジストリ内でグローバルであるため、必ず一意の名前にしてください。
* 特定の GitHub または Bitbucket 組織内で、オーナーまたは管理者の権限を持つユーザーだけが、その組織にリンクされる名前空間を作成できます。
* 組織管理者が Orb を作成すると、その組織のメンバーはだれでも `dev` Orb としてパブリッシュできます。 準備が整ったら、組織管理者はその `dev` Orb を安定版 Orb にプロモートできます。
* 組織管理者によって生成された [API トークン]({{ site.baseurl }}/2.0/managing-api-tokens)をプロジェクト環境変数またはコンテキスト リソースとして保存すると、Orb パブリッシュ プロセスを自動化でき、_任意_の組織メンバーが CircleCI ジョブで [CircleCI CLI]({{ site.baseurl }}/2.0/local-cli/) を使用して安定版 Orb を公開することが可能になります。
* 作成した Orb を使用するには、組織の CircleCI 組織設定ページの [Security (セキュリティ)] セクション (`https://circleci.com/[vcs]/organizations/[org-name]/settings#security`) で、[Allow Uncertified Orbs (未承認 Orbs の使用を許可)] を有効にする必要があります。
* Orb 作成中は、作成中の Orb の準備が整う前に CircleCI Orb レジストリに公開される、または永続的に掲載されてしまう事態を回避するために、開発バージョンを使用することができます。

### The following high-level steps are needed to publish your first orb:

1) Claim a namespace (assuming you don't yet have one). For example:

`circleci namespace create sandbox github CircleCI-Public`

In this example we are creating the `sandbox` namespace, which will be linked to the GitHub organization `CircleCI-Public`.

**Note:** When creating a namespace via the CircleCI CLI, be sure to specify the VCS provider.

2) Create the orb inside your namespace. This doesn't generate any content, but rather reserves the naming for when the orb is published. For example:

`circleci orb create sandbox/hello-world`

3) Create the content of your orb in a file. You will generally do this in your code editor in a git repo made for your orb, but, for the sake of an example, let's assume a file in `/tmp/orb.yml` could be made with a bare-bones orb like:

`echo 'version: "2.1"\ndescription: "a sample orb"' > /tmp/orb.yml`

4) Validate that your code is a valid orb using the CLI. For example, using the path above you could use:

`circleci orb validate /tmp/orb.yml`

5) Publish a dev version of your orb. Assuming the above orb, it would look like this:

`circleci orb publish /tmp/orb.yml sandbox/hello-world@dev:first`

6) Once you are ready to push your orb to production, you can publish it manually using `circleci orb publish` or promote it directly from the dev version. In the case where you want to publish the orb, assuming you wanted to increment the new dev version to become 0.0.1, you can use:

`circleci orb publish promote sandbox/hello-world@dev:first patch`

7) Your orb is now published in an immutable form as a production version and can be used safely in builds. You can then pull the source of your orb using:

`circleci orb source sandbox/hello-world@0.0.1`

## Orbs の設計

When designing your own orbs, make sure your orbs meet the following requirements:

* Orbs は常に `description` を使用する - ジョブ、コマンド、Executors、およびパラメーターの `description` キーで、使用方法、前提、および技術を説明してください。
* コマンドを Executors に合わせる - コマンドを提供する場合は、それらを実行する Executors を 1 つ以上提供します。
* Orb には簡潔な名前を使用する - コマンドやジョブの使用は常に Orb のコンテキストに依存するため、ほとんどの場合 "run-tests" のような一般的な名前を使用できます。
* 必須パラメーターと オプション パラメーター - 可能な限り、パラメーターに安全なデフォルト値を指定してください。
* ジョブのみの Orbs を使用しない - ジョブのみの Orbs は柔軟性に欠けます。 While these orbs are sometimes appropriate, it can be frustrating for users to be unable to use the commands in their own jobs. ジョブを起動する前後のステップはユーザーにとって 1 つの回避策になります。
* `steps` パラメーターは強力 - ユーザーから提供されるステップをラップすることで、キャッシュ戦略やさらに複雑なタスクなどをカプセル化および容易化することができ、ユーザーに大きな価値をもたらします。

Refer to [Reusing Config]({{ site.baseurl }}/2.0/reusing-config/) for details and examples of commands, executors and parameters in orbs.

When developing your own orb, you may find it useful to write an inline orb. The section below describes how you can write your own inline orb.

### Writing Inline Orbs

Inline orbs can be handy during development of an orb or as a convenience for name-spacing jobs and commands in lengthy configurations, particularly if you later intend to share the orb with others.

To write inline orbs, place the orb elements under that orb's key in the `orbs` declaration in the configuration. For example, if you want to import one orb and then author inline for another, the orb might look like the example shown below:

{% raw %}
```yaml
version: 2.1
description: # The purpose of this orb

orbs:
  my-orb:
    orbs:
      codecov: circleci/codecov-clojure@0.0.4
    executors:
      specialthingsexecutor:
        docker:
          - image: circleci/ruby:2.7.0
            auth:
              username: mydockerhub-user
              password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    commands:
      dospecialthings:
        steps:
          - run: echo "We will now do special things"
    jobs:
      myjob:
        executor: specialthingsexecutor
        steps:
          - dospecialthings
          - codecov/upload:
              path: ~/tmp/results.xml

workflows:
  main:
    jobs:
      - my-orb/myjob
```
{% endraw %}

In the example above, note that the contents of `my-orb` are resolved as an inline orb because the contents of `my-orb` are a map; whereas the contents of `codecov` are a scalar value, and thus assumed to be an orb URI.

### Example Inline Template

When you want to author an orb, you may wish to use this example template to quickly and easily create a new orb with all of the required components. This example includes each of the three top-level concepts of orbs. While any orb can be equally expressed as an inline orb definition, it will generally be simpler to iterate on an inline orb and use `circleci config process .circleci/config.yml` to check whether your orb usage matches your expectation.

{% raw %}
```yaml
version: 2.1
description: This is an inline job

orbs:
  inline_example:
    jobs:
      my_inline_job:
        parameters:
          greeting_name:
            description: # a helpful description
            type: string
            default: olleh
        executor: my_inline_executor
        steps:
          - my_inline_command:
              greeting_name: <<parameters.greeting_name>>
    commands:
      my_inline_command:
        parameters:
          greeting_name:
            type: string
        steps:
          - run: echo "hello <<parameters.greeting_name>>, from the inline command"
    executors:
      my_inline_executor:
        parameters:
          version:
            type: string
            default: "2.4"
        docker:
          - image: circleci/ruby:<<parameters.version>>
            auth:
              username: mydockerhub-user
              password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference

workflows:
  build-test-deploy:
    jobs:
      - inline_example/my_inline_job:
          name: mybuild # best practice is to name each orb job
      - inline_example/my_inline_job:
          name: mybuild2
          greeting_name: world
```
{% endraw %}

### Describing your Orb

Before publishing your orb, it is recommended you add metadata to your orb to aid in the discoverability and documentation of your orb. We recommend adding a top-level `description` that informs users of the purpose of your orb and is indexed in search.

Under the `display` key,  add a link to the git repository via the `source_url`. If your orb relates to a specific product or service, you may optionally include a link to the homepage or documentation for said product or service via the `home_url` key.

``` YAML
version: 2.1
description: >
  Integrate Amazon AWS S3 with your CircleCI CI/CD pipeline easily with the aws-s3 orb.
display:
  home_url: https://aws.amazon.com/s3/
  source_url: https://github.com/CircleCI-Public/aws-s3-orb
```

The `description` and contents of the `display` key will be featured in the header of the orb's registry page.


## Orbs の使用例

_The `examples` stanza is available in configuration version 2.1 and later_

As an author of an orb, you may wish to document examples of using it in a CircleCI configuration file, not only to provide a starting point for new users, but also to demonstrate more complicated use cases.

When you have completed authoring an orb, and have published the orb, the orb will be published in the [Orb Registry](https://circleci.com/orbs/registry/). You will see your newly-created orb in the Orb Registry, which is shown below.

![Orbs Registry image]({{ site.baseurl }}/assets/img/docs/orbs-registry.png)

### Simple Examples
Below is an example orb you can use:

{% raw %}
```yaml
version: 2.1
description: A foo orb

commands:
  hello:
    description: Greet the user politely
    parameters:
      username:
        type: string
        description: A name of the user to greet
    steps:
      - run: "echo Hello << parameters.username >>"
```
{% endraw %}

If you would like, you may also supply an additional `examples` stanza in the orb like the example shown below:

{% raw %}
```yaml
version: 2.1

examples:
  simple_greeting:
    description: Greeting a user named Anna
    usage:
      version: 2.1
      orbs:
        foo: bar/foo@1.2.3
      jobs:
        build:
          machine: true
          steps:
            - foo/hello:
                username: "Anna"
```
{% endraw %}

Please note that `examples` can contain multiple keys at the same level as `simple_greeting`, allowing for multiple examples.

### Expected Usage Results

The above usage example can be optionally supplemented with a `result` key, demonstrating what the configuration will look like after expanding the orb with its parameters:

{% raw %}
```yaml
version: 2.1

examples:
  simple_greeting:
    description: Greeting a user named Anna
    usage:
      version: 2.1
      orbs:
        foo: bar/foo@1.2.3
      jobs:
        build:
          machine: true
          steps:
            - foo/hello:
                username: "Anna"
    result:
      version: 2.1
      jobs:
        build:
          machine: true
          steps:
          - run:
              command: echo Hello Anna
      workflows:
        version: 2
        workflow:
          jobs:
          - build
```
{% endraw %}

### Usage Examples Syntax
The top level `examples` key is optional. Usage example maps nested below it can have the following keys:

- **description:** 例の目的をユーザーにわかりやすく説明する文字列 (オプション)
- **usage:** Orb の使用例を含む有効な設定ファイルのマップ全体 (必須)
- **result:** 指定されたパラメーターで Orb を拡張した結果を具体的に示す有効な設定ファイルのマップ全体 (オプション)


## 次のステップ
{:.no_toc}

- 次に行うべき手順については、「[Orb のオーサリング – Orb のバリデーションとパブリッシュ]({{site.baseurl}}/2.0/orb-author-validate-publish/)」を参照してください。
