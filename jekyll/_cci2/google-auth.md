---
layout: classic-docs
title: Authenticating Google Cloud Platform
description: Authenticating Google Cloud Platform
---

Before you can use the `gcloud` command line tool with CircleCI, you must authenticate it. To do this, you will need to create a [service account][]. This account can then be added as an [environment variable][] within CircleCI. Your build script will decode this variable and authenticate the `gcloud` tool, which you can then use to deploy and interact with your project.

[Service Account]: https://developers.google.com/identity/protocols/OAuth2ServiceAccount
[environment variable]: {{ site.baseurl }}/2.0/env-vars/
