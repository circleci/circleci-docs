---
layout: classic-docs
title: "はじめてのビルドの成功（グリーンビルド）"
short-title: "はじめてのビルドの成功"
description: "CircleCI を使用してはじめてビルドを成功させるためのチュートリアル"
categories:
  - はじめよう
order: 41
---

CircleCI ではじめてビルドを成功（グリーンビルド）させるためのステップについて詳しくご説明します。

* 目次
{:toc}

## 初回のビルド実行にあたっての前提条件
{: #prerequisites-for-running-your-first-build }
{:.no_toc}

* Git の基礎知識
* ログイン済みの GitHub または Bitbucket アカウント。 このガイドでは GitHub を使用しますが、必要に応じて同じプロセスを Bitbucket で実行してもかまいません。
* CircleCI のアカウント
* ターミナルまたは `bash` に関する基本知識と、コマンド ラインの使用経験があると役立ちます。

## リポジトリを作成する
CircleCI アカウントをまだお持ちでない場合は、[ユーザー登録ページ](https://circleci.com/ja/signup/)に移動し、**[GitHub でログイン]** をクリックしてアカウントを作成します。

最初に、GitHub でリポジトリを新規作成します。 既存のリポジトリを使用する場合は、このセクションをスキップしても問題ありません。

1. GitHub に移動して、[新規リポジトリを作成](https://github.com/new)します。
1. Input the name of your repository, in this case "hello-world", then select the option to initialize the repository with a README file. 最後に、**[Create repository (リポジトリを作成)]** をクリックします。

## CircleCI をセットアップする
{: #setting-up-circleci }

If you have not yet, create an account on CircleCI by navigating to [the signup page](https://circleci.com/signup/) and clicking on **Sign Up with GitHub**.

1. CircleCI の[プロジェクト ページ](https://app.circleci.com/projects/)に移動します。
1. 組織の下に新しいリポジトリを作成した場合は、CircleCI へのログイン時にその組織名を選択する必要があります。
1. Once on the Project page, select the project you are using (in our case `hello-world`).
1. Select the option to use a starter config.yml template, and click **Set Up Project**.
1. Next, choose a language from the list of sample configs to get a pre-populated config.yml file with suggested best practices for your project. For this example, because we have an empty repository, we will use the `Hello World` configuration example.

    **Note:** Based on which language you choose, you can view related documentation in the sidebar on the right of the screen.
1. Click **Commit and Run**. This will create a file `.circleci/config.yml` at the root of your repository on a new branch called `circle-ci-setup`. If you are happy with this configuration, you can merge it into your main branch later, or continue to make changes.

## 最初のパイプラインを掘り下げる
{: #digging-into-your-first-pipeline }

You should see your pipeline start to run automatically—and pass! So, what just happened? Click on the green **Success** button on your pipeline to investigate the following parts of the run:

1. **実行されたワークフローを確認する**: **[Success (成功)]** をクリックすると、実行されたジョブの一覧ページに移動します。 初めてのビルドであれば、(**1 つのワークフロー**内で自動的に実行される) **1 つのジョブ** だけが実行されています。  In our case, we only ran one job, called `say-hello`. Click on `say-hello` and let's investigate the steps of our job.

1. **View step results:** Every job is made up of a series of steps - some steps, like [`checkout`]({{site.baseurl}}/2.0/configuration-reference/#checkout) are special, reserved commands in CircleCI. Other steps are specified by a user to achieve a specific purpose. In our Hello World example config, we use both `checkout` and [`run`]({{site.baseurl}}/2.0/configuration-reference/#run).

Even though there was no actual source code in your repo, and no actual tests configured in your `config.yml`, CircleCI considers your build to have "succeeded" because all steps completed successfully (returned an [exit code](https://en.wikipedia.org/wiki/Exit_status) of 0). Most projects are far more complicated, oftentimes with multiple Docker images and multiple steps, including a large number of tests. You can learn more about all the possible steps one may put in a `config.yml` file in the [Configuration Reference](https://circleci.com/docs/2.0/configuration-reference).

### ビルドを意図的に失敗させる
{: #breaking-your-build }
{:.no_toc}

Let's get a bit more complex. Let's edit our `.circleci/config.yml` file now. On GitHub, it is possible to edit files directly. Use the URL below and substitute the name of your repository and username (replace the text with `{brackets}`) and then paste it in your browser. If you are already familiar with Git, use your text-editor and push your changes with git.

`https://github.com/{username}/{repo}/edit/circleci-project-setup/.circleci/config.yml`

Let's use the [Node orb](https://circleci.com/developer/orbs/orb/circleci/node). Paste the following into your `config.yml`

```yaml
version: 2.1
orbs:
  node: circleci/node@4.7.0
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


Then, commit your change in the GitHub editor and return to the Projects page in CircleCI. You should see a new pipelines running... and it will fail! What's going on?

The Node orb runs some common Node tasks. Because we are working with an empty repository, running `npm run test`, a Node script, causes our configuration to fail.  How would we fix this? You would need to setup a Node project in your repository;  a topic for another tutorial. You can view several [demo applications]({{site.baseurl}}/2.0/demo-apps/) that go into more detail on setting up CircleCI with various languages and frameworks.

## ワークフロー機能を使用する
{: #using-the-workflows-functionality }
{:.no_toc}

You do not have to use orbs to use CircleCI. The following example details how to create a custom configuration that also uses the [workflow feature]({{site.baseurl}}/2.0/workflows) of CircleCI.

1. 以下のコード ブロックと付記されているコメントを読み進めます。 面倒だとしても、どのような処理をしているのかを理解しないままコードをコピー & ペーストするのはやめてください。 読み終えたら、ワークフローの動作を確認するために、`.circleci/config.yml` ファイルを編集して以下のテキストをコピー & ペーストします。

   ```yaml
   version: 2
   jobs: # 今回は 2 つのジョブを用意し、ワークフロー機能でジョブの調整を行います。
     one: # 1 つ目のジョブ
       docker: # Docker Executor を使用します。
         - image: circleci/ruby:2.4.1 # Ruby 2.4.1 を含む Docker イメージを指定します。
           auth:
             username: mydockerhub-user
             password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
       # ステップは、上記の Docker コンテナ内で実行するコマンドのリストです
       steps:
         - checkout # GitHub からコードをプルします
         - run: echo "A first hello" # "A first hello" を stdout に出力します
         - run: sleep 25 # 25 秒間スリープするようにジョブに指示するコマンドです。
     two: # 2 つ目のジョブ
       docker: # 前述と同様に Docker イメージ内で実行します。
         - image: circleci/ruby:2.4.1
           auth:
             username: mydockerhub-user
             password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
       steps:
         - checkout
         - run: echo "A more familiar hi" # 前述のコマンドに類似した echo コマンドを実行します。
         - run: sleep 15 # 15 秒間スリープします
   # このワークフローでは、マッピングを行い、上記で定義した 2 つのジョブを調整することができます。
   workflows:
     version: 2
     one_and_two: # ワークフローの名前
       jobs: # 実行するジョブをここにリストします
         - one
         - two
   ```


1. この変更をリポジトリにコミットし、CircleCI パイプライン ページに戻ります。 CircleCI パイプラインが実行中であると表示されます。

1. 実行中のパイプラインをクリックし、作成したワークフローを表示します。 2 つのジョブが同時に実行された (または現在実行されている) ことがわかります。

Read more about workflows in the [Orchestrating Workflows](https://circleci.com/docs/2.0/workflows/#overview) documentation.

### 変更を追加してワークスペース機能を使用する
{: #adding-some-changes-to-use-the-workspaces-functionality }
{:.no_toc}

Each workflow has an associated workspace which can be used to transfer files to downstream jobs as the workflow progresses. You can use workspaces to pass along data that is unique to this run and which is needed for downstream jobs. Try updating `config.yml` to the following:

```yml
version: 2
jobs:
  one:
    docker:
      - image: circleci/ruby:2.4.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  #  コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - run: echo "A first hello"
      - run: mkdir -p my_workspace
      - run: echo "Trying out workspaces" > my_workspace/echo-output
      - persist_to_workspace:
          # 絶対パスまたは working_directory からの相対パスでなければなりません。
          root: my_workspace
          # ルートからの相対パスでなければなりません。
          paths:
            - echo-output      
  two:
    docker:
      - image: circleci/ruby:2.4.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  #  コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - run: echo "A more familiar hi"  
      - attach_workspace:
          # 絶対パスまたは working_directory からの相対パスでなければなりません。
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

### SSH での{% comment %}TODO: Job {% endcomment %}ビルドへの接続
{: #ssh-into-your-percent-comment-percent-todo-job-percent-endcomment-percentbuild }
{:.no_toc}

If you are comfortable with the terminal, you can SSH directly into your CircleCI jobs to troubleshoot issues with your builds by rerunning your {% comment %} TODO: Job {% endcomment %}build with the SSH enabled option.

*Note that you will need to add your SSH keys to your GitHub account: <https://help.github.com/articles/connecting-to-github-with-ssh/>*.


{:.tab.switcher.Cloud}
![Rebuild With SSH]( {{ site.baseurl }}/assets/img/docs/rebuild-with-SSH_newui.png)

{:.tab.switcher.Server_3}
![SSH でのリビルド]( {{ site.baseurl }}/assets/img/docs/rebuild-with-SSH_newui.png)

{:.tab.switcher.Server_2}
![SSH でのリビルド]( {{ site.baseurl }}/assets/img/docs/rebuild-with-SSH.png)


ビルドの SSH 有効化セクションから `ssh` の接続先をコピーします。 ターミナルを開き、`ssh` の接続先を貼り付けます。

以下のコマンドを使用して、ワークスペースで作成したファイルの内容を表示できるかどうかを確認します。

```
pwd                  #  "print what directory" の略で、ファイル システム内のどこにいるかを確認できます。
ls -al               # 現在のディレクトリに含まれるファイルとディレクトリを一覧表示します。
cd <directory_name>  # 現在のディレクトリを <directory_name> ディレクトリに変更します。
cat <file_name>      # ファイル <file_name> の内容を表示します。
```
**注:** `rerun job with ssh`を実行するには、 [ジョブにSSHキーを追加する](https://circleci.com/docs/2.0/add-ssh-key/#adding-ssh-keys-to-a-job)という手順が必要です。

## チームメイトと協力する
{: #collaborating-with-teammates }

チームメイトやコラボレーターは、簡単にプロジェクトを閲覧したりフォローしたりできます。 チームメイトは、コードをまったくコミットしていないとしても、いつでも無料の CircleCI アカウントを作成してパイプラインを閲覧できます。

## 関連項目
{: #see-also }
{:.no_toc}

Git フックを使用してコミットごとに CircleCI `config.yml` を検証する方法については、[こちらのブログ記事](https://circleci.com/ja/blog/circleci-hacks-validate-circleci-config-on-every-commit-with-a-git-hook/)を参照してください。

### CircleCI
{: #circleci }
{:.no_toc}

* [CircleCI CIのブログ](https://circleci.com/blog/)
* [継続的インテグレーションとは](https://circleci.com/blog/what-is-continuous-integration/)
* CircleCI のアカウント: [GitHub](https://github.com/circleci) (英語)、[Twitter](https://twitter.com/circleci) (英語)、[Facebook](https://www.facebook.com/circleci) (英語)

### 継続的インテグレーション
{: #continuous-integration }
{:.no_toc}

* [Martin Fowler 氏 - Continuous Integration (継続的インテグレーション) (英語)](https://martinfowler.com/articles/continuousIntegration.html)
* [ベスト プラクティス](https://en.wikipedia.org/wiki/Continuous_integration#Best_practices)

### YAML
{: #yaml }
{:.no_toc}

* [より詳しい概念 (英語)](https://en.wikipedia.org/wiki/YAML#Advanced_components)
