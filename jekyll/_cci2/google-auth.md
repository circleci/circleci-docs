---
layout: classic-docs
title: Authorizing the Google Cloud SDK
description: How to authorize the Google Cloud SDK
categories: [deploying]
order: 100
---

This document explains how to install and authorize the [Google Cloud SDK](https://cloud.google.com/sdk/) in your primary container.

* TOC
{:toc}

## Overview
{: #overview }
{:.no_toc}

The Google Cloud SDK is a powerful set of tools that can be used to access Google Cloud Platform (GCP) services like Google Compute Engine and Google Kubernetes Engine. On CircleCI, the Google Cloud SDK is recommended to deploy your application to GCP products.

## Prerequisites
{: #prerequisites }
{:.no_toc}

- A CircleCI 2.0 project.
- A GCP project.

### Installing the Google Cloud SDK
{: #installing-the-google-cloud-sdk }

If Debian is an acceptable operating system for your primary container, consider using Google's base Docker image.
You can find this image on DockerHub as [`google/cloud-sdk`](https://hub.docker.com/r/google/cloud-sdk/).

Otherwise, follow the [Google Cloud SDK installation instructions](https://cloud.google.com/sdk/) for your base image's operating system.

### Creating and storing a service account
{: #creating-and-storing-a-service-account }

Before you can use any tools in the Google Cloud SDK, you must authorize `gcloud`. Google offers two types of authorization: user accounts and service accounts. Because you are installing the Cloud SDK on CircleCI, the service account is the appropriate choice.

1. Create a service account by following Steps 1-3 of [Google's instructions](https://cloud.google.com/sdk/docs/authorizing#authorizing_with_a_service_account). Remember to download the JSON-formatted key file.

2. Add the key file to CircleCI as a [project environment variable]({{ site.baseurl }}/2.0/env-vars/#setting-an-environment-variable-in-a-project). In this example, the variable is named `GCLOUD_SERVICE_KEY`. Using this particular name is not required, but it will be used throughout the examples in this document.

3. For convenience, add two more environment variables to your CircleCI project:
    - `GOOGLE_PROJECT_ID`: the ID of your GCP project.
    - `GOOGLE_COMPUTE_ZONE`: the default [compute zone](https://cloud.google.com/compute/docs/regions-zones/).

#### Adding granular permissions
{: #adding-granular-permissions }

If you are having issues pushing container images to GCR you may need more granular permissions than the default `service account` provides. You can grant permission changes in the Cloud Storage [IAM Console](https://console.cloud.google.com/iam-admin/iam/project).

Refer to the Cloud Storage [permission documentation](https://cloud.google.com/storage/docs/access-control/iam-permissions)
to learn more about Identity and Access Management (IAM) permissions.

### Authenticating to Google Container Registry
{: #authenticating-to-google-container-registry }

Depending on the [base Docker image you chose](#installing-the-google-cloud-sdk), you may have to authenticate to the Google Container Registry.

```yaml
version: 2.1
jobs:
  deploy:
    docker:
      - image: google/cloud-sdk
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
```

If you are using a custom image, you must authenticate to GCR. Use the [`auth` key (https://circleci.com/docs/2.0/configuration-reference/#docker) to specify credentials.

```yaml
version: 2.1
jobs:
  deploy:
    docker:
      - image: gcr.io/project/<image-name>
        auth:
          username: _json_key  # default username when using a JSON key file to authenticate
          password: $GCLOUD_SERVICE_KEY  # JSON service account you created, do not encode to base64
```

**Note:** If base64 encoding is required for your particular workflow, use the following command:

```bash
cat <file> | base64 -w 0
```

### Authorization
{: #authorization }

Use `gcloud` to authorize the Google Cloud SDK and set several default settings. Before executing this command, make sure to write the key to a file before running this command, otherwise, the key file will be interpreted as a .p12 file.

```yaml
version: 2.1
jobs:
  deploy:
    docker:
      - image: google/cloud-sdk
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - run: |
          echo $GCLOUD_SERVICE_KEY | gcloud auth activate-service-account --key-file=-
          gcloud --quiet config set project ${GOOGLE_PROJECT_ID}
          gcloud --quiet config set compute/zone ${GOOGLE_COMPUTE_ZONE}
```

**Note:**
If you are using a custom base image, ensure that you have the most recent components by adding the following command before authorizing the SDK.

```bash
sudo gcloud --quiet components update
```
