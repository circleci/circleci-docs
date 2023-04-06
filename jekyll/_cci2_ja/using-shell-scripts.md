---
layout: classic-docs
title: "シェル スクリプトの使用"
description: "CircleCI 設定ファイルでのシェルスクリプト使用に関するベストプラクティス"
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
---

## 概要
{: #overview }

CircleCI の設定では、シェルスクリプトの記述が必要になることは少なくありません。 シェルスクリプトを使用すると、ビルドをより細かく制御できますが、エラーが発生する可能性があります。 以下に説明するベストプラクティスを参照すれば、これらのエラーの多くを回避することができます。

## シェルスクリプトのベストプラクティス
{: #shell-script-best-practices }

### ShellCheck の使用
{: #use-shellcheck }

[ShellCheck](https://github.com/koalaman/shellcheck) は、シェル スクリプトの静的解析ツールです。bash/sh シェル スクリプトに対して警告と提案を行います。

ShellCheck を `version: 2.1` の設定に追加するには、[ShellCheck Orb](https://circleci.com/ja/developer/orbs/orb/circleci/shellcheck) の使用が最も簡単な方法です ( 必ず `x.y.z` を有効なバージョンに変更してください)。

```yaml
version: 2.1

orbs:
  shellcheck: circleci/shellcheck@x.y.z

workflows:
  check-build:
    jobs:
      - shellcheck/check # job defined within the orb so no further config necessary
      - build-job:
          requires:
            - shellcheck/check # only run build-job once shellcheck has run
          filters:
            branches:
              only: main # only run build-job on main branch

jobs:
  build-job:
    ...
```

または、version 2 の設定をご使用の場合は、 Orb を使わなくても ShellCheck を設定できます。

```yaml
version: 2
jobs:
  shellcheck:
    docker:
      - image: koalaman/shellcheck-alpine:stable
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run:
          name: Check Scripts
          command: |
            find . -type f -name '*.sh' | wc -l
            find . -type f -name '*.sh' | xargs shellcheck --external-sources
  build-job:
    ...

workflows:
  version: 2
  check-build:
    jobs:
      - shellcheck
      - build-job:
          requires:
            - shellcheck # only run build-job once shellcheck has run
          filters:
            branches:
              only: main # only run build-job on main branch
```

ShellCheck と共に `set -o xtrace` / `set -x` を使用する際は注意が必要です。 シェルがシークレットな環境変数を展開する場合、以下のように機密性の高くない方法で公開されてしまいます。
{: class="alert alert-info" }

上述したように、この `tmp.sh` スクリプトファイルでは、公開すべきでない部分まで公開されています。

```shell
> cat tmp.sh
#!/bin/sh

set -o nounset
set -o errexit
set -o xtrace

if [ -z "${SECRET_ENV_VAR:-}" ]; then
  echo "You must set SECRET_ENV_VAR!" fi
> sh tmp.sh
+ '[' -z '' ']'
+ echo 'You must set SECRET_ENV_VAR!'
You must set SECRET_ENV_VAR!
> SECRET_ENV_VAR='s3cr3t!' sh tmp.sh
+ '[' -z 's3cr3t!' ']'
```

### エラーフラグの設定
{: #set-error-flags }

いくつかのエラーフラグを設定することで、好ましくない状況が発生した場合にスクリプトを自動的に終了できます。 厄介なエラーを回避するために、各スクリプトの先頭に以下のフラグを追加することをお勧めします。

```shell
#!/usr/bin/env bash

# Exit script if you try to use an uninitialized variable.
set -o nounset

# Exit script if a statement returns a non-true return value.
set -o errexit

# Use the error status of the first failure, rather than that of the last item in a pipeline.
set -o pipefail
```

## シェルスクリプトの実行
{: #run-a-shell-script }

ターミナルで、実行するスクリプトのフォルダ/場所に移動します。 `ls` を使用すると、スクリプトの正しいパスにいることを確認できます。 次にターミナルで以下を実行します。

```bash
sh <name-of-file>.sh
```

場合によっては、スクリプトがデフォルトで実行できないことがあり、実行する前にファイルを実行可能な状態にする必要があります。 このプロセスはプラットフォームによって異なり、お客様のプラットフォームでの方法を調べる必要があります。 たとえば、スクリプトファイル上で右クリックすると、実行可能にするオプションがあるかを確認できる場合があります。 macOS または Linux を使用している場合は、`chmod`コマンドを使用して、異なる権限でスクリプトファイルを実行可能にする方法を確認することができます。

## 関連リソース
{: #additional-resources }
{:.no_toc}

堅牢な Bash シェルスクリプトの記述に関する詳しい説明と追加テクニックについては、[こちらのブログ記事](https://www.davidpashley.com/articles/writing-robust-shell-scripts)を参照してください。
