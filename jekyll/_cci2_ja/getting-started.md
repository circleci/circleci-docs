---
layout: getting-started-guide-experimental
title: "はじめてのビルドの成功（グリーンビルド）"
short-title: "はじめてのビルドの成功"
description: "CircleCI を使用してはじめてビルドを成功させるためのチュートリアル"
categories:
  - はじめよう
order: 41
toc: true
---

ここでは GitHub リポジトリを使ってはじめてビルドを成功 (グリーンビルド) させるための詳しい手順を説明します。

* 目次
{:toc}

## はじめてのビルド実行に必要な前提条件
{: #prerequisites-for-running-your-first-build }
{:.no_toc}

* Git の基礎知識
* GitHub 又は Bitbucket アカウント:  このガイドでは GitHub を使用していますが、必要に応じて Bitbucket でも同じプロセスを実行していただけます。
* バージョン管理システムと連携している CircleCI アカウント : まだお持ちでない場合は、[ユーザー登録ページ](https://circleci.com/ja/signup)に移動してアカウントを作成してください (オプション: [CircleCI のユーザー登録]({{site.baseurl}}/ja/2.0/first-steps/))をお読みください)。
* ターミナルやコマンドラインの使用経験や `bash` に関する基礎知識があると役立ちます。

## リポジトリを作成する
CircleCI アカウントをまだお持ちでない場合は、[ユーザー登録ページ](https://circleci.com/ja/signup/)に移動し、**[GitHub でログイン]** をクリックしてアカウントを作成します。

1. GitHub にログインして、[新規リポジトリを作成](https://github.com/new)します。
1. リポジトリ名を入力します (例: `hello-world`)。
1. README ファイルを使ってリポジトリを初期化するを選択します。
1. 最後に、**[Create repository (リポジトリを作成)]** をクリックします。

ここではソースコードを追加する必要はありません。

## CircleCI をセットアップする
{: #setting-up-circleci }

1. CircleCI の [**Project** ページ](https://app.circleci.com/projects/)に移動します。 組織の下に新しいリポジトリを作成した場合は、CircleCI へのログイン時にその組織名を選択する必要があります。
1. **Project** ダッシュボードに自動的に移動します。 ダッシュボードで、セットアップするプロジェクトを選択します (`hello-world`)。
1. 選択肢の中から Commit a starter CI pipeline to a new branch を選択し、**[Set Up Project]** をクリックします。 リポジトリのルートで、`circleci-project-setup` という名前の新規ブランチに `.circleci/config.yml` ファイルが作成されます。

おめでとうございます！ はじめてのビルドの成功 (グリーンビルド) です。 この設定で問題がなければ、後にこれをメインブランチにマージすることができます。

## はじめて作成したパイプラインを掘り下げる
{: #digging-into-your-first-pipeline }

実行結果を確認します。

1. プロジェクトのパイプラインのページで、緑色の **Success** ボタンをクリックすると、実行されたワークフローが表示されます (`say-hello-workflow`)。
2. このワークフロー内で、パイプラインが `say-hello` というジョブを実行しました。 `say-hello` をクリックして、このジョブのステップを確認します:   
   a. 環境のスピンアップ  
   b. 環境変数の作成  
   c. コードのチェックアウト  
   d. Say hello

どのジョブも一連のステップから構成されています。 [`checkout`]({{site.baseurl}}/2.0/configuration-reference/#checkout) などの一部のステップは、CircleCI で予約されている特別なコマンドです。 このサンプル設定では、`checkout` と [`run`]({{site.baseurl}}/2.0/configuration-reference/#run) の両方の予約ステップを使っています。 ユーザー特定の目的に合わせてジョブ内でカスタマイズされたステップを定義することも可能です。

リポジトリに実際のソースコードがなく、`.circleci/config.yml` に実際のテストが設定されていなくても、すべてのステップが問題なく完了したため ([終了コード](https://en.wikipedia.org/wiki/Exit_status) 0 が返されたため)、CircleCI はビルドが "成功した" と見なします。 実際のプロジェクトはこれよりもはるかに複雑で、複数の Docker イメージと複数のステップを使用し、膨大な数のテストを行います。 `config.yml` ファイルで使用できるすべてのステップの詳細については、[CircleCI の設定リファレンス]({{site.baseurl}}/2.0/configuration-reference)を参照してください。

### ビルドを意図的に失敗させる
{: #breaking-your-build }
{:.no_toc}

ここでは、`.circleci/config.yml` ファイルを編集してビルドが成功しなかった場合に何が起きるか確認します。

GitHub 上で直接ファイルを編集することができます。 下記 URL をブラウザーで開き、ユーザー名 (または組織) とリポジトリ名を自分のものに置き換えます (テキストを `{brackets}` に置き換えます)。 または、Git やコマンドラインに慣れている方は、テキストエディターを使って変更をターミナルにプッシュします。

`https://github.com/{username}/{repo}/edit/circleci-project-setup/.circleci/config.yml`

今回は、[Node Orb](https://circleci.com/ja/developer/orbs/orb/circleci/node) を使用してみましょう。 下記のコードをペーストして現在の設定を変更します。

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


変更をコミットし、CircleCI の **Project** ページに戻ります。 新しいパイプラインが実行され失敗することが確認できます。 何が起こったのでしょうか？

Node Orb は、一般的な Node タスクを実行します。 今回は空のリポジトリで Node スクリプト `npm run test` を実行したので、設定が失敗したのです。 これを修正するには、リポジトリで Node プロジェクトをセットアップする必要があります。その方法は、別のチュートリアルで説明します。 参考として、[デモ アプリケーション]({{site.baseurl}}/ja/2.0/examples-and-guides-overview/)で、さまざまな言語とフレームワークで CircleCI をセットアップする方法をご覧ください。

## ワークフローを使用する
{: #using-the-workflows-functionality }
{:.no_toc}

CircleCI を使用する際に、必ずしも Orb を使う必要はありません。 次の例では、カスタム設定ファイルの作成方法を説明します。 ここでも、CircleCI の[ワークフロー機能]({{site.baseurl}}/2.0/workflows)を使用します。

1. 以下のコードブロックと付記されているコメントを読み進めます。 読み終えたら、ワークフローの動作を確認するために、`.circleci/config.yml` ファイルを編集して以下のテキストをコピー & ペーストします。

   ```yaml
   version: 2
   jobs: # we now have TWO jobs, so that a workflow can coordinate them!
     one: # This is our first job.
       docker: # it uses the docker executor
         - image: cimg/ruby:2.6.8 # specifically, a docker image with ruby 2.6.8
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
         - image: cimg/ruby:3.0.2
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


1. これらの変更をリポジトリにコミットし、CircleCI の **パイプライン**ページに戻ります。 パイプラインが実行中であることがわかります。

1. 実行中のパイプラインをクリックし、作成したワークフローを表示します。 2 つのジョブが同時に実行された (または現在実行されている) ことがわかります。

ワークフローの詳細については、[ワークフローのオーケストレーション]({{site.baseurl}}/2.0/workflows/#overview)を参照してください。

### 変更を追加してワークスペースを使用する
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
      - image: cimg/ruby:3.0.2
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

詳細については、[ワークスペース]({{site.baseurl}}/2.0/workspaces/)を参照してください。

### ジョブで SSH を使用する
{: #ssh-into-your-jobs}
{:.no_toc}

ターミナルの操作に慣れている方は、SSH を有効にした CircleCI ジョブを再実行し、直接 SSH でジョブに接続してトラブルシューティングを行えます。

- [GitHub アカウントに SSH キーを追加する](https://help.github.com/articles/connecting-to-github-with-ssh/)必要があります。
- **SSH でジョブを再実行する**オプションを有効にするには、適切なジョブにも SSH キーを追加する必要があります。 [ジョブに SSH キーを追加する方法]({{site.baseurl}}/2.0/add-ssh-key/#adding-ssh-keys-to-a-job)を参照してください。

{:.tab.switcher.Cloud}
![SSH でのリビルド]( {{ site.baseurl }}/assets/img/docs/rebuild-with-SSH_newui.png)

{:.tab.switcher.Server_3}
![SSH でのリビルド]( {{ site.baseurl }}/assets/img/docs/rebuild-with-SSH_newui.png)

{:.tab.switcher.Server_2}
![SSH でのリビルド]( {{ site.baseurl }}/assets/img/docs/rebuild-with-SSH.png)


ビルドの SSH 有効化セクションから `ssh` の接続先をコピーします。 それをペーストし、ターミナルで `ssh` コマンドを実行します。

以下のコマンドを使用して、ワークスペースを使って作成したファイルの内容を表示できるかどうかを確認します。

```
pwd                  #  "print what directory" の略で、ファイル システム内のどこにいるかを確認できます
ls -al               # 現在のディレクトリに含まれるファイルとディレクトリを一覧表示します
cd <directory_name>  # 現在のディレクトリを <directory_name> ディレクトリに変更します
cat <file_name>      # ファイル <file_name> の内容を表示します
```


## チームメイトと協力する
{: #collaborating-with-teammates }

チームメイトやコラボレーターは、簡単にプロジェクトを閲覧したりフォローすることができます。 チームメイトは、コードをまったくコミットしていなくても、いつでも無料の CircleCI アカウントを作成してパイプラインを閲覧できます。

## 関連項目
{: #see-also }
{:.no_toc}

- [設定に関するリファレンス]({{site.baseurl}}/ja/2.0/configuration-reference/)
- [CircleCI  のコンセプト]({{site.baseurl}}/ja/2.0/concepts/)
- [Orb を使って共通タスクを自動化する]({{site.baseurl}}/ja/2.0/orb-intro/)

