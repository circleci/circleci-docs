---
layout: classic-docs
title: Installing the Google Cloud SDK
description: How to install and authorize the Google Cloud SDK
---

*[Deploy]({{ site.baseurl }}/2.0/deployment-integrations/) > Installing the Google Cloud SDK*

This document explains
how to install the [Google Cloud SDK](https://cloud.google.com/sdk/) in your primary container.

* TOC
{:toc}

## Overview

The Google Cloud SDK is a powerful set of tools
that can be used to access Google Cloud Platform (GCP) services
like Google Compute Engine and Google Kubernetes Engine.
On CircleCI, the Google Cloud SDK is required
to deploy your application to GCP products.

## Prerequisites

- A CircleCI 2.0 project.
- A GCP project.

## Steps

### Choosing a Base Image for the Deploy Job

If Debian is an acceptable operating system for your primary container,
consider using Google's base Docker image.
You can find this image on DockerHub as [`google/cloud-sdk`](https://hub.docker.com/r/google/cloud-sdk/).

Otherwise, follow the [Google Cloud SDK installation instructions](https://cloud.google.com/sdk/) for your base image's operating system.

### Creating and Storing a Service Account

Before you can use any tools in the Google Cloud SDK,
you must authorize `gcloud`.
Google offers two types of authorization: user accounts and service accounts.
Because you are installing the Cloud SDK on CircleCI,
the service account is the appropriate choice.

1. Create a service account
by following Steps 1-3 of [Google's instructions](https://cloud.google.com/sdk/docs/authorizing#authorizing_with_a_service_account).
Remember to download the JSON-formatted key file.

2. Add the key file to CircleCI as a [project environment variable]({{ site.baseurl }}/2.0/env-vars/#adding-a-project-level-environment-variable).
In this example, the variable is named `GCLOUD_SERVICE_KEY`.

5. Paste the JSON file from Step 1 into the **Value** field.

6. Click the **Add Variable** button.

### Authorizing the Google Cloud SDK

To authorize the `gcloud` tool,
store the contents of the environment variable in another file.
To do this,
add the following command to `.circleci/config.yml`.

    echo $GCLOUD_SERVICE_KEY > ${HOME}/gcloud-service-key.json

### Authorize the `gcloud` Tool

Authorize `gcloud`
and set the project's active configuration.

    sudo /opt/google-cloud-sdk/bin/gcloud auth activate-service-account --key-file=${HOME}/gcloud-service-key.json
    sudo /opt/google-cloud-sdk/bin/gcloud config set project $GCLOUD_PROJECT

### Set Google Application Credentials

To use certain services (like Google Cloud Datastore),
you will also need to set the CircleCI `$GOOGLE_APPLICATION_CREDENTIALS` environment variable to `${HOME}/gcloud-service-key.json`.

In your configuration,
you can use this environment variable
to authorize the `gcloud` tool.
