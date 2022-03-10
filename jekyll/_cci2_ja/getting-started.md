---
layout: classic-docs
title: "はじめてのビルドの成功（グリーンビルド）"
short-title: "はじめてのビルドの成功"
description: "CircleCI を使用してはじめてビルドを成功させるためのチュートリアル"
categories:
  - はじめよう
order: 41
---

ここでは GitHub リポジトリを使ってはじめてビルドを成功 (グリーンビルド) させるための詳しい手順を説明します。

* 目次
{:toc}

## はじめてのビルド実行に必要な前提条件
{: #prerequisites-for-running-your-first-build }
{:.no_toc}

* Git の基礎知識
* GitHub 又は Bitbucket アカウント:  このガイドでは GitHub を使用していますが、必要に応じて Bitbucket でも同じプロセスを実行していただけます。
* バージョン管理システムと連携している CircleCI アカウント : まだお持ちでない場合は、[ユーザー登録ページ](https://circleci.com/signup/)に移動してアカウントを作成してください (オプション: [CircleCI のユーザー登録]({{site.baseurl}}/2.0/first-steps/)をお読みください)。
* ターミナルやコマンドラインの使用経験や `bash` に関する基礎知識があるとスムーズに行えます。

## リポジトリの作成
CircleCI アカウントをまだお持ちでない場合は、[ユーザー登録ページ](https://circleci.com/ja/signup/)に移動し、**[GitHub でログイン]** をクリックしてアカウントを作成します。

1. GitHub にログインして、[新規リポジトリを作成](https://github.com/new)します。
1. リポジトリ名を入力します (例: `hello-world`)。
1. README ファイルを使ってリポジトリを初期化するを選択します。
1. 最後に、**[Create repository (リポジトリを作成)]** をクリックします。

ここではソースコードを追加する必要はありません。

## CircleCI をセットアップする
{: #setting-up-circleci }

1. CircleCI の [Project</strong> ページ](https://app.circleci.com/projects/)に移動します。 組織の下に新しいリポジトリを作成した場合は、CircleCI へのログイン時にその組織名を選択する必要があります。
1. **Project** ダッシュボードに自動的に移動します。 ダッシュボードで、セットアップするプロジェクトを選択します (`hello-world`)。
1. CI スターターパイプラインを新しいブランチにコミットするを選択し、config.yml のスターターテンプレートの使用を選択し、**[Set Up Project]**をクリックします。 リポジトリのルートで、`circleci-project-setup` という名前の新規ブランチに `.circleci/config.yml` ファイルが作成されます。

おめでとうございます！ はじめてのビルドの成功 (グリーンビルド) です。 この設定で問題がなければ、後でこれをメインブランチにマージすることができます。

## はじめて作成したパイプラインを掘り下げる
{: #digging-into-your-first-pipeline }

実行結果を確認します。

1. プロジェクトのパイプラインのページで、緑色の **Success** ボタンをクリックすると、実行されたワークフローが表示されます (`say-hello-workflow`)。
2. このワークフロー内で、パイプラインが `say-hello` というジョブを実行しました。 `say-hello` をクリックして、このジョブのステップを確認します:   
   a. 環境のスピンアップ  
   b.  環境変数の作成  
   c. コードのチェックアウト  
   d. Say hello

どのジョブも一連のステップから構成されています。 [checkout</code>]({{site.baseurl}}/2.0/configuration-reference/#checkout) などの一部のステップは、CircleCI で予約されている特別なコマンドです。 The example config uses both the reserved `checkout` and [`run`]({{site.baseurl}}/2.0/configuration-reference/#run) steps. Custom steps can also be defined within a job to achieve a user-specified purpose.

Even though there is no actual source code in your repo, and no actual tests configured in your `.circleci/config.yml`, CircleCI considers your build to have succeeded because all steps completed successfully (returned an [exit code](https://en.wikipedia.org/wiki/Exit_status) of 0). 実際のプロジェクトは、これよりもはるかに複雑で、複数の Docker イメージと複数のステップを使用し、膨大な数のテストを行います。 You can learn more about all the possible steps one may put in a `.circleci/config.yml` file in the [Configuration Reference]({{site.baseurl}}/2.0/configuration-reference).

### Break your build!
{: #breaking-your-build }
{:.no_toc}

In this section, you will edit the `.circleci/config.yml` file and see what happens if a build does not complete successfully.

It is possible to edit files directly on GitHub. Open the URL below in a browser, substituting your username (or organization) and the name of your repository (replace the text with `{brackets}`). Or, if you are comfortable with Git and the command line, use your text editor and push your changes in the terminal.

`https://github.com/{username}/{repo}/edit/circleci-project-setup/.circleci/config.yml`

今回は、[Node Orb](https://circleci.com/ja/developer/orbs/orb/circleci/node) を使用してみましょう。 Replace the existing config by pasting the following code:

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


Commit your change, then return to the **Projects** page in CircleCI. You should see a new pipeline running... and it will fail! 何が起こったのでしょうか。

Node Orb は、一般的な Node タスクを実行します。 Because you are working with an empty repository, running `npm run test`, a Node script, causes the configuration to fail. To fix this, you need to set up a Node project in your repository—a topic for another tutorial. 参考として、[デモ アプリケーション]({{site.baseurl}}/2.0/demo-apps/)で、さまざまな言語とフレームワークで CircleCI をセットアップする方法をご覧ください。

## Use workflows
{: #using-the-workflows-functionality }
{:.no_toc}

CircleCI を使用する際には、必ずしも Orb を使用する必要はありません。 次の例では、カスタム設定ファイルの作成方法を説明します。 この例でも、CircleCI の[ワークフロー機能]({{site.baseurl}}/2.0/workflows)を使用します。

1. 以下のコードブロックと付記されているコメントを読み進めます。 Then, to see workflows in action, edit your `.circleci/config.yml` file and copy and paste the following text into it.

   ```yaml
   version: 2
   jobs: # 今回は 2 つのジョブを用意し、ワークフロー機能でジョブの調整を行います。
     one: # 1 つ目のジョブ
       docker: # it uses the docker executor
         - image: cimg/ruby:2.6.8 # specifically, a docker image with ruby 2.6.8
           auth:
             username: mydockerhub-user
             password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
       # Steps are a list of commands to run inside the docker container above.
       steps:
         - checkout # GitHub からコードをプルします
         - run: echo "A first hello" # "A first hello" を stdout に出力します
         - run: sleep 25 # 25 秒間スリープするようにジョブに指示するコマンドです。
     two: # 2 つ目のジョブ
       docker: # 前述と同様に Docker イメージ内で実行します。
         - image: cimg/ruby:3.0.2
           auth:
             username: mydockerhub-user
             password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
       steps:
         - checkout
         - run: echo "A more familiar hi" # We run a similar echo command to above.
         - run: sleep 15 # 15 秒間スリープします
   # このワークフローでは、マッピングを行い、上記で定義した 2 つのジョブを調整することができます。
   workflows:
     version: 2
     one_and_two: # ワークフローの名前
       jobs: # 実行するジョブをここにリストします
         - one
         - two
   ```


1. Commit these changes to your repository and navigate back to the CircleCI **Pipelines** page. You should see your pipeline running.

1. 実行中のパイプラインをクリックし、作成したワークフローを表示します。 2 つのジョブが同時に実行された (または現在実行されている) ことがわかります。

Read more about workflows in the [Orchestrating Workflows]({{site.baseurl}}/2.0/workflows/#overview) documentation.

### Add some changes to use workspaces
{: #adding-some-changes-to-use-the-workspaces-functionality }
{:.no_toc}

各ワークフローには 1 つのワークスペースが関連付けられ、ワークフローの進行に伴って後続のジョブにファイルを転送するために使用されます。 ワークスペースを使用して、後続のジョブに必要な、実行ごとに固有のデータを渡すことができます。 `config.yml` を以下のように更新してみます。

```yaml
version: 2
jobs:
  one:
    docker:
      - image: cimg/ruby:3.0.2
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
      - image: cimg/ruby:3.0.2
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

Learn more about this feature in the [Workspaces]({{site.baseurl}}/2.0/workspaces/) page.

### SSH into your jobs
{: #ssh-into-your-jobs}
{:.no_toc}

If you are comfortable with the terminal, you can rerun a CircleCI job with SSH enabled, then SSH directly into your jobs to troubleshoot issues.

- You will need to [add your SSH keys to your GitHub account](https://help.github.com/articles/connecting-to-github-with-ssh/).
- To enable the **Rerun Job with SSH** option, you will also need to add your SSH keys to the appropriate job. Refer to the [Adding SSH Keys to a Job]({{site.baseurl}}/2.0/add-ssh-key/#adding-ssh-keys-to-a-job) instructions.

{:.tab.switcher.Cloud}
![SSH でのリビルド]( {{ site.baseurl }}/assets/img/docs/rebuild-with-SSH_newui.png)

{:.tab.switcher.Server_3}
![SSH でのリビルド]( {{ site.baseurl }}/assets/img/docs/rebuild-with-SSH_newui.png)

{:.tab.switcher.Server_2}
![SSH でのリビルド]( {{ site.baseurl }}/assets/img/docs/rebuild-with-SSH.png)


ビルドの SSH 有効化セクションから `ssh` の接続先をコピーします。 Then, paste in and execute the `ssh` command in the terminal.

以下のコマンドを使用して、ワークスペースで作成したファイルの内容を表示できるかどうかを確認します。

```
pwd                  # print what directory, find out where you are in the file system
ls -al               # list what files and directories are in the current directory
cd <directory_name>  # change directory to the <directory_name> directory
cat <file_name>      # show me the contents of the file <file_name>
```


## チームメイトと協力する
{: #collaborating-with-teammates }

チームメイトやコラボレーターは、簡単にプロジェクトを閲覧したりフォローしたりできます。 チームメイトは、コードをまったくコミットしていないとしても、いつでも無料の CircleCI アカウントを作成してパイプラインを閲覧できます。

## 関連項目
{: #see-also }
{:.no_toc}

- [設定に関するリファレンス]({{site.baseurl}}/2.0/configuration-reference/)
- [CircleCI  のコンセプト]({{site.baseurl}}/)
- [Automate common tasks with orbs]({{site.baseurl}}/)

