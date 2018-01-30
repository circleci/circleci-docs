---
layout: classic-docs
title: Authenticating Google Cloud Platform
description: Authenticating Google Cloud Platform
---

Before you can use the `gcloud` command line tool with CircleCI, you must authenticate it. To do this, you will need to create a [service account][]. You can then add this account as an [environment variable][] within CircleCI. Your build script will decode this variable and authenticate the `gcloud` tool for use in your project.

## Prerequisites

- A Google account.
- A Google Cloud Platform project.

[Service Account]: https://developers.google.com/identity/protocols/OAuth2ServiceAccount
[environment variable]: {{ site.baseurl }}/2.0/env-vars/
