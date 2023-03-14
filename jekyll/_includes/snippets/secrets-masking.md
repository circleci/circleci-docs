## Secrets masking

{: #secrets-masking }

_Secrets masking is not available on version 2.x of self-hosted installations of CircleCI server._

Environment variables and contexts may hold project secrets or keys that perform crucial functions for your applications. Secrets masking provides added security within CircleCI by obscuring environment variables in the job output when `echo` or `print` is used.

Secrets masking is applied to environment variables set within **Project Settings** or **Contexts** in the web app.

The value of the environment variable or context will _not_ be masked in the job output if:

- the value of the environment variable is less than 4 characters
- the value of the environment variable is equal to one of `true`, `True`, `false`, or `False`

Secrets masking will only prevent values from appearing in your job output. Invoking a bash shell with the `-x` or `-o xtrace` options may inadvertently log unmasked secrets (please refer to [Using shell scripts]({{site.baseurl}}/using-shell-scripts)). If your secrets appear elsewhere, such as test results or artifacts, they will not be masked. Additionally, values are still accessible to users [debugging builds with SSH]({{site.baseurl}}/ssh-access-jobs).
{: class="alert alert-warning"}
