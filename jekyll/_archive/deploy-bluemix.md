---
layout: classic-docs
title: Continuous Deployment to IBM Bluemix and Pivotal Web Service
categories: [how-to]
description: Continuous Deployment to IBM Bluemix and Pivotal Web Service
sitemap: false
---

Bluemix is a PaaS offering from IBM, and PWS is a PaaS offering from
Pivotal. It is pretty straightforward
to use the [Cloud Foundry command line tool 'cf'](https://github.com/cloudfoundry/cli) to deploy to both of those platforms from CircleCI.

## Quickstart

To deploy to Bluemix from CircleCI you will need to [set your Bluemix password]( {{ site.baseurl }}/1.0/environment-variables/#setting-environment-variables-for-all-commands-without-adding-them-to-git) 
and username, and modify 3 sections in circle.yml. 

Here's a minimal example circle.yml configuration:

```
dependencies:
  pre:
    - curl -v -L -o cf-cli_amd64.deb 'https://cli.run.pivotal.io/stable?release=debian64&source=github'
    - sudo dpkg -i cf-cli_amd64.deb
    - cf -v

test:
  post:
    - cf api https://api.ng.bluemix.net
    - cf auth $BLUEMIX_USER $BLUEMIX_PASSWORD
    - cf target -o $BLUEMIX_USER -s dev
    - cf a

deployment:
  production:
    branch: master
    commands:
      - cf push
```

## Details

### Add Cloud Foundry 'cf' utility as a Dependency

First, you have to **install the 'cf' tool on your build VM.**

This example [circle.yml]( {{ site.baseurl }}/1.0/configuration/)
fragment installs the latest version of the 'cf' utility:

```
dependencies:
  pre:
    - curl -v -L -o cf-cli_amd64.deb 'https://cli.run.pivotal.io/stable?release=debian64&source=github'
    - sudo dpkg -i cf-cli_amd64.deb
    - cf -v
```

### Configure 'cf' with your Bluemix credentials

You should store your Bluemix password in an environment variables, which you can
manage through the web UI as described
[in this document]( {{ site.baseurl }}/1.0/environment-variables/#setting-environment-variables-for-all-commands-without-adding-them-to-git).
For the sake of convenience, we'll assume you store your Bluemix user there too; in BLUEMIX_PASSWORD and BLUEMIX_USER respectively.

We'll configure 'cf' in our post test section of our circle.yml like:

```
test:
  post:
    - cf api https://api.ng.bluemix.net
    - cf auth $BLUEMIX_USER $BLUEMIX_PASSWORD
    - cf target -o $BLUEMIX_USER -s dev
    - cf a
```

### Configure Deployment to Bluemix

With the cli installed and configured, next you need to **configure continuous deployment.**
You may want to read up on configuring
[continuous deployment with circle.yml]( {{ site.baseurl }}/1.0/configuration/#deployment)
in general if your needs are more complex than what's shown here.

For the sake of this example, let's deploy the master branch to
Bluemix every time the tests are green.

```
deployment:
  production:
    branch: master
    commands:
      - cf push
```

### Deploying to Pivotal Web Service

Deploying to PWS is similar to the Bluemix deployment. Given that you
change the names of the variables where the credentials are stored to
`$PWS_USER` and `$PWS_PASSWORD`, the configuration in the `test: post`
section will look like this:

```
test:
  post:
    - cf api https://api.run.pivotal.io
    - cf auth $PWS_USER $PWS_PASSWORD
    - cf target -o $PWS_USER -s dev
    - cf a
```

The rest of the steps don’t need to be changed.
