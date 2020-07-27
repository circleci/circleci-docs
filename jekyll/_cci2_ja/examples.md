---
layout: classic-docs
title: "設定ファイルをローカルでテストする"
description: "設定ファイルをローカルでテストする"
---

<div class="alert alert-info" role="alert">
<b>注:</b> このページはCircleCI API を使って設定ファイルのテストとバリデーションを行う方法について記載しています。
<a href="{{ site.baseurl }}/ja/2.0/local-cli/#概要">CircleCI CLI</a>をインストールすることでもローカルで設定ファイルの<a href="{{ site.baseurl }}/ja/2.0/local-cli/#circleci-のコンフィグのバリデーション">バリデーション</a>を行うこともできます。
</div>

設定ファイルをローカルでテストするためのスクリプトを追加するには以下の手順を実施してください。

1. シェルスクリプトを `run-build-locally.sh` などのファイル名で `.circleci` ディレクトリに作成します。
2. [こちらの手順]({{ site.baseurl }}/2.0/managing-api-tokens/#creating-a-personal-api-token)通りに API トークンを作成します。
3. コマンドラインで以下のように入力し、実行します。
    `export CIRCLE_TOKEN=<前の手順で生成したトークン文字列>`
    ※ < > は不要です。
4. 下記の情報を準備します。
    * ビルド対象のコミットハッシュ
    * ユーザー名
    * プロジェクトソース
    * プロジェクト名
    * ビルド対象のブランチ
5. 用意した情報を下記のシェルスクリプトに適用します。

```bash
#!/usr/bin/env bash
curl --user ${CIRCLE_TOKEN}: \
    --request POST \
    --form revision=<コミットハッシュ>\
    --form config=@config.yml \
    --form notify=false \
        https://circleci.com/api/v1.1/project/<プロジェクトソース (例： github) >/<ユーザー名>/<プロジェクト名>/tree/<ブランチ>
```

このシェルスクリプトを実行すると、リポジトリを介してプッシュすることなく `config.yml` ファイルの内容をデバッグできます。

## 関連情報

[CircleCI CLIをローカルで実行する]({{ site.baseurl }}/ja/2.0/local-cli/)
