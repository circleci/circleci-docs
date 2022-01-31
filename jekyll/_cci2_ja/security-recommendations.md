---
layout: classic-docs
title: "セキュリティーに関する推奨事項"
category:
  - 管理
order: 5
description: "セキュリティーに関する推奨事項"
---

このドキュメントでは、 CircleCI の使用時にデータやシークレットのセキュリティを確保するために推奨されるベストプラクティスについて概説します。

* TOC
{:toc}

## CircleCI を安全に使用していただくためのチェックリスト
{: #checklist-for-using-circleci-securely-as-a-customer }

CircleCI の使用を開始するにあたり、チームが CircleCI のユーザーとして考慮すべきセキュリティ上のベストプラクティスがいくつかあります。

- ビルドに必要なシークレット (プライベートキー、環境変数) の数を最小限に抑え、定期的にシークレットのローテーションを行ってください。
  - 組織のシークレットを定期的に (チームメンバーが変わるときは特に) ローテーションすることが重要です。
  - シークレットを定期的にローテーションすることで、シークレットの有効期限が設けられ、キーが漏洩した場合の潜在的なリスクを軽減できます。
  - _使用するシークレット_は範囲を制限し、必ずビルドに必要な最低限の権限のみを許可してください。 AWS 上での IAM 権限や GitHub の [Machine User](https://developer.github.com/v3/guides/managing-deploy-keys/#machine-users) 機能など、CircleCI の外部で使用する他のプラットフォームのロールや権限システムについてもよく理解してください。
- スクリプトを書いたりコマンドラインで作業する際は、下記の [シークレットの安全な取り扱い](#handling-secrets-securely)に記載されている内容に従ってください。
- VCS プロバイダーから付与された組織の権限を確認したうえで (組織に属している場合)、[最小権限の原則](https://en.wikipedia.org/wiki/Principle_of_least_privilege)にできる限り従ってください。
- チーム間では制限付きコンテキストを使用し、環境変数は一つのセキュリティグループでのみ共有します。 詳細については、[コンテキストに関するドキュメント]({{ site.baseurl }}/2.0/contexts/#restricting-a-context)をお読みください。
- 組織において SSH キーへのアクセス権を持つメンバーの監査を必ず行ってください。
- VCS では、必ず2 要素認証 (2FA) を使用してください([Github 2FA](https://help.github.com/en/articles/securing-your-account-with-two-factor-authentication-2fa)、[Bitbucket](https://confluence.atlassian.com/bitbucket/two-step-verification-777023203.html))。 ユーザーの GitHub または Bitbucket アカウントが漏れると、悪意のあるユーザーによりコードがプッシュされたり、シークレットが盗まれたりする危険性があります。
- パブリックのオープンソース プロジェクトでは、環境変数を共有するかどうかを明記します。 CircleCI では、プロジェクトの設定を変更して、_フォークされたバージョンのリポジトリ_に環境変数を渡すかどうかを制御できます。 これは、デフォルトでは**有効になっていません**。 この設定とオープンソースのセキュリティの詳細については、[オープンソース プロジェクトのドキュメント]({}/2.0/oss/#security)を参照してください。

## シークレットの安全な取り扱い
{: #handling-secrets-securely }

多くのビルドでシークレット値の参照が必要です。 これらのシークレットが CircleCI に委託された場合、その安全を必ず確保します。 セキュリティーはあらゆる組織の成功において不可欠な要素です。 CircleCI のシステムとお客様のシステムの境界でシークレットを守る方法があります。

### コマンドラインでシークレットを使用するリスク
{: #risks-of-using-secrets-on-the-command-line }

Unix シェルと Linux シェルで機密データが公開されるケースが複数あります。 CircleCI を使ってコマンドラインで作業をする場合は、そのすべてを考慮することが重要です。

* **コマンド履歴**: コマンドのパラメーター（`export MY_SECRET='value'` や `curl --header 'authorization: Basic TOKEN'`など) にシークレットを含める場合、その値はシェルの履歴ファイル (`.bash_history`など) に記載されます。  そのファイルへのアクセス権も持つユーザーは誰でもそのシークレットを取得することができます。
* **プロセスの引数**: プロセスの実行中、同じシステム上のユーザーは誰でもそのコマンドを見ることができます。 コマンドを見る一番簡単な方法は `ps -ef` の実行すが、他にも方法があります。 この情報は、環境変数が解釈された後に公開されるため、`mycommand "$MYVAR"` を実行すると、`ps` に `mycommand <value of MYVAR>`が表示されます。 また、AIX などの一部の古い Unix では、すべてのユーザがすべてのプロセスのすべての環境変数を見ることができます。
* **システムのログ**: 多くのシステムでは、`sudo` を使って実行されたすべてのコマンドが監査のためにログに記録されます。 すべてのコマンドを記録する監査サービスは数多くあります。 このようなサービスは、機密データを安全に保つように設計されていないシステムにログをエクスポートする可能性があります。
* **コンソールの出力**: 脅威モデルや使用しているコンソールの種類によっては、コンソールにシークレットを出力するだけでリスクになる場合があります。 たとえば、ペアプログラミングなどのアクティビティに画面共有ツールを使用すると、信頼できないビデオ会議プロバイダーを経由して伝送された機密情報が、ビデオレコーディングの場合でも偶発的かつ永続的に漏洩する可能性があります。 必要なときに、そしてユーザーが明示的に指示した場合のみシークレットをコンソールに出力するツールを選びましょう。
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

可能な場合は`curl`の代わりに[the CircleCI local CLI]({{site.baseurl}}/2.0/local-cli)を使用します。 CLI では、機密性の高い操作を実行するときにシークレットが漏洩するのを防ぐために特別な注意を払っています。 たとえば、 [コンテキストにシークレットを追加する]({{site.baseurl}}/2.0/local-cli)場合、 CLI はコマンドライン引数として受け入れるのではなく、シークレットを入力するように要求します。

CircleCI CLI を使用するシェルスクリプトを作成する場合、 Bash では値をパイピングする際に新しいプロセスを生成しない  `<<<` 構成を使用することにより、環境変数またはテキストに格納されたシークレットの公開を回避できます: `circleci context store-secret <vcs-type> <org-name> <context-name> <secret name> <<< "$MY_SECRET"`。 これは、`echo `や`printf`を使用するよりも信頼性が高く、シェルビルトインの場合とそうでない場合があり、プロセスを生成する可能性があります。

#### CircleCI API を使って curl を安全に使用する
{: #using-curl-safely-with-the-circleci-api }

##### API トークンの保護
{: #protecting-the-api-token }

`curl`を使用して CircleCI API を呼び出す場合は、API トークンを指定する必要があります。 その間にリスクを軽減するには、いくつかの方法があります。

* Use a `.netrc` file: The [netrc file format](https://everything.curl.dev/usingcurl/netrc), which is supported by several different tools, allows you to provide HTTP basic auth credentials in a file, rather than at the command-line.
  - 選択した場所にファイルを作成します。 一部のツールではデフォルト設定は`~/.netrc`です。 Be sure to `chmod 0600` this file before adding the secret, to prevent other users from viewing its contents.
  - 次の形式の行を追加します: `machine circleci.com login <your token> password`。
  - `curl` を呼び出すときは、`.netrc`ファイルで認証情報を探すように指示します: `curl --netrc-file ~/.netrc`。
* ファイルに`Circle-Token`ヘッダーを記述します。 これには curl 7.55 以降が必要ですが、`.netrc `ファイルを使用する一部のツールでは空のパスワードフィールドが認識されないため、`.netrc `よりも信頼性の高いソリューションです。
  - 選択した場所にファイルを作成します。 他のユーザーにファイルの内容を見られないようにするには、`chmod 0600` を実行してください。
  - 次の形式の行を追加します: `Circle-Token: <your token>`。
  - When invoking `curl`, tell it to read the header from a file: `curl --header @your_filename`
* 1Password などのシークレットを保存するように設計されたツールからトークンを直接引き出します。 この場合、 process substitution を使用して、ヘッダーを公開せずに取得できます。
  - `curl --header @<(command_to_retrieve_password)`
  - printf がシェルに組み込まれていることが確実な場合は、 curl --header@<(printf '%s\n''$myVar") を記述して、 ps を使用して環境変数を公開せずに使用できるようにしてください。

##### シークレットの保護
{: #protecting-your-secrets }

addEnvironmentVariableToContext などの一部の API エンドポイントでは、 put リクエストまたは POST リクエストの本文にシークレットを送信する必要がある場合があります。 これらの秘密を隠すには、いくつかの方法があります。

* ファイルを使用して、リクエスト本文を作成および保存します。 シークレットの値を追加する前に必ず `chmod 0600` を実行し、他のユーザーにファイルの内容を見られないようにしてください。
  - `@`ディレクティブを使用して、`curl`をこのファイルにポイントします: curl --data@myfile。
* ヒアドキュメントを使って、リクエスト本文を作成し、標準入力で curl に渡します。
```
curl --data @- <<EOF
{"value":"some-secret-value"}
EOF
```

## 関連項目
{: #see-also }
{:.no_toc}

[GitHub および Bitbucket のインテグレーション]({{ site.baseurl }}/2.0/gh-bb-integration/)
