---
layout: classic-docs
title: "Adding an SSH Key to CircleCI"
short-title: "Adding an SSH Key"
description: "How to Add an SSH Key to CircleCI"
order: 20
---

If deploying to your servers requires SSH access,
you'll need to add SSH keys to CircleCI.

## Overview

There are two reasons
to add SSH keys to CircleCI:

1. To check out code from version control systems.
2. To enable running processes to access other services.

If you are adding an SSH key for the first reason,
refer to the [GitHub and Bitbucket Integration]({{ site.baseurl }}/2.0/gh-bb-integration/#enable-your-project-to-check-out-additional-private-repositories) document.
Otherwise,
follow the steps below to add an SSH key to your project.

## Steps

1. In the CircleCI application,
go to your project's settings
by clicking the gear icon next to your project.

2. In the **Permissions** section,
click on **SSH Permissions**.

3. Click the **Add SSH Key** button.

4. In the **Hostname** field,
enter the key's associated host (for example, "git.heroku.com").
If you don't specify a hostname,
the key will be used for all hosts.

5. In the **Private Key** field,
paste the SSH key
you are adding.

6. Click the **Add SSH Key** button.

**Note:**
Since CircleCI cannot decrypt SSH keys,
every new key must have an empty passphrase.
CircleCI also will not accept OpenSSH's default file format - use `ssh-keygen -m pem` if you are using OpenSSH to generate your key.

## Adding SSH Keys to a Job

Even though all CircleCI jobs use `ssh-agent`
to automatically sign all added SSH keys,
you **must** use the `add_ssh_keys` key
to actually add keys to a container.

To add a set of SSH keys to a container,
use the `add_ssh_keys` [special step]({{ site.baseurl }}/2.0/configuration-reference/#add_ssh_keys)
within the appropriate [job]({{ site.baseurl }}/2.0/jobs-steps/)
in your configuration file.

```yaml
version: 2
jobs:
  deploy-job:
    steps:
      - add_ssh_keys:
          fingerprints:
            - "SO:ME:FIN:G:ER:PR:IN:T"
```

**Note:**
All fingerprints in the `fingerprints` list
must correspond to keys
that have been added through the CircleCI application.

## Adding multiple keys with blank hostnames

If you need to add multiple SSH keys with blank hostnames to your project you will need to make some changes to the default SSH configuration provided by CircleCI. In the scenario where you have multiple SSH keys that have access to the same hostss, but are for different purposes the default `IdentitiesOnly no` is set causing connections to use ssh-agent. This will always cause the first key to be used, even if that is the incorrect key. If you have added the SSH key to a container you will need to either set `IdentitiesOnly no` in the appropriate block, or you can remove all keys from the ssh-agent for this job using `ssh-agent -D`, and reading the key added with `ssh-add /path/to/key`.

## See Also

[GitHub and Bitbucket Integration]({{ site.baseurl }}/2.0/gh-bb-integration/)
