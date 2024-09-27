---
layout: classic-docs
title: "シークレットの安全な取り扱い"
category:
  - 管理
description: "CircleCI でシークレットを安全に取り扱う方法を説明します。"
---

多くのビルドでは、CircleCI に託されたシークレット値の参照が必要になります。 CircleCI では、あらゆる組織の成功においてセキュリティは不可欠な要素だと考えています。 お客様のシークレットを安全に保つための CircleCI での作業に加えて、CircleCI のシステムとお客様のシステムの境界でシークレットを保護するために、お客様にしていただだけることがいくつかあります。

## コマンドラインでシークレットを使用する場合のリスク
{: #risks-of-using-secrets-on-the-command-line }

Unix シェルや Linux シェルで機密データが公開されてしまう要因は複数あります。 CircleCI を使ってコマンドラインで作業をする際は、そのすべてを考慮することが重要です。

* **コマンド履歴**: コマンドのパラメーター (`export MY_SECRET="value"` や `curl --header "authorization: Basic TOKEN"`など) にシークレットを含める場合、その値はシェルの履歴ファイル (`.bash_history`など) に記載されます。  そのファイルへのアクセス権も持つユーザーは誰でもそのシークレットを取得することができます。

* **プロセスの引数**: プロセスの実行中、同じシステム上のユーザーは誰でもそのコマンドを見ることができます。 コマンドを見る一番簡単な方法は `ps -ef` の実行ですが、他にも方法があります。 この情報は、環境変数が解釈された後に公開されるため、`mycommand "$MYVAR"` を実行すると、`ps` に `mycommand <value of MYVAR>`が表示されます。 また、AIX などの一部の古い Unix では、すべてのユーザがすべてのプロセスのすべての環境変数を見ることができます。

* **システムのログ**: 多くのシステムでは、`sudo` を使って実行されたすべてのコマンドが監査のためにログに記録されます。 すべてのコマンドを記録する監査サービスは数多くあります。 このようなサービスは、機密データを安全に保つように設計されていないシステムにログをエクスポートする可能性があります。

* **コンソールの出力**: 脅威モデルや使用しているコンソールの種類によっては、コンソールにシークレットを出力するだけでリスクになる場合があります。 たとえば、ペアプログラミングなどのアクティビティに画面共有ツールを使用すると、信頼できないビデオ会議プロバイダーを経由して伝送された機密情報が、ビデオレコーディングの場合でも偶発的かつ永続的に漏洩する可能性があります。 必要なときに、そしてユーザーが明示的に指示した場合のみシークレットをコンソールに出力するツールを選びましょう。

* **ディスク上の永続性のある暗号化されていないシークレット**: コマンドラインツールでは、ホームディレクトリのファイルに保存されているシークレットを保存して使用するのが一般的ですが、このようなファイルがすべてのプロセスで使用可能であり、時間の経過に伴い永続性が重大なリスクになる可能性があります。

## リスクを低減する方法
{: #mitigation-techniques }

上述のようなリスクを低減させる方法はたくさんあります。 ここでは `curl` コマンドと [CircleCI CLI]({{site.baseurl}}/ja/local-cli) を Bash シェルで安全に使う方法を説明します。

### 一般的な注意事項
{: #general-precautions }

シークレットを含むすべての環境変数の値を出力する `env` または `printenv` を実行しないようにします。

以下の方法で、シェルの履歴にシークレットが記載されないようにします。 ただし、履歴をオフにしても、コマンドが監査ログや `ps` で公開されるのを防ぐことはできません。
  - 機密性の高いコマンドの前に `set+o history` を実行すると、これらのコマンドが履歴ファイルに書き込まれなくなります。 `set -o history` により履歴の記録が再び有効になります。
  - シェルが `HISTCONTROL` 環境変数をサポートしていて、`ignoreboth` または `ignorespace` に設定されている場合、コマンドの前にスペースを入れると、履歴ファイルに書き込まれません。

`export` は、Bash およびその他の共通シェルに組み込まれています。 つまり `export` を使用する際に予防策を講じることにより、履歴ファイル、`ps`、および監査ログへのシークレットの漏洩を避けることがでます。
  - `set+o history` または `HISTCONTROL` を使用したシェル履歴への書き込みは避けてください。
  - 次に、不明な場合は `type` コマンド、 `type export` を使って、`export` がきちんとシェルに組み込まれていることを確認してください。
  - 情報は引き続きコンソールに表示されます。このリスクに問題がないことをご確認ください。
  - このページの環境変数の使用に関するその他の注意事項に従ってください。
  - `export` したシークレットの使用後は、`unset` によりすぐにシェルから削除してください。 削除しないと、`export`された環境変数は、そのコンソールから派生したすべてのプロセスで引き続き表示されます。

もう一つのビルトインシェル、 `read` では、環境変数をコンソールに表示せずに設定することができます。
```
# Check that your version of read supports the -s option
help read

IFS='' read -r -s MY_VAR
# (enter your secret; press return when done)

# Alternatively, read from a file
IFS='' read -r MY_VAR < ~/.my_secret

# Or a process
secret_producer | IFS='' read -r MY_VAR

# Export the variable so that it is available to subprocesses
export MY_VAR
```

### CircleCI CLI の使用
{: #use-the-circleci-cli }

可能な場合は `curl` コマンドの代わりに [CircleCI ローカル CLI]({{site.baseurl}}/ja/local-cli) を使用します。 CLI では、機密性の高い操作を実行するときにシークレットが漏洩するのを防ぐために特別な注意を払っています。 たとえば、  [環境変数を作成する]({{site.baseurl}}/ja/contexts#creating-environment-variables)場合、CLI はコマンドライン引数として受け入れるのではなく、シークレットを入力するように要求します。

CircleCI CLI を使用するシェルスクリプトを記述する場合、Bash では `<<<` コンストラクトを使用すると環境変数やテキストに保存されているシークレットが表示されないようにすることが可能です。このコンストラクトは、値のパイピング中に新しいプロセスを生成しません。
```bash
`circleci context store-secret <vcs-type> <org-name> <context-name> <secret name> <<< "$MY_SECRET"`
```
これは、`echo `や`printf` を使用するよりも信頼性が高く、シェルに組み込まれている場合とそうでない場合があり、プロセスを生成する場合があります。

### API トークンの保護
{: #protect-the-api-token }

`curl` コマンドを使用して CircleCI API を呼び出す場合は、API トークンを指定する必要があります。 その際にリスクを低減する方法が複数あります。

* .netrc ファイルを使用します。 netrc ファイル形式 は、複数の異なるツールでサポートされており、コマンドラインではなくファイルに HTTP 基本認証情報を提供できます。
  - 選択した場所にファイルを作成します。 一部のツールではデフォルト設定は`~/.netrc`です。 他のユーザーがその内容を閲覧できないように、シークレットを追加する前にこのファイルを `chmod 0600` してください。
  - 次の形式の行を追加します: `machine circleci.com login <your token> password`。
  - `curl` コマンドを呼び出す際は、`.netrc`ファイルで認証情報を探すように指示します: `curl --netrc-file ~/.netrc`
* ファイルに `Circle-Token` ヘッダーを記述します。 これには cURL 7.55 以降が必要ですが、`.netrc `ファイルを使用する一部のツールでは空のパスワードフィールドが認識されないため、`.netrc `よりも信頼性の高いソリューションです。
  - 選択した場所にファイルを作成します。 他のユーザーにファイルの内容を見られないようにするには、`chmod 0600` を実行してください。
  - 次の形式の行を追加します: `Circle-Token: <your token>`
  - `curl` コマンドを呼び出す際は、 `curl --header@your_filename `というファイルからヘッダーを読み取るように指示します
* 1Password などのシークレットを保存するように設計されたツールからトークンを直接プルします。 この場合、 [process substitution](https://en.wikipedia.org/wiki/Process_substitution) を使用して、ヘッダーを公開せずに取得できます。
  - `curl --header @<(command_to_retrieve_password)`
  - `printf` がシェルに組み込まれていることが確実な場合は、`curl --header @<(printf '%s\n' "$MYVAR")`を記述して、`ps` を使用して環境変数を公開せずに使用できるようにしてください。

### シークレットの保護
{: #protect-your-secrets }

[addEnvironmentVariableToContext](https://circleci.com/docs/api/v2/#operation/addEnvironmentVariableToContext) などの一部の API エンドポイントでは、`PUT` or `POST`の本文にシークレットを送信する必要がある場合があります。 これらのシークレットを隠す方法をご紹介します。

* ファイルを使用して、リクエスト本文を作成および保存します。 シークレットの値を追加する前に必ず `chmod 0600` を実行し、他のユーザーにファイルの内容を見られないようにしてください。
  - `@`ディレクティブを使用して、`curl`をこのファイルにポイントします: `curl --data @myfile`
* ヒアドキュメントを使って、リクエスト本文を作成し、標準入力で cURL に渡します。
```
curl --data @- <<EOF
{"value":"some-secret-value"}
EOF
```
