---
layout: classic-docs
title: "Deploying to Google Container Engine"
short-title: "Deploying to Google Container Engine"
categories: [containerization]
description: "Deploying to Google Container Engine with CircleCI 2.0."
order: 60
---

*[Deploy]({{ site.baseurl }}/2.0/deployment-integrations/) > Using Google Container Engine*

In order to deploy to Google Kubernetes Engine (GKE),
you must install the [Google Cloud SDK](https://cloud.google.com/sdk/) in your primary container.

## Prerequisites

- A CircleCI 2.0 project.
- A working knowledge of Docker and building Docker images.
- A registered Google Cloud Platform (GCP) project. Keep the project name handy.
- A GKE cluster connected to your GCP project. Keep the cluster name handy.

## Selecting a Base Image
If Debian is acceptable as a base for your custom primary container, Google's [`google/cloud-sdk`](https://hub.docker.com/r/google/cloud-sdk/) image can be a good base image to use.

For those with more complicated custom primary containers, follow the [installation instructions](https://cloud.google.com/sdk/) for the operating system of your base image.

## Setting Up Authentication

### Generating a Service Account Key
After the Google Cloud SDK has been integrated into your primary container (see above), authentication can be achieved with the use of a [service account](https://cloud.google.com/docs/authentication#getting_credentials_for_server-centric_flow). Ensure that you follow the Google Cloud documentation for generating a service account, or create a new key for an existing service account, saving the credentials as a JSON key.

Paste this into a new environment variable's "Value" field, using the name `GOOGLE_AUTH`. Using this particular name is not required, but will be used throughout the examples in this document.

Next, simply set up three more environment variables for convenience:

* `GOOGLE_PROJECT_ID`: the ID of your GCP project
* `GOOGLE_CLUSTER_NAME`: the cluster to which deployments will occur
* `GOOGLE_COMPUTE_ZONE`: which compute zone to use by default, e.g. `us-central1-a`

### Setting Up a Job Step to Decode Credentials
Once the `GOOGLE_AUTH` environment variable has been saved to your project, it will be readily available for use in the steps of your job's primary container. 

**config.yml**

```yaml
docker: 
  - image: gcr.io/project/image-name
    auth:
    #Put the contents of keyfile.json into an environment variable for the build called GCR_CREDS, which is then passed in.
      username: _json_key
      password: $GOOGLE_AUTH 
  - steps:
     # ...
     - run:
       name: Dump Google Cloud Credentials to file
       command: echo ${GOOGLE_AUTH} > ${HOME}/gcp-key.json
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
