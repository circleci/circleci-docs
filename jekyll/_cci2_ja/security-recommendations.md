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
* **プロセスの引数**: プロセスの実行中、同じシステム上のユーザーは誰でも開始したコマンドを見ることができます。 コマンドを見る一番簡単な方法は`ps -ef`を実行することですが、他の方法もあります。 Critically, this information is exposed after environment variables have been interpreted, so that when running `mycommand "$MYVAR"`, `ps` will show `mycommand <value of MYVAR>`. On some older variants of Unix, such as AIX, it is also possible for all users to see all environment variables for any process.
* **System logs**: Many systems log all commands executed using `sudo` for auditing. There are many auditing services that record all commands. このようなサービスは、機密データを安全に保つように設計されていないシステムにログをエクスポートする可能性があります。
* **Console output**: Depending on your threat model and what kind of console is in use, simply printing a secret to the console could carry risk. For example, use of screen-sharing tools for activities like pair-programming can lead to accidental, persistent exposure of secrets transited through untrusted videoconferencing providers, possibly even in video recordings. It is best to choose tools that print secrets to the console only when necessary and explicitly told to do so by the user.
* **Persistent, unencrypted secrets on disk**: Although it is common practice for command-line tools to store and use secrets stored in files in your home directory, such files' availability to all processes and persistence over time may be a significant risk. Some of the techniques below can help avoid the need to leave secrets on disk.

### Mitigation techniques
{: #mitigation-techniques }

There are many techniques to help mitigate the risks discussed above. Here, we will focus on methods for using `curl` and [the CircleCI CLI]({{site.baseurl}}/2.0/local-cli) securely with the Bash shell.

#### General precautions
{: #general-precautions }

running `env` or `printenv` which will print all your environment variables to `stdout`.

Avoid writing secrets into your shell history with these two techniques. However, note that turning off history will not prevent commands from being exposed through audit logs and `ps`:
  - Running `set +o history` before the sensitive commands will prevent them from being written to the history file. `set -o history` will turn history logging back on.
  - If your shell supports the `HISTCONTROL` environment variable, and it is set to `ignoreboth` or `ignorespace`, placing a space before your command will prevent it from being written to the history file.

Be aware that `export` is built in to Bash and other common shells. This means that, with precautions, you can avoid exposure of secrets to the history file, `ps`, and audit logs when using `export`:
  - Make sure to avoid writing to the shell history by using `set +o history` or `HISTCONTROL`.
  - Next, if unsure, verify that `export` is really a shell built-in by using the `type` command: `type export`
  - Remember that information will still be exposed in your console, and make sure you are OK with that risk.
  - Follow the rest of the precautions on this page related to the use of environment variables.
  - As soon as you are finished using a secret you have `export`ed, consider using `unset` to remove it from the shell. Otherwise, the `export`ed environment variable will still be available to all processes spawned from that console.

`read`, another shell built-in, can be used to set an environment variable without exposing it to the console.
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

#### Using the CircleCI CLI
{: #using-the-circleci-cli }

Use the [the CircleCI local CLI]({{site.baseurl}}/2.0/local-cli) instead of `curl` when possible. The CLI takes extra precautions to avoid leaking secrets when performing sensitive operations. For example, when [adding a secret to a context]({{site.baseurl}}/2.0/local-cli), the CLI will prompt you to enter the secret rather than accepting it as a command line argument.

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
