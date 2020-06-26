---
layout: classic-docs
title: "ワークフローを使用したジョブのスケジュール"
short-title: "ワークフローを使用したジョブのスケジュール"
description: "ワークフローを使用したジョブのスケジュール"
categories:
  - configuring-jobs
order: 30
---

![ヘッダー]({{ site.baseurl }}/assets/img/docs/wf-header.png)

迅速なフィードバック、再実行時間の短縮、リソースの効率的な使用によって、ソフトウェア開発をスピードアップさせるには、ワークフローを構成します。 ここでは、以下のセクションに沿って、ワークフロー機能について説明し、構成例を紹介します。

- 目次
{:toc}

## 概要

**ワークフロー**は、一連のジョブとその実行順序を定義するルールのセットです。 ワークフローを使用すると、単純な設定キーを組み合わせて複雑なジョブ オーケストレーションを構成でき、問題の早期解決に役立ちます。

ワークフローによって以下の作業を実行できます。

- リアルタイムのステータス フィードバックによって、ジョブの実行とトラブルシューティングを分離する
- 定期的に実行したいジョブをワークフローとしてスケジュールする
- 複数のジョブをファンアウトして並列に実行し、バージョン テストを効率的に行う
- ファンインして複数のプラットフォームにすばやくデプロイする

ワークフロー内の 1 つのジョブのみが失敗した場合は、その失敗をリアルタイムに確認できます。 ビルド全体の失敗を待ってからジョブ セット全体を再実行するといった時間の無駄をなくし、*失敗したジョブのみ*を再実行することが可能です。

### ステータス
{:.no_toc}

ワークフローのステータスには以下の種類があります。

- RUNNING: ワークフローが実行中
- NOT RUN: ワークフローが起動されていない
- CANCELLED: ワークフローが終了前にキャンセルされた
- FAILING: ワークフロー内の 1 つのジョブが失敗 (グラフ内のジョブの 1 つが失敗し、他のジョブが引き続き実行されている場合、 ワークフローが最終的に失敗することを意味する「Failing」ステータスとなります)
- FAILED: ワークフロー内の 1 つ以上のジョブが失敗 (ワークフロー グラフ内の 1 つ以上のジョブが失敗した場合の 最終的なステータスです)
- SUCCESS: ワークフロー内のすべてのジョブが正常に完了
- ON HOLD: ワークフロー内のジョブが承認を待機中
- NEEDS SETUP: このプロジェクトの [config.yml]({{ site.baseurl }}/2.0/configuration-reference/) ファイル内にワークフロー スタンザが含まれていない、または正しくない

### 制限事項
{:.no_toc}

パイプラインが有効化されているプロジェクトは、CircleCI API を使用してワークフローをトリガーできます。 パイプラインが有効化されていないプロジェクトは、API によってトリガーされても、ワークフローが存在しないかのように実行されます。 **メモ:** ワークフローが存在しないビルドには、`build` ジョブが必要です。

その他の詳細と制限事項については、「[よくあるご質問]({{ site.baseurl }}/2.0/faq)」のワークフロー セクションを参照してください。

## ワークフローの構成例

`workflows` *キーの完全な仕様については、**「CircleCI を設定する」の「[workflows]({{ site.baseurl }}/2.0/configuration-reference/#workflows)」を参照してください。*

**メモ:** ワークフローを使用して構成されたプロジェクトに含まれる複数のジョブが、Docker イメージ、環境変数、`run` ステップなどの構文を共有することは少なくありません。 `.circleci/config.yml` ファイルのサイズを抑えるために、構文をエイリアス化して再利用する方法については、[YAML の アンカーとエイリアスに関するドキュメント](http://yaml.org/spec/1.2/spec.html#id2765878)参照してください。 概要については、ブログ記事「[Reuse YAML in the CircleCI Config (CircleCI 設定ファイルで YAML を再利用する)](https://circleci.com/blog/circleci-hacks-reuse-yaml-in-your-circleci-config-with-yaml/)」を参照してください。

並列ジョブを実行するには、既存の `.circleci/config.yml` ファイルの末尾に新しい `workflows:` セクションを追加し、バージョンとワークフローの一意名を指定します。 以下の `.circleci/config.yml` ファイルの例は、2 つの並列ジョブから成るデフォルトのワークフロー オーケストレーションを示しています。 これは、`build_and_test` という名前の `workflows:` キーを使用し、ジョブ名のリストから成る `jobs:` キーをネストすることによって定義されています。 依存関係が定義されていないため、これらのジョブは並列に実行されます。

```yaml
jobs:
  build:
    docker:
      - image: circleci/<language>:<version TAG>
    steps:
      - checkout
      - run: <command>
  test:
    docker:
      - image: circleci/<language>:<version TAG>
    steps:
      - checkout
      - run: <command>
workflows:
  version: 2
  build_and_test:
    jobs:
      - build
      - test
```

このサンプルの全文は、[並列ワークフローの構成例](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/parallel-jobs/.circleci/config.yml)でご覧いただけます。

## 高度な構成のヒント

ワークフローを使用すると、単一のジョブ セットを実行するよりも格段に高度な構成を作成できます。 しかし、カスタマイズと制御の範囲が広がると、エラーのリスクも高まります。 ワークフローを使用するときは、以下の点を考慮してください。

- 早く終わるジョブをワークフローの先頭に移動させます。 たとえば、lint や構文チェックは、実行時間が長く計算コストが高いジョブの前に実行する必要があります。
- ワークフローの*最初*に setup ジョブを実行すると、何らかの事前チェックだけでなく、後続のすべてのジョブのワークスペースの準備に役立ちます。

設定ファイルを改善するためのヒントについては、「[最適化]({{ site.baseurl }}/2.0/optimizations)」と「[高度な設定ファイル]({{ site.baseurl }}/2.0/adv-config)」を参照してください。

### 順次ジョブ実行の例
{:.no_toc}

以下の例は、4 つの順次ジョブから成るワークフローを示しています。 ジョブは、構成された要件に従って実行されます。図に示すように、各ジョブは必要なジョブが正しく終了してから開始されます。

![順次ジョブ実行のワークフロー]({{ site.baseurl }}/assets/img/docs/sequential_workflow.png)

以下の `config.yml` スニペットは、順次ジョブ実行を構成するワークフローの例を示しています。

```yaml
workflows:
  version: 2
  build-test-and-deploy:
    jobs:
      - build
      - test1:
          requires:
            - build
      - test2:
          requires:
            - test1
      - deploy:
          requires:
            - test2
```

ここに示すように、依存関係は `requires:` を設定することによって定義されます。 `deploy:` ジョブは、`build`、`test1`、`test2` の各ジョブが正しく完了するまで実行されません。 ジョブは、依存関係グラフ内のすべてのアップストリーム ジョブが実行を完了するまで待機する必要があります。 したがって、`deploy` ジョブは `test2` ジョブを待ち、`test2` ジョブは `test1` ジョブを待ち、`test1` ジョブは `build` ジョブを待ちます。

このサンプルの全文は、[順次ワークフローの構成例](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/sequential-branch-filter/.circleci/config.yml)でご覧いただけます。

### ファンアウトとファンインのワークフローの例
{:.no_toc}

ここに示すワークフローの例では、共通のビルド ジョブを実行し、次にファンアウトして一連の受け入れテスト ジョブを並列に実行し、最後にファンインして共通のデプロイ ジョブを実行します。

![ファンアウトとファンインのワークフロー]({{ site.baseurl }}/assets/img/docs/fan_in_out.png)

以下の `config.yml` スニペットは、ファンアウトとファンインのジョブ実行を構成するワークフローの例を示しています。

```yaml
workflows:
  version: 2
  build_accept_deploy:
    jobs:
      - build
      - acceptance_test_1:
          requires:
            - build
      - acceptance_test_2:
          requires:
            - build
      - acceptance_test_3:
          requires:
            - build
      - acceptance_test_4:
          requires:
            - build
      - deploy:
          requires:
            - acceptance_test_1
            - acceptance_test_2
            - acceptance_test_3
            - acceptance_test_4
```

この例では、`build` ジョブが正しく終了すると直ちに、4 つすべての受け入れテスト ジョブが開始されます。 `deploy` ジョブは、4 つすべての受け入れテスト ジョブが正しく完了するまで待ってから開始されます。

このサンプルの全文は、[ファンイン・ファンアウトのワークフローの構成例](https://github.com/CircleCI-Public/circleci-demo-workflows/tree/fan-in-fan-out)でご覧いただけます。

## 手動承認後に処理を続行するワークフロー

ジョブが手動承認されてから次のジョブを続行するようにワークフローを構成できます。 リポジトリへのアクセスをプッシュしたユーザーであればだれでも、[Approval (承認)] ボタンをクリックしてワークフローを続行できます。 それには、`type: approval` キーを指定して `jobs` リストにジョブを追加します。 コメント付きの設定ファイルの例を見てみましょう。

```yaml
# ...
# << build、test1、test2、deploy ジョブの設定ファイル >>
# ...

workflows:
  version: 2
  build-test-and-approval-deploy:
    jobs:

      - build  # 設定ファイルに含まれるカスタム ジョブ。コードをビルドします。
      - test1: # カスタム ジョブ。テスト スイート 1 を実行します。
          requires: # `build` ジョブが完了するまで、test1 は実行されません。
            - build
      - test2: # 別のカスタム ジョブ。テスト スイート 2 を実行します。
          requires: # test2 は、ジョブ `test1` が成功するかどうかに依存します。
            - test1
      - hold: # <<< CircleCI Web アプリケーションで手動承認を必要とするジョブ。
          type: approval # <<< このキー・値のペアにより、ワークフローのステータスが "On Hold" に設定されます。
          requires: # test2 が成功した場合にのみ "hold" ジョブを実行します。
           - test2
      # `hold` ジョブが承認されると、`hold` ジョブを必要とする後続のジョブが実行されます。 
      # この例では、ユーザーが手動でデプロイ ジョブをトリガーしています。
      - deploy:
          requires:
            - hold
```

上の例の結果として、CircleCI アプリケーションの [Workflows (ワークフロー)] ページで `hold` ジョブをクリックし、[Approve (承認)] をクリックするまで、`deploy:` ジョブは実行されません。 この例の `hold` ジョブの目的は、承認されるまでデプロイの開始を待つことです。

ワークフローで手動承認を使用する場合は、以下の点に注意する必要があります。

- `approval` は、`workflow` キーの下にあるジョブで**のみ**使用できる特別な種類のジョブです。
- `hold` ジョブは、他のジョブで使用されていない一意の名前である必要があります。
- つまり、上の例の `build` や `test1` など、カスタム構成されたジョブに `type: approval` を指定することはできません。
- `type: approval` キーが指定されている限り、保留するジョブの名前は任意です。たとえば、`wait`、`pause` などを使用できます。
- 手動で承認されるジョブの後に実行するすべてのジョブは、そのジョブの名前を `require:` で*指定する必要があります*。 上の例の `deploy:` ジョブを参照してください。
- ワークフローが `type: approval` キーを持つジョブと、そのジョブが依存するジョブを処理するまでは、定義された順序でジョブが実行されます。

下図は、`request-testing` ジョブが承認されるまで保留されているワークフローのスクリーンショットです。

![保留中のワークフローの承認ジョブ]({{ site.baseurl }}/assets/img/docs/approval_job.png)

下図は、`request-testing` ジョブをクリックしたときに表示される承認ダイアログ ボックスのスクリーンショットです。

![保留中のワークフローの承認ダイアログ]({{ site.baseurl }}/assets/img/docs/approval_job_dialog.png)

## ワークフローのスケジュール実行

すべてのブランチで、コミットのたびにワークフローを実行するのは、非効率的でコストもかさみます。 代わりに、特定のブランチに対して特定の時刻にワークフローを実行するようにスケジュールを設定できます。 これで、これらのブランチでは、コミットによってジョブがトリガーされなくなります。

リソースに高い負荷がかかるワークフローやレポートを生成するワークフローは、コミットのたびに実行するのではなく、設定ファイルに `triggers` キーを追加してスケジュール実行することを検討してください。 `triggers` キーは、`workflows` キーの下に**のみ**追加されます。 この機能では、指定したブランチに対して、UTC を表す `cron` 構文を使用してワークフローの実行スケジュールを設定できます。

**メモ:** CircleCI v2.1 では、設定ファイルにワークフローが指定されていない場合、暗黙的なワークフローが使用されます。 しかし、ビルドをスケジュール実行するワークフローを宣言すると、暗黙的なワークフローは実行されなくなります。 コミットごとにもビルドを行うには、設定ファイルにジョブ ワークフローを追加する必要があります。

### 夜間に実行する例
{:.no_toc}

デフォルトでは、`git push` ごとにワークフローがトリガーされます。 スケジュールに沿ってワークフローをトリガーするには、ワークフローに `triggers` キーを追加し、`schedule` を指定します。

以下の例では、`nightly` ワークフローが毎日午前 0 時 (UTC) に実行されるように構成しています。 `cron` キーは、POSIX `crontab` 構文を使用して指定されます。`cron` 構文の基本については、[crontab の man ページ](https://www.unix.com/man-page/POSIX/1posix/crontab/)を参照してください。 このワークフローは、`master` ブランチと `beta` ブランチで実行されます。

**メモ:** スケジュールが設定されたワークフローは、最大 15 分遅れることがあります。 これは、午前 0 時 (UTC) などの混雑時の信頼性を維持するために実施されます。 スケジュールが設定されたワークフローが分単位の正確性で開始されることを想定しないようにご注意ください。

```yaml
workflows:
  version: 2
  commit:
    jobs:
      - test
      - deploy
  nightly:
    triggers:
      - schedule:
          cron: "0 0 * * *"
          filters:
            branches:
              only:
                - master
                - beta
    jobs:
      - coverage
```

上の例の `commit` ワークフローに `triggers` キーはなく、`git push` ごとに実行されます。 `nightly` ワークフローには `triggers` キーがあるため、`schedule` の指定に沿って実行されます。

### 有効なスケジュールの指定
{:.no_toc}

有効な `schedule` には、`cron` キーと `filters` キーが必要です。

`cron` キーの値は、[有効な crontab エントリ](https://crontab.guru/)である必要があります。

**メモ:** cron のステップ構文 (たとえば、`*/1`、`*/20`) は**サポートされません**。 エレメントのカンマ区切りリスト内の範囲エレメントも**サポートされません**。

`filters` キーの値は、特定ブランチ上の実行ルールを定義するマップです。

詳細については、「CircleCI を設定する」の「[branches ]({{ site.baseurl }}/2.0/configuration-reference/#branches-1)」を参照してください。

このサンプルの全文は、[ワークフローのスケジュールを設定する構成例](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/try-schedule-workflow/.circleci/config.yml)でご覧いただけます。

## ワークフローにおけるコンテキストとフィルターの使用

以下のセクションでは、コンテキストとフィルターを使用してジョブの実行を管理する例を示します。

### ジョブ コンテキストを使用して環境変数を共有する
{:.no_toc}

以下の例は、コンテキストを使用して環境変数を共有して 4 つの順次ジョブから成るワークフローを示しています。 アプリケーションでこの設定を行う詳細な手順については、[コンテキストに関するドキュメント]({{ site.baseurl }}/2.0/contexts)を参照してください。

以下の `config.yml` スニペットは、`org-global` コンテキスト内に定義されたリソースを使用するように順次ジョブ ワークフローを構成した例です。

```yaml
workflows:
  version: 2
  build-test-and-deploy:
    jobs:
      - build
      - test1:
          requires:
            - build
          context: org-global  
      - test2:
          requires:
            - test1
          context: org-global  
      - deploy:
          requires:
            - test2
```

これらの環境変数は、ここに示すように、`context` キーにデフォルト名 `org-global` を設定することによって定義されます。 この構成例の `test1` ジョブと `test2` ジョブは、組織の所属ユーザーによって開始された場合、同じ共有環境変数を使用します。 デフォルトでは、組織に対して設定されたコンテキストには、その組織内のすべてのプロジェクトがアクセスできます。

### ブランチレベル（ブランチの配下）でジョブを実行する
{:.no_toc}

以下の例は、3 つのブランチ (Dev、Stage、Pre-Prod) 上にあるジョブを使用して構成されたワークフローを示しています。 ワークフローは `jobs` 設定の下にネストされた `branches` キーを無視するため、ジョブレベルのブランチを使用して後でワークフローを追加する場合は、ジョブレベルのブランチを削除し、代わりにそれを `config.yml` のワークフロー セクションで宣言する必要があります。

![ブランチレベルでジョブを実行する]({{ site.baseurl }}/assets/img/docs/branch_level.png)

以下の `config.yml` スニペットは、ブランチレベルのジョブ実行を構成するワークフローの例を示しています。

```yaml
workflows:
  version: 2
  dev_stage_pre-prod:
    jobs:
      - test_dev:
          filters:  # 正規表現フィルターを使用すると、ブランチ全体が一致する必要があります
            branches:
              only:  # 以下の正規表現フィルターに一致するブランチのみが実行されます
                - dev
                - /user-.*/
      - test_stage:
          filters:
            branches:
              only: stage
      - test_pre-prod:
          filters:
            branches:
              only: /pre-prod(?:-.+)?$/
```

正規表現の詳細については、この後の「[正規表現を使用してタグとブランチをフィルタリングする](#正規表現を使用してタグとブランチをフィルタリングする)」を参照してください。

ワークフロー構成例の全文は、ブランチを含む順次ワークフロー サンプル プロジェクトの[設定ファイル](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/sequential-branch-filter/.circleci/config.yml)でご覧いただけます。

### Git タグに対応するワークフローを実行する
{:.no_toc}

明示的にタグ フィルターを設定しない限り、CircleCI はタグに関するワークフローを実行しません。 さらに、ジョブが (直接的または間接的に) 他のジョブを必要とする場合は、[正規表現を使用](#正規表現を使用してタグとブランチをフィルタリングする)して、それらのジョブに対応するタグ フィルターを指定する必要があります。 軽量のタグと注釈付きのタグがサポートされています。

以下の例では、2 つのキーが定義されています。

- `untagged-build`: すべてのブランチに対して `build` ジョブを実行します
- `tagged-build`: すべてのブランチ**に加えて** `v` で始まるすべてのタグに対して `build` を実行します

```yaml
workflows:
  version: 2
  untagged-build:
    jobs:
      - build
  tagged-build:
    jobs:
      - build:
          filters:
            tags:
              only: /^v.*/
```

以下の例では、`build-n-deploy` ワークフローで 2 つのジョブが定義されています。

- `build`: すべてのブランチとすべてのタグに対して実行されます
- `deploy`: ブランチに対しては実行されず、'v' で始まるタグに対してのみ実行されます

```yaml
workflows:
  version: 2
  build-n-deploy:
    jobs:
      - build:
          filters:  # `deploy` にタグ フィルターがあり、それが `build` を必要とするため必須
            tags:
              only: /.*/
      - deploy:
          requires:
            - build
          filters:
            tags:
              only: /^v.*/
            branches:
              ignore: /.*/
```

以下の例では、`build-test-deploy` ワークフローで 3 つのジョブが定義されています。

- `build`: すべてのブランチおよび 'config-test' で始まるタグに対してのみ実行されます
- `test`: すべてのブランチおよび 'config-test' で始まるタグに対してのみ実行されます
- `deploy`: ブランチに対しては実行されず、'config-test' で始まるタグに対してのみ実行されます

```yaml
workflows:
  version: 2
  build-test-deploy:
    jobs:
      - build:
          filters:  # `test` にタグ フィルターがあり、それが `build` を必要とするため必須
            tags:
              only: /^config-test.*/
      - test:
          requires:
            - build
          filters:  # `deploy` にタグ フィルターがあり、それが `test` を必要とするため必須
            tags:
              only: /^config-test.*/
      - deploy:
          requires:
            - test
          filters:
            tags:
              only: /^config-test.*/
            branches:
              ignore: /.*/
```

**メモ:** GitHub からの Web フック ペイロードは、[上限が 5 MB](https://developer.github.com/webhooks/#payloads) に設定されており、[一部のイベント](https://developer.github.com/v3/activity/events/types/#createevent)は最大 3 つのタグに制限されます。 複数のタグを一度にプッシュした場合、CircleCI はすべてを受信できないことがあります。

### 正規表現を使用してタグとブランチをフィルタリングする
{:.no_toc}

CircleCI のブランチおよびタグ フィルターは、Java 正規表現パターン マッチの一種をサポートしています。 フィルターを記述した場合、CircleCI は正規表現との正確な一致を調べます。

たとえば、`only: /^config-test/` は `config-test` タグにのみ一致します。 `config-test` で始まるすべてのタグに一致させるには、代わりに `only: /^config-test.*/` を使用します。

セマンティック バージョニングにはタグが一般的に使用されています。 2.1 リリースのパッチ バージョン 3-7 と一致させるには、`/^version-2\.1\.[3-7]/` と記述します。

パターン マッチ ルールの詳細については、[java.util.regex のドキュメント](https://docs.oracle.com/javase/7/docs/api/java/util/regex/Pattern.html)を参照してください。

## ワークスペースによるジョブ間のデータ共有

各ワークフローには 1 つのワークスペースが関連付けられ、ワークフローの進行に伴ってダウンストリーム ジョブにファイルを転送するために使用されます。 ワークスペースは、追加専用のデータ ストレージです。 ジョブは、ワークスペースにデータを維持できます。 この構成は、データをアーカイブし、コンテナ外のストアに新しいレイヤーを作成します。 ダウンストリーム ジョブは、そのコンテナ ファイル システムにワークスペースをアタッチできます。 ワークスペースをアタッチすると、ワークフロー グラフ内のアップストリーム ジョブの順序に基づいて、各レイヤーがダウンロードされ、アンパッケージ化されます。

![ワークスペースのデータ フロー]({{ site.baseurl }}/assets/img/docs/Diagram-v3-Workspaces.png)

ワークスペースを使用して実行ごとに固有のデータを渡しますが、これはダウンストリーム ジョブに必要です。 複数のブランチで実行されるジョブを含むワークフローでは、ワークスペースを使用してデータを共有しなければならない場合があります。 ワークスペースは、コンパイルされたデータがテスト コンテナによって使用されるプロジェクトでも便利です。

たとえば、Scala プロジェクトは通常、ビルド ジョブ内のコンパイルで CPU に高い負荷がかかります。 対照的に、Scala テスト ジョブは CPU に高い負荷がかからず、コンテナ間で十分に並列処理できます。 ビルド ジョブにより大きなコンテナを使用し、コンパイルされたデータをワークスペースに保存することで、テスト コンテナはビルド ジョブからコンパイルされた Scala を使用できるようになります。

2 つ目の例は、jar をビルドしてワークスペースに保存する `build` ジョブを含むプロジェクトです。 この `build` ジョブは、`integration-test`、`unit-test`、`code-coverage` にファンアウトし、jar を使用してこれらのテストを並列に実行します。

あるジョブのデータを維持し、他のジョブにそのデータを提供するには、`persist_to_workspace` キーを使用するようにジョブを構成します。 `persist_to_workspace` の `paths:` プロパティで指定したファイルとディレクトリは、`root` キーで指定したディレクトリからの相対パスにある、ワークフローの一時ワークスペースにアップロードされます。 その後、それらのファイルとディレクトリは、後続のジョブ (およびワークフローの再実行) で使用するためにアップロードされ、利用可能になります。

`attach_workspace` キーを構成することで、保存されたデータを取得するようにジョブを構成します。 以下の `config.yml` ファイルでは 2 つのジョブが定義されており、`downstream` ジョブは `flow` ジョブのアーティファクトを使用します。 順次実行のワークフローとして構成されているため、`downstream` が開始する前に `flow` が終了する必要があります。

```yaml
# 以下のスタンザは、CircleCI 2.1 を使用して再利用可能な Executor を使用していることに注意してください。
# これにより、ジョブ間で再利用される Docker イメージを定義できます。
# 詳細については、https://circleci.com/ja/docs/2.0/reusing-config/#再利用可能な-executors-のオーサリング を参照してください。

version: 2.1

executors:
  my-executor:
    docker:

      - image: buildpack-deps:jessie
    working_directory: /tmp

jobs:
  flow:
    executor: my-executor
    steps:

      - run: mkdir -p workspace
      - run: echo "Hello, world!" > workspace/echo-output

      # ダウンストリーム ジョブで使用するために、指定されたパス (workspace/echo-output) をワークスペースに維持します。 

      - persist_to_workspace:
          # 絶対パスまたは working_directory からの相対パスでなければなりません。 これは、ワークスペースの
      # ルート ディレクトリとなる、コンテナ上のディレクトリです。
          root: workspace
          # ルートからの相対パスでなければなりません。
          paths:
            - echo-output

  downstream:
    executor: my-executor
    steps:

      - attach_workspace:
          # 絶対パスであるか、working_directory からの相対パスでなければなりません。
          at: /tmp/workspace

      - run: |
          if [[ `cat /tmp/workspace/echo-output` == "Hello, world!" ]]; then
            echo "It worked!";
          else
            echo "Nope!"; exit 1
          fi

workflows:
  version: 2

  btd:
    jobs:

      - flow
      - downstream:
          requires:
            - flow
```

ワークスペースを使用してビルド ジョブとデプロイ ジョブの間でデータを受け渡す実際の例については、CircleCI ドキュメントをビルドするように構成された [`config.yml`](https://github.com/circleci/circleci-docs/blob/master/.circleci/config.yml) を参照してください。

ワークスペース、キャッシュ、およびアーティファクトの使用に関する概念的な情報については、ブログ記事「[Persisting Data in Workflows: When to Use Caching, Artifacts, and Workspaces (ワークフローでデータを保持するには: キャッシュ、アーティファクト、ワークスペース活用のヒント)](https://circleci.com/blog/persisting-data-in-workflows-when-to-use-caching-artifacts-and-workspaces/)」を参照してください。

## ワークフロー内の失敗したジョブの再実行

ワークフローを使用すると、失敗にもすばやく対応できるようになります。 ワークフローの**失敗したジョブ**のみを再実行するには、アプリで **[Workflows (ワークフロー)]** アイコンをクリックし、ワークフローを選択して各ジョブのステータスを表示します。次に、**[Rerun (再実行)]** ボタンをクリックし、[**Rerun from failed (失敗から再実行)**] を選択します。

![CircleCI のワークフロー ページ]({{ site.baseurl }}/assets/img/docs/rerun-from-failed.png)

## トラブルシューティング

このセクションでは、ワークフローに関連する一般的な問題とその解決方法について説明します。

### ワークフローの再実行が失敗する
{:.no_toc}

(パイプラインの処理中に) ワークフローを実行する前にエラーが発生する場合があることがわかっています。 この場合、停止する前は正しく動作していたワークフローでも、再実行すると失敗します。 これを回避するには、プロジェクトのリポジトリに変更をプッシュします。 これにより、最初にパイプライン処理が再実行されてからワークフローが実行されます。

### ワークフローが起動しない
{:.no_toc}

ワークフロー構成の作成時または修正時に、新しいジョブが表示されない場合は、`config.yml` に構成エラーが発生している可能性があります。

ワークフローがトリガーされないのは、主に構成エラーによってワークフローの起動が妨げられていることが原因です。 そのため、ワークフローがジョブを開始しない事態が発生します。

現在、ワークフローのセットアップ時に構成エラーを確認するには、CircleCI アプリケーションの (*ジョブ ページではなく*) ワークフロー ページをチェックする必要があります。

プロジェクトのジョブ ページの URL は、以下のとおりです。

`https://circleci.com/:VCS/:ORG/:PROJECT`

ワークフロー ページの URL は、以下のとおりです。

`https://circleci.com/:VCS/:ORG/workflows/:PROJECT`

「NEEDS SETUP (要セットアップ)」と記載された黄色のタグが付いたワークフローを探します。

![無効なワークフロー構成の例]({{ site.baseurl }}/assets/img/docs/workflow-config-error.png)

### GitHub でワークフローがステータスを待機する
{:.no_toc}

GitHub リポジトリでブランチにワークフローを実装しているものの、ステータス チェックがいつまでも完了しない場合は、GitHub でいずれかのステータス設定を解除する必要がある可能性があります。 たとえば、ブランチの保護を選択している場合は、以下に示すように `ci/circleci` ステータス キーの選択を解除する必要があります。このキーが選択されていると、デフォルトの CircleCI 1.0 チェックが参照されるためです。

![GitHub ステータス キーの選択の解除]({{ site.baseurl }}/assets/img/docs/github_branches_status.png)

ワークフローを使用している場合に、`ci/circleci` チェックボックスをオンにすると、GitHub でステータスが完了と表示されなくなります。これは、CircleCI が名前にジョブを含むキーを使用して GitHub にステータスを送信するためです。

GitHub で [Settings (設定)] > [Branches (ブランチ)] に移動し、保護されているブランチで [Edit (編集)] ボタンをクリックして、設定の選択を解除します (例: https://github.com/your-org/project/settings/branches)。

## 関連項目
{:.no_toc}

- 1.0 `circle.yml` ファイルから 2.0 `.circleci/config.yml` ファイルへの移行時に、ワークフローを構成に追加する手順については、[1.0 から 2.0 への移行に関するドキュメント]({{ site.baseurl }}/2.0/migrating-from-1-2/)でワークフローの構成手順を参照してください。

- ワークフローに関するよくある質問と回答については、「[よくあるご質問]({{ site.baseurl }}/2.0/faq)」のワークフロー セクションを参照してください。

- ワークフローを使用して構成されたデモ アプリについては、GitHub で [CircleCI デモ ワークフロー](https://github.com/CircleCI-Public/circleci-demo-workflows)を参照してください。

## ビデオ: ワークフローに複数のジョブを構成する
{:.no_toc}

<iframe width="560" height="315" src="https://www.youtube.com/embed/3V84yEz6HwA" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen mark="crwd-mark"></iframe> 

### ビデオ: 自動的にテストおよびデプロイを行うようビルドのスケジュールを設定する
{:.no_toc}

<iframe width="560" height="315" src="https://www.youtube.com/embed/FCiMD6Gq34M" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen mark="crwd-mark"></iframe>