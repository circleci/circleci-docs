---
layout: classic-docs
title: "Orb のテスト手法"
short-title: "テスト手法"
description: "CircleCI Orbs のテストに関する入門ガイド"
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

Orbs are open source and contributions are expected, therefore, as with all software, setting up a solid testing pipeline for your orb is important. Because orbs are created in YAML, it may seem difficult to test them effectively. With the orb development kit, there is a simple path to implementing a full range of robust tests for your orb.

## バリデーション
{: #validation }

The most basic forms of testing for orbs are configuration validation and code linting. When an orb is packed and published it must be both valid YAML, and valid CircleCI syntax. Both of these checks are automatically applied when using the orb development kit, through the CI/CD pipeline set out in the project's config file at `.circleci/config.yml`. Config validation and code linting can also be performed manually, locally.

```yaml
# Snippet from test-pack workflow
test-pack:
    unless: << pipeline.parameters.run-integration-tests >>
    jobs:
      - orb-tools/lint # Lint Yaml files
      - orb-tools/pack # Pack orb source + validate config
      - shellcheck/check:
          dir: ./src/scripts
          exclude: SC2148
```

When you first make a commit to your orb repository, the [test-pack](https://github.com/CircleCI-Public/Orb-Project-Template/blob/43712ad367f2f3b06b2ae46e43ddf70bd3d83222/.circleci/config.yml#L40) workflow is triggered, which contains several jobs related to validating and testing your orb.

Learn more about what is included in orb project config files in the [Orb Publishing Process]({{site.baseurl}}/2.0/creating-orbs) guide.

### YAML lint
{: #yaml-lint }

The first job listed within the workflow, `orb-tools/lint`, is from the [`orb-tools` orb](https://circleci.com/developer/orbs/orb/circleci/orb-tools), which is a major component of the orb development kit. The `orb-tools/lint` job is responsible for basic YAML linting. You can modify the linting rules or other settings via the [job's parameters, which are listed on the orb registry](https://circleci.com/developer/orbs/orb/circleci/orb-tools#jobs-lint).

### Config validation
{: #config-validation }

The `test-pack` workflow will run the [orb-tools/pack](https://circleci.com/developer/orbs/orb/circleci/orb-tools#jobs-pack) job, in parallel with your YAML linting job (`orb-tools/lint`), to automatically pack and validate the configuration.

A singular `orb.yml` file (a packed orb) can be validated with the CircleCI CLI via `circleci orb validate orb.yml`. However, using the orb development kit, we rarely work out of singular YAML files. Instead, your configuration file is automatically validated after it has been packed with the `circleci orb pack <dir> > orb.yml` command.

### ShellCheck
{: #shellcheck }

One of the major benefits of using the orb development kit is the ability to import external bash scripts into your final orb. Because you can keep your bash scripts in the [src/scripts](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/scripts) directory, you can run additional tests against your scripts.

The most basic tests to run against bash scripts are a form of validation: "shellchecking". This is similar to a linter for Bash, you can find out more at [shellcheck.net](https://www.shellcheck.net/).

In the `test-pack` workflow, you will find the [shellcheck orb](https://circleci.com/developer/orbs/orb/circleci/shellcheck) is included. The shellcheck orb steps are completely optional and can be removed, especially, if your orb does not require scripts to be imported.

## Unit testing
{: #unit-testing }

If you are taking advantage of the orb development kit's [`<<include(file)>>` file inclusion]({{site.baseurl}}/2.0/orb-concepts/#file-include-syntax) feature and `src/scripts` directory to store and source your bash files, you can write true integration tests for your scripts.

![Unit testing BASH with BATS-Core]({{site.baseurl}}/assets/img/docs/bats_tests_example.png)

The `test-pack` workflow includes the [bats/run](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/.circleci/config.yml#L49) job, which is responsible for automatically executing [.bats](#bats-core) tests within the `src/tests` directory.

When you initialize your orb, the [greet.yml](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/commands/greet.yml) command is generated, which _includes_ the [greet.sh](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/scripts/greet.sh) shell script. Also included, is a test case example using the [BATS-Core (Bash Automation Testing System)](#bats-core) framework, in the `src/tests` directory, named [greet.bats](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/tests/greet.bats)

{:.tab.unitTest.greet-yaml}

```yaml

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

{:.tab.unitTest.greet-sh}

```bash
# ソース: https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/scripts/greet.sh

Greet() {
    echo Hello "${PARAM_TO}"
}

# BATS-Core テスト用に呼びされていない場合は実行しません。
# 詳細は src/tests を参照してください。
ORB_TEST_ENV="bats-core"
if [ "${0#*$ORB_TEST_ENV}" == "$0" ]; then
    Greet
fi
# View src/tests for more information.
# View src/tests for more information.
ORB_TEST_ENV="bats-core"
if [ "${0#*$ORB_TEST_ENV}" == "$0" ]; then
    Greet
fi

```

{:.tab.unitTest.greet-bats}
```bash
# ソース: https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/tests/greet.bats

# 各テストの前に実行
setup() {
    # Load our script file.
    source ./src/scripts/greet.sh
}

@test '1: Greet the world' {
    # 環境変数または機能をエクスポートによりモックする (スクリプトの読み込み後)
    export PARAM_TO="World"
    # "Greet" 関数の出力を取得する
    result=$(Greet)
    [ "$result" == "Hello World" ]
}

```

### BATS-Core
{: #bats-core }

The [Bash Automation Testing System](https://github.com/bats-core/bats-core) is an open source testing framework that provides a simple way to test UNIX programs.

Within your [src/tests](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/tests) is a [README](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/tests/README.md) with a full and updated tutorial for creating BATS test cases.

Each `.bats` file within the [src/tests](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/tests) directory will be automatically loaded and tested by the [bats/run](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/.circleci/config.yml#L49) job provided by the [bats orb](https://circleci.com/developer/orbs/orb/circleci/bats).

#### 例
{: #example }

For a real-life example, take a look at the tests in our [Shellcheck orb](https://github.com/CircleCI-Public/shellcheck-orb/blob/master/src/tests/check-test.bats).

Remember, including bats tests are optional and can be removed from your configuration file if desired.
{: class="alert alert-warning"}

Here is a simplified snippet from the Shellcheck orb's BATS test suite.

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
    # 標準的な POSIX テスト コマンドを使用して "Run_ShellCheck" 関数の機能をテストします。
}
}
}
```

## Integration testing
{: #integration-testing }

Up until this point, all testing has happened prior to packing the orb, and is applied to the code itself, not the finalized functioning orb. For the final, critical part of orb testing, you will test your orb commands and jobs to ensure they work as intended in production. This happens after the validation tests have run and a new development version of your orb is published.

After the development version of your orb has been published, the [integration-test_deploy](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/.circleci/config.yml#L78) workflow will be triggered automatically to test it.

The `integration-test_deploy` workflow runs a series of final integration tests, and if all pass, and you are on your main deployment branch, you can deploy your orb.

### Testing orb commands
{: #testing-orb-commands }

The first job you will see in the [integration-test_deploy](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/.circleci/config.yml#L78) workflow is the [integration-test-1](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/.circleci/config.yml#L82) job, a sample integration test included with the `hello-world` orb, generated by the `orb-init` command.

You can see the definition of the [`integration-test-1` job](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/.circleci/config.yml#L27) above in the `jobs` key.

```
  integration-test-1:
    docker:
      - image: cimg/base:stable
    steps:
      - checkout
      - <orb-name>/greet
```

In your local version, `<orb-name>` will be replaced by the orb name you provided. This job offers a way for us to test our orb's jobs in a real CircleCI environment.

Replace  the steps of this job with commands from your orb. You could include a sample project if needed or otherwise just run your orb's commands to ensure they do not result in a failure.

### Testing orb jobs
{: #testing-orb-jobs }

If we needed to test our orb's jobs, as well as commands, we can simply add our orb job right next to the `integration-test-1` job in our config under the [integration-test_deploy](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/.circleci/config.yml#L78) workflow.

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

Once you have added new orb features, and created passing tests, it is time to publish your orb to the Orb Registry. View the [Orb Publishing Process]({{site.baseurl}}/2.0/creating-orbs/) guide for information on automatically publishing semantically versioned orbs.

## See also
{: #see-also }

- CircleCI の Orb の基本的な概念については、「[Orb のコンセプト]({{site.baseurl}}/2.0/orb-concepts/)」を参照してください。
- ワークフローやジョブで使用する Orb については、「[Orb のパブリッシュ]({{site.baseurl}}/2.0/creating-orbs/)」を参照してください。
- 再利用可能な Orb、コマンド、パラメーター、Executor の例については、「[再利用可能な設定ファイル リファレンス ガイド]({{site.baseurl}}/2.0/reusing-config/)」を参照してください。
- 設定ファイル内で CircleCI Orbs を使用するための詳しいレシピは、「[CircleCI 構成クックブック]({{site.baseurl}}/2.0/configuration-cookbook/)」を参照してください。
