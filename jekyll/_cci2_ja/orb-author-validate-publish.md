---
layout: classic-docs
title: "Orb の手動オーサリング プロセス"
description: "Orb 開発キットを使用せずに、シンプルな Orb を手動でオーサリングする方法を説明します。"
version:
  - Cloud
---

ここでは、Orb 開発キットを使わずにシンプルな Orb を手動で作成する手順について説明します。 ただし、ほとんどの Orb プロジェクトでは、Orb 開発キットのご利用をおすすめします。詳細は「[Orb のオーサリング プロセス]({{site.baseurl}}/2.0/orb-author)」を参照してください。

1. まだ名前空間を作成していない場合は、次のコマンドでユーザー/組織の名前空間を作成します。希望する名前空間とGitHub 組織名を代入して実行してください。

```sh
circleci namespace create <my-namespace> github <my-gh-org>
```
**メモ:** CircleCI CLI から名前空間を作成する場合は、VCS プロバイダーを指定してください。

1. 名前空間内に Orb を作成します。 この段階では Orb のコンテンツは何も生成されませんが、Orb をパブリッシュするときの名前が予約されます。

**[パブリック](https://circleci.com/docs/ja/2.0/orb-intro/#%E3%83%91%E3%83%96%E3%83%AA%E3%83%83%E3%82%AF-Orbs)** Orb を作成する場合:
```sh
circleci orb create <my-namespace>/<my-orb-name>
```

**[プライベート](https://circleci.com/docs/ja/2.0/orb-intro/#%E3%83%97%E3%83%A9%E3%82%A4%E3%83%99%E3%83%BC%E3%83%88-Orbs)** Orb を作成する場合:
```sh
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

1. CLI を使用して、Orb コードをバリデーションします。
```
circleci orb validate /tmp/orb.yml
```

1. 開発版の Orb をパブリッシュします。
```sh
circleci orb publish /tmp/orb.yml <my-namespace>/<my-orb-name>@dev:first
```

1. Orb を本番にプッシュする準備が整ったら、`circleci orb publish` を使用して手動でパブリッシュするか、開発バージョンから直接プロモートすることができます。 以下のコマンドを使用すると、開発バージョン番号を `0.0.1` にインクリメントできます。
```sh
circleci orb publish promote <my-namespace>/<my-orb-name>@dev:first patch
```

1. 安定版の Orb が変更不可形式でパブリッシュされ、CircleCI プロジェクトで安全に使用できるようになりました。 以下のコマンドを使用して、Orb のソースをプルします。
```sh
circleci orb source <my-namespace>/<my-orb-name>@0.0.1
```

1. CLI を使用して、公開中の Orb を一覧表示します。

**[パブリック](https://circleci.com/docs/ja/2.0/orb-intro/#%E3%83%91%E3%83%96%E3%83%AA%E3%83%83%E3%82%AF-Orbs)** Orb を一覧表示する場合:
```sh
circleci orb list <my-namespace>
```

**[プライベート](https://circleci.com/docs/ja/2.0/orb-intro/#%E3%83%97%E3%83%A9%E3%82%A4%E3%83%99%E3%83%BC%E3%83%88-Orbs)** Orb を一覧表示する場合:
```sh
circleci orb list <my-namespace> --private
```

`circleci orb` コマンドの使用方法の詳細については、[CLI に関するドキュメント](https://circleci-public.github.io/circleci-cli/circleci_orb.html)を参照してください。
