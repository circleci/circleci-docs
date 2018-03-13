---
layout: classic-docs
title: Authenticating Google Cloud Platform
description: Authenticating Google Cloud Platform
---

*[Deploy]({{ site.baseurl }}/2.0/deployment-integrations/) > Authenticating Google Cloud Platform*

Before you can use the `gcloud` command line tool with CircleCI, you must authenticate it. To do this, you will need to create a [service account][]. You can then add this account as an [environment variable]({{ site.baseurl }}/2.0/env-vars/) within CircleCI. Your build script will decode this variable and authenticate the `gcloud` tool for use in your project.

## Prerequisites

- A CircleCI 2.0 project.
- A Google account.
- A Google Cloud Platform project.

## Steps

### Create a Service Account and Download

Go to Google's [Getting Started with Authentication][] article and follow the instructions in the **Creating a service account** section.

### Add Service Account to CircleCI Environment

1. Encode the JSON file you downloaded in base64 format and copy the result to the clipboard.
2. In the CircleCI application, go to your project's settings by clicking the gear icon in the top right.
3. In the **Build Settings** section, click **Environment Variables**, then click the **Add Variable** button.
4. Name the variable. In this example, the variable is named `$GCLOUD_SERVICE_KEY`.
5. Paste the contents from Step 1 into the **Value** field.
6. Click the **Add Variable** button.

### Decode and Store Service Account

To authenticate the `gcloud` tool, you will first need to decode the environment variable you created above. You could do that by adding the following command to `config.yml`:

    echo $GCLOUD_SERVICE_KEY | base64 --decode --ignore-garbage > ${HOME}/gcloud-service-key.json

This will decode the secret into a file named `gcloud-service-key.json`.

### Authenticate the `gcloud` Tool

Update `gcloud`, authenticate, and set the project's active configuration.

    sudo /opt/google-cloud-sdk/bin/gcloud --quiet components update
    sudo /opt/google-cloud-sdk/bin/gcloud auth activate-service-account --key-file=${HOME}/gcloud-service-key.json
    sudo /opt/google-cloud-sdk/bin/gcloud config set project $GCLOUD_PROJECT

### Set Google Application Credentials

To use certain services (like Google Cloud Datastore), you will also need to set the CircleCI `$GOOGLE_APPLICATION_CREDENTIALS` environment variable to `${HOME}/gcloud-service-key.json`. See above for instructions on adding environment variables to CircleCI projects.

[Service Account]: https://developers.google.com/identity/protocols/OAuth2ServiceAccount
[Getting Started with Authentication]: https://cloud.google.com/docs/authentication/getting-started
[certutil]: https://stackoverflow.com/questions/16945780/decoding-base64-in-batch
