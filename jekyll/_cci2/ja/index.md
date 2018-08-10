---
layout: classic-docs
title: "CircleCI 2.0 マニュアル"
description: "CircleCI 2.0 マニュアル トップページ"
permalink: /2.0/
---
CircleCI 2.0 をご利用いただきありがとうございます。このマニュアルはチュートリアル、サンプルコード、機能説明を含む以下の 2 つのセクションから構成されています。

* **デベロッパー向け：**CircleCI で管理している開発中アプリケーションのビルド、テスト、デプロイを自動化する YML ファイルの作成方法
* **サーバー管理者向け：**オンプレミスやプライベートクラウドの環境で CircleCI を稼働させる際のインストールとメンテナンスの方法

このページでは、導入直後のファーストステップとなるビルドの手順について説明しています。

<div class="video-wrapper">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/KhjwnTD4oec" frameborder="0" allowfullscreen></iframe>
</div>

## ビルドにあたっての前提条件

* Git に関する基礎的な知識があり、GitHub のアカウントを所有している、もしくはアカウントを作成する権限があること。ここでは GitHub の新しいリポジトリを使用した手順を説明しますが、実際には Bitbucket も利用できます。
* `bash` をはじめとするターミナル、シェルの基礎的な知識があること。コマンドライン操作に慣れていると理解がスムーズです。 

## リポジトリの作成

1. GitHub.com にログインし、下記の通り操作します
  
  * **New repositories** ボタンをクリックするか、<https://github.com/new>{:target="_blank"} に直接アクセスします ![]({{ site.baseurl }}/assets/img/docs/GH_Repo-New-Banner.png)

2. 「Initialize this repository with a README」にチェックを入れて、**Create repository** ボタンをクリックします![]({{ site.baseurl }}/assets/img/docs/create-repo-circle-101-initialise-readme.png)

## .YML ファイルの追加

CircleCI は、テスト環境の構築方法や実行するテスト内容の定義に [YAML](https://en.wikipedia.org/wiki/YAML) ファイルを使います。 CircleCI 2.0 では、`config.yml` というファイル名で、隠しフォルダである `.circleci` ディレクトリ配下に作成しておく必要があります。 macOS、Linux、Windows においては、ピリオドから始まるファイルやフォルダは、デフォルトで隠し属性のある*システム*ファイルとして扱われます。

1. GitHub でファイルやフォルダを作成するには、リポジトリページの **Create new file** ボタンをクリックし、`.circleci/config.yml` と入力します。 すると、空の `config.yml` ファイルが `.circleci` フォルダ内に作成されます。

2. To start out with a simple `config.yml`, copy the text below into the file editing window on GitHub:

```yaml
version: 2
jobs:
  build:
    docker: # See https://docs.docker.com/get-started/#docker-concepts if you are new to Docker.
      - image: circleci/ruby:2.4.1-jessie
    steps:
      - checkout
      - run: echo "A first hello"
```

1. Commit the file by entering comments and clicking the Commit New File button. ![]({{ site.baseurl }}/assets/img/docs/commit-new-file.png)

The `- image: circleci/ruby:2.4.1-jessie` text tells CircleCI what Docker image to use when it builds your project. CircleCI will use the image to boot up a *container* — a virtual computing environment where it will install any languages, system utilities, dependencies, web browsers, and tools, that your project might need to run.

## Setting up Your Build on CircleCI

1. For this step, you will need a CircleCI account. Visit the CircleCI [signup page](https://circleci.com/signup) and click "Start with GitHub". You will need to give CircleCI access to your GitHub account to run your builds. If you already have a CircleCI account then you can navigate to your [dashboard](https://circleci.com/dashboard){:rel="nofollow"}.

2. Next, you will be given the option of *following* any projects you have access to that are already building on CircleCI (this would typically apply to developers connected to a company or organization's GitHub account). On the next screen, you'll be able to add the repo you just created as a new project on CircleCI.

3. To add your new repo, ensure that your GitHub account is selected in the dropdown in the upper-left, find the repository you just created below, and click the **Setup project** button next to it. ![]({{ site.baseurl }}/assets/img/docs/CircleCI-add-new-project-list.png)

4. On the next screen, you're given some options for configuring your project on CircleCI. Leave everything as-is for now and just click the **Start building** button a bit down the page on the right. ![]({{ site.baseurl }}/assets/img/docs/CircleCI-2.0-setup-project-circle101.png) ![]({{ site.baseurl }}/assets/img/docs/CircleCI-2.0-start-building.png)

## Running Your First CircleCI Build!

You should see your build start to run automatically—and pass! So, what just happened? Click on the green Success button on the CircleCI dashboard to investigate the following parts of the run:

1. **Spin up environment:** CircleCI used the `circleci/ruby:2.4.1-jessie` Docker image to launch a virtual computing environment.

2. **Checkout code:** CircleCI checked out your GitHub repository and "cloned" it into the virtual environment launched in Step 1.

3. **echo:** This was the only other instruction in your `config.yml` file: CircleCI ran the echo command with the input "A first hello" ([echo](https://linux.die.net/man/1/echo), does exactly what you'd think it would do).

Even though there was no actual source code in your repo, and no actual tests configured in your `config.yml`, CircleCI considers your build to have "succeeded" because all steps completed successfully (returned an [exit code](https://en.wikipedia.org/wiki/Exit_status) of 0). Most projects are far more complicated, oftentimes with multiple Docker images and multiple steps, including a large number of tests. You can learn more about all the possible steps one may put in a `config.yml` file in the [Configuring CircleCI](https://circleci.com/docs/2.0/configuration-reference) document.

## Breaking Your Build!

Edit your `config.yml` file in the GitHub editor for simplicity and replace `echo "A first hello"` with `notacommand`. Click the **Commit change** button in the GitHub editor. When you navigate back to the Job page in CircleCI, you will see that a new build was triggered. This build will fail with a red Failed button and will send you a notification email of the failure.

## Using the Workflows Functionality

1. To see Workflows in action, edit your `.circleci/config.yml` file. After you have the file in edit mode in your browser window, select the text from `build` and onwards in your file and copy and paste the text to duplicate that section. That should look similar to the code block below:

```yml
version: 2
jobs:
  build:
    docker:
      - image: circleci/ruby:2.4.1-jessie
    steps:
      - checkout
      - run: echo "A first hello"
  build:
    docker:
      - image: circleci/ruby:2.4.1-jessie
    steps:
      - checkout
      - run: echo "A first hello"      
```

1. Next, rename your two jobs so that they have different names. In this example they are named `one` and `two`. Change the contents of the echo statements to something different. To make the job take a longer period of time we can add a system `sleep` command.

2. Add a `workflows` section to your `config.yml` file. The workflows section can be placed anywhere in the file. Typically it is found either at the top or the bottom of the file.

```yml
version: 2
jobs:
  one:
    docker:
      - image: circleci/ruby:2.4.1-jessie
    steps:
      - checkout
      - run: echo "A first hello"
      - run: sleep 25
  two:
    docker:
      - image: circleci/ruby:2.4.1-jessie
    steps:
      - checkout
      - run: echo "A more familiar hi"
      - run: sleep 15
workflows:
  version: 2
  one_and_two:
    jobs:
      - one
      - two
```

1. Commit these changes to your repository and navigate back over to the CircleCI dashboard. ![]({{ site.baseurl }}/assets/img/docs/workflows-circle-101-running.png)

2. Click on the link for your workflow to see that these two jobs run in parallel. ![]({{ site.baseurl }}/assets/img/docs/inside-workflows-circle-101-running.png)

Read more about workflows in the [Orchestrating Workflows](https://circleci.com/docs/2.0/workflows/#overview) documentation.

## Adding Some Changes to use the Workspaces Functionality

Each workflow has an associated workspace which can be used to transfer files to downstream jobs as the workflow progresses. You can use workspaces to pass along data that is unique to this run and which is needed for downstream jobs. Try updating `config.yml` to the following:

```yml
version: 2
jobs:
  one:
    docker:
      - image: circleci/ruby:2.4.1-jessie
    steps:
      - checkout
      - run: echo "A first hello"
      - run: mkdir -p my_workspace
      - run: echo "Trying out workspaces" > my_workspace/echo-output
      - persist_to_workspace:
          # Must be an absolute path, or relative path from working_directory
          root: my_workspace
          # Must be relative path from root
          paths:
            - echo-output      
  two:
    docker:
      - image: circleci/ruby:2.4.1-jessie
    steps:
      - checkout
      - run: echo "A more familiar hi"  
      - attach_workspace:
          # Must be absolute path or relative path from working_directory
          at: my_workspace

      - run: |
          if [[ $(cat my_workspace/echo-output) == "Trying out workspaces" ]]; then
            echo "It worked!";
          else
            echo "Nope!"; exit 1
          fi
workflows:
  version: 2
  one_and_two:
    jobs:
      - one
      - two:
          requires:
            - one
```

Read more about workspaces [here](https://circleci.com/docs/2.0/workflows/#using-workspaces-to-share-data-among-jobs).

## SSH into Your Job

![]({{ site.baseurl }}/assets/img/docs/SSH-screen.png)

If you are comfortable with the terminal, you can SSH directly into your CircleCI jobs to troubleshoot issues with your builds by rerunning your job with the **SSH enabled** option.

*Note that you will need to add your SSH keys to your GitHub account: <https://help.github.com/articles/connecting-to-github-with-ssh/>*.

![]({{ site.baseurl }}/assets/img/docs/rebuild-with-SSH.png)

![]({{ site.baseurl }}/assets/img/docs/SSH-build-terminal-string.png)

Copy the `ssh` string from the enabling SSH section of your build. Open a terminal and paste in the `ssh` string.

Using some of the following commands, see if you can find and view the contents of the file you created using workspaces:

    pwd     #  print what directory, find out where you are in the file system
    ls -al   # list what files and directories are in the current directory
    cd <directory_name>    # change directory to the <directory_name> directory
    cat <file_name>    # show me the contents of the file <file_name>
    

## Further Resources and Links

[Blog post](https://circleci.com/blog/circleci-hacks-validate-circleci-config-on-every-commit-with-a-git-hook/) on how to validate the CircleCI `config.yml` on every commit with a git hook.

### CircleCI

* The CircleCI blog and how to follow it 
  * <https://circleci.com/blog/>
* Relevant blog post  
  * <https://circleci.com/blog/what-is-continuous-integration/>
* Our other social media and GitHub 
  * <https://github.com/circleci>
  * <https://twitter.com/circleci>
  * <https://www.facebook.com/circleci>

### Continuous Integration

* <https://martinfowler.com/articles/continuousIntegration.html>
* [https://en.wikipedia.org/wiki/Continuous_integration#Best_practices](https://en.wikipedia.org/wiki/Continuous_integration#Best_practices)

### YAML

* <https://en.wikipedia.org/wiki/YAML#Advanced_components>

We’re thrilled to have you here. Happy building!

*The CircleCI Team*