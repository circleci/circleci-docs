---
layout: classic-docs
title: "Orb の手動オーサリングプロセス"
description: "Orb 開発キットを使用せずに、シンプルな Orb を手動でオーサリングする方法を説明します。"
contentTags:
  platform:
    - クラウド
---

ここでは、Orb 開発キットを使わずにシンプルな [Orb]({{site.baseurl}}/ja/orb-intro) を手動で作成する手順について説明します。 ほとんどの Orb プロジェクトでは [Orb 開発キット]({{site.baseurl}}/ja/orb-development-kit)を使用することを推奨しています。

## 1. 名前空間の作成
{: #create-a-namespace }

まだ名前空間を作成していない場合は、次のコマンドでユーザー/組織の名前空間を作成します。 希望する名前空間と GitHub 組織名を入力して実行してください。
```shell
circleci namespace create <name> --org-id <your-organization-id>
```

## 2. Orb の作成
{: #create-your-orb }

名前空間内に Orb を作成します。 この段階では Orb のコンテンツは何も生成されませんが、Orb をパブリッシュするときために名前が予約されます。 **CircleCI Server をご利用の場合は、`--private` フラグが使われており、Orb がインストール環境内でプライベートになっていることを確認してください。 [パブリック]({{site.baseurl}}/ja/orb-intro/#public-orbs) Orb を作成する場合:</p>
```shell
circleci orb create <my-namespace>/<my-orb-name>
```
**[プライベート]({{site.baseurl}}/ja/orb-intro/#private-orbs)** Orb を作成する場合:
```shell
circleci orb create <my-namespace>/<my-orb-name> --private
```

YAML ファイル形式で Orb のコンテンツを作成します。 以下のシンプルな例を参考にしてください。
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

## 3. 設定のパッケージ化 (オプション)
{: #pack-a-configuration }

CLI パッケージ化コマンド (`circleci orb pack`とは異なる) を使うと、複数の個別ファイルから (ディレクトリ構造とファイルの内容に基づいて) 1 つの YAML ファイルを作成できます。 `pack` コマンドには、ディレクトリツリー内の複数ファイルにまたがる YAML ドキュメントを解析する [FYAML](https://github.com/CircleCI-Public/fyaml) が実装されています。 これは、容量の大きな Orb のソースコードを分割する際に特に便利で、Orb の YAML 設定ファイルの編成をカスタマイズできます。

```shell
circleci config pack
```

`pack` コマンドを使用するときのファイルの**名前**や**編成**に応じて、最終的にどのような `orb.yml` が出力されるかが決まります。 次のフォルダー構造を例に考えてみましょう。

```shell
$ tree
.
└── your-orb-source
    ├── @orb.yml
    ├── commands
    │   └── foo.yml
    └── jobs
        └── bar.yml

3 directories, 3 files
```

Unix の `tree` コマンドは、フォルダー構造の出力に大変便利です。 上記のツリー構造の例の場合、`pack` コマンドは、フォルダー名とファイル名を **YAML キー**にマップし、ファイルの内容を**値**として対応するキーにマップします。

次のコマンドにより、前述のフォルダー例が `pack` されます。

```shell
$ circleci config pack your-orb-source
```

出力は `.yml` ファイルに格納されます。

```yaml
# Contents of @orb.yml appear here
commands:
  foo:
    # contents of foo.yml appear here
jobs:
  bar:
    # contents of bar.yml appear here
```

### その他の設定ファイルのパッケージ化機能
{: #other-configuration-packing-capabilities }

`@` で始まるファイルの内容は、その親フォルダーのレベルにマージされます。 この機能は、汎用的な `orb.yml` にメタデータを格納したいものの、`orb` のキーと値のペアにはマップしたくない場合に、トップレベルの Orb で使用すると便利です。

たとえば以下のような場合、

```shell
$ cat foo/bar/@baz.yml
{baz: qux}
```

このファイルは、次のようにマップされます。

```yaml
bar:
  baz: qux
```

## 4. Orb のバリデーション
{: #validate-your-orb }

CLI を使用して、Orb コードをバリデーションします。

```
circleci orb validate /tmp/orb.yml
```

### 設定の処理 (オプション)
{: #processing-a-configuration }

次のコマンドを実行すると設定ファイルがバリデーションされると共に、展開されたソース設定ファイルが元の設定ファイルと一緒に表示されます (Orb を使用している場合に便利です)。

```shell
circleci config process
```

[`node`]https://circleci.com/developer/orbs/orb/circleci/node Orb を使用する次の設定を例に考えてみましょう。

```yml
version: 2.1

orbs:
  node: circleci/node@4.7.0

workflows:
  version: 2
  example-workflow:
      jobs:
        - node/test
```

次のコマンドを実行すると、下記の例のような YAML ファイルが出力されます (展開されたソースとコメントアウトされた元の設定が混在しています)。

```shell
circleci config process .circleci/config.yml
```
```yml
{% raw %}
# Orb 'circleci/node@4.7.0' resolved to 'circleci/node@4.7.0'
version: 2
jobs:
  node/test:
    docker:
    - image: cimg/node:13.11.0
      auth:
        username: mydockerhub-user
        password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
    - checkout
    - run:
        command: |
          if [ ! -f "package.json" ]; then
            echo
            echo "---"
            echo "Unable to find your package.json file. Did you forget to set the app-dir parameter?"
            echo "---"
            echo
            echo "Current directory: $(pwd)"
            echo
            echo
            echo "List directory: "
            echo
            ls
            exit 1
          fi
        name: Checking for package.json
        working_directory: ~/project
    - run:
        command: |
          if [ -f "package-lock.json" ]; then
            echo "Found package-lock.json file, assuming lockfile"
            ln package-lock.json /tmp/node-project-lockfile
          elif [ -f "npm-shrinkwrap.json" ]; then
            echo "Found npm-shrinkwrap.json file, assuming lockfile"
            ln npm-shrinkwrap.json /tmp/node-project-lockfile
          elif [ -f "yarn.lock" ]; then
            echo "Found yarn.lock file, assuming lockfile"
            ln yarn.lock /tmp/node-project-lockfile
          fi
          ln package.json /tmp/node-project-package.json
        name: Determine lockfile
        working_directory: ~/project
    - restore_cache:
        keys:
        - node-deps-{{ arch }}-v1-{{ .Branch }}-{{ checksum "/tmp/node-project-package.json" }}-{{ checksum "/tmp/node-project-lockfile" }}
        - node-deps-{{ arch }}-v1-{{ .Branch }}-{{ checksum "/tmp/node-project-package.json" }}-
        - node-deps-{{ arch }}-v1-{{ .Branch }}-
    - run:
        command: "if [[ ! -z \"\" ]]; then\n  echo \"Running override package installation command:\"\n  \nelse\n  npm ci\nfi\n"
        name: Installing NPM packages
        working_directory: ~/project
    - save_cache:
        key: node-deps-{{ arch }}-v1-{{ .Branch }}-{{ checksum "/tmp/node-project-package.json" }}-{{ checksum "/tmp/node-project-lockfile" }}
        paths:
        - ~/.npm
    - run:
        command: npm run test
        name: Run NPM Tests
        working_directory: ~/project
workflows:
  version: 2
  example-workflow:
    jobs:
    - node/test

# Original config.yml file:
# version: 2.1
#
# orbs:
#   node: circleci/node@4.7.0
#
# workflows:
#   version: 2
#   example-workflow:
#       jobs:
#         - node/test
{% endraw %}
```

## 5. Orb のパブリッシュ
{: #publish-your-orb }

開発版の Orb をパブリッシュします。
```shell
circleci orb publish /tmp/orb.yml <my-namespace>/<my-orb-name>@dev:first
```

Orb を安定版にプッシュする準備が整ったら、`circleci orb publish` を使用して手動でパブリッシュするか、開発版から直接プロモートすることができます。 以下のコマンドを使用すると、開発版のバージョン番号を `0.0.1` にインクリメントできます。
```shell
circleci orb publish promote <my-namespace>/<my-orb-name>@dev:first patch

```

安定版の Orb が変更不可形式でパブリッシュされ、CircleCI プロジェクトで安全に使用できるようになりました。 以下のコマンドを使用して、Orb のソースをプルします。
```shell
circleci orb source <my-namespace>/<my-orb-name>@0.0.1
```

## 利用可能な Orb の一覧
{: #list-available-orbs }

CLI を使用して、公開されている Orb を一覧表示できます。

**[パブリック]({{site.baseurl}}/ja/orb-intro/#public-orbs)** Orb を一覧表示する場合:
```shell
circleci orb list <my-namespace>
```

**[プライベート]({{site.baseurl}}/ja/orb-intro/#private-orbs)** Orb を一覧表示する場合:
```shell
circleci orb list <my-namespace> --private

```

## 次のステップ
{: #next-steps }

`circleci orb` コマンドの使用方法の詳細については、[CLI に関するドキュメント](https://circleci-public.github.io/circleci-cli/circleci_orb.html)を参照してください。
