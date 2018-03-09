---
layout: classic-docs
title: "Deploying to Google Kubernetes Engine"
short-title: "Deploying to Google Kubernetes Engine"
categories: [containerization]
description: "Deploying to Google Kubernetes Engine with CircleCI 2.0."
order: 60
---

*[Deploy]({{ site.baseurl }}/2.0/deployment-integrations/) > Deploying to Google Kubernetes Engine*

In order to deploy to Google Kubernetes Engine (GKE),
you must install the [Google Cloud SDK](https://cloud.google.com/sdk/) in your primary container.

## Prerequisites

- A CircleCI 2.0 project.
- A working knowledge of Docker and building Docker images.
- A registered Google Cloud Platform (GCP) project. Keep the project name handy.
- A GKE cluster connected to your GCP project. Keep the cluster name handy.

## Steps

### Select a Base Image

If Debian is an acceptable operating system for your primary container,
consider using Google's [`google/cloud-sdk`](https://hub.docker.com/r/google/cloud-sdk/) as a base image.
Otherwise,
follow the [SDK installation instructions](https://cloud.google.com/sdk/) for your base image's operating system.

### Authenticate Google Cloud Platform

Before you can use the `gcloud` command line tool with CircleCI,
you must authenticate it.
Follow the instructions in the [Authenticating Google Cloud Platform]({{ site.baseurl }}/2.0/google-auth/) document.
After completing those steps,
you should have an environment variable called `GCLOUD_SERVICE_KEY`.
Using this particular  name is not required,
but will be used throughout the examples in this document.

### Add More Environment Variables

For convenicnce,
add three more environment variables to your project:

- `GOOGLE_PROJECT_ID`: the ID of your GCP project
- `GOOGLE_CLUSTER_NAME`: the target cluster for all deployments
- `GOOGLE_COMPUTE_ZONE`: the default [compute zone](https://cloud.google.com/compute/docs/regions-zones/)

### Setting Up a Job Step to Decode Credentials
Once the `GCLOUD_SERVICE_KEY` environment variable has been saved to your project, it will be readily available for use in the steps of your job's primary container.

**config.yml**

```yaml
docker: 
  - image: gcr.io/project/image-name
    auth:
    #Put the contents of keyfile.json into an environment variable for the build called GCR_CREDS, which is then passed in.
      username: _json_key
      password: $GCLOUD_SERVICE_KEY
  - steps:
     # ...
     - run:
       name: Dump Google Cloud Credentials to file
       command: echo ${GCLOUD_SERVICE_KEY} > ${HOME}/gcp-key.json
     # ...  
```

## Configuring `gcloud`

As part of your deployment commands, configure `gcloud` to use the newly-configured service account and set up the appropriate defaults:

```bash
gcloud auth activate-service-account --key-file ${HOME}/gcp-key.json
gcloud --quiet config set project ${GOOGLE_PROJECT_ID}
gcloud --quiet config set compute/zone ${GOOGLE_COMPUTE_ZONE}
gcloud --quiet container clusters get-credentials ${GOOGLE_CLUSTER_NAME}
```
