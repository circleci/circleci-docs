---
layout: classic-docs
title: "Secure secrets handling"
category: [administration]
description: "Learn how to handle secrets securely with CircleCI."
---

Many builds must reference secret values entrusted to CircleCI. CircleCI understands that security is critical to every organization’s success. In addition to the work CircleCI does to keep your secrets safe, there are a few things you can do to help protect secrets at the boundary between CircleCI’s systems and yours.

## Risks of using secrets on the command-line
{: #risks-of-using-secrets-on-the-command-line }

There are several ways that Unix and Linux shells can expose sensitive data. It is important to consider all of them when working with CircleCI on the command-line.

* **Command history**: If you include a secret in a command’s parameters, such as `export MY_SECRET="value"` or `curl --header "authorization: Basic TOKEN"`, that value could be written into your shell’s history file, such as `.bash_history`. Anyone with access to that file could then retrieve the secret.

* **Process arguments**: While a process is running, any user on the same system can view the command that started it. The easiest way to see this is by running `ps -ef`, but there are other methods as well. Critically, this information is exposed after environment variables have been interpreted, so that when running `mycommand "$MYVAR"`, `ps` will show `mycommand <value of MYVAR>`. On some older variants of Unix, such as AIX, it is also possible for all users to see all environment variables for any process.

* **System logs**: Many systems log all commands executed using `sudo` for auditing. There are many auditing services that record all commands. Such services could potentially export those logs into systems that are not designed to keep secret data safe.

* **Console output**: Depending on your threat model and what kind of console is in use, simply printing a secret to the console could carry risk. For example, use of screen-sharing tools for activities like pair-programming can lead to accidental, persistent exposure of secrets transited through untrusted videoconferencing providers, possibly even in video recordings. It is best to choose tools that print secrets to the console only when necessary and explicitly told to do so by the user.

* **Persistent, unencrypted secrets on disk**: Although it is common practice for command-line tools to store and use secrets stored in files in your home directory, such files' availability to all processes and persistence over time may be a significant risk. 
<!-- Some of the techniques below can help avoid the need to leave secrets on disk. -->

## Mitigation techniques
{: #mitigation-techniques }

There are many techniques to help mitigate the risks discussed above. We will focus on methods for using `curl` and [the CircleCI CLI]({{site.baseurl}}/local-cli) securely with the bash shell.

### General precautions
{: #general-precautions }

Avoid running `env` or `printenv`, which will print the values of all environment variables, including secrets.

Avoid writing secrets into your shell history with these following techniques. However, note that turning off history will not prevent commands from being exposed through audit logs and `ps`:
  - Running `set +o history` before the sensitive commands will prevent them from being written to the history file. `set -o history` will turn history logging back on.
  - If your shell supports the `HISTCONTROL` environment variable, and it is set to `ignoreboth` or `ignorespace`, placing a space before your command will prevent it from being written to the history file.

Be aware that `export` is built in to bash and other common shells. This means that, with precautions, you can avoid exposure of secrets to the history file, `ps`, and audit logs when using `export`:
  - Make sure to avoid writing to the shell history by using `set +o history` or `HISTCONTROL`.
  - Next, if unsure, verify that `export` is really a shell built-in by using the `type` command: `type export`.
  - Remember that information will still be exposed in your console, and make sure you are okay with that risk.
  - Follow the rest of the precautions on this page related to the use of environment variables.
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

Use the [the CircleCI local CLI]({{site.baseurl}}/local-cli) instead of `curl` when possible. The CLI takes extra precautions to avoid leaking secrets when performing sensitive operations. For example, when [creating environment variables]({{site.baseurl}}/contexts#creating-environment-variables), the CLI will prompt you to enter the secret rather than accepting it as a command line argument.

If writing a shell script that uses the CircleCI CLI, remember that in bash you can avoid exposing secrets stored in environment variables or text by using the `<<<` construct, which does not spawn a new process while piping a value:
```bash
`circleci context store-secret <vcs-type> <org-name> <context-name> <secret name> <<< "$MY_SECRET"`
```
This is more reliable than using `echo` or `printf`, which may or may not be shell built-ins and could potentially spawn a process.

### Protect the API token
{: #protect-the-api-token }

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

### Protect your secrets
{: #protect-your-secrets }

Some API endpoints, such as [addEnvironmentVariableToContext]({{site.baseurl}}/api/v2/#operation/addEnvironmentVariableToContext), may require secrets to be sent in the body of `PUT` or `POST` requests. There are several options to help conceal these secrets:

* Use a file to compose and store the request body. Be sure to `chmod 0600` this file before adding the secret value to prevent other users from viewing its contents.
  - Point `curl` to this file by using the `@` directive: `curl --data @myfile`
* Use a heredoc to compose the request body, and pass it to curl on stdin:
```
curl --data @- <<EOF
{"value":"some-secret-value"}
EOF
```

## See also
{: #see-also }
{:.no_toc}

[GitHub and Bitbucket Integration]({{ site.baseurl }}/gh-bb-integration/)
