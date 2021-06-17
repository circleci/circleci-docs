---
layout: classic-docs
title: "CircleCI CLI 入門"
short-title: "CircleCI CLI 入門"
description: "コマンド ラインから CircleCI を操作する方法の基礎"
categories:
  - getting-started
order: 50
version:
  - Cloud
  - Server v2.x
---

# 概要
{: #overview }

For those who prefer to spend most of their development time in the terminal, consider installing the [CircleCI CLI](https://github.com/CircleCI-Public/circleci-cli) to interact with your projects on CircleCI. This document provides a step-by-step guide on intializing and working with a CircleCI project primarily from within the terminal. Please note that our server offering only supports a legacy version of the CLI. You can find more information on how to install that here: https://circleci.com/docs/2.0/local-cli/#using-the-cli-on-circleci-server.

# 前提条件
{: #prerequisites }

- Unix マシン (Mac または Linux) を使用している。Windows にも CircleCI CLI ツールのインストールは_可能_ですが、現在はベータ版であり、Unix 版ほどの機能は完備されていません。
- CI/CD、CircleCI サービスの機能とコンセプトについての基礎知識がある。
- GitHub アカウントを持っている。
- CircleCI アカウントを持っている。
- ターミナルを開いており、使用可能である。
- オプション: Github の [`Hub`](https://hub.github.com/) コマンドライン ツールがインストールされている (Web UI ではなくコマンド ラインから Github を使用できます)。 Hub のインストール方法については、[こちら](https://github.com/github/hub#installation)を参照してください。

If some of these prerequisites sound unfamiliar, or you are new to the CircleCI platform, you may want to consider reading our [getting started]({{site.baseurl}}/2.0/getting-started/) guide or reading our [concepts document](https://circleci.com/docs/2.0/concepts/#section=getting-started) before proceeding.

# 手順
{: #steps }

## Initialize a git repo
{: #initialize-a-git-repo }

Let's start from the very basics: create a project and initialize a git repository. Refer to the below code block for a list of steps.

```sh
cd ~ # ホーム ディレクトリに移動します
mkdir foo_ci # "foo_ci" という名前のフォルダーにプロジェクトを作成します
cd foo_ci # 新しい foo_ci フォルダーにディレクトリを変更します
git init # create a git repository
touch README.md # Create a file to put in your repository
echo 'Hello World!' >> README.md
git add . # コミットするすべてのファイルをステージングします
git commit -m "Initial commit" # 最初のコミットを実行します
```

## Connect your git repo to a VCS
{: #connect-your-git-repo-to-a-vcs }

Great! We have a git repository set up, with one file that says "Hello World!". We need to connect our local git repository to a Version Control System - either GitHub or BitBucket. Let's do that now.

If you have installed and setup the Hub CLI, you can simply run:

```sh
hub create
```

Then follow any prompts regarding logins / authorizing the HUB CLI.

If you aren't using Hub, head over to GitHub, login, and [create a new respository](https://github.com/new). Follow the instructions to commit and push to the remote. These instructions generally looks like this:

```sh
git remote add origin git@github.com:<YOUR_USERNAME>/foo_ci.git
git push --set-upstream origin master
```

You now have a git repo that is connected to a VCS. The remote on your VCS ("origin") now matches your local work.

## Download and set up the CircleCI CLI
{: #download-and-set-up-the-circleci-cli }

Next, we will install the CircleCI CLI and try out some of its features. To install the CLI on a unix machine run the following command in your terminal:

```sh
curl -fLSs https://circle.ci/cli | bash
```

There are multiple installation methods for the CLI, you can read more about them [here]({{site.baseurl}}/2.0/local-cli) if you need to use an alternative method.

Now run the setup step after the installation:

```sh
circleci setup
```

You'll be asked for your API token. Go to the [Account Settings](https://circleci.com/account/api) page and click `Create a New Token`. Name your token and copy the resulting token string and keep it somewhere safe!

Return to the CLI and paste in your API token to complete your setup.

## Setup and validate our first config
{: #setup-and-validate-our-first-config }

Now it's time to create a configuration file in our project directory.

```sh
cd ~/foo_ci # カレント ディレクトリが foo_ci フォルダーであることを確認します
mkdir .circleci # ".circleci" という名前のディレクトリを作成します
cd .circleci # カレント ディレクトリを新しいディレクトリに変更します
touch config.yml # "config.yml" という名前の YAML ファイルを作成します
```

The above commands create a `.circleci` folder where we will store our config file.

Open the newly created `config.yml` file and paste the following contents into it.

```yaml
version: 2.0
jobs:
  build:
    docker:
      - image: circleci/ruby:2.4.2-jessie-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: echo "Hello World"
```

Now let's validate your config to ensure it's useable. In the root of your project, run the following command:

```sh
circleci config validate
```

**NOTE**: if at any time you want to learn more about a command you are using you can append `--help` to receive additional information in the terminal about the command:

```sh
circleci config validate --help
```

## Testing a job before pushing to a VCS
{: #testing-a-job-before-pushing-to-a-vcs }

The CircleCI CLI enables you to test a job locally from the command line rather than having to push to your VCS. If a job in your configuration is proving problematic, this is a great way to try and debug it locally rather than using credits or minutes on the platform.

Try running the "build" job locally:

```sh
circleci local execute
```

This will pull down the docker image you have specified, in this case `circleci/ruby::2.4.2-jessie-node` and run the job. This may take a bit of time depending on the size of the docker image you are using.

You should see quite a bit of a text in your terminal. The last few lines of output should look similar to this:

```sh
====>> Checkout code
  #!/bin/bash -eo pipefail
mkdir -p /home/circleci/project && cp -r /tmp/_circleci_local_build_repo/. /home/circleci/project
====>> echo "Hello World"
  #!/bin/bash -eo pipefail
echo "Hello World"
Hello World
Success!
```

## Connect your repo to CircleCI
{: #connect-your-repo-to-circleci }

We will need to leave the terminal behind for this step. Head over to [the "Add Projects page"](https://app.circleci.com/projects/project-dashboard/github/circleci/). It's time to set up your project to run CI whenever you push code.

Find your project ("foo_ci", or whatever you named it on GitHub) in the list of projects and click "Set Up Project". Next, return to your terminal and push your latest changes to GitHub (the addition of our `config.yml` file.)

```sh
git add .
git commit -m "add config.yml file"
git push
```

Returning to CircleCI in your browser, you can now click "start building" to run your build.

# Next steps
{: #next-steps }

This document provides a small overview to getting started with the CircleCI CLI tool. There are several more complex features that the CircleCI CLI offers:

- [Orbs](https://circleci.com/ja/orbs/) の作成、表示、バリデーション、パブリッシュ
- CircleCI GraphQL API のクエリ
- 複雑な設定ファイルのパッケージ化と処理

Consider reading our [document covering]({{site.baseurl}}/2.0/local-cli) the CLI for more details.
