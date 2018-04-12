---
layout: classic-docs
title: "Adding an SSH Key to CircleCI"
short-title: "Adding an SSH Key"
description: "How to Add an SSH Key to CircleCI"
order: 20
---

*[Basics]({{ site.baseurl }}/2.0/basics/) > Adding SSH Keys*

If deploying to your servers requires SSH access,
you'll need to add SSH keys to CircleCI.

## Overview

There are two reasons
to add SSH keys to CircleCI:

1. To check out code from version control systems.
2. To enable running processes to access other services.

## Steps

1. In the CircleCI application,
go to your project's settings
by clicking the gear icon next to your project.

2. In the **Build Settings** section,
click on **SSH Permissions**.

3. Click the **Add SSH Key** button.

4. In the **Hostname** field,
enter the key's associated host (e.g. "git.heroku.com").
If you don't specify a hostname,
the key will be used for all hosts.

5. In the **Private Key** field,
paste the SSH key
you are adding.

6. Click the **Add SSH Key** button.

**Note:**
Since CircleCI cannot decrypt SSH keys,
every new key must have an empty passphrase.

## Advanced Usage

By default,
all CircleCI jobs are configured with `ssh-agent`
and automatically load _all_ keys.
While this is usually sufficient,
you may need finer control
over which keys authenticate.
This is particularly useful
for handling a "Too many authentication failures" error.

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
