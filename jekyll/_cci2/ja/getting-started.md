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

## 初回のビルド実行にあたっての前提条件
{: #prerequisites-for-running-your-first-build }
{:.no_toc}

* Git の基礎知識
* ログイン済みの GitHub または Bitbucket アカウント。 このガイドでは GitHub を使用しますが、必要に応じて同じプロセスを Bitbucket で実行してもかまいません。
* CircleCI のアカウント
* ターミナルまたは `bash` に関する基本知識と、コマンド ラインの使用経験があると役立ちます。

## リポジトリを作成する
{: #creating-a-repository }

Begin by creating a new repository on GitHub. You may skip this section if you intend to use an existing repository.

1. GitHub に移動して、[新規リポジトリを作成](https://github.com/new)します。
1. リポジトリの名前に (ここでは "hello-world") を入力して、[Initialize this repository with: (リポジトリを初期化し次を実行:)] セクションで **[Add a README file (README ファイルを追加)]** を選択します 最後に、**[Create repository (リポジトリを作成)]** をクリックします。

![Creating a Repository]( {{ site.baseurl }}/assets/img/docs/getting-started--new-repo.png){:.img--bordered}

## CircleCI をセットアップする
{: #setting-up-circleci }

If you have not yet, create an account on CircleCI by navigating to [the signup page](https://circleci.com/signup/) and clicking on **Sign Up with GitHub**.

1. CircleCI の[プロジェクト ページ](https://app.circleci.com/projects/)に移動します。
1. 組織の下に新しいリポジトリを作成した場合は、CircleCI へのログイン時にその組織名を選択する必要があります。
1. プロジェクト ページに移動したら、使用するプロジェクト (今回の例では `hello-world`) を探し、**[Set Up Project (プロジェクトのセットアップ)]** をクリックします。

1. 次の画面で、ドロップダウンから言語を選択して、プロジェクト向けの推奨ベスト プラクティスがあらかじめ記述されている config.yml ファイルを取得します。 この例では、空のリポジトリを用意したので、リスト下部にある `Hello World` 構成サンプルを使用します。

    ![サンプル構成を取得する]( {{ site.baseurl }}/assets/img/docs/getting-started--sample-config.png){:.img--bordered}

    **Note:** Based on which language you choose you can view related documentation in the sidebar on the right of the screen

1. **[Commit and Run (コミットして実行)]** をクリックします。 リポジトリのルートで、`circleci-project-setup` という名前の新規ブランチに `.circleci/config.yml` ファイルが作成されます。 この設定で問題がなければ、後にメインブランチにマージする、もしくは引き続き変更を行うことができます。

## 最初のパイプラインを掘り下げる
{: #digging-into-your-first-pipeline }

You should see your pipeline start to run automatically—and pass! So, what just happened? Click on the green **Success** button on your pipeline to investigate the following parts of the run:

![First Successful Pipeline]( {{ site.baseurl }}/assets/img/docs/getting-started--first-success.png)

1. **実行されたワークフローを確認する**: **[Success (成功)]** をクリックすると、実行されたジョブの一覧ページに移動します。 初めてのビルドであれば、(**1 つのワークフロー**内で自動的に実行される) **1 つのジョブ** だけが実行されています。  この例では、`welcome/run` という名前のジョブだけが実行されました。 [`welcome/run`] をクリックして、ジョブのステップを調査してみましょう。

   ![ビルドを調査する]( {{ site.baseurl }}/assets/img/docs/getting-started--first-success-workflow.png)


1. **環境をスピンアップする:** このプロジェクトのデフォルト設定には、[Orb](https://circleci.com/ja/orbs) が利用されています。 Orb を使用すると、よく使用する構成にすばやくアクセスできます。 この例では、ユーザーに単純なあいさつをする "構築済み" ジョブを実行する `circleci/welcome-orb@0.4.1` を使用しています。

1. **ステップの結果を表示する:** どのジョブも、一連のステップから構成されています。[`checkout`]({{site.baseurl}}/2.0/configuration-reference/#checkout) など、一部のステップは、CircleCI で予約されている特別なコマンドです。 他のステップは、ユーザーがそれぞれの目的に合わせて指定します。 `welcome` Orb を使用しているので、カスタム ステップは表示されません。カスタム ステップは Orb 内で構成されているからです。 しかし、問題ありません。 [Orb のソース](https://circleci.com/ja/developer/orbs/orb/circleci/welcome-orb)はオンラインで確認できます。

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


Then, commit your change in the GitHub editor and return to the Projects page in CircleCI. You should see a new pipelines running... and it will fail! What's going on?

The Node orb runs some common Node tasks. Because we are working with an empty repository, running `npm run test`, a Node script, causes our configuration to fail.  How would we fix this? You would need to setup a Node project in your repository;  a topic for another tutorial. You can view several [demo applications]({{site.baseurl}}/2.0/demo-apps/) that go into more detail on setting up CircleCI with various languages and frameworks.

## ワークフロー機能を使用する
{: #using-the-workflows-functionality }
{:.no_toc}

You do not have to use orbs to use CircleCI. The following example details how to create a custom configuration that also uses the [workflow feature]({{site.baseurl}}/2.0/workflows) of CircleCI.

1. 以下のコード ブロックと付記されているコメントを読み進めます。 面倒だとしても、どのような処理をしているのかを理解しないままコードをコピー & ペーストするのはやめてください。 読み終えたら、ワークフローの動作を確認するために、`.circleci/config.yml` ファイルを編集して以下のテキストをコピー & ペーストします。

   ```yaml
   version: 2
   jobs: # 今回は 2 つのジョブを用意し、ワークフロー機能でジョブの調整を行います
     one: # 1 つ目のジョブ
       docker: # Docker Executor を使用します
         - image: circleci/ruby:2.4.1 # Ruby 2.4.1 を含む Docker イメージを指定します
           auth:
             username: mydockerhub-user
             password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
       # ステップは、上記の Docker コンテナ内で実行するコマンドのリストです
       steps:
         - checkout # GitHub からコードをプルします
         - run: echo "A first hello" # "A first hello" を stdout に出力します
         - run: sleep 25 # 25 秒間スリープするようにジョブに指示するコマンド
     two: # 2 つ目のジョブ
       docker: # 前述と同様に Docker イメージ内で実行します
         - image: circleci/ruby:2.4.1
           auth:
             username: mydockerhub-user
             password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
       steps:
         - checkout
         - run: echo "A more familiar hi" # 前述のコマンドに類似した echo コマンドを実行します
         - run: sleep 15 # 15 秒間スリープします
   # workflows 以下でマッピングを行い、上記で定義した 2 つのジョブを調整します
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

### {% comment %} todo: job {% endcomment %}ビルドに SSH 接続する
{: #ssh-into-your-percent-comment-percent-todo-job-percent-endcomment-percentbuild }
{:.no_toc}

If you are comfortable with the terminal, you can SSH directly into your CircleCI jobs to troubleshoot issues with your builds by rerunning your {% comment %} TODO: Job {% endcomment %}build with the SSH enabled option.

*Note that you will need to add your SSH keys to your GitHub account: <https://help.github.com/articles/connecting-to-github-with-ssh/>*.


{:.tab.switcher.Cloud}
![Rebuild With SSH]( {{ site.baseurl }}/assets/img/docs/rebuild-with-SSH_newui.png)

{:.tab.switcher.Server}
![Rebuild With SSH]( {{ site.baseurl }}/assets/img/docs/rebuild-with-SSH.png)


Copy the `ssh` string from the enabling SSH section of your build. Open a terminal and paste in the `ssh` string.

Using some of the following commands, see if you can find and view the contents of the file you created using workspaces:

```
pwd                  #  "print what directory" の略で、ファイル システム内のどこにいるかを確認できます
ls -al               # 現在のディレクトリに含まれるファイルとディレクトリを一覧表示します
cd <directory_name>  # 現在のディレクトリを <directory_name> ディレクトリに変更します
cat <file_name>      # ファイル <file_name> の内容を表示します
```

## チームメイトと協力する
{: #collaborating-with-teammates }

It is easy for teammates and collaborators to view and follow your projects. Teammates can make a free CircleCI account at any time to view your pipelines, even if they are not committing any code.

## 関連項目
{: #see-also }
{:.no_toc}

[Blog post](https://circleci.com/blog/circleci-hacks-validate-circleci-config-on-every-commit-with-a-git-hook/) on how to validate the CircleCI `config.yml` on every commit with a git hook.

### CircleCI
{: #circleci }
{:.no_toc}

* [CircleCI ブログ](https://circleci.com/ja/blog/)
* [継続的インテグレーションとは](https://circleci.com/blog/what-is-continuous-integration/)
* CircleCI のアカウント: [GitHub](https://github.com/circleci) (英語)、[Twitter](https://twitter.com/circleci) (英語)、[Facebook](https://www.facebook.com/circleci) (英語)

### 継続的インテグレーション
{: #continuous-integration }
{:.no_toc}

* [Martin Fowler 氏 - Continuous Integration (継続的インテグレーション) (英語)](https://martinfowler.com/articles/continuousIntegration.html)
* [ベスト プラクティス](https://ja.wikipedia.org/wiki/継続的インテグレーション)

### YAML
{: #yaml }
{:.no_toc}

* [Advanced components (高度なコンポーネント) (英語)](https://en.wikipedia.org/wiki/YAML#Advanced_components)
