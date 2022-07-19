---
layout: classic-docs
title: "Security recommendations"
category: [administration]
order: 5
description: "CircleCI security recommendations."
---

This document outlines recommended best practices to ensure the security of your data and secrets when using CircleCI.

* TOC
{:toc}

## Checklist for using CircleCI securely as a customer
{: #checklist-for-using-circleci-securely-as-a-customer }

If you are getting started with CircleCI, there are some security best practices you can ask your team to consider as _users_ of CircleCI:

- Minimize the number of secrets (private keys / environment variables) your
  build needs and rotate secrets regularly.
  - It is important to rotate secrets regularly in your organization, especially as team members come and go.
  - Rotating secrets regularly means your secrets are only active for a certain amount of time, helping to reduce possible risks if keys are compromised.
  - Ensure the secrets you _do_ use are of limited scope - with only enough permissions for the purposes of your build. Understand the role and permission systems of other platforms you use outside of CircleCI; for example, IAM permissions on AWS, or GitHub's [Machine User](https://developer.github.com/v3/guides/managing-deploy-keys/#machine-users) feature.
- Follow the advice in [Handling secrets securely](#handling-secrets-securely), below, when writing scripts and working on the command-line.
- Consult your VCS provider's permissions for your organization (if you are in an organization) and try to follow the [Principle of Least Privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege).
- Use Restricted Contexts with teams to share environment variables with a select security group. Read through the [contexts]({{ site.baseurl }}/contexts/#restricting-a-context) document to learn more.
- Ensure you audit who has access to SSH keys in your organization.
- Ensure that your team is using Two-Factor Authentication (2FA) with your VCS ([Github 2FA](https://help.github.com/en/articles/securing-your-account-with-two-factor-authentication-2fa), [Bitbucket](https://confluence.atlassian.com/bitbucket/two-step-verification-777023203.html)). If a user's GitHub or Bitbucket account is compromised, a nefarious actor could push code or potentially steal secrets.
- If your project is open source and public, please make note of whether or not you want to share your environment variables. On CircleCI, you can change a project's settings to control whether your environment variables can pass on to _forked versions of your repo_. This is **not enabled** by default. You can read more about these settings and open source security in our [Open Source Projects document]({{site.baseurl}}/oss/#security).

## Handling secrets securely
{: #handling-secrets-securely }

Many builds must reference secret values. When these secrets are entrusted to CircleCI, we make sure they stay safe. We understand that security is critical to every organization’s success. However, there are some things that you can do to help protect secrets at the boundary between CircleCI’s systems and yours.

### Risks of using secrets on the command-line
{: #risks-of-using-secrets-on-the-command-line }

There are several ways that Unix and Linux shells can expose sensitive data. It is important to consider all of them when working with CircleCI on the command-line.

* **Command history**: If you include a secret in a command’s parameters, such as `export MY_SECRET='value'` or `curl --header 'authorization: Basic TOKEN'`, that value could be written into your shell’s history file, such as `.bash_history`. Anyone with access to that file could then retrieve the secret.
* **Process arguments**: While a process is running, any user on the same system can view the command that started it. The easiest way to see this is by running `ps -ef`, but there are other methods as well. Critically, this information is exposed after environment variables have been interpreted, so that when running `mycommand "$MYVAR"`, `ps` will show `mycommand <value of MYVAR>`. On some older variants of Unix, such as AIX, it is also possible for all users to see all environment variables for any process.
* **System logs**: Many systems log all commands executed using `sudo` for auditing. There are many auditing services that record all commands. Such services could potentially export those logs into systems that are not designed to keep secret data safe.
* **Console output**: Depending on your threat model and what kind of console is in use, simply printing a secret to the console could carry risk. For example, use of screen-sharing tools for activities like pair-programming can lead to accidental, persistent exposure of secrets transited through untrusted videoconferencing providers, possibly even in video recordings. It is best to choose tools that print secrets to the console only when necessary and explicitly told to do so by the user.
* **Persistent, unencrypted secrets on disk**: Although it is common practice for command-line tools to store and use secrets stored in files in your home directory, such files' availability to all processes and persistence over time may be a significant risk. Some of the techniques below can help avoid the need to leave secrets on disk.

### Mitigation techniques
{: #mitigation-techniques }

There are many techniques to help mitigate the risks discussed above. Here, we will focus on methods for using `curl` and [the CircleCI CLI]({{site.baseurl}}/local-cli) securely with the Bash shell.

#### General precautions
{: #general-precautions }

Avoid running `env` or `printenv`, which will print the values of all environment variables, including secrets.

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

Use the [the CircleCI local CLI]({{site.baseurl}}/local-cli) instead of `curl` when possible. The CLI takes extra precautions to avoid leaking secrets when performing sensitive operations. For example, when [adding a secret to a context]({{site.baseurl}}/local-cli), the CLI will prompt you to enter the secret rather than accepting it as a command line argument.

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

## See also
{: #see-also }
{:.no_toc}

[GitHub and Bitbucket Integration]({{ site.baseurl }}/gh-bb-integration/)
