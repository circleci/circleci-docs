---
layout: classic-docs
title: "Orbs に関するよくあるご質問"
short-title: "Orbs に関するよくあるご質問"
description: "Orbs に関するよくあるご質問"
order: 20
---

よく寄せられるご質問や技術的な問題など、Orbs の使用時に役立つ情報をまとめました。

- 目次
{:toc}

## Orbs のダウンロード、統合、テスト
{:.no_toc}

- 質問: Orbs をダウンロード、統合、テストする方法を教えてください。

- 回答: バージョン 2.1 以上の CircleCI 構成では、`orbs` スタンザを使用して Orbs をインポートできます。 たとえば、名前空間 `circleci` で `hello-build` という Orb をパブリッシュする場合、パブリッシュされているバージョンが `0.0.1` ならば、以下の例のように Orb をインポートします。

    orbs:
         hello: circleci/hello-build@0.0.1
    

これで、`hello` キーの下でこの Orb のエレメントを参照することにより、そのエレメントを構成に呼び出せます。 たとえば、Orb に `hello-build` というジョブが含まれている場合、以下の例のようにワークフローでそのジョブを呼び出すことができます。

    workflows:
      info:
        jobs:
          - hello/hello-build
    

CircleCI では Web ベースのレジストリ ビューアがパブリッシュされているため、Orbs に関するドキュメントを自動的に生成できます。 また、Orbs のソースは、いつでも直接プルすることができます。 たとえば、`circleci orb source circleci/hello-build@0.01` を実行できます。

## ローカル テストでのビルド エラー

- 質問: ローカルでのテストで以下のエラーが表示されるのはなぜですか？

    circleci build -c .circleci/jobs.yml --job test
    

    Error:
    You attempted to run a local build with version 2.1 of configuration.
    

- 回答: このエラーを解決するには、構成で `circleci config process` を実行し、その構成をディスクに保存します。 次に、処理された構成に対して `circleci local execute` を実行します。

## 再実行のエラー

- 質問: 同じワークフローを再実行すると以下のエラーが表示されるのはなぜですか？

    only certified orbs are permitted in this project.
    

- 回答: スペースを挿入してから削除するなど、何らかの変更を加えてください。 変更が発生しない限り、構成は再コンパイルされません。 構成の処理が行われてから、コンパイルされたコードがワークフロー コンダクターに渡されます。 このため、再ビルドをトリガーしたワークフロー コンダクターには、変更前の 2.1 設定ファイルに関する情報が伝わりません。

## 実行時に環境変数が渡されないエラー

構成を 2.0 互換の形式に変換しようとすると、実行時に環境変数が渡されないことがあります。 たとえば、GitHub リポジトリ (`https://github.com/yourusername/circle-auto/blob/master/.circleci/echo.yml` など) でシンプルな構成を作成した場合は、以下のように指定して設定ファイルを呼び出します。

    export AUTO_FILE=/Users/yourusername/Desktop/apkpure_app_887.apk
    export AUTO_DIR=.
    circleci build -c .circleci/echo.yml --job test
    

設定ファイルは以下のようになります。

```yaml
version: 2.1
jobs:
  build:
    docker:
    - image: circleci/openjdk:8-jdk
    steps:
    - checkout
  test:
    docker:
    - image: circleci/openjdk:8-jdk
    environment:
    - TERM: dumb
    steps:
    - checkout
    - run:
        command: "echo file ${AUTO_FILE} dir ${AUTO_DIR}"
workflows:
  version: 2
  workflow:
    jobs:
    - build
    - test
```

実行時には、以下の応答が表示されます。

    #!bin/bash -eo pipefail
    echo file $(AUTO_FILE) dir $(AUTO_DIR)
    file directlySuccess!
    

## 出力のログ

- 質問: 出力をログに記録する標準的な方法はありますか？ たとえば、Jenkins プラグインでは、ログの出力を表示するコンソール リンクと、それらのメッセージをログに記録するフックが提供されています。 `stdout` はログに記録できますが、ログ メッセージをログに記録するもっと良い方法があれば教えてください。

- 回答: CircleCI では、実行されたステップはすべてログに記録されるため、ステップからの出力はコンソールに表示されます。 SSH を使用し、`echo` によって直接出力することができます。 CircleCI には、コンソールへの出力以外にログ機能はありません。

## ビルドの失敗

- 質問: Orb を呼び出すジョブを Orb 内部から意図的に失敗させるには、どうしたらよいですか？

- 回答: シェルから 0 以外のステータス コードを返すことで、ジョブをいつでも失敗させることができます。 また、`run: circleci-agent step halt` をステップとして使用して、ジョブを失敗させずに終了することも可能です。

## CircleCI プライベート環境での Orbs 使用

- 質問: Orbs で作業するときに CircleCI Server のプライベート環境を使用できますか？

- 回答: いいえ。 現在、CircleCI Server では Orbs の使用をサポートしていません。

## 他の Orbs での Orb エレメントの使用

- 質問: 独自の Orb を作成するときに別の Orb のエレメントを使用することはできますか？

- 回答: はい。他の Orbs のエレメントを直接使用して Orbs を構成できます。 たとえば、以下のようになります。

```yaml
  version: 2.1
  orbs:
    some-orb: some-ns/some-orb@volatile
  executors:
    my-executor: some-orb/their-executor
  commands:
    my-command: some-orb/their-command
  jobs:
    my-job: some-orb/their-job
    another-job:
      executor: my-executor
      steps:
        - my-command:
            param1: "hello"
  ```

## サードパーティ製 Orbs の使用

* 質問: サードパーティ製の Orb を使用しようとするとエラー メッセージが表示されるのはなぜですか？

* 回答: サードパーティ製 Orb を使用するには、最初にオプトインする必要があります。 オプトインせずにサードパーティ製 Orb を使用した場合、以下のエラー メッセージが表示されます。

```

"Orb {orb@version} not loaded. To use this orb, an organization admin must opt-in to using third party orbs in Organization Security settings." ```

ユーザーが組織で Orbs を使用する機能をオンにして、[コード共有利用規約](https://circleci.com/ja/legal/code-sharing-terms/)に同意するまで、レジストリの Orbs を使用することはできません。 サードパーティ製 Orbs を使用すると、組織が CircleCI に対して、サードパーティによってオーサリングされた構成をビルドに挿入するように求めるため、CircleCI では組織ごとにこの設定を行う必要があります。

この問題を解決するには、[Settings (設定)] -> [Security (セキュリティ)] -> [Allow uncertified orbs (未承認 Orbs の使用を許可)] の順に選択して、この設定を有効にします。

![サードパーティ製 Orbs の有効化]({{ site.baseurl }}/assets/img/docs/third-party-orbs.png)

**メモ:** 承認済み Orbs (CircleCI によるレビューと承認を経てパブリッシュされた Orbs) を使用する場合、この設定は必要ありません。 サードパーティによってオーサリングされた Orbs の認証プログラムはまだ提供されていませんが、近いうちに整備される予定です。

## 関連項目

- [Orb のコンセプト]({{site.baseurl}}/ja/2.0/using-orbs/): CircleCI Orbs の基本的な概念
- [Orb のパブリッシュ]({{site.baseurl}}/ja/2.0/creating-orbs/): ワークフローやジョブに使用する Orb のパブリッシュ プロセス
- [Orbs リファレンス ガイド]({{site.baseurl}}/ja/2.0/reusing-config/): 再利用可能な Orbs、コマンド、パラメーター、および Executors の例
- [Orb のテスト手法]({{site.baseurl}}/ja/2.0/testing-orbs/): 独自に作成した Orbs のテスト方法
- [CircleCI 構成クックブック]({{site.baseurl}}/ja/2.0/configuration-cookbook/#構成レシピ): CircleCI Orbs のレシピを構成に使用する詳しい方法
