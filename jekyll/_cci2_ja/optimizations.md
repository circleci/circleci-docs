---
layout: classic-docs
title: "最適化"
short-title: "最適化"
description: "CircleCI 2.0 ビルドの最適化"
categories:
  - getting-started
order: 1
---

以下のサンプルスニペットを使用して、ジョブ実行、ワークフロー、イメージのビルドをスピードアップさせましょう。

## 依存関係のキャッシュ

{% raw %}

        steps: # 実行可能コマンドの集合
          - checkout # ソースコードを作業ディレクトリにチェックアウトする特別なステップ
          - restore_cache: # Branch キーテンプレートファイルまたは requirements.txt ファイルが前回の実行時から変更されていない場合、保存されている依存関係キャッシュを復元します
              key: deps1-{{ .Branch }}-{{ checksum "requirements.txt" }}
          - run: # pip を使用して、仮想環境をインストールしてアクティブ化します
              command: |
                python3 -m venv venv
                . venv/bin/activate
                pip install -r requirements.txt
          - save_cache: # 依存関係キャッシュを保存する特別なステップ
              key: deps1-{{ .Branch }}-{{ checksum "requirements.txt" }}
              paths:
                - "venv"
    

{% endraw %}

## 並列処理

    # ~/.circleci/config.yml
    version: 2
    jobs:
      docker:
        - image: circleci/<language>:<version TAG>
      test:
        parallelism: 4
    

## Docker レイヤーキャッシュ

Docker レイヤーキャッシュ (DLC) はプレミアム機能です。お使いのアカウントでこの有料の機能を有効にするには、サポートチケットをオープンする必要があります。

    version: 2
    jobs:
     build:
       docker:
         # ここでは、DLC は何もしません。キャッシュの状況は、イメージレイヤーにどれだけ共通点があるかによって左右されます。
          - image: circleci/node:9.8.0-stretch-browsers
        steps:
          - checkout
          - setup_remote_docker:
              docker_layer_caching: true
          # ここでは、DLC はレイヤーを明示的にキャッシュし、リビルドを避けようとします。
          - run: docker build .
    

## 関連項目

[CircleCI を設定する]({{ site.baseurl }}/2.0/configuration-reference/)