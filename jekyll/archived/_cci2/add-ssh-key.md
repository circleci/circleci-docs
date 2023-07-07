---
layout: classic-docs
title: Add additional SSH keys to CircleCI
short-title: Add an SSH Key
description: How to add additional SSH keys to CircleCI
order: 20
contentTags:
  platform:
  - Cloud
  - Server v4.x
  - Server v3.x
---

If deploying to your servers requires SSH access, you will need to add SSH keys to CircleCI.

## Overview
{: #overview }

If you are looking to set up an SSH key in order to check out code from GitHub or Bitbucket, refer to the [GitHub](/docs/github-integration/#enable-your-project-to-check-out-additional-private-repositories) or [Bitbucket](/docs/bitbucket-integration/#enable-your-project-to-check-out-additional-private-repositories) integration pages.

If you are using GitLab as your VCS, or if you need additional SSH keys to access other services, follow the steps below for the version of CircleCI you are using to add an SSH key to your project.

You may need to add the public key to `~/.ssh/authorized_keys` in order to add SSH keys.
{: class="alert alert-info" }

## Steps to add additional SSH keys
{: #steps-to-add-additional-ssh-keys }

Since CircleCI cannot decrypt SSH keys, every new key must have an empty passphrase. The below examples are for macOS. See [GitHub](https://help.github.com/articlesgenerating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/) or [Bitbucket](https://support.atlassian.com/bitbucket-cloud/docs/configure-ssh-and-two-step-verification/) documentation for additional details on creating SSH keys.

1. In a terminal, generate the key with `ssh-keygen -t ed25519 -C "your_email@example.com"`. See [Secure Shell documentation](https://www.ssh.com/ssh/keygen/) for additional details.

2. In the CircleCI application, go to your project's settings by clicking the **Project Settings** button (top-right on the **Pipelines** page of the project).

3. On the **Project Settings** page, click on **SSH Keys**.

4. Scroll down to the **Additional SSH Keys** section.

5. Click the **Add SSH Key** button.

6. In the **Hostname** field, enter the key's associated host (for example, `git.heroku.com`). If you do not specify a hostname, the key will be used for all hosts.

7. In the **Private Key** field, paste the SSH key you are adding.

8. Click the **Add SSH Key** button.

## Add SSH Keys to a Job
{: #add-ssh-keys-to-a-job }

Even though all CircleCI jobs use `ssh-agent` to automatically sign all added SSH keys, you **must** use the `add_ssh_keys` key to actually add keys to a container.

To add a set of SSH keys to a container, use the `add_ssh_keys` [special step](/docs/configuration-reference/#add_ssh_keys) within the appropriate [job](/docs/jobs-steps/) in your configuration file.

For a self-hosted runner, ensure that you have an `ssh-agent` on your system to successfully use the `add_ssh_keys` step. The SSH key is written to `$HOME/.ssh/id_rsa_<fingerprint>`, where `$HOME` is the home directory of the user configured to execute jobs, and `<fingerprint>` is the fingerprint of the key. A host entry is also appended to `$HOME/.ssh/config`, along with a relevant `IdentityFile` option to use the key.
{: class="alert alert-info"}

```yaml
version: 2.1
jobs:
  deploy-job:
    steps:
      - add_ssh_keys:
          fingerprints:
            - "SO:ME:FIN:G:ER:PR:IN:T"
```

All fingerprints in the `fingerprints` list must correspond to keys that have been added through the CircleCI application. Fingerprints in CircleCI environment variables will fail.
{: class="alert alert-info" }

## Adding multiple keys with blank hostnames
{: #adding-multiple-keys-with-blank-hostnames }

If you need to add multiple SSH keys with blank hostnames to your project, you will need to make some changes to the default SSH configuration provided by CircleCI. In the scenario where you have multiple SSH keys that have access to the same hosts, but are for different purposes the default `IdentitiesOnly no` is set causing connections to use ssh-agent. This will always cause the first key to be used, even if that is the incorrect key. If you have added the SSH key to a container, you will need to either set `IdentitiesOnly no` in the appropriate block, or you can remove all keys from the ssh-agent for this job using `ssh-add -D`, and reading the key added with `ssh-add /path/to/key`.

## See Also
{: #see-also }

- [GitHub Integration]({{site.baseurl}}/github-integration)
- [Bitbucket Integration]({{site.baseurl}}/bitbucket-integration)
- [GitLab Integration]({{site.baseurl}}/gitlab-integration/)
