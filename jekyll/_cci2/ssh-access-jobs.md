---
layout: classic-docs
title: "Debugging with SSH"
short-title: "Debugging with SSH"
description: "How to access a build container using SSH on CircleCI"
categories: [troubleshooting]
order: 20
version:
- Cloud
- Server v4.x
- Server v3.x
- Server v2.x
---

This document describes how to access a build container using SSH on CircleCI in the following sections:

* TOC
{:toc}

## Overview
{: #overview }
Often the best way to troubleshoot problems is to SSH into a job and inspect things like log files, running processes, and directory paths. CircleCI gives you the option to access all jobs via SSH. Read our [blog post](https://circleci.com/blog/debugging-ci-cd-pipelines-with-ssh-access/) on debugging CI/CD pipelines with SSH.

When you log in with SSH, you are running an interactive login shell. You may be running the command on top of the directory where the command failed the first time, **or** you may be running the command from the directory one level up from where the command failed (e.g. `~/project/` or `~/`). Either way, you will not be initiating a clean run (you may wish to execute `pwd` or `ls` to ensure that you are in the correct directory).

Please note that a default CircleCI pipeline executes steps in a non-interactive shell and hence, there is the possibility that running steps using an interactive login may succeed, while failing in non-interactive mode.

## Steps
{: #steps }

1. Ensure that you have added an SSH key to your [GitHub](https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/) or [Bitbucket](https://confluence.atlassian.com/bitbucket/set-up-an-ssh-key-728138079.html) account.

2. To start a job with SSH enabled, select the 'Rerun job with SSH' option from the 'Rerun Workflow' dropdown menu.

     **Note:** The `Rerun job with SSH` feature is intended for debugging purposes. These jobs will be created inside of the same pipeline as the original job. 

3. To see the connection details, expand the 'Enable SSH' section in the job output where you will see the SSH command needed to connect.

     The details are displayed again in the 'Wait for SSH' section at the end of the job.

4. SSH to the running job (using the same SSH key that you use for GitHub or Bitbucket) to perform whatever troubleshooting you need to.

If you are using the Windows executor you will need to pass in the shell you want to use when using SSH. For example, To run  `powershell` in your build you
would run: `ssh -p <remote_ip> -- powershell.exe`. Consider reading the [Hello World on Windows]({{site.baseurl}}/hello-world-windows) document to learn more.

The build VM will remain available for an SSH connection for **10 minutes after the build finishes running** and then automatically shut down (or you can cancel it). After you SSH into the build, the connection will remain open for **one hour** for customers on a free plan or **two hours** for all other customers.

**Note**: If your job has parallel steps, CircleCI launches more than one VM to perform them. Thus, you'll see more than one 'Enable SSH' and 'Wait for SSH' section in the build output.

## Debugging: "permission denied (publickey)"
{: #debugging-permission-denied-publickey }

If you run into permission troubles trying to SSH to your job, try
these things:

### Ensure authentication with GitHub/Bitbucket
{: #ensure-authentication-with-githubbitbucket }
{:.no_toc}

A single command can be used to test that your keys are set up as expected. For
GitHub run:

```bash
ssh git@github.com
```

or for Bitbucket run:

```bash
ssh -Tv git@bitbucket.org
```

and you should see:

```bash
$ Hi :username! You've successfully authenticated...
```

for GitHub or for Bitbucket:

```bash
$ logged in as :username.
```

If you _don't_ see output like that, you need to start by
[troubleshooting your SSH keys with GitHub](https://help.github.com/articles/error-permission-denied-publickey)/
[troubleshooting your SSH keys with Bitbucket](https://confluence.atlassian.com/bitbucket/troubleshoot-ssh-issues-271943403.html).

### Ensure authenticating as the correct user
{: #ensure-authenticating-as-the-correct-user }
{:.no_toc}

If you have multiple accounts, double-check that you are
authenticated as the right one!

In order to SSH into a CircleCI build, the username must be one which has
access to the project being built!

If you're authenticating as the wrong user, you can probably resolve this
by offering a different SSH key with `ssh -i`. See the next section if
you need a hand figuring out which key is being offered.

### Ensure the correct key is offered to CircleCI
{: #ensure-the-correct-key-is-offered-to-circleci }
{:.no_toc}

If you've verified that you can authenticate as the correct
user, but you're still getting "Permission denied" from CircleCI, you
may be offering the wrong credentials to us. (This can happen for
several reasons, depending on your SSH configuration.)

Figure out which key is being offered to GitHub that authenticates you, by
running:

```bash
$ ssh -v git@github.com

# Or

$ ssh -v git@bitbucket.com
```

In the output, look for a sequence like this:

```bash
debug1: Offering RSA public key: /Users/me/.ssh/id_rsa_github
<...>
debug1: Authentication succeeded (publickey).
```

This sequence indicates that the key /Users/me/.ssh/id_rsa_github is the one which
GitHub accepted.

Next, run the SSH command for your CircleCI build, but add the -v flag.
In the output, look for one or more lines like this:

```bash
debug1: Offering RSA public key: ...
```

Make sure that the key which GitHub accepted (in our
example, /Users/me/.ssh/id_rsa_github) was also offered to CircleCI.

If it was not offered, you can specify it via the `-i` command-line
argument to SSH. For example:

```bash
$ ssh -i /Users/me/.ssh/id_rsa_github -p 64784 54.224.97.243
```

## See also
{: #see-also }
{:.no_toc}

[GitHub and Bitbucket Integration](  {{ site.baseurl }}/gh-bb-integration/)
