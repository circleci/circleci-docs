---
layout: classic-docs
title: "FAQ"
short-title: "FAQ"
description: "Frequently asked questions about CircleCI 2.0"
categories: [migration]
order: 1
---

*[Basics]({{ site.baseurl }}/2.0/basics/) > FAQ*

* Contents
{:toc}

## What are the differences between CircleCI’s hosting options?

- **Cloud** - CircleCI manages the setup, infrastructure, security and maintenance of your services. You get instant access to new feature releases and automatic upgrades, alleviating the need for manual work on an internal system.

- **Server** - You install and manage CircleCI, through a service like AWS, behind a firewall that your team sets up and maintains according to your datacenter policy. You have full administrative control for complete customization and manage  upgrades as new versions are released.

## Why did you change the name from CircleCI Enterprise? 

The term Enterprise was used to refer to the behind-the-firewall option. However, this nomenclature was confusing for  customers and for CircleCI employees. 

CircleCI is one product that can be accessed through our cloud service, installed behind your firewall, or in a hybrid approach, depending on your needs.

## Why Migrate from CircleCI 1.0 to 2.0?

- CircleCI 2.0 includes a significant rewrite of container utilization to run more jobs faster and to prevent available containers from sitting idle. 
- In 2.0, Jobs are broken into Steps. Compose these Steps within a Job at your discretion, giving you greater flexibility to run your build the way you want. 
- 2.0 Jobs support almost all public Docker images and custom images with your own dependencies specified.

## Can I try CircleCI 2.0 while still using 1.0?

Yep! If you're not ready to fully commit to 2.0, you can easily try it while still building on 1.0:

Create a new branch and add 2.0 configuration as described in the [2.0 Project Tutorial](https://circleci.com/docs/2.0/project-walkthrough/). When you push the branch with 2.0 configuration, your project will build on CircleCI 2.0. All other branches will continue building on CircleCI 1.0.

If you'd like to completely revert to 1.0 configuration, simply replace `.circleci/config.yml` with a 1.0 `circle.yml` file. 

## What operating systems does CircleCI 2.0 support?

- **Linux:** CircleCI is flexible enough that you should be able to build most applications that run on Linux. These do not have to be web applications!

- **Android:** Refer to [Android Language Guide]({{ site.baseurl }}/2.0/language-android/) for instructions.

- **iOS:** Refer to the [iOS Project Tutorial]({{ site.baseurl }}/2.0/ios-tutorial) to get started.

- **Windows:** We do not yet support building and testing Windows applications.

## Why is the 2.0 build not working?

In CircleCI 2.0, the first image listed in the `.circleci/config.yml` file is where the build runs. If you are trying to figure out why the new 2.0 build is not working it may be that the build runs on the first image specified in the list. The first image in the list is used for the primary container.

## Why can't I find my project on the Add Project page?
 
If you are not seeing a project you would like to build and it is not currently building on CircleCI, check your org in the top left corner of the CircleCI application.  For instance, if the top left shows your user `myUser`, only Github projects belonging to `myUser` will be available under `Add Projects`.  If you want to build the Github project `myOrg/orgProject`, you must change your org on the application Switch Organization menu to `myOrg`.

## I got an error saying my “build didn’t run because it needs more containers than your plan allows” but my plan has more than enough. Why is this failing?

There is a default setting within CircleCI to initially limit project parallelism to 16. If you request more than that, it will fail. Contact [Support or your Customer Success Manager](https://support.circleci.com/hc/en-us) to have it increased. 

## How do I migrate from Jenkins to CircleCI 2.0?

Start with the [Hello World doc]({{ site.baseurl }}/2.0/hello-world/), then add `steps:` to duplicate your project exactly as it is in Jenkins, for example:

    steps:
      - run: "Add any bash command you want here"
      - run:
          command: |
            echo "Arbitrary multi-line bash"
            echo "Probably copy-pasted from 'Execute Shell' on Jenkins"

## Does CircleCI 2.0 run inference commands?

CircleCI 2.0 does not infer from your project and is moving toward a model of smart defaults with a configuration builder interface to assist with configuring all jobs in the `config.yml` file.

## Can I use CircleCI 2.0 without creating base images?

Yes, you can use one of ours! For now, but this image may be deprecated in a future release.

The `circleci/build-image:ubuntu-14.04-XL-922-9410082` image has the same content as the Ubuntu Trusty 14.04 image our web app uses. Just know that the image is fairly large (around 17.5 GB uncompressed), so it’s less ideal for local testing.

The image defaults to running actions as the `ubuntu` user and is designed to work with network services provided by Docker Compose.

Here’s a [list of languages and tools]({{site.baseurl}}/1.0/build-image-ubuntu-14.04-XL-922-9410082/) included in the image.

## Is CircleCI 2.0 available to enterprise clients?

Yes, CircleCI 2.0 is now available to enterprise clients, see [Administrator's Overview]({{ site.baseurl }}/2.0/overview) for details and links to installation instructions.

## How do Docker image names work? Where do they come from?

CircleCI 2.0 currently supports pulling (and pushing with Docker Engine) Docker images from [Docker Hub][docker-hub]. For [official images][docker-library], you can pull by simply specifying the name of the image and a tag:

```YAML
golang:1.7.1
redis:3.0.7
```

For public images on Docker Hub, you can pull the image by prefixing the account or team username:

```YAML
myUsername/couchdb:1.6.1
```

## Can I use the `latest` tag when specifying image versions?

It is best practice not to use the `latest` tag for specifying image versions. For more context, refer to the [Avoid Mutable Tags]({{ site.baseurl }}/2.0/executor-types) section of Writing Jobs with Steps.

## How can I set the timezone in Docker images?

You can set the timezone in Docker images with the `TZ` environment variable. In your `.circleci/config.yml`, it would look like:

A sample `.circleci/config.yml` with a defined `TZ` variable would look like this:

```
version: 2
jobs:
  build:
    docker:
      - image: your/primary-image:version
      - image: mysql:5.7
        environment:
           TZ: "/usr/share/zoneinfo/America/Los_Angeles"
    working_directory: ~/your-dir
    environment:
      TZ: "/usr/share/zoneinfo/America/Los_Angeles"
```

In this example, the timezone is set for both the primary image and an additional mySQL image.

A full list of available timezone options is [available on Wikipedia](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

## Workflows

### Can I use the API with Workflows?
Not yet, but we are working on that functionality.
 
### Can I use the Auto-cancel feature with Workflows?
Not yet, but we are working on that functionality.

### Can I use `store_test_results` with Workflows?
This is next up on our roadmap to fix. Test timings are available for 2.0 but not with Workflows.
 
### Can I use Workflows with CircleCI 1.0?
 
This feature only exists on CircleCI 2.0. In order to use Workflows, you must first be building on CircleCI 2.0.
 
### Can I use Workflows with the Installable CircleCI?

Yes, Workflows are available in CircleCI as part of the 2.0 option for enterprise clients. However, scheduled workflows are not yet availalble in an installable release. Refer to the [Administrator's Overview]({{ site.baseurl }}/2.0/overview) for installation instructions.
 
### How many jobs can I run at one time?
The number of containers in your plan determines the number of jobs that may be run at one time. For example, if you have ten workflow jobs ready to run, but only five containers in your plan, only five jobs will run.
Using Workflow config you can run multiple jobs at once or sequentially. You can fan-out (run multiple jobs at once) or fan-in (wait for all the jobs to complete before executing the dependent job).
 
### Do you plan to add the ability to launch jobs on both Linux and Mac environments in the same workflow?
Yes, we are currently working on that functionality.
 
### Is it possible to split the `config.yml` into different files?
Splitting `config.yml` into multiple files is not yet supported.
 
### Can I build only the jobs that changed?
No.
 
### Can I build fork PR’s using Workflows?
We do not support fork PR’s yet.

### Can workflows be scheduled to run at a specific time of day?
Yes, for the CircleCI hosted application. For example, to run a workflow at 4 PM use `"0 16 * * *"` as the value for the `cron:` key. Times are interpreted in the UTC time zone. Next on the roadmap is to enable scheduled workflows in an  installable CircleCI release.

### What time zone is used for schedules?
Coordinated Universal Time (UTC) is the time zone in which schedules are interpreted.

### Why didn’t my scheduled build run? 
You must specify exactly the branches on which the scheduled workflow will run and push that 'config.yml' to the branch you want to build. A push on the `master` branch will only schedule a workflow for the `master` branch. 

### Can I schedule multiple workflows?
Yes, every workflow with a `schedule` listed in the `trigger:` key will be run on the configured schedule. 

### Are scheduled workflows guaranteed to run at precisely the time scheduled?
CircleCI provides no guarantees about precision. A scheduled workflow will be run as though a commit was pushed at the configured time.

## Billing

### Is there a way to share plans across organizations and have them billed centrally?
Yes, go to the Settings > Share & Transfer > Share Plan page of the CircleCI app to select the Orgs you want to add to your plan.

### Can I set up billing for an organization, without binding it to my personal account?
Yes, the billing is associated with the organization. You can buy while within that org's context from that org's settings page. But, you must have another GitHub Org Admin who will take over if you unfollow all projects. We are working on a better solution for this in a future update.

### What is the definition of a container in the context of billing?

A container is a 2 CPU 4GB RAM machine that you pay for access to. Containers may be used for concurrent tasks (for example, running five different jobs) or for parallelism (for example, splitting one job across five different tasks, all running at the same time). Both examples would use five containers.


[docker-hub]: https://hub.docker.com
[docker-library]: https://hub.docker.com/explore/
