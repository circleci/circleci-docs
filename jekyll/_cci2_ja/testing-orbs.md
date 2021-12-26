---
layout: classic-docs
title: "Orb のテスト手法"
short-title: "テスト手法"
description: "CircleCI Orb のテストに関する入門ガイド"
categories:
  - getting-started
order: 1
version:
  - クラウド
---

Orb のテストに関するベスト プラクティスを説明します。

* TOC
{:toc}

## はじめに
{: #introduction }

Orb はオープン ソースであり他者が手を加えられるので、すべてのソフトウェアと同様に、Orb 用に厳格なテスト パイプラインを作成することが重要です。 Orb は YAML 形式で作成するので、効率的にテストを行うのは難しいと思うかもしれません。 しかし、Orb 開発キットがあれば、Orb について厳密かつ網羅的なテストを簡単に実装できます。

## バリデーション
{: #validation }

Orb のテストで最も基本的なものは、設定ファイルのバリデーションとコードの構文チェックです。 パッケージ化およびパブリッシュする Orb は、有効な YAML 形式であり、かつ CircleCI の構文に従っている必要があります。 Orb 開発キットを使用していれば、これら両方のチェックは、プロジェクトの設定ファイル `.circleci/config.yml` に定められた CI/CD パイプラインにより自動で行われます。 また、ローカル環境において手動で実施することも可能です。

```yaml
# test-pack ワークフローのスニペット
test-pack:
    unless: << pipeline.parameters.run-integration-Tests >>
    jobs:
      - orb-tools/lint # YAML ファイルの構文チェック
      - orb-tools/pack # Orb ソースのパッケージ化と設定ファイルのバリデーション
      - shellcheck/check:
          dir: ./src/scripts
          exclude: SC2148
```

Orb リポジトリへの初回コミット時には、[test-pack](https://github.com/CircleCI-Public/Orb-Project-Template/blob/43712ad367f2f3b06b2ae46e43ddf70bd3d83222/.circleci/config.yml#L40) ワークフローがトリガーされ、Orb のバリデーションとテスト関係のジョブが複数実行されます。

Orb プロジェクトの設定ファイルの中身について詳しくは、「[Orb のパブリッシュ]({{site.baseurl}}/ja/2.0/creating-orbs)」ガイドを参照してください。

### YAML 構文チェック
{: #yaml-lint }

上記ワークフローの最初にあるジョブ `orb-tools/lint` は、Orb 開発キットの主要コンポーネントである [`orb-tools` Orb](https://circleci.com/developer/ja/orbs/orb/circleci/orb-tools) のジョブです。 この `orb-tools/lint` ジョブは、基本的な YAML 構文チェックを行います。 ジョブのパラメーターで構文チェックのツールやその他の設定を変更できます。 詳しくは、[Orb レジストリのページ](https://circleci.com/developer/ja/orbs/orb/circleci/orb-tools#jobs-lint)を参照してください。

### コンフィグの検証
{: #config-validation }

`test-pack` ワークフローでは、YAML 構文チェック ジョブ (`orb-tools/lint`) と並列で [orb-tools/pack](https://circleci.com/developer/ja/orbs/orb/circleci/orb-tools#jobs-pack) ジョブも実行し、自動的に設定ファイルのパッケージ化とバリデーションを行います。

単一の `orb.yml` ファイル (パッケージ化された Orb) であれば、CircleCI CLI の `circleci orb validate orb.yml` でバリデーションできます。 一方で、Orb 開発キットを使用する場合、YAML ファイル 1 つだけを扱うことはめったにありません。 その代わりに、設定ファイルは `circleci orb pack <dir> > orb.yml` コマンドでパッケージ化された後、自動的にバリデーションされます。

### ShellCheck
{: #shellcheck }

Orb 開発キットを使用することの大きなメリットとして、完成版の Orb に外部の bash スクリプトをインポートできることがあります。 bash スクリプトは [src/scripts](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/scripts) ディレクトリに配置するので、スクリプトに対する別のテストも実行できます。

bash スクリプトのテストで最も基本的なものは、"ShellCheck" というバリデーション ツールです。 これは bash 用の構文チェック ツールというべきもので、詳細は [shellcheck.net](https://www.shellcheck.net/) に記載されています。

`test-pack` ワークフローでは、[ShellCheck Orb](https://circleci.com/developer/ja/orbs/orb/circleci/shellcheck) を使用します。 ShellCheck Orb のステップはすべて省略可能であり、特に Orb でスクリプトのインストールが不要な場合などは削除してかまいません。

## 単体テスト
{: #unit-testing }

Orb 開発キットの [`<<include(file)>>` ファイル インクルード]({{site.baseurl}}/2.0/orb-concepts/#file-include-syntax)機能を使っており、`src/scripts` に bash ファイルを保存して読み込む場合、スクリプト向けの完全な結合テストを作成できます。

![BATS-Core を使用した bash スクリプトの単体テスト]({{site.baseurl}}/assets/img/docs/bats_tests_example.png)

`test-pack` ワークフローには [bats/run](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/.circleci/config.yml#L49) ジョブが含まれており、このジョブにより `src/tests` ディレクトリ内にある [.bats](#bats-core) テストが自動で実行されます。

Orb を初期化すると、[greet.sh](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/scripts/greet.sh) シェル スクリプトを_インクルード_する [greet.yml](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/commands/greet.yml) コマンドが生成されます。 また、`src/tests` ディレクトリに、[BATS-Core (Bash Automation Testing System)](#bats-core) フレームワークを使用したテスト ケース サンプルである [greet.bats](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/tests/greet.bats) も生成されます。

{:.tab.unitTest.greet-yaml}

```yaml

# Source: https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/commands/greet.yml

description: >
  This command echos "Hello World" using file inclusion.
parameters:
  to:
    type: string
    default: "World"
    description: "Hello to whom?"
steps:
  - run:
      environment:
        PARAM_TO: <<parameters.to>>
      name: Hello Greeting
      command: <<include(scripts/greet.sh)>>

```

{:.tab.unitTest.greet-sh}

```bash
# Source: https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/scripts/greet.sh

Greet() {
    echo Hello "${PARAM_TO}"
}

# Will not run if sourced for bats-core tests.
# View src/tests for more information.
ORB_TEST_ENV="bats-core"
if [ "${0#*$ORB_TEST_ENV}" == "$0" ]; then
    Greet
fi

```

{:.tab.unitTest.greet-bats}
```bash
# Source: https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/tests/greet.bats

# Runs prior to every test
setup() {
    # Load our script file.
    source ./src/scripts/greet.sh
}

@test '1: Greet the world' {
    # Mock environment variables or functions by exporting them (after the script has been sourced)
    export PARAM_TO="World"
    # Capture the output of our "Greet" function
    result=$(Greet)
    [ "$result" == "Hello World" ]
}

```

### BATS-Core
{: #bats-core }

[Bash Automation Testing System](https://github.com/bats-core/bats-core) は、UNIX プログラムのテストを簡素化するためのオープン ソースのテスト フレームワークです。

[src/tests](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/tests) にある [README](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/tests/README.md) に、BATS テスト ケースの作成手順をすべて示した最新のチュートリアルが記載されています。

[src/tests](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/tests) ディレクトリにある各 `.bats` ファイルは、[BATS Orb](https://circleci.com/developer/ja/orbs/orb/circleci/bats) の [bats/run](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/.circleci/config.yml#L49) ジョブにより自動的に読み込まれ、テストされます。

#### 例
{: #example }

実際の使用例として、CircleCI 製の [ShellCheck Orb](https://github.com/CircleCI-Public/shellcheck-orb/blob/master/src/tests/check-test.bats) に含まれるテストを見てみましょう。

BATS テストのインクルードは必須ではなく、必要に応じて設定ファイルから削除してもかまいません。
{: class="alert alert-warning"}

ShellCheck Orb の BATS テスト スイートの簡略版スニペットを次に示します。

```bash
# example BATS test
setup() {
    # Sourcing our bash script allows us to acces to functions defined within.
    source ./src/scripts/check.sh
    # Our script expects certain envrionment variables which would be set as parameters.
    # We can "mock" those inputs here.
    export SC_PARAM_OUTPUT="/tmp/shellcheck.log"
    export SC_PARAM_SHELL="bash"
}

teardown() {
    # Logs are recorded in each function.
    # We will echo it out on error, but otherwise remove it to indicate no issue.
    rm -rf /tmp/shellcheck.log
}

# This is a test case in the BATS framework.
# This is essentially just a function with a name.
# For each test case, setup() will run -> test -> teardown() -> repeat.

# Ensure Shellcheck is able to find the two included shell scripts
@test "1: Shellcheck test - Find both scripts" {
    # Mocking inputs
    export SC_PARAM_DIR="src/scripts"
    export SC_PARAM_SEVERITY="style"
    export SC_PARAM_EXCLUDE="SC2148,SC2038,SC2059"
    Set_SHELLCHECK_EXCLUDE_PARAM
    Run_ShellCheck
    # Test that 2 scripts were found
    [ $(wc -l tmp | awk '{print $1}') == 2 ]
    # If an error is thrown anywhere in this test case, it will be considered a failure.
    # We use a standard POSIX test command to  test the functionality of the "Run_ShellCheck" function.
}
```

## 結合テスト
{: #integration-testing }

ここまでは、すべてのテストを Orb のパッケージ化前に実行し、完成版の Orb ではなくコード自体を対象としていました。 最後に最も重要な Orb のテストとして、Orb のコマンドとジョブをテストし、本番環境で意図したとおりに動作するかを確認します。 このテストは、バリデーション テストを実行して新しい開発版の Orb がパブリッシュされた後に行われます。

開発版の Orb がパブリッシュされると、[integration-test_deploy](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/.circleci/config.yml#L78) ワークフローが自動的にトリガーされ、Orb をテストします。

`integration-test_deploy` ワークフローでは、一連の最終結合テストを実行します。 これらすべてのテストに合格した場合、メインのデプロイメント ブランチに移動し、Orb をデプロイすることができます。

### Testing orb commands
{: #testing-orb-commands }

[integration-test_deploy](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/.circleci/config.yml#L78) ワークフローの最初のジョブは [integration-test-1](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/.circleci/config.yml#L82) ジョブです。 これは、`orb-init` コマンドで生成される `hello-world` Orb に含まれるサンプルの結合テストです。

[`integration-test-1` ジョブ](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/.circleci/config.yml#L27) の定義は、上部の `jobs` キーで確認できます。

```
  integration-test-1:
    docker:
      - image: cimg/base:stable
    steps:
      - checkout
      - <orb-name>/greet
```

ローカル バージョンでは、`<orb-name>` は指定した Orb 名に置き換えられます。 このジョブを利用することで、実際の CircleCI 環境で Orb のジョブをテストすることができます。

このジョブのステップを、Orb のコマンドに置き換えます。 必要に応じてサンプル プロジェクトを含めたり、Orb のコマンドだけを実行してエラーが発生しないことを確認したりすることもできます。

### Testing orb jobs
{: #testing-orb-jobs }

Orb のコマンドだけでなくジョブもテストする必要がある場合は、設定ファイルで、[integration-test_deploy](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/.circleci/config.yml#L78) ワークフローの `integration-test-1` のすぐ下にテストする Orb ジョブを追加します。

```
integration-test_deploy:
    when: << pipeline.parameters.run-integration-tests >>
    jobs:
      - integration-test-1
      - my-orb/orb-job
      - orb-tools/dev-promote-prod-from-commit-subject:
          requires:
            - integration-test-1
            - my-orb/orb-job
```

## What's next?
{: #whats-next }

Orb の新しい機能を追加し、適切なテストを作成できたら、Orb レジストリに Orb をパブリッシュしましょう。 セマンティック バージョンの Orb を自動的にパブリッシュする方法について、「[Orb のパブリッシュ]({{site.baseurl}}/ja/2.0/creating-orbs/)」を参照してください。

## 関連項目
{: #see-also }

- CircleCI の Orb の基本的な概念については、「[Orb のコンセプト]({{site.baseurl}}/ja/2.0/orb-concepts/)」を参照してください。
- ワークフローやジョブで使用する Orb については、「[Orb のパブリッシュ]({{site.baseurl}}/ja/2.0/creating-orbs/)」を参照してください。
- 再利用可能な Orb、コマンド、パラメーター、Executor の例については、「[再利用可能な設定ファイル リファレンス ガイド]({{site.baseurl}}/ja/2.0/reusing-config/)」を参照してください。
- 設定ファイル内で CircleCI Orb を使用するための詳しいレシピは、「[CircleCI 設定クックブック]({{site.baseurl}}/ja/2.0/configuration-cookbook/)」を参照してください。
