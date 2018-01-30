---
layout: classic-docs
title: Authenticating Google Cloud Platform
description: Authenticating Google Cloud Platform
---

Before you can use the `gcloud` command line tool with CircleCI, you must authenticate it. To do this, you will need to create a [service account][]. You can then add this account as an [environment variable][] within CircleCI. Your build script will decode this variable and authenticate the `gcloud` tool for use in your project.

## Prerequisites

- A Google account.
- A Google Cloud Platform project.

## Steps

### Create and download service account

1. Visit <https://console.developers.google.com/apis/credentials/serviceaccountkey/>.
2. Select your project by clicking the **Select** button, then choosing a project from the pop-up window.
3. In the **Service account** dropdown, select **New service account**.
4. Give your service account a name. A custom service account ID will be generated based on this name.
5. Select the **JSON** key type, then click the **Create** button. The JSON file will be downloaded to your machine.

### Add service account to CircleCI environment

1. Encode the JSON file in base64 format. Unix users can type `base64 <service-account-name.json>`. Windows users will need to use [certutil][].
2. Copy the encoded result of step 1 to the clipboard.
3. In the CircleCI application, go to your project's settings by clicking the gear icon in the top right.
4. In the **Build Settings** section, click **Environment Variables**, then click the **Add Variable** button.
5. Name the variable. In this example, the variable is named `$GCLOUD_SERVICE_KEY`.
6. Paste the contents from step 2 into the **Value** field.
7. Click the **Add Variable** button.

[Service Account]: https://developers.google.com/identity/protocols/OAuth2ServiceAccount
[environment variable]: {{ site.baseurl }}/2.0/env-vars/
[certutil]: https://stackoverflow.com/questions/16945780/decoding-base64-in-batch
