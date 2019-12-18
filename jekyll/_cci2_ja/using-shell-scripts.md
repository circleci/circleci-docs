---
layout: classic-docs
title: "シェルスクリプトの使用"
short-title: "シェルスクリプトの使用"
description: "CircleCI 設定でのシェルスクリプト使用に関するベストプラクティス"
categories:
  - getting-started
order: 10
---

[CircleCI 設定]({{ site.baseurl }}/ja/2.0/configuration-reference/)でシェルスクリプトを使用するうえでのベストプラクティスについて、以下のセクションに沿って説明します。

+ 目次
{:toc}

## 概要

CircleCI を設定するときに、シェルスクリプトの記述が必要になることは少なくありません。 シェルスクリプトを作成すると、ビルドをきめ細かく制御できるようになりますが、些細なエラーにつながりやすいため、繊細なテクニックが求められる作業です。 以下に説明するベストプラクティスを参照すれば、これらのエラーの多くを回避することができます。

## シェルスクリプトのベストプラクティス

### ShellCheck の使用

{:.no_toc}

[ShellCheck](https://github.com/koalaman/shellcheck) は、シェルスクリプトの静的解析ツールです。bash/sh シェルスクリプトに対して警告と提案を行います。

CircleCI で ShellCheck を最も効果的に使用するには、このツールを `.circleci/config.yml` ファイルに個別のジョブとして追加します。 こうすると、ワークフロー内で `shellcheck` ジョブを他のジョブと並列に実行できます。

```yaml
version: 2
jobs:
  shellcheck:
    docker:
      - image: koalaman/shellcheck-alpine:stable
    steps:
      - checkout
      - run:
          name: スクリプトをチェック
          command: |
            find . -type f -name '*.sh' | wc -l
            find . -type f -name '*.sh' | xargs shellcheck --external-sources
  build-job:
    ...

workflows:
  version: 2
  workflow:
    jobs:

      - shellcheck
      - build-job:
          requires:
            - shellcheck
          filters:
            branches:
              only: master
```

**メモ**：ShellCheck と共に `set -o xtrace` / `set -x` を使用するときには注意が必要です。 シェルがシークレットな環境変数を展開すると、機密性の高くない方法で公開されてしまいます。 以下の例では、`tmp.sh` スクリプトファイルによって、公開すべきでない部分まで公開されています。

```
> cat tmp.sh
#!/bin/sh

set -o nounset
set -o errexit
set -o xtrace

if [ -z "${SECRET_ENV_VAR:-}" ]; then
  echo "You must set SECRET_ENV_VAR!"
fi
> sh tmp.sh

+ '[' -z '' ']'
+ echo 'You must set SECRET_ENV_VAR!'
You must set SECRET_ENV_VAR!
> SECRET_ENV_VAR='s3cr3t!' sh tmp.sh
+ '[' -z 's3cr3t!' ']'
```

### エラーフラグの設定

{:.no_toc}

いくつかのエラーフラグを設定することで、好ましくない状況が発生した場合にスクリプトを自動的に終了できます。 厄介なエラーを回避するために、各スクリプトの先頭に以下のフラグを追加することをお勧めします。

```bash
#!/usr/bin/env bash

# 初期化されていない変数が使用された場合にスクリプトを終了します。
set -o nounset

# ステートメントが true 以外の戻り値を返した場合にスクリプトを終了します。
set -o errexit

# パイプライン内の最後の項目ではなく、最初の障害のエラーステータスを使用します。
set -o pipefail
```

## 関連項目

堅牢なシェルスクリプトの作成に関する詳しい説明と他のテクニックについては、[こちらのブログ記事](https://www.davidpashley.com/articles/writing-robust-shell-scripts)を参照してください。
