---
layout: classic-docs
title: "セキュリティーに関する推奨事項"
category:
  - 管理
order: 5
description: "セキュリティーに関する推奨事項"
---

このドキュメントでは、 CircleCI を使用する際にデータとシークレットのセキュリティを確保するために推奨されるベストプラクティスについて説明します。

* TOC
{:toc}

## CircleCI を安全に使用していただくためのチェックリスト
{: #checklist-for-using-circleci-securely-as-a-customer }

CircleCI の使用を開始するにあたり、 チームが CircleCI の ユーザー として考慮すべきセキュリティ上のベストプラクティスがいくつかあります。

- ビルドが必要とするシークレット (プライベートキー、環境変数) の数を最小限に抑え、定期的にシークレットのローテーションを行ってください。
  - 組織のシークレットを定期的に (チーム メンバーが変わるときは特に) ローテーションすることが重要です。
  - シークレットを定期的にローテーションすることで、シークレットの有効期限が設けられ、キーが漏洩した場合の潜在的なリスクを軽減できます。
  - _使用するシークレット_は範囲を制限し、必ずビルドのために必要な最低限の権限のみを許可してください。 AWS 上での IAM 権限や GitHub の [Machine User](https://developer.github.com/v3/guides/managing-deploy-keys/#machine-users) 機能など、CircleCI の外部で使用する他のプラットフォームのロールや権限システムについてもよくご理解いただくようお願いします。
- スクリプトを書いたりコマンドラインで作業する際は、下記の [シークレットの安全な取り扱い](#handling-secrets-securely)に記載されている内容に従ってください。
- VCS プロバイダーから付与された組織の権限を確認したうえで (組織に属している場合)、[最小権限の原則](https://en.wikipedia.org/wiki/Principle_of_least_privilege)にできる限り従ってください。
- チーム間では制限付きコンテキストを使用し、環境変数は一つのセキュリティグループでのみ共有します。 詳細については、[コンテキストに関するドキュメント]({{ site.baseurl }}/2.0/contexts/#restricting-a-context)をお読みください。
- 組織において SSH キーへのアクセス権を持つメンバーの監査を必ず行ってください。
- VCS では、必ず2 要素認証 (2FA) を使用してください([Github 2FA](https://help.github.com/en/articles/securing-your-account-with-two-factor-authentication-2fa)、[Bitbucket](https://confluence.atlassian.com/bitbucket/two-step-verification-777023203.html))。 ユーザーの GitHub または Bitbucket アカウントが漏れると、悪意のあるユーザーによりコードがプッシュされたり、シークレットが盗まれたりする危険性があります。
- パブリックのオープンソース プロジェクトでは、環境変数を共有するかどうかを明記します。 CircleCI では、プロジェクトの設定を変更して、_フォークされたバージョンのリポジトリ_に環境変数を渡すかどうかを制御できます。 これは、デフォルトでは**有効になっていません**。 この設定とオープンソースのセキュリティの詳細については、[オープンソース プロジェクトのドキュメント]({}/2.0/oss/#security)を参照してください。

## シークレットの安全な取り扱い
{: #handling-secrets-securely }

多くのビルドでシークレットな値の参照が必要です。 これらのシークレットが CircleCI に委託された場合、その安全は必ず確保します。 セキュリティーはすべての組織の成功において不可欠な要素です。 CircleCI のシステムとお客様のシステムの境界でシークレットを守るためにできることがいくつかあります。

### コマンドライン上でシークレットを使用するリスク
{: #risks-of-using-secrets-on-the-command-line }

Unix シェルと Linux シェルが機密データを公開する方法はいくつかあります。 CircleCI を使ってコマンドラインで作業をする場合は、すべての方法を考慮することが重要です。

* **Command history**: If you include a secret in a command’s parameters, such as `export MY_SECRET='value'` or `curl --header 'authorization: Basic TOKEN'`, that value could be written into your shell’s history file, such as `.bash_history`. Anyone with access to that file could then retrieve the secret.
* **プロセスの引数**: プロセスの実行中、同じシステム上のユーザーは誰でも開始したコマンドを見ることができます。 コマンドを見る一番簡単な方法は`ps -ef`を実行することですが、他の方法もあります。 この情報は、環境変数が解釈された後に公開されるため、`mycommand "$MYVAR"` を実行すると、`ps` に `mycommand <value of MYVAR>`が表示されます。 また、AIX などの一部の古い Unix では、すべてのユーザが任意のプロセスのすべての環境変数を見ることができます。
* **システムのログ**: 多くのシステムでは、`sudo`を使用して実行されたすべてのコマンドが監査のためにログに記録されます。 すべてのコマンドを記録する監査サービスは数多くあります。 このようなサービスは、機密データを安全に保つように設計されていないシステムにログをエクスポートする可能性があります。
* **コンソールの出力**: 脅威モデルや使用しているコンソールの種類によっては、コンソールにシークレットを出力するだけでリスクになる場合があります。 たとえば、ペアプログラミングなどのアクティビティに画面共有ツールを使用すると、信頼できないビデオ会議プロバイダーを経由して伝送された機密情報が、ビデオレコーディングの場合でも、偶発的かつ永続的に漏洩する可能性があります。 必要なときに、そしてユーザーが明示的に指示した場合のみシークレットをコンソールに出力するツールを選びましょう。
* **ディスク上の永続的な暗号化されていないシークレット**: コマンドラインツールでは、ホームディレクトリのファイルに保存されているシークレットを保存して使用するのが一般的ですが、このようなファイルがすべてのプロセスで使用可能であり、時間の経過に伴う永続性が重大なリスクになる可能性があります。 以下のテクニックの中には、ディスクにシークレットを残す必要を避ける必要がなくなるものがあります。

### リスク低減テクニック
{: #mitigation-techniques }

上記のリスクを低減させるテクニックはたくさんあります。 ここでは `curl` と [the CircleCI CLI]({{site.baseurl}}/2.0/local-cli) を Bash シェルで安全に使う方法を説明します。

#### 一般的な注意事項
{: #general-precautions }

シークレットを含むすべての環境変数の値を出力する `env` または `printenv` を実行しないようにします。

以下の２つのテクニックを使ってシェルの履歴にシークレットを記載しないようにします。 ただし、履歴をオフにしても、コマンドが監査ログや`ps` によって公開されるのを防ぐことはできません。
  - 機密性の高いコマンドの前に`set+o history` を実行すると、これらのコマンドが履歴ファイルに書き込まれなくなります。 `set -o history` により履歴の記録が再び有効になります。
  - シェルが `HISTCONTROL` 環境変数をサポートしていて、`ignoreboth` または `ignorespace` に設定されている場合、コマンドの前にスペースを置くと、履歴ファイルに書き込まれません。

`export` は Bash およびその他の共通シェルに組み込まれているのでご注意ください。 つまり`export` を使用する際に予防策を講じることにより、履歴ファイル、`ps`、および監査ログへのシークレットの漏洩を回避することができるのです。
  - `set+o history` または `HISTCONTROL` を使用したシェル履歴への書き込みは避けてください。
  - 次に、よくわからない場合は `type` コマンド, `type export`を使って、`export` が本当にシェルビルトインであることを確認します。
  - 情報は引き続きコンソールに表示されます。そのリスクに問題がないことを確認してください。
  - このページの環境変数の使用に関するその他の注意事項に従ってください。
  - `export`したシークレットの使用が終了したらすぐに `unset` によりシェルから削除してください。 削除しないと、`export`された環境変数は、そのコンソールから生成されたすべてのプロセスで引き続き閲覧できます。

`read` や他のシェルビルトインを使用して、環境変数をコンソールに公開せずに設定することもできます。
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

#### CircleCI の CLI の使用
{: #using-the-circleci-cli }

可能な場合は`curl`の代わりに[the CircleCI local CLI]({{site.baseurl}}/2.0/local-cli)を使用します。 CLI では、機密性の高い操作を実行するときにシークレットが漏洩するのを防ぐために特別な注意を払っています。 For example, when [adding a secret to a context]({{site.baseurl}}/2.0/local-cli), the CLI will prompt you to enter the secret rather than accepting it as a command line argument.

If writing a shell script that uses the CircleCI CLI, remember that in Bash you can avoid exposing secrets stored in environment variables or text by using the `<<<` construct, which does not spawn a new process while piping a value: `circleci context store-secret <vcs-type> <org-name> <context-name> <secret name> <<< "$MY_SECRET"`. This is more reliable than using `echo` or `printf`, which may or may not be shell built-ins and therefore could spawn a process.

#### Using curl safely with the CircleCI API
{: #using-curl-safely-with-the-circleci-api }

##### Protecting the API token
{: #protecting-the-api-token }

When calling the CircleCI API with `curl`, you need to provide an API token. There are several ways you can mitigate risk while doing so:

* Use a `.netrc` file: The [netrc file format](https://everything.curl.dev/usingcurl/netrc), which is supported by several different tools, allows you to provide HTTP basic auth credentials in a file, rather than at the command-line.
  - Create a file at a location of your choosing. The default used by some tools is `~/.netrc`. Be sure to `chmod 0600` this file before adding the secret, to prevent other users from viewing its contents.
  - Add a line in the following format: `machine circleci.com login <your token> password`
  - When invoking `curl`, tell it to look in your `.netrc` file for credentials: `curl --netrc-file ~/.netrc`
* Write the `Circle-Token` header into a file. This requires curl 7.55 or later, but is a more reliable solution than `.netrc`, because some tools that use `.netrc` files do not understand an empty password field:
  - Create a file at a location of your choosing. Be sure to `chmod 0600` the file to prevent other users from viewing its contents.
  - Add a line in the following format: `Circle-Token: <your token>`
  - When invoking `curl`, tell it to read the header from a file: `curl --header @your_filename`
* Pull the token directly from a tool designed to store secrets, such as 1Password. In this case, you can use [process substitution](https://en.wikipedia.org/wiki/Process_substitution) to retrieve the header without exposing it:
  - `curl --header @<(command_to_retrieve_password)`
  - If you are sure that `printf` is a built-in in your shell, it should also be safe to write `curl --header @<(printf '%s\n' "$MYVAR")`, allowing you to use environment variables without exposing them through `ps`.

##### Protecting your secrets
{: #protecting-your-secrets }

Some API endpoints, such as [addEnvironmentVariableToContext]({{site.baseurl}}/api/v2/#operation/addEnvironmentVariableToContext), may require secrets to be sent in the body of `PUT` or `POST` requests. There are several options to help conceal these secrets:

* Use a file to compose and store the request body. Be sure to `chmod 0600` this file before adding the secret value to prevent other users from viewing its contents.
  - Point `curl` to this file by using the `@` directive: `curl --data @myfile`
* Use a heredoc to compose the request body, and pass it to curl on stdin:
```
curl --data @- <<EOF
{"value":"some-secret-value"}
EOF
```

## 関連項目
{: #see-also }
{:.no_toc}

[GitHub および Bitbucket のインテグレーション]({{ site.baseurl }}/2.0/gh-bb-integration/)
