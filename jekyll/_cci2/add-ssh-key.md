---
layout: classic-docs
title: "Adding an SSH Key to CircleCI"
short-title: "Adding an SSH Key"
description: "How to Add an SSH Key to CircleCI"
order: 20
---

*[Basics]({{ site.baseurl }}/2.0/basics/) > Adding SSH Keys*

## Overview

If deploying to your servers requires SSH access,
you'll need to upload the keys to CircleCI.

## Adding an SSH Key

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
