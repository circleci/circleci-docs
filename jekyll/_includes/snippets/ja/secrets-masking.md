## シークレットのマスキング
{: #secrets-masking }

_シークレットのマスキングは、現在オンプレミス版である CircleCI Server ではサポートされていません。_

Environment variables and contexts may hold project secrets or keys that perform crucial functions for your applications. Secrets masking provides added security within CircleCI by obscuring environment variables in the job output when `echo` or `print` is used.

Secrets masking is applied to environment variables set within **Project Settings** or **Contexts** in the web app.

The value of the environment variable or context will _not_ be masked in the job output if:

* 環境変数の値が 4 文字未満
* 環境変数の値が `true`、`True`、`false`、`False` のいずれか

Secrets masking will only prevent values from appearing in your job output. Invoking a bash shell with the `-x` or `-o xtrace` options may inadvertantly log unmasked secrets (please refer to [Using shell scripts]({{site.baseurl}}/using-shell-scripts)). 別の場所 (テスト結果やアーティファクトなど) に出力されるシークレットはマスキングされません。 Aditionally, values are still accessible to users [debugging builds with SSH]({{site.baseurl}}/ssh-access-jobs).
{: class="alert alert-warning"}