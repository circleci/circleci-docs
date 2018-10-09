---
layout: classic-docs
title: Permissions and access during deployment
categories: [how-to]
description: Permissions and access during deployment
last_updated: May 7, 2015
order: 1
sitemap: false
---

Sometimes you need to access external systems that require SSH key-based authentication during your build. Such case includes accessing your production server for deployment or pulling dependencies from private VCS.

You can add ssh private keys used to access these systems from our UI: **Project Settings > SSH Permissions** page.
If you leave the **Hostname** field blank, the key will be used for all hosts.

*Please note that added keys will need to have an empty passphrase, as CircleCI does not have the ability to decrypt and use them otherwise.*

### Under the hood
The ssh private keys that you add from the page are stored under the `~/.ssh` directory for the build user in the container. We also add entries to `~/.ssh/config` to specify which key is used to access which host. For example, if you add a key with the hostname `prod-server`, then `~/.ssh/id_prod-server` will be automatically created and `~/.ssh/config` will have an entry that looks like:

```
Host prod-server
IdentitiesOnly yes
IdentityFile /home/ubuntu/.ssh/id_prod-server
```
