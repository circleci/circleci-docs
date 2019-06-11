---
layout: classic-docs
title: "Debugging with SSH"
short-title: "Debugging with SSH"
description: "How to access a build container using SSH on CircleCI 2.0"
categories: [troubleshooting]
order: 20
---

This document describes how to access a build container using SSH on CircleCI 2.0 in the following sections:

* TOC
{:toc}

## Overview
Often the best way to troubleshoot problems is to SSH into a job and inspect things like log files, running processes, and directory paths. CircleCI 2.0 gives you the option to access all jobs via SSH. Read our [blog post](https://circleci.com/blog/debugging-ci-cd-pipelines-with-ssh-access/) on debugging CI/CD pipelines with SSH.

When you log in with SSH, you are running an interactive login shell. You are also likely to be running the command on top of the directory where the command failed the first time, so you are not starting a clean run. In contrast, CircleCI uses a non-interactive shell for running commands by default. Hence, steps run in interactive mode may succeed, while failing in non-interactive mode.

## Steps

1. Ensure that you have added an SSH key to your [GitHub](https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/) or [Bitbucket](https://confluence.atlassian.com/bitbucket/set-up-an-ssh-key-728138079.html) account.

2. To start a job with SSH enabled, select the 'Rerun job with SSH' option from the 'Rerun Workflow' dropdown menu.

3. To see the connection details, expand the 'Enable SSH' section in the job output where you will see the SSH command needed to connect:
![SSH connection details](https://circleci-discourse.s3.amazonaws.com/optimized/2X/5/57f50e26ec245d0373c4265ec4375641553bdbdb_1_690x295.png)
![SSH connection details](https://circleci-discourse.s3.amazonaws.com/optimized/2X/5/514e8aec3e8017dac8e8d401d22432026b473161_1_690x281.png)

     The details are displayed again in the 'Wait for SSH' section at the end of the job.

4. SSH to the running job (using the same SSH key that you use for GitHub or Bitbucket) to perform whatever troubleshooting you need to.

The build VM will remain available for an SSH connection for **10 minutes after the build finishes running** and then automatically shut down. (Or you can cancel it.) After you SSH into the build, the connection will remain open for **two hours**.

**Note**: If your job has parallel steps, CircleCI launches more than one VM to perform them. Thus, you'll see more than one 'Enable SSH' and 'Wait for SSH' section in the build output.

## Debugging: "Permission denied (publickey)"

If you run into permission troubles trying to SSH to your job, try
these things:

### Ensure Authentication With GitHub/Bitbucket
{:.no_toc}

A single command can be used to test that your keys are set up as expected. For
GitHub run:

```
ssh git@github.com
```

or for Bitbucket run:

```
ssh -Tv git@bitbucket.org
```

and you should see:

```
$ Hi :username! You've successfully authenticated...
```

for GitHub or for Bitbucket:

```
$ logged in as :username.
```

If you _don't_ see output like that, you need to start by
[troubleshooting your SSH keys with GitHub](https://help.github.com/articles/error-permission-denied-publickey)/
[troubleshooting your SSH keys with Bitbucket](https://confluence.atlassian.com/bitbucket/troubleshoot-ssh-issues-271943403.html).

### Ensure Authenticating as the Correct User
{:.no_toc}

If you have multiple accounts, double-check that you are
authenticated as the right one!

In order to SSH into a CircleCI build, the username must be one which has
access to the project being built!

If you're authenticating as the wrong user, you can probably resolve this
by offering a different SSH key with `ssh -i`. See the next section if
you need a hand figuring out which key is being offered.

### Ensure the Correct Key is Offered to CircleCI
{:.no_toc}

If you've verified that you can authenticate as the correct
user, but you're still getting "Permission denied" from CircleCI, you
may be offering the wrong credentials to us. (This can happen for
several reasons, depending on your SSH configuration.)

Figure out which key is being offered to GitHub that authenticates you, by
running:

```
$ ssh -v git@github.com

# or

$ ssh -v git@bitbucket.com
```

In the output, look for a sequence like this:

```
debug1: Offering RSA public key: /Users/me/.ssh/id_rsa_github
<...>
debug1: Authentication succeeded (publickey).
```

This sequence indicates that the key /Users/me/.ssh/id_rsa_github is the one which
GitHub accepted.

Next, run the SSH command for your CircleCI build, but add the -v flag.
In the output, look for one or more lines like this:

```
debug1: Offering RSA public key: ...
```

Make sure that the key which GitHub accepted (in our
example, /Users/me/.ssh/id_rsa_github) was also offered to CircleCI.

If it was not offered, you can specify it via the `-i` command-line
argument to SSH. For example:

```
$ ssh -i /Users/me/.ssh/id_rsa_github -p 64784 ubuntu@54.224.97.243
```

## See Also
{:.no_toc}

[GitHub and Bitbucket Integration](  {{ site.baseurl }}/2.0/gh-bb-integration/)
