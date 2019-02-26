---
layout: classic-docs
title: "FAQ"
short-title: "FAQ"
description: "Frequently asked questions about CircleCI 2.0"
categories: [migration]
order: 1
---

* TOC
{:toc}

## General

### Does CircleCI look at my code?
{:.no_toc}
CircleCI employees never look at your code without permission.
If you have requested support,
a support engineer may ask permission
to look at your code
to help you debug the problem.

See the CircleCI [security policy]({{ site.baseurl }}/2.0/security/) for more details.

## Migration

### Why migrate from CircleCI 1.0 to 2.0?
{:.no_toc}
- CircleCI 2.0 includes a significant rewrite of container utilization to run more jobs faster and to prevent available containers from sitting idle. 
- In 2.0, Jobs are broken into Steps. Compose these Steps within a Job at your discretion, giving you greater flexibility to run your build the way you want. 
- 2.0 Jobs support almost all public Docker images and custom images with your own dependencies specified.

### How do I migrate from Jenkins to CircleCI 2.0?
{:.no_toc}
Start with the [Hello World doc]({{ site.baseurl }}/2.0/hello-world/), then add `steps:` to duplicate your project exactly as it is in Jenkins, for example:

```yaml
    steps:
      - run: echo "Add any bash command you want here"
      - run:
          command: |
            echo "Arbitrary multi-line bash"
            echo "Probably copy-pasted from 'Execute Shell' on Jenkins"
```
            
Refer to [Migrating From Jenkins]({{ site.baseurl }}/2.0/migrating-from-jenkins/) for conceptual differences between Jenkins and CircleCI.           

### Does CircleCI 2.0 run inference commands?
{:.no_toc}
CircleCI 2.0 does not infer from your project and is moving toward a model of smart defaults with a configuration builder interface to assist with configuring all jobs in the `config.yml` file.

### Can I use CircleCI 2.0 without creating base images?
{:.no_toc}
Yes, you can use one of ours! For now, but this image may be deprecated in a future release.

The `circleci/build-image:ubuntu-14.04-XL-922-9410082` image has the same content as the Ubuntu Trusty 14.04 image our web app uses. Just know that the image is fairly large (around 17.5 GB uncompressed), so it’s less ideal for local testing.

The image defaults to running actions as the `ubuntu` user and is designed to work with network services provided by Docker Compose.

Here’s a [list of languages and tools]({{site.baseurl}}/1.0/build-image-ubuntu-14.04-XL-922-9410082/) included in the image.

## Hosting

### Is CircleCI 2.0 available to enterprise clients?
{:.no_toc}
Yes, CircleCI 2.0 is now available to enterprise clients, see [Administrator's Overview]({{ site.baseurl }}/2.0/overview) for details and links to installation instructions.

### What are the differences between CircleCI’s hosting options?
{:.no_toc}
- **Cloud** - CircleCI manages the setup, infrastructure, security and maintenance of your services. You get instant access to new feature releases and automatic upgrades, alleviating the need for manual work on an internal system.

- **Server** - You install and manage CircleCI, through a service like AWS, behind a firewall that your team sets up and maintains according to your datacenter policy. You have full administrative control for complete customization and manage upgrades as new versions are released.

### Why did you change the name from CircleCI Enterprise? 
{:.no_toc}
The term Enterprise was used to refer to the behind-the-firewall option. However, this nomenclature was confusing for customers and for CircleCI employees. 

CircleCI is one product that can be accessed through our cloud service, installed behind your firewall, or in a hybrid approach, depending on your needs.

## Troubleshooting

### Why aren't my jobs running when I push commits?
{:.no_toc}
In the CircleCI application,
check the Workflows tab
for error messages.
More often than not,
the error is because of formatting errors in your `config.yml` file.
See [Writing YAML]({{ site.baseurl }}/2.0/writing-yaml/) for more details.

After checking your `config.yml` for formatting errors,
search for your issue in the [CircleCI support center](https://support.circleci.com/hc/en-us).

### What is the difference between a usage queue and a run queue?
{:.no_toc}
A **usage queue** forms
when an organization lacks the containers
to run a build.
The number of available containers is determined
by the plan chosen
when setting up a project on CircleCI.
If your builds are queuing often,
you can add more containers
by changing your plan.

A **run queue** forms
when CircleCI experiences high demand.
Customer builds are placed in a run queue
and processed as machines become available.

In other words,
you can reduce time spent in a **usage queue**
by [purchasing more containers](#how-do-i-upgrade-my-plan-with-more-containers-to-prevent-queuing),
but time spent in a **run queue** is unavoidable
(though CircleCI aims to keep this as low as possible).

### Why can't I find my project on the Add Project page?
 {:.no_toc}
If you are not seeing a project you would like to build and it is not currently building on CircleCI, check your org in the top left corner of the CircleCI application.  For instance, if the top left shows your user `my-user`, only GitHub projects belonging to `my-user` will be available under `Add Projects`.  If you want to build the GitHub project `your-org/project`, you must change your org on the application Switch Organization menu to `your-org`.

### I got an error saying my “build didn’t run because it needs more containers than your plan allows” but my plan has more than enough. Why is this failing?
{:.no_toc}
There is a default setting within CircleCI to initially limit project parallelism to 16. If you request more than that, it will fail. Contact [Support or your Customer Success Manager](https://support.circleci.com/hc/en-us) to have it increased. 

### How do Docker image names work? Where do they come from?
{:.no_toc}
CircleCI 2.0 currently supports pulling (and pushing with Docker Engine) Docker images from [Docker Hub][docker-hub]. For [official images][docker-library], you can pull by simply specifying the name of the image and a tag:

```
golang:1.7.1-jessie
redis:3.0.7-jessie
```

For public images on Docker Hub, you can pull the image by prefixing the account or team username:

```
my-user/couchdb:1.6.1
```

### What is the best practice for specifying image versions?
{:.no_toc}
It is best practice **not** to use the `latest` tag for specifying image versions. It is also best practice to use a specific version and tag, for example `circleci/ruby:2.4-jessie-node`, to pin down the image and prevent upstream changes to your containers when the underlying base distro changes. Specifying only `circleci/ruby:2.4` could result in unexpected changes from `jessie` to `stretch` for example. For more context, refer to the [Docker Image Best Practices]({{ site.baseurl }}/2.0/executor-types/#docker-image-best-practices) section of the Choosing an Executor Type document and the Best Practices section of the [CircleCI Images]({{ site.baseurl }}/2.0/circleci-images/#best-practices) document.

### How can I set the timezone in Docker images?
{:.no_toc}
You can set the timezone in Docker images with the `TZ` environment variable. In your `.circleci/config.yml`, it would look like:

A sample `.circleci/config.yml` with a defined `TZ` variable would look like this:

```yaml
version: 2
jobs:
  build:
    docker:
      - image: your/primary-image:version-tag
      - image: mysql:5.7
        environment:
           TZ: "America/Los_Angeles"
    working_directory: ~/your-dir
    environment:
      TZ: "America/Los_Angeles"
```

In this example, the timezone is set for both the primary image and an additional mySQL image.

A full list of available timezone options is [available on Wikipedia](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

## Workflows 

### Can I use the API with Workflows?
{:.no_toc}
Yes, see the [Enabling Build Processing]({{ site.baseurl }}/2.0/build-processing/) document for instructions and links to the API endpoint.
 
### Can I use the Auto-cancel feature with Workflows?
{:.no_toc}
Yes, see the [Skipping and Cancelling Builds]({{ site.baseurl }}/2.0/skip-build/) document for instructions.

### Can I use `store_test_results` with Workflows?
{:.no_toc}
You can use `store_test_results` in order to populate your Test Summary section with test results information and for [timing-based test-splitting]({{ site.baseurl }}/2.0/parallelism-faster-jobs/#splitting-by-timings-data). Test timings data is available for 2.0 with Workflows, using data from a job with the same name going back 50 builds.
 
### Can I use Workflows with CircleCI 1.0?
 {:.no_toc}
This feature only exists on CircleCI 2.0. In order to use Workflows, you must first be building on CircleCI 2.0.
 
### Can I use Workflows with the Installable CircleCI?
{:.no_toc}
Yes, Workflows are available in CircleCI as part of the 2.0 option for enterprise clients. Refer to the [Administrator's Overview]({{ site.baseurl }}/2.0/overview) for installation instructions.
 
### How many jobs can I run at one time?
{:.no_toc}
The number of containers in your plan determines the number of jobs that may be run at one time. For example, if you have ten workflow jobs ready to run, but only five containers in your plan, only five jobs will run.
Using Workflow config you can run multiple jobs at once or sequentially. You can fan-out (run multiple jobs at once) or fan-in (wait for all the jobs to complete before executing the dependent job).
 
### Do you plan to add the ability to launch jobs on both Linux and Mac environments in the same workflow?
{:.no_toc}
Yes, this is supported. See the section for multiple executor types in the [Sample 2.0 `config.yml` Files]({{ site.baseurl }}/2.0/sample-config/#sample-configuration-with-multiple-executor-types-macos--docker) document.
 
### Is it possible to split the `config.yml` into different files?
{:.no_toc}
Splitting `config.yml` into multiple files is not yet supported.
 
### Can I build only the jobs that changed?
{:.no_toc}
No.
 
### Can I build fork PR’s using Workflows?
{:.no_toc}
Yes!

### Can workflows be scheduled to run at a specific time of day?
{:.no_toc}
Yes, for the CircleCI hosted application. For example, to run a workflow at 4 PM use `"0 16 * * *"` as the value for the `cron:` key. Times are interpreted in the UTC time zone. Next on the roadmap is to enable scheduled workflows in an installable CircleCI release.

### What time zone is used for schedules?
{:.no_toc}
Coordinated Universal Time (UTC) is the time zone in which schedules are interpreted.

### Why didn’t my scheduled build run? 
{:.no_toc}
You must specify exactly the branches on which the scheduled workflow will run and push that 'config.yml' to the branch you want to build. A push on the `master` branch will only schedule a workflow for the `master` branch. 

### Can I schedule multiple workflows?
{:.no_toc}
Yes, every workflow with a `schedule` listed in the `trigger:` key will be run on the configured schedule. 

### Are scheduled workflows guaranteed to run at precisely the time scheduled?
{:.no_toc}
CircleCI provides no guarantees about precision. A scheduled workflow will be run as though a commit was pushed at the configured time.

## Billing

### How do I upgrade my plan with more containers to prevent queuing?
{:.no_toc}
* Linux: Go to the Settings > Plan Settings page of the CircleCI app to increase the number of containers on your Linux plan. Type the increased number of containers in the entry field under the Choose Linux Plan heading and click the Pay Now button to enter your payment details. 

* macOS: Go to the Settings > Plan Settings page of the CircleCI app and click the macOS tab in the upper-right. Then, click the Pay Now button on the Startup, Growth, or Mobile Focused plan to enter your payment details.

### Is there a way to share plans across organizations and have them billed centrally?
{:.no_toc}
Yes, go to the Settings > Share & Transfer > Share Plan page of the CircleCI app to select the Orgs you want to add to your plan.

### Can I set up billing for an organization, without binding it to my personal account?
{:.no_toc}
Yes, the billing is associated with the organization. You can buy while within that org's context from that org's settings page. But, you must have another GitHub Org Admin who will take over if you unfollow all projects. We are working on a better solution for this in a future update.

### What is the definition of a container in the context of billing?
{:.no_toc}
A container is a 2 CPU 4GB RAM machine that you pay for access to. Containers may be used for concurrent tasks (for example, running five different jobs) or for parallelism (for example, splitting one job across five different tasks, all running at the same time). Both examples would use five containers.

## Architecture

### Can I use IPv6 in my tests?
{:.no_toc}
You can use the [machine executor]({{ site.baseurl }}/2.0/executor-types) for testing local IPv6 traffic.  Unfortunately, we do not support IPv6 internet traffic, as not all of our cloud providers offer IPv6 support.

Hosts running with machine executor are configured with IPv6 addresses for `eth0` and `lo` network interfaces.

You can also configure Docker to assign IPv6 address to containers, to test services with IPv6 setup.  You can enable it globally by configuring docker daemon like the following:

```yaml
   ipv6_tests:
     machine: true
     steps:
     - checkout
     - run:
         name: enable ipv6
         command: |
           cat <<'EOF' | sudo tee /etc/docker/daemon.json
           {
             "ipv6": true,
             "fixed-cidr-v6": "2001:db8:1::/64"
           }
           EOF
           sudo service docker restart
```

Docker allows enabling IPv6 at different levels: [globally via daemon config like above](https://docs.docker.com/engine/userguide/networking/default_network/ipv6/), with [`docker network create` command](https://docs.docker.com/engine/reference/commandline/network_create/), and with [`docker-compose`](https://docs.docker.com/compose/compose-file/#enable_ipv6).


### What operating systems does CircleCI 2.0 support?
{:.no_toc}
- **Linux:** CircleCI is flexible enough that you should be able to build most applications that run on Linux. These do not have to be web applications!

- **Android:** Refer to [Android Language Guide]({{ site.baseurl }}/2.0/language-android/) for instructions.

- **iOS:** Refer to the [iOS Project Tutorial]({{ site.baseurl }}/2.0/ios-tutorial) to get started.

- **Windows:** We do not yet support building and testing Windows applications.

### Which CPU architectures does CircleCI support?
{:.no_toc}
`amd64` is the only supported CPU architecture.


[docker-hub]: https://hub.docker.com
[docker-library]: https://hub.docker.com/explore/
