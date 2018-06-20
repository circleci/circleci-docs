---
layout: classic-docs
title: Installing the Google Cloud SDK
description: How to install and authenticate the Google Cloud SDK
---

*[Deploy]({{ site.baseurl }}/2.0/deployment-integrations/) > Installing the Google Cloud SDK*

This document explains
how to install the [Google Cloud SDK](https://cloud.google.com/sdk/) in your primary container.

* TOC
{:toc}

## Overview

The Google Cloud SDK is a powerful set of tools
that can be used to access Google Cloud Platform services
like Google Compute Engine and Google Kubernetes Engine.

On CircleCI, the Google Cloud SDK is required
to deploy your application to Google Cloud Platform products.

## Prerequisites

- A CircleCI 2.0 project.
- A Google account.
- A Google Cloud Platform project.

## Steps

### Choosing a Base Image

If Debian is an acceptable operating system for your primary container,
consider using Google's base Docker image.
You can find this image on DockerHub as [`google/cloud-sdk`](https://hub.docker.com/r/google/cloud-sdk/).

Otherwise, follow the [SDK installation instructions](https://cloud.google.com/sdk/) for your base image's operating system.

### Authorizing the Cloud SDK

To do this,
you will need to create a [service account](https://developers.google.com/identity/protocols/OAuth2ServiceAccount)
and add it to CircleCI as an [environment variable]({{ site.baseurl }}/2.0/env-vars/).
In your configuration,
you can use this environment variable
to authenticate the `gcloud` tool.

### Create a Service Account and Download

Go to Google's [Getting Started with Authentication](https://cloud.google.com/docs/authentication/getting-started) article
and follow the instructions in the **Creating a service account** section.

### Add Service Account to CircleCI Environment

1. Copy the JSON file you downloaded to the clipboard.

2. In the CircleCI application,
go to your project's settings
by clicking the gear icon in the top right.

3. In the **Build Settings** section,
click **Environment Variables**,
then click the **Add Variable** button.

4. Name the variable.
In this example, the variable is named `GCLOUD_SERVICE_KEY`.

5. Paste the JSON file from Step 1 into the **Value** field.

6. Click the **Add Variable** button.

### Store Service Account

To authenticate the `gcloud` tool,
store the contents of the environment variable in another file.
To do this,
add the following command to `.circleci/config.yml`.

    echo $GCLOUD_SERVICE_KEY > ${HOME}/gcloud-service-key.json

### Authenticate the `gcloud` Tool

Authenticate `gcloud`
and set the project's active configuration.

    sudo /opt/google-cloud-sdk/bin/gcloud auth activate-service-account --key-file=${HOME}/gcloud-service-key.json
    sudo /opt/google-cloud-sdk/bin/gcloud config set project $GCLOUD_PROJECT

### Set Google Application Credentials

To use certain services (like Google Cloud Datastore),
you will also need to set the CircleCI `$GOOGLE_APPLICATION_CREDENTIALS` environment variable to `${HOME}/gcloud-service-key.json`.
See above for instructions on adding environment variables to CircleCI projects.
