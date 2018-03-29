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
consider using Google's base image.
You can find this image on DockerHub as [`google/cloud-sdk`](https://hub.docker.com/r/google/cloud-sdk/).
Otherwise, follow the [SDK installation instructions](https://cloud.google.com/sdk/) for your base image's operating system.

### Authenticate `gcloud`

Before you can use the `gcloud` command line tool with CircleCI,
you must authenticate it.
To do this,
follow the instructions in the [Authenticating Google Cloud Platform]({{ site.baseurl }}/2.0/google-auth/) document.
After completing these steps,
you should have created an environment variable called `GCLOUD_SERVICE_KEY`.
Using this particular name is not required,
but it will be used throughout the examples in this document.

### Add More Environment Variables

For convenience, add three more environment variables to your project:

- `GOOGLE_PROJECT_ID`: the ID of your GCP project
- `GOOGLE_COMPUTE_ZONE`: the default [compute zone](https://cloud.google.com/compute/docs/regions-zones/)
- `GOOGLE_CLUSTER_NAME`: the target cluster for all deployments

### Authenticate to Google's Container Registry

If you chose the `google/cloud-sdk` image,
no authentication is needed since this is a public image.

```yaml
version: 2
jobs:
  deploy-job:
    docker:
      - image: google/cloud-sdk
```

If you are using a custom image,
authenticate to Google's Container Registry (GCR).
Since you are [using a JSON key file](https://cloud.google.com/container-registry/docs/advanced-authentication#using_a_json_key_file),
use the `auth` key in `config.yml`
to specify credentials:

```yaml
version: 2
jobs:
  deploy-job:
    docker:
      - image: gcr.io/project/image-name
        auth:
          username: _json_key  # default username when using a JSON key file to authenticate
          password: $GCLOUD_SERVICE_KEY  # JSON service account you created
```

### Add a Job Step to Decode Credentials

To authenticate the `gcloud` tool,
add a job step
to transfer the contents of `GCLOUD_SERVICE_KEY` into a local file.

```yaml
version: 2
jobs:
  deploy-job:
    docker:
      - image: google/cloud-sdk
    steps:
      - run:
        name: Store Service Account
        command: echo $GCLOUD_SERVICE_KEY > ${HOME}/gcloud-service-key.json
```

### Configure `gcloud`

Finally, as part of your deployment commands,
update `gcloud`, authenticate, and set appropriate defaults for your project.

```bash
gcloud --quiet components update
gcloud auth activate-service-account --key-file=${HOME}/gcloud-service-key.json
gcloud --quiet config set project ${GOOGLE_PROJECT_ID}
gcloud --quiet config set compute/zone ${GOOGLE_COMPUTE_ZONE}
gcloud --quiet container clusters get-credentials ${GOOGLE_CLUSTER_NAME}
```

Refer to the [Google Cloud](https://circleci.com/docs/2.0/deployment-integrations/#google-cloud) deploy example for further steps.
