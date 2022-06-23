---
layout: classic-docs
title: "Orb のテスト手法"
short-title: "テスト手法"
description: "CircleCI Orb のテストに関する入門ガイド"
categories:
  - はじめよう
order: 1
version:
  - クラウド
---

Orb のテストに関するベストプラクティスを説明します。

* 目次
{:toc}

## はじめに
{: #introduction }

Orb は、CircleCI のパイプラインの重要な構成要素であり、ツールのインストール、テストの実行、アプリケーションのデプロイを行います。 他のソフトウェアと同様に、新しい変更による Orb の破損を防ぐために、テストを行うことが重要です。 Orb は YAML で開発されるため、そのテストプロセスはプログラミング言語のテストプロセスとは少し異なります。 しかし、Orb 開発キットがあれば、Orb について厳密かつ網羅的なテストを簡単に実施できます。

<div class="video-wrapper">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/kTeRJrwxShI?start=314" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## Orb ツールパイプラインの概要
{: #orb-tools-pipeline-overview }

このガイドに従って、Orb 開発キットを使用して Orb を作成すると、 [Orb テンプレート](https://github.com/CircleCI-Public/Orb-Template)と同じ構造の Orb プロジェクトが出来上がります。 `.circleci/` ディレクトリの中を見ると、`config.yml` と `test-deploy.yml` の 2 つの設定ファイルがあり、どちらにも実行可能なテスト一式が含まれています。

### config.yml
{: #configyml }

最初の設定ファイルは、2 つ目のワークフローの `test-deploy` で結合テストを実行できるよう、Orb の開発版をパブリッシュします。 パイプラインのこの時点では、Orb がまだパブリッシュされていないため、Orb を_直接_テストすることはできませんが、この段階ではスクリプトの構文チェックやバリデーションおよびレビュー、単体テストを実行することも可能です。

Orb の開発版がパブリッシュされた後、最後の `orb-tools/continue` ジョブが 2 つ目のワークフロー、`test-deploy` をトリガーします。

完全な [config.yml テンプレート](https://github.com/CircleCI-Public/Orb-Template/blob/main/.circleci/config.yml)については、こちらを参照してください。


### test-deploy.yml
{: #test-deployyml }

2 つ目の設定ファイルには、2 つの主要タスクがあります。1 つ目の設定ファイルで Orb の開発版がパブリッシュされたので、結合テストで Orb を_直接_テストできるようになりました。タグが作成された場合は、この 2 つ目の設定ファイルにより Orb が CircleCI Orb レジストリにパブリッシュされます。

完全な [test-deploy.yml テンプレート](https://github.com/CircleCI-Public/Orb-Template/blob/main/.circleci/test-deploy.yml)については、こちらを参照してください。

## バリデーション
{: #validation }

Orb のテストの最も基本的な形式は、設定ファイルのバリデーションとコードの構文チェックです。 パッケージ化およびパブリッシュされる Orb は、有効な YAML 形式であり、かつ CircleCI の構文に従っている必要があります。 Orb 開発キットを使用していれば、これら両方のチェックは、プロジェクトの設定ファイル `.circleci/config.yml` に定められた CI/CD パイプラインにより自動で行われます。 また、ローカル環境において手動で実施することも可能です。

```yaml
# Snippet from lint-pack workflow in config.yml
workflows:
  lint-pack:
    jobs:
      - orb-tools/lint # Lints the YAML and CircleCI syntax of the orb
      - orb-tools/pack # Packs the orb source and validates it
```
### YAML の構文チェック
{: #yaml-lint }

上記ワークフローの最初にあるジョブ `orb-tools/lint` は、Orb 開発キットの主要な構成要素である [`orb-tools` Orb](https://circleci.com/developer/orbs/orb/circleci/orb-tools) のジョブです。 この `orb-tools/lint` ジョブは、 YAML の基本的な構文チェックを行います。 構文チェックのルールやその他の設定は[Orb レジストリに記載されているジョブのパラメーター](https://circleci.com/ja/developer/orbs/orb/circleci/orb-tools#jobs-lint)により変更できます。

#### ローカル YAML の構文チェック
{: #local-yaml-lint }

`yamllint` をローカルにインストールしている場合:

```shell
$ yamllint ./src
```

Using CircleCI's Local Execute:

```shell
circleci local execute --job orb-tools/lint
```


### Orb のバリデーション
{: #orb-validation }

YAML の構文チェックに加えて、「パッケージ化」した `orb.yml` ファイルを検証し、Orbスキーマに正しく準拠していることを確認する必要があります。 まず、Orb を[パッケージ化]({{site.baseurl}}/ja/2.0/orb-concepts/#orb-packing)して、複数のソースファイルを `orb.yml` に結合させます。 次に、 `circleci orb validate` コマンドを実行して、スキーマを確認します。

```yaml
# Snippet from lint-pack workflow in config.yml
workflows:
  lint-pack:
    jobs:
      - orb-tools/pack # Packs the orb source and validates it
```

#### ローカル Orb のバリデーション
{: #local-orb-validate }

Orb をローカルでパッケージ化してバリデーションを行うには、次のコマンドを実行します。

```shell
circleci orb pack src > orb.yml
circleci orb validate orb.yml
```

または、CircleCI の Local Execute を使用します。
```shell
circleci local execute --job orb-tools/pack
```
### ShellCheck
{: #shellcheck }

Orb 開発キットを使用する大きなメリットとして、完成版の Orb に[外部の bash スクリプトをインポート]({{site.baseurl}}/ja/2.0/orb-concepts/#file-include-syntax)できる機能が挙げられます。 bash スクリプトは [src/scripts](https://github.com/CircleCI-Public/Orb-Template/tree/main/src/scripts) ディレクトリに保存できるので、スクリプトに対して別のテストも実行できます。

bash スクリプトの最も基本的なテストは、"ShellCheck" というバリデーションツールです。 これは bash 用の構文チェックツールのようなもので、詳細は [shellcheck.net](https://www.shellcheck.net/) に記載されています。

`lint-pack` ワークフローには、[ShellCheck Orb](https://circleci.com/ja/developer/orbs/orb/circleci/shellcheck) が含まれています。 ShellCheck Orb のステップはすべて省略可能であり、特に Orb でスクリプトのインストールが不要な場合は削除してかまいません。

#### ローカル ShellCheck
{: #local-shellcheck }

ShellCheck をローカルで実行するには、次のコマンドを実行します。

```shell
shellcheck src/scripts/*.sh
```

または、CircleCI の Local Execute を使用します。
```shell
circleci local execute --job shellcheck/check
```

### レビュー
{: #review }

orb-tools Orb には、`orb-tools/review` ジョブが含まれています。このジョブは、ベストプラクティスを実装し、Orb の品質を向上するために設計された一連のテストを Orb に対して実行します。 "review" ジョブは、_ShellCheck_ に厳密に基づいて作られおり、"RC" Review Check というルールのリストに基づいて動作します。 各 "RC" コードは特定のルールに対応しています。ただし、このルールはオプションであって無視することもできます。

Review Check は JUNIT XML 形式に出力され、UI にネイティブに表示されるよう、自動的に CircleCI にアップロードされます。

![Orb ツールの Review Check RC008]({{site.baseurl}}/assets/img/docs/orbtools-rc008.png)

エラーをクリックすると、エラーが検出されたファイルやコードの行などの詳細情報と、解決策の提案が表示されます。

**注:** "orb-tools/review" ジョブは、その結果が JUNIT XML として出力され、CircleCI にアップロードされるため、現在ローカルでは実行できません。現時点では、これはローカルの実行コマンドではサポートされていません。
{: class="alert alert-warning"}

## 単体テスト
{: #unit-testing }

Orb 開発キットの[`<<include(file)>>`ファイルインクルード]({{site.baseurl}}/ja/2.0/orb-concepts/#file-include-syntax)機能と`src/scripts` ディレクトリを使用して、bash ファイルを保存して読み込むと、スクリプトに対して有効な結合テストを作成できます。

![BATS-Core を使用した bash スクリプトの単体テスト]({{site.baseurl}}/assets/img/docs/bats_tests_example.png)

内部スクリプトが複雑な Orb の場合、コードの品質向上やローカル開発テストの簡易化のために、単体テストを実施することをお勧めします。

bash 単体テストについては、[BATS-Core](https://github.com/bats-core/bats-core) ライブラリをお勧めします。これは、bash 用のオープンソースのテストフレームワークで、JavaScript 用の [Jest](https://jestjs.io/)  に類似しています。

CircleCI では [BATS orb](https://circleci.com/developer/orbs/orb/circleci/bats-core) をすでに作成しており、BATS を簡単に CircleCI パイプラインに統合できます。

BATS を Orb に追加するには、次のステップに従います。

  1. `tests` ディレクトリを Orb の `src` ディレクトリに追加します。
  2. `tests` ディレクトリでテストを作成します。
  3. [circleci/bats](https://circleci.com/ja/developer/orbs/orb/circleci/bats#usage-run-bats-tests) Orb を `config.yml` ファイルに追加します。
  4. `bats/run` ジョブを `config.yml` ファイルのパブリッシュ前のジョブに追加します。

```
workflows:
  lint-pack:
    jobs:
      - orb-tools/lint:
          filters: *filters
      - orb-tools/pack:
          filters: *filters
      - orb-tools/review:
          filters: *filters
# Add bats
      - bats/run:
          filters: *filters
          path: ./src/tests
# ...
# And ensure to mark it as required in the publish job.
 - orb-tools/publish:
          requires:
            [orb-tools/lint, orb-tools/review, orb-tools/pack, shellcheck/check, bats/run]
```

bash 用単体テストの記述方法については、 [Slack Orb](https://github.com/CircleCI-Public/slack-orb/blob/master/src/tests/notify.bats) を参照してください。

## 結合テスト
{: #integration-testing }

ソースコード上で行えるバリデーション、構文チェック、ShellCheck および他のテストの完了後に、実際の CircleCI 設定ファイルで Orb の機能をテストする必要があります。 2 つ目の設定ファイル (`test-deploy.yml`) では、1 つ目の設定ファイルでパブリッシュした Orb の開発版にアクセスし、Orb コマンドおよびジョブの実行を試してみることができます。

### Orb コマンドのテスト
{: #testing-orb-commands }

デフォルトでは、新しい Orb をオーサリングすると、"greet" コマンドを備えた Orb ソースのサンプルが手に入ります。 結合テストとして、`test-deploy` ワークフローで greet コマンド (場合によっては、他のコマンド) をテストできます。 このコマンドを実行して、エラーが無く実行されているかをバリデーションすることができます。また、追加のチェックを実行することで、コマンドの機能を確認することもできます。

`test-deploy.yml` ファイルに、`command-tests` という名前のジョブが表示されます。 このサンプルジョブでは、結合テストとして 1 つまたはすべてのコマンドを実行します。

このジョブでは、テストするパラメーターを使って、Orb コマンドを呼び出すことができます。 例えば、コマンドによりコマンドライン ツールをインストールする場合、追加ステップでテストを実行してコマンドが有効かどうかを確認できます。

デフォルトでは、含まれている "greet" コマンドがテストされます。 greet コマンドは stdout にメッセージを出力するだけなので、他のバリデーションチェックは行うことはできません。

```yaml
jobs:
    command-tests:
      docker:
        - image: cimg/base:current
      steps:
        # Run your orb's commands to validate them.
        - <orb-name>/greet
```

以下は、[GitHub CLI Orb](https://github.com/CircleCI-Public/github-cli-orb) の実際のサンプルスニペットです。

```yaml
jobs:
    command-tests:
      docker:
        - image: cimg/base:current
      steps:
        - github-cli/install
        - run:
            name: verify Install
            command: command -v gh
```

この例では、 `github-cli/install` コマンドをテストしています。 このコマンドだけでは成功または失敗する場合がありますが、次のステップで GitHub CLI がインストールされており、コマンドラインで利用できるかを確認することもできます。 `gh` バイナリがこのパスになければ、このジョブはこのステップで失敗します。

必要に応じて、コマンドをテストするために複数のジョブを使用できます。Orb にコマンドがない場合は、そのようなジョブがない可能性があります。 `orb-tools/publish` ジョブが、お客様のテストを含むジョブを要求していることを確認してください。


### Orb ジョブのテスト
{: #testing-orb-jobs }

Orb 内でのジョブのテストは、コマンドのテストと非常によく似ています。 ただし、考慮すべき制限が他にいくつかあります。

まず、`test-deploy` ワークフローでは、上記のコマンドのテストで述べたように、`orb-tools/publish` ジョブは、最終的にはワークフローの中でそれ以前のすべてのジョブが完了している必要があります。 Orb のジョブをテストするには、ジョブをこのワークフローに追加して、`orb-tools/publish` ジョブでそれが求められていることを確認する必要があります。

以下は、CircleCI の [AWS ECR Orb](https://github.com/CircleCI-Public/aws-ecr-orb/blob/0c27bfab932b60f1c60a4c2e74bee114f8d4b795/.circleci/test-deploy.yml#L40) のサンプルです。

```yaml
# Shortened for this example
workflows:
  test-deploy:
    jobs:
      - aws-ecr/build-and-push-image:
          name: integration-tests-default-profile
          tag: integration,myECRRepoTag
          dockerfile: sample/Dockerfile
          executor: amd64
          post-steps:
            - run:
                name: "Delete repository"
                command: aws ecr delete-repository
          filters:
            tags:
              only: /.*/
# ...
      - orb-tools/publish:
          orb-name: circleci/aws-ecr
          vcs-type: << pipeline.project.type >>
          pub-type: production
          requires:
            - integration-tests-default-profile
          context: orb-publisher
          filters:
            branches:
              ignore: /.*/
            tags:
              only: /^v[0-9]+\.[0-9]+\.[0-9]+$/
```

AWS ECR Orb には、イメージをビルドし AWS ECR リポジトリにプッシュする、"build-and-push-image" という名前のジョブが含まれています。 このジョブや他のジョブを複数のパラメーター オプションを使用して実行し、コードを変更するたびに機能をテストします。

新たなステップを追加してコマンドをテストする方法と同様に、 [post-steps](https://circleci.com/docs/2.0/configuration-reference/#pre-steps-and-post-steps-requires-version-21) を利用してジョブ環境でバリデーションしたり、このサンプルで示すように、ジョブで作成したものをすべて「クリーンアップ」したりすることもできます。 Post-Step は、既存のジョブの最後に挿入可能な追加のステップです。

## 次の手順
{: #whats-next }

Orb の新しい機能を追加し、CI にパスする適切なテストを作成できたら、Orb レジストリに Orb をパブリッシュしましょう。 本番対応の Orb をリリースする方法については、[Orb のパブリッシュ]({{site.baseurl}}/ja/2.0/creating-orbs/)を参照してください。

## 関連項目
{: #see-also }

- CircleCI Orb の概要については、[Orb のコンセプト]({{site.baseurl}}/ja/2.0/orb-concepts/)を参照してください。
- ワークフローやジョブで使用する Orb については、[Orb のパブリッシュ]({{site.baseurl}}/ja/2.0/creating-orbs/)を参照してください。
- 再利用可能な Orb、コマンド、パラメーター、Executor のサンプルについては、[再利用可能な設定ファイル リファレンスガイド]({{site.baseurl}}/ja/2.0/reusing-config/)を参照してください。
