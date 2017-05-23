---
layout: classic-docs
title: "Google Container Engine"
short-title: "Google Container Engine"
categories: [deploying]
description: "Setting up continuous deployment with Google Cloud Platform's Container Engine with CircleCI 2.0."
order: 30
---

In order to use Google Cloud, you will need to ensure that the [Google Cloud SDK](https://cloud.google.com/sdk/) is installed on your primary container.

## Prerequisites

This document makes the following assumptions:

1. You have a working knowledge of Docker and building Docker images.
1. You already have a GCP project registered. Keep the project name handy.
1. A Container Engine cluster has already been created in your GCP project. Keep the cluster name handy.
1. Your repository has already been configured as a CircleCI 2.0 project.

## Selecting a Base Image
If Debian is acceptable as a base for your custom primary container, Google's [`google/cloud-sdk`](https://hub.docker.com/r/google/cloud-sdk/) image can be a good base image to use.

For those with more complicated custom primary containers, follow the [installation instructions](https://cloud.google.com/sdk/) for the operating system of your base image.

## Setting Up Authentication

### Generating a Service Account Key
Once the Google Cloud SDK has been integrated into your primary container (see above), authentication can be achieved with the use of a [service account](https://cloud.google.com/docs/authentication#getting_credentials_for_server-centric_flow). Ensure that you follow the Google Cloud documentation for generating a service account, or create a new key for an existing service account, saving the credentials as a JSON key.

### Encoding and Storing the Credentials
Once a valid service account key has been downloaded in JSON format, we must encode the file's contents and save the encoded result to the `GOOGLE_AUTH` environment variable in the CircleCI project settings via the web interface.

_**Note:** It is not advised to save the environment variable for authentication in your `config.yml` file. The credentials will be encoded, **NOT** encrypted._ 

Given a key filename of `My Project.json`, we will encode the file's contents to easily save it as a string environment variable. In a Mac OS X or Linux terminal (shell):

```sh
base64 "My Project.json"
```

Copy the result of the command to the clipboard, and paste this into a new environment variable's "Value" field, using the name `GOOGLE_AUTH`. Using this particular name is not required, but will be used throughout the examples in this document.

Next, simply set up three more environment variables for convenience:

* `GOOGLE_PROJECT_ID`: the ID of your GCP project
* `GOOGLE_CLUSTER_NAME`: the cluster to which deployments will occur
* `GOOGLE_COMPUTE_ZONE`: which compute zone to use by default, e.g. `us-central1-a`

### Setting Up a Job Step to Decode Credentials
Once the `GOOGLE_AUTH` environment variable has been saved to your project, it will be readily available for use in the steps of your job's primary container. In order to configure `gcloud` to use the service account key as its authentication method, the key must be reconstructed by decoding it from the environment variable back into a JSON key file for use on the primary container:

**config.yml**

```yml
steps:
  # ...
  - run:
      name: Decode Google Cloud Credentials
      command: echo ${GOOGLE_AUTH} | base64 -i --decode > ${HOME}/gcp-key.json
  # ...  
```

## Configuring `gcloud`

As part of your deployment commands, configure `gcloud` to use the newly-configured service account and set up the appropriate defaults:

```sh
gcloud auth activate-service-account --key-file ${HOME}/gcp-key.json
gcloud --quiet config set project ${GOOGLE_PROJECT_ID}
gcloud --quiet config set compute/zone ${GOOGLE_COMPUTE_ZONE}
gcloud --quiet config set container/cluster ${GOOGLE_CLUSTER_NAME}
gcloud --quiet container clusters get-credentials ${GOOGLE_CLUSTER_NAME}
```

## Deploying

By ensuring that the Google Cloud SDK is installed in your primary container, `gcloud` and all of the necessary tools for manipulating Kubernetes resources are at your disposal inside your deployment script/commands. Though the use of Kubernetes is a large subject outside of the scope of this document, [the CircleCI 1.0 documentation on deployment to GKE](https://circleci.com/docs/1.0/continuous-deployment-with-google-container-engine/#deploysh) has helpful examples that should get you started on simple deployments, and there are [numerous freely-available online resources](https://circleci.com/docs/1.0/continuous-deployment-with-google-container-engine/#how-to-setup-the-project-and-cluster) to guide you along the way.