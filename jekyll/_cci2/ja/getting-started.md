---
layout: classic-docs
title: "はじめてのビルドの成功（グリーンビルド）"
short-title: "はじめてのビルドの成功"
description: "CircleCI を使用してはじめてビルドを成功させるためのチュートリアル"
categories:
  - getting-started
order: 41
---

CircleCI ではじめてビルドを成功（グリーンビルド）させるためのステップについて詳しくご説明します。

* 目次
{:toc}

## Prerequisites for running your first build
{:.no_toc}

* Some basic knowledge of Git.
* ログイン済みの GitHub または Bitbucket アカウント。 We will use GitHub for this guide but you can follow the equivalent processes for Bitbucket if required.
* An account on CircleCI.
* Some basic terminal or `bash` knowledge and prior experience using the command line is helpful.

## リポジトリを作成する

Begin by creating a new repository on GitHub. 既存のリポジトリを使用する場合は、このセクションをスキップしても問題ありません。

1. Navigate to GitHub and [create a new repository](https://github.com/new).
1. リポジトリの名前に (ここでは "hello-world") を入力して、[Initialize this repository with: (リポジトリを初期化し次を実行:)] セクションで **[Add a README file (README ファイルを追加)]** を選択します 最後に、**[Create repository (リポジトリを作成)]** をクリックします。

![Creating a Repository]( {{ site.baseurl }}/assets/img/docs/getting-started--new-repo.png){:.img--bordered}

## Setting up CircleCI

CircleCI アカウントをまだお持ちでない場合は、[ユーザー登録ページ](https://circleci.com/ja/signup/)に移動し、**[GitHub でログイン]** をクリックしてアカウントを作成します。

1. Navigate to the CircleCI [Project Page](https://app.circleci.com/projects/).
1. If you created your new repository under an organization you will need to select the organization name when you login to CircleCI.
1. プロジェクト ページに移動したら、使用するプロジェクト (今回の例では `hello-world`) を探し、**[Set Up Project (プロジェクトのセットアップ)]** をクリックします。

1. On the following screen, choose a language from the dropdown to get a pre-populated config.yml file with suggested best-practices for your project. For this example, because we have an empty repository, we will use the `Hello
World` configuration example at the bottom of the list.

    ![Getting a sample configuration]( {{ site.baseurl }}/assets/img/docs/getting-started--sample-config.png){:.img--bordered}

    **注:** 選択した言語に応じて、参考ドキュメントが画面右側のサイドバーに表示されます。

1. **[Commit and Run (コミットして実行)]** をクリックします。 This will create a file `.circleci/config.yml` at the root of your repository on a new branch called `circle-ci-setup`. この設定で問題がなければ、後にメインブランチにマージする、もしくは引き続き変更を行うことができます。

## Digging into your first pipeline

ここまでの手順を終えると、自動的にパイプラインの実行が開始され、成功するのを確認できます。 実行結果を確認します。 パイプラインの緑色の **[Success (成功)]** ボタンをクリックして、実行について以下の部分を確認しましょう。

![First Successful Pipeline]( {{ site.baseurl }}/assets/img/docs/getting-started--first-success.png)

1. **実行されたワークフローを確認する**: **[Success (成功)]** をクリックすると、実行されたジョブの一覧ページに移動します。 初めてのビルドであれば、(**1 つのワークフロー**内で自動的に実行される) **1 つのジョブ** だけが実行されています。  In our case, we only ran one job, called `welcome/run`. Click on `welcome/run` and let's investigate the steps of our job.

   ![Investigate build]( {{ site.baseurl }}/assets/img/docs/getting-started--first-success-workflow.png)


1. **環境をスピンアップする:** このプロジェクトのデフォルト設定には、[Orb](https://circleci.com/ja/orbs) が利用されています。 By using an orb, we can get quick access to common configuration. In this case, `circleci/welcome-orb@0.4.1` provides a "pre-built" job you can run which simply greets the user.

1. **ステップの結果を表示する:** どのジョブも、一連のステップから構成されています。[`checkout`]({{site.baseurl}}/2.0/configuration-reference/#checkout) など、一部のステップは、CircleCI で予約されている特別なコマンドです。 Other steps are specified by a user to achieve a specific purpose. Because we are using the `welcome` orb, we don't see custom steps; they are configured in the orb. But no problem! We can view the [source of an orb](https://circleci.com/developer/orbs/orb/circleci/welcome-orb) online.

Even though there was no actual source code in your repo, and no actual tests configured in your `config.yml`, CircleCI considers your build to have "succeeded" because all steps completed successfully (returned an [exit code](https://en.wikipedia.org/wiki/Exit_status) of 0). Most projects are far more complicated, oftentimes with multiple Docker images and multiple steps, including a large number of tests. You can learn more about all the possible steps one may put in a `config.yml` file in the [Configuration Reference](https://circleci.com/docs/2.0/configuration-reference).

### Breaking your build!
{:.no_toc}

Let's get a bit more complex. Let's edit our `.circleci/config.yml` file now. On GitHub, it is possible to edit files directly. Use the URL below and substitute the name of your repository and username (replace the text with `{brackets}`) and then paste it in your browser. If you are already familiar with Git, use your text-editor and push your changes with git.

`https://github.com/{username}/{repo}/edit/circleci-project-setup/.circleci/config.yml`

Let's use the [Node orb](https://circleci.com/developer/orbs/orb/circleci/node). Paste the following into your `config.yml`

```yaml
version: 2.1
orbs:
  node: circleci/node@1.1
jobs:
  build:
    executor:
      name: node/default
      tag: '10.4'
    steps:
      - checkout
      - node/with-cache:
          steps:
            - run: npm install
      - run: npm run test
```


Then, commit your change in the GitHub editor and return to the Projects page in CircleCI. 新しいパイプラインが実行され失敗することが確認できます。 What's going on?

The Node orb runs some common Node tasks. Because we are working with an empty repository, running `npm run test`, a Node script, causes our configuration to fail.  How would we fix this? You would need to setup a Node project in your repository;  a topic for another tutorial. You can view several [demo applications]({{site.baseurl}}/2.0/demo-apps/) that go into more detail on setting up CircleCI with various languages and frameworks.

## Using the workflows functionality
{:.no_toc}

You do not have to use orbs to use CircleCI. The following example details how to create a custom configuration that also uses the [workflow feature]({{site.baseurl}}/2.0/workflows) of CircleCI.

1. Take a moment and read the comments in the code block below. Of course, we do not want to be copying and pasting code without understanding what we are doing. Now, to see Workflows in action, edit your `.circleci/config.yml` file and copy and paste the following text into it.

   ```yaml
   version: 2
   jobs: # we now have TWO jobs, so that a workflow can coordinate them!
     one: # This is our first job.
       docker: # it uses the docker executor
         - image: circleci/ruby:2.4.1 # specifically, a docker image with ruby 2.4.1
           auth:
             username: mydockerhub-user
             password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
       # Steps are a list of commands to run inside the docker container above.
       steps:
         - checkout # this pulls code down from GitHub
         - run: echo "A first hello" # This prints "A first hello" to stdout.
         - run: sleep 25 # a command telling the job to "sleep" for 25 seconds.
     two: # This is our second job.
       docker: # it runs inside a docker image, the same as above.
         - image: circleci/ruby:2.4.1
           auth:
             username: mydockerhub-user
             password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
       steps:
         - checkout
         - run: echo "A more familiar hi" # We run a similar echo command to above.
         - run: sleep 15 # and then sleep for 15 seconds.
   # Under the workflows: map, we can coordinate our two jobs, defined above.
   workflows:
     version: 2
     one_and_two: # this is the name of our workflow
       jobs: # and here we list the jobs we are going to run.
         - one
         - two
   ```


1. この変更をリポジトリにコミットし、CircleCI パイプライン ページに戻ります。 You should see your CircleCI pipeline running.

1. Click on the running pipeline to view the workflow you have created. 2 つのジョブが同時に実行された (または現在実行されている) ことがわかります。

Read more about workflows in the [Orchestrating Workflows](https://circleci.com/docs/2.0/workflows/#overview) documentation.

### Adding some changes to use the workspaces functionality
{:.no_toc}

各ワークフローには 1 つのワークスペースが関連付けられ、ワークフローの進行に伴って後続のジョブにファイルを転送するために使用されます。 ワークスペースを使用して、後続のジョブに必要な、実行ごとに固有のデータを渡すことができます。 Try updating `config.yml` to the following:

```yml
version: 2
jobs:
  one:
    docker:
      - image: circleci/ruby:2.4.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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
      - image: circleci/ruby:2.4.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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

### SSH into your {% comment %} todo: job {% endcomment %}build
{:.no_toc}

If you are comfortable with the terminal, you can SSH directly into your CircleCI jobs to troubleshoot issues with your builds by rerunning your {% comment %} TODO: Job {% endcomment %}build with the SSH enabled option.

*SSH 公開鍵を GitHub アカウントに登録する必要があることにご注意ください。詳細は[こちら](https://help.github.com/articles/connecting-to-github-with-ssh/)。*


{:.tab.switcher.Cloud}
![Rebuild With SSH]( {{ site.baseurl }}/assets/img/docs/rebuild-with-SSH_newui.png)

{:.tab.switcher.Server}
![Rebuild With SSH]( {{ site.baseurl }}/assets/img/docs/rebuild-with-SSH.png)


Copy the `ssh` string from the enabling SSH section of your build. Open a terminal and paste in the `ssh` string.

Using some of the following commands, see if you can find and view the contents of the file you created using workspaces:

```
pwd                  #  print what directory, find out where you are in the file system
ls -al               # list what files and directories are in the current directory
cd <directory_name>  # change directory to the <directory_name> directory
cat <file_name>      # show me the contents of the file <file_name>
```

## Collaborating with teammates

It is easy for teammates and collaborators to view and follow your projects. Teammates can make a free CircleCI account at any time to view your pipelines, even if they are not committing any code.

## See also
{:.no_toc}

[Blog post](https://circleci.com/blog/circleci-hacks-validate-circleci-config-on-every-commit-with-a-git-hook/) on how to validate the CircleCI `config.yml` on every commit with a git hook.

### CircleCI
{:.no_toc}

* The [CircleCI blog](https://circleci.com/blog/).
* [What is continuous integration?](https://circleci.com/blog/what-is-continuous-integration/)
* CircleCI on [GitHub](https://github.com/circleci), [Twitter](https://twitter.com/circleci) and [Facebook](https://www.facebook.com/circleci)

### Continuous integration
{:.no_toc}

* [Martin Fowler - Continuous Integration](https://martinfowler.com/articles/continuousIntegration.html)
* [Best Practices](https://en.wikipedia.org/wiki/Continuous_integration#Best_practices)

### YAML
{:.no_toc}

* [Advanced Concepts](https://en.wikipedia.org/wiki/YAML#Advanced_components)
