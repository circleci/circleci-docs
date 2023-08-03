---
layout: classic-docs
title: "Debug with SSH"
description: "How to access a build container using SSH on CircleCI"
contentTags:
  platform:
  - Cloud
  - Server v4.x
  - Server v3.x
---

Troubleshoot problems in a job using **Rerun job with SSH**. Using this feature you can inspect log files, running processes, and directory paths.

## Introduction
{: #introduction }

SSH reruns are not currently supported for GitLab or GitHub apps projects. This feature is in development and will be available soon. To find out if you authenticated through GitHub OAuth or GitHub apps, see the [GitHub apps integration](/docs/github-apps-integration/) page.
{: class="alert alert-info" }

CircleCI gives you the option to access all jobs via SSH. Read our [blog post](https://circleci.com/blog/debugging-ci-cd-pipelines-with-ssh-access/) on debugging CI/CD pipelines with SSH.

When you log in with SSH, you are running an **interactive** login shell. You may be running the command on top of the directory where the command failed the first time, or you may be running the command from the directory one level up from where the command failed (e.g. `~/project/` or `~/`). Either way, you will not be initiating a clean run. You may wish to execute `pwd` or `ls` to ensure that you are in the correct directory.

Please note that a _default_ CircleCI pipeline executes steps in a non-interactive shell. There is a possibility that running steps using an interactive login may succeed, but in non-interactive mode.

## Steps
{: #steps }

1. Ensure that you have added an SSH key to your [GitHub](https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/) or [Bitbucket](https://confluence.atlassian.com/bitbucket/set-up-an-ssh-key-728138079.html) account.

2. To start a job with SSH enabled, select the **Rerun job with SSH** option from the **Rerun Workflow** dropdown menu.

     The `Rerun job with SSH` feature is intended for debugging purposes. These jobs will be created inside of the same pipeline as the original job.
     {: class="alert alert-info" }

3. To see the connection details, expand the **Enable SSH** section in the job output where you will see the SSH command needed to connect.

     The details are displayed again in the **Wait for SSH** section at the end of the job.

4. SSH to the running job (using the same SSH key that you use for GitHub or Bitbucket) to perform whatever troubleshooting you need to.

If you are using the Windows executor you will need to pass in the shell you want to use when using SSH. For example, to run  `powershell` in your build you would run: `ssh -p <remote_ip> -- powershell.exe`. Consider reading the [Hello world on Windows](/docs/hello-world-windows/) page to learn more.

The job virtual machine (VM) will remain available for an SSH connection for **10 minutes after the pipeline finishes running** and then automatically shut down (or you can cancel it). After you SSH into the job, the connection will remain open for **one hour** for customers on the Free plan, or **two hours** for all other customers.

If your job has parallel steps, CircleCI launches more than one VM to perform them. You will see more than one 'Enable SSH' and 'Wait for SSH' section in the job output.

## Debugging: "permission denied (publickey)"
{: #debugging-permission-denied-publickey }

If you run into permission issues trying to SSH to your job, try the following in the sections below.

### Ensure authentication with GitHub/Bitbucket
{: #ensure-authentication-with-githubbitbucket }

A single command can be used to test that your keys are set up as expected.

For GitHub, run:
```bash
ssh git@github.com
```

Or, for Bitbucket, run:
```bash
ssh -Tv git@bitbucket.org
```

You should see both the following in the output:

```bash
$ Hi :username! You've successfully authenticated...
```

```bash
$ logged in as :username.
```

If you _do not_ see output like above, you can try troubleshooting with the following:
- [Troubleshooting your SSH keys with GitHub](https://help.github.com/articles/error-permission-denied-publickey)
- [Troubleshooting your SSH keys with Bitbucket](https://confluence.atlassian.com/bitbucket/troubleshoot-ssh-issues-271943403.html)

### Ensure authenticating as the correct user
{: #ensure-authenticating-as-the-correct-user }

The user that triggered the rerun is the user that is required to authenticate. You will need to make sure that your username is in the 'Enable SSH' step.

If you have multiple accounts, double-check that you are authenticated as the right one. In order to SSH into a CircleCI build, the username must be one which has access to the project being built.

If you are authenticating as the wrong user, you can try to resolve this by offering a different SSH key with `ssh -i`. See the next section for guidance on confirming which key is being offered.

### Ensure the correct key is offered to CircleCI
{: #ensure-the-correct-key-is-offered-to-circleci }

If you have verified that you can authenticate as the correct user, but you are still getting "Permission denied" from CircleCI, you may be offering the wrong credentials to CircleCI.

Check which key is being offered that authenticates you, by running:

```bash
$ ssh -v git@github.com
```
Or,
```bash
$ ssh -v git@bitbucket.com
```

In the output, look for a sequence like this:

```bash
debug1: Offering public key: /Users/me/.ssh/id_ed25519_github
<...>
debug1: Authentication succeeded (publickey).
```

This sequence indicates that the key `/Users/me/.ssh/id_ed25519_github` is the one which your VCS accepted.

Next, run the SSH command for your CircleCI job, but add the `-v` flag. In the output, look for one or more lines like this:

```bash
debug1: Offering public key: ...
```

Make sure that the key which your VCS accepted (in our example, `/Users/me/.ssh/id_ed25519_github`) was also offered to CircleCI.

If it was not offered, you can specify it via the `-i` command-line argument to SSH. For example:

```bash
$ ssh -i /Users/me/.ssh/id_ed25519_github -p 64784 54.224.97.243
```

When you add the `-v` flag, you can also run multiple options in verbose mode to get more details, for example:

```bash
$ ssh -vv git@github.com
```
or the maximum of
```bash
$ ssh -vvv git@github.com
```

## See also
{: #see-also }

- [GitHub integration](/docs/github-integration/)
- [Bitbucket integration](/docs/bitbucket-integration/)
