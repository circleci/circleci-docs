## シークレットのマスキング
{: #secrets-masking }

環境変数とコンテキストは、アプリケーションにおいてきわめて重要な機能を担うプロジェクトのシークレットやキーを保持している場合があります。 シークレットのマスキングにより、`echo` や `print` の使用時にジョブの出力の環境変数を隠すことで、CircleCI のセキュリティが強化されます。

シークレットのマスキングは、**Project Settings** や Web アプリの **Contexts** で設定される環境変数に適用されます。

以下の場合、環境変数やコンテキストの値はジョブの出力でマスキング_されません_。

- 環境変数の値が 4 文字未満
- 環境変数の値が `true`、`True`、`false`、`False` のいずれか

シークレットのマスキングにより、ジョブ出力に値が表示されなくなります。 `-x` や `-o xtrace` オプションを使って Bash シェルを呼び出すとマスキングされていないシークレットが誤ってログに記録される場合があります ([シェルスクリプトの使用]({{site.baseurl}}/using-shell-scripts)を参照してください)。 別の場所 (テスト結果やアーティファクトなど) に出力されるシークレットはマスキングされません。 また、[SSH を使用してデバッグ]({{site.baseurl}}/ja/ssh-access-jobs)を行うユーザーは、マスキング後も環境変数の値にアクセスできます。
{: class="alert alert-warning"}

The secrets masking feature exists as a preventative measure to catch unintentional display of secrets at the output. Best practice is to avoid printing secrets to the output. The are many ways that secrets masking could be bypassed, either accidentally or maliciously. For example, any process that reformats the output of a command or script could remove secrets masking.
{: class="alert alert-warning"}