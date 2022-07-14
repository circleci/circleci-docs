---
layout: classic-docs
title: "Orb の手動オーサリングプロセス"
description: "Orb 開発キットを使用せずに、シンプルな Orb を手動でオーサリングする方法を説明します。"
version:
  - Cloud
---

ここでは、Orb 開発キットを使わずにシンプルな Orb を手動で作成する手順について説明します。 ただし、ほとんどの Orb プロジェクトでは、Orb 開発キットのご利用をおすすめします。 詳細は、[Orb のオーサリングプロセス]({{site.baseurl}}/ja/orb-author)を参照してください。

## 名前空間の作成
{: #create-a-namespace }

1. まだ名前空間を作成していない場合は、次のコマンドでユーザー/組織の名前空間を作成します。 希望する名前空間と GitHub 組織名を入力して実行してください。
```shell
circleci namespace create <name> --org-id <your-organization-id>
```

## Orb の作成
{: #create-your-orb }

1. 名前空間内に Orb を作成します。 この段階では Orb のコンテンツは何も生成されませんが、Orb をパブリッシュするときために名前が予約されます。 **CircleCI Server をご利用の場合は、`--private` フラグが使われており、Orb がインストール環境内でプライベートになっていることを確認してください。 **[パブリック]({{site.baseurl}}/orb-intro/#public-orbs)** Orb を作成する場合:</li> </ol>
```shell
circleci orb create <my-namespace>/<my-orb-name>
```
**[プライベート]({{site.baseurl}}/orb-intro/#private-orbs)** Orb を作成する場合:
```shell
circleci orb create <my-namespace>/<my-orb-name> --private
```

1. YAML ファイル形式で Orb のコンテンツを作成します。 以下のシンプルな例を参考にしてください。
```yaml
version: 2.1
description: あいさつコマンド Orb
commands:
    greet:
        description: 相手に "Hello" とあいさつします。
        parameters:
            to:
                type: string
                default: World
        steps:
            - run: echo "Hello, << parameters.to >>"
```

## Orb のバリデーション
{: #validate-your-orb }

1. CLI を使用して、Orb コードをバリデーションします。
```
circleci orb validate /tmp/orb.yml
```

## Orb のパブリッシュ
{: #publish-your-orb }

1. 開発版の Orb をパブリッシュします。
```shell
circleci orb publish /tmp/orb.yml <my-namespace>/<my-orb-name>@dev:first
```

1. Orb を安定版にプッシュする準備が整ったら、`circleci orb publish` を使用して手動でパブリッシュするか、開発版から直接プロモートすることができます。 以下のコマンドを使用すると、開発版のバージョン番号を `0.0.1` にインクリメントできます。
```shell
circleci orb publish promote <my-namespace>/<my-orb-name>@dev:first patch
```

1. 安定版の Orb が変更不可形式でパブリッシュされ、CircleCI プロジェクトで安全に使用できるようになりました。 以下のコマンドを使用して、Orb のソースをプルします。
```shell
circleci orb source <my-namespace>/<my-orb-name>@0.0.1
```

## 利用可能な Orb の一覧表示
{: #list-available-orbs }

1. CLI を使用して、公開中の Orb を一覧表示します。

**[パブリック]({{site.baseurl}}/orb-intro/#public-orbs)** Orb を一覧表示する場合:
```shell
circleci orb list <my-namespace>
```

**[プライベート]({{site.baseurl}}/orb-intro/#private-orbs)** Orb を一覧表示する場合:
```shell
circleci orb list <my-namespace> --private
```

## 次のステップ
{: #next-steps }

`circleci orb` コマンドの使用方法の詳細については、[CLI に関するドキュメント](https://circleci-public.github.io/circleci-cli/circleci_orb.html)を参照してください。
