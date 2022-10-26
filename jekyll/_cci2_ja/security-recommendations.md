---
layout: classic-docs
title: "Secure secrets handling"
category:
  - 管理
description: "Learn how to handle secrets securely with CircleCI."
---

Many builds must reference secret values entrusted to CircleCI. CircleCI understands that security is critical to every organization’s success. In addition to the work CircleCI does to keep your secrets safe, there are a few things you can do to help protect secrets at the boundary between CircleCI’s systems and yours.

## コマンドラインでシークレットを使用する場合のリスク
{: #risks-of-using-secrets-on-the-command-line }

Unix シェルと Linux シェルで機密データが公開されてしまう要因は複数あります。 CircleCI を使ってコマンドラインで作業をする場合は、そのすべてを考慮することが重要です。

* **コマンド履歴**: コマンドのパラメーター (`export MY_SECRET="value"` や `curl --header "authorization: Basic TOKEN"`など) にシークレットを含める場合、その値はシェルの履歴ファイル (`.bash_history`など) に記載されます。  そのファイルへのアクセス権も持つユーザーは誰でもそのシークレットを取得することができます。

* **プロセスの引数**: プロセスの実行中、同じシステム上のユーザーは誰でもそのコマンドを見ることができます。 コマンドを見る一番簡単な方法は `ps -ef` の実行すが、他にも方法があります。 この情報は、環境変数が解釈された後に公開されるため、`mycommand "$MYVAR"` を実行すると、`ps` に `mycommand <value of MYVAR>`が表示されます。 また、AIX などの一部の古い Unix では、すべてのユーザがすべてのプロセスのすべての環境変数を見ることができます。

* **システムのログ**: 多くのシステムでは、`sudo` を使って実行されたすべてのコマンドが監査のためにログに記録されます。 すべてのコマンドを記録する監査サービスは数多くあります。 このようなサービスは、機密データを安全に保つように設計されていないシステムにログをエクスポートする可能性があります。

* **コンソールの出力**: 脅威モデルや使用しているコンソールの種類によっては、コンソールにシークレットを出力するだけでリスクになる場合があります。 たとえば、ペアプログラミングなどのアクティビティに画面共有ツールを使用すると、信頼できないビデオ会議プロバイダーを経由して伝送された機密情報が、ビデオレコーディングの場合でも偶発的かつ永続的に漏洩する可能性があります。 必要なときに、そしてユーザーが明示的に指示した場合のみシークレットをコンソールに出力するツールを選びましょう。

* **ディスク上の永続性のある暗号化されていないシークレット**: コマンドラインツールでは、ホームディレクトリのファイルに保存されているシークレットを保存して使用するのが一般的ですが、このようなファイルがすべてのプロセスで使用可能であり、時間の経過に伴い永続性が重大なリスクになる可能性があります。

## リスク低減手法
{: #mitigation-techniques }

上述のようなリスクを低減させる手法はたくさんあります。 We will focus on methods for using `curl` commands and [the CircleCI CLI]({{site.baseurl}}/local-cli) securely with the bash shell.

### 一般的な注意事項
{: #general-precautions }

シークレットを含むすべての環境変数の値を出力する `env` または `printenv` を実行しないようにします。

Avoid writing secrets into your shell history with these following techniques. ただし、履歴をオフにしても、コマンドが監査ログや `ps` によって公開されるのを防ぐことはできません。
  - 機密性の高いコマンドの前に `set+o history` を実行すると、これらのコマンドが履歴ファイルに書き込まれなくなります。 `set -o history` により履歴の記録が再び有効になります。
  - シェルが `HISTCONTROL` 環境変数をサポートしていて、`ignoreboth` または `ignorespace` に設定されている場合、コマンドの前にスペースを置くと、履歴ファイルに書き込まれません。

Be aware that `export` is built in to bash and other common shells. つまり`export` を使用する際に予防策を講じることにより、履歴ファイル、`ps`、および監査ログへのシークレットの漏洩を回避することがでます。
  - `set+o history` または `HISTCONTROL` を使用したシェル履歴への書き込みは避けてください。
  - Next, if unsure, verify that `export` is really a shell built-in by using the `type` command: `type export`.
  - Remember that information will still be exposed in your console, and make sure you are okay with that risk.
  - このページの環境変数の使用に関するその他の注意事項に従ってください。
  - As soon as you are finished using a secret with `export`, consider using `unset` to remove it from the shell. Otherwise, the `export` environment variable will still be available to all processes spawned from that console.

Another shell built-in, `read`, can be used to set an environment variable without exposing it to the console:
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

### Use the CircleCI CLI
{: #use-the-circleci-cli }

Use the [the CircleCI local CLI]({{site.baseurl}}/local-cli) instead of `curl` commands when possible. CLI では、機密性の高い操作を実行するときにシークレットが漏洩するのを防ぐために特別な注意を払っています。 For example, when [creating environment variables]({{site.baseurl}}/contexts#creating-environment-variables), the CLI will prompt you to enter the secret rather than accepting it as a command line argument.

If writing a shell script that uses the CircleCI CLI, remember that in bash you can avoid exposing secrets stored in environment variables or text by using the `<<<` construct, which does not spawn a new process while piping a value:
```bash
`circleci context store-secret <vcs-type> <org-name> <context-name> <secret name> <<< "$MY_SECRET"`
```
This is more reliable than using `echo` or `printf`, which may or may not be shell built-ins and could potentially spawn a process.

### Protect the API token
{: #protect-the-api-token }

When calling the CircleCI API with `curl` commands, you need to provide an API token. その際にリスクを低減する方法が複数あります。

* .netrc ファイルを使用します。 netrc ファイル形式 は、複数の異なるツールでサポートされており、コマンドラインではなくファイルに HTTP 基本認証情報を提供できます。
  - 選択した場所にファイルを作成します。 一部のツールではデフォルト設定は`~/.netrc`です。 他のユーザーがその内容を閲覧できないように、シークレットを追加する前にこのファイルを `chmod 0600` してください。
  - 次の形式の行を追加します: `machine circleci.com login <your token> password`。
  - When invoking `curl` commands, tell it to look in your `.netrc` file for credentials: `curl --netrc-file ~/.netrc`
* ファイルに `Circle-Token` ヘッダーを記述します。 This requires cURL 7.55 or later, but is a more reliable solution than `.netrc`, because some tools that use `.netrc` files do not understand an empty password field:
  - 選択した場所にファイルを作成します。 他のユーザーにファイルの内容を見られないようにするには、`chmod 0600` を実行してください。
  - 次の形式の行を追加します: `Circle-Token: <your token>`
  - When invoking `curl` commands, tell it to read the header from a file: `curl --header @your_filename`
* 1Password などのシークレットを保存するように設計されたツールからトークンを直接プルします。 この場合、 [process substitution](https://en.wikipedia.org/wiki/Process_substitution) を使用して、ヘッダーを公開せずに取得できます。
  - `curl --header @<(command_to_retrieve_password)`
  - `printf` がシェルに組み込まれていることが確実な場合は、`curl --header @<(printf '%s\n' "$MYVAR")`を記述して、`ps` を使用して環境変数を公開せずに使用できるようにしてください。

### Protect your secrets
{: #protect-your-secrets }

[addEnvironmentVariableToContext]({{site.baseurl}}/api/v2/#operation/addEnvironmentVariableToContext) などの一部の API エンドポイントでは、`PUT` or `POST`の本文にシークレットを送信する必要がある場合があります。 これらのシークレットを隠す方法をご紹介します。

* ファイルを使用して、リクエスト本文を作成および保存します。 シークレットの値を追加する前に必ず `chmod 0600` を実行し、他のユーザーにファイルの内容を見られないようにしてください。
  - `@`ディレクティブを使用して、`curl`をこのファイルにポイントします: curl --data@myfile
* Use a heredoc to compose the request body, and pass it to cURL on stdin:
```
curl --data @- <<EOF
{"value":"some-secret-value"}
EOF
```

## 関連項目
{: #see-also }
{:.no_toc}

[GitHub と Bitbucket のインテグレーション]({{ site.baseurl }}/gh-bb-integration/)
