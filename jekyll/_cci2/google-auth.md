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

## Steps

### Create and download service account

1. Visit <https://console.developers.google.com/apis/credentials/serviceaccountkey/>.
2. Select your project by clicking the **Select** button, then choosing a project from the pop-up window.
3. In the **Service account** dropdown, select **New service account**.
4. Give your service account a name. A custom service account ID will be generated based on this name.
5. Select the **JSON** key type, then click the **Create** button. The JSON file will be downloaded to your machine.
