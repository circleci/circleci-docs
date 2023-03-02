## シークレットのマスキング

{: #secrets-masking }

_Secrets masking is not available on version 2.x of self-hosted installations of CircleCI server._

環境変数とコンテキストは、アプリケーションにおいてきわめて重要な機能を担うプロジェクトのシークレットやキーを保持している場合があります。 シークレットのマスキングにより、`echo` や `print` の使用時にジョブの出力の環境変数を隠すことで、CircleCI のセキュリティが強化されます。

シークレットのマスキングは、**Project Settings** や Web アプリの **Contexts** で設定される環境変数に適用されます。

以下の場合、環境変数やコンテキストの値はジョブの出力でマスキング _されません_。

- 環境変数の値が 4 文字未満
- 環境変数の値が `true`、`True`、`false`、`False` のいずれか

シークレットのマスキングにより、ジョブ出力に値が表示されなくなります。 Invoking a bash shell with the `-x` or `-o xtrace` options may inadvertently log unmasked secrets (please refer to [Using shell scripts]({{site.baseurl}}/using-shell-scripts)). 別の場所 (テスト結果やアーティファクトなど) に出力されるシークレットはマスキングされません。 また、[SSH を使用してデバッグ]({{site.baseurl}}/ja/ssh-access-jobs)を行うユーザーは、マスキング後も環境変数の値にアクセスできます。
{: class="alert alert-warning"}
