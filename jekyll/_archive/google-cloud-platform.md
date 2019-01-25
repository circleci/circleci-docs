---
layout: classic-docs
title: Deploying to Google Cloud Platform
categories: [how-to]
description: Deploying to Google Cloud Platform
sitemap: false
---

## Prerequisites

Setting up continuous deployment to Google Cloud Platform is pretty 
straightforward. Whether you are deploying to Google App Engine, Google Managed 
VMs, Google Compute Engine, or Google Container Engine, you'll need to first 
complete some of the same prerequisites.

### gcloud

The [Google Cloud SDK](https://cloud.google.com/sdk/), or the gcloud tool, is 
the command line tool that can be used to deploy to any Google Cloud product. 
Fortunately, it comes pre-installed on CircleCI.

### Python 2.7

In order to use the `gcloud` program, you will need to activate Python 2.7.

For example, if your tests require Python 3.5, you can specify the version required by `gcloud` in your `circle.yml`:

```
deployment:
  production:
    pre:
      - pyenv global 2.7.12
```

### Service Account Authentication

You'll need to use a GCP Service Account to authenticate the `gcloud` tool 
before deploying your project. See more detail on this in the 
[gcloud authentication doc]( {{ site.baseurl }}/1.0/google-auth/). You can also see 
a complete, working example in the 
[sample App Engine project](https://github.com/GoogleCloudPlatform/continuous-deployment-circle).

## Google App Engine and Managed VMs

To deploy to Google App Engine, see the 
[complete doc]( {{ site.baseurl }}/1.0/deploy-google-app-engine/) or the 
[sample project](https://github.com/GoogleCloudPlatform/continuous-deployment-circle).

## Google Compute Engine And Google Container Engine

Deployment processes to Compute Engine and Container Engine can vary, but the 
gcloud tool is usually the foundational piece for interacting with these 
environments. For compute engine, you can use:

```
sudo /opt/google-cloud-sdk/bin/gcloud --quiet compute copy-files <artifact> <instance_name:path_to_artifact>
```

to copy artifacts to your instance. For Container Engine, the gcloud command can download the kubectl command

```
sudo /opt/google-cloud-sdk/bin/gcloud --quiet components update kubectl
sudo /opt/google-cloud-sdk/bin/gcloud container clusters get-credentials <your-cluster>
```

which can then be used to interact with your Kubernetes cluster.
