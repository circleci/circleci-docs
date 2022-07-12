---
layout: classic-docs
title: "FAQ"
short-title: "FAQ"
description: "Frequently asked questions about CircleCI"
categories: [migration]
order: 1
version:
- Cloud
- Server v3.x
- Server v2.x
---

* TOC
{:toc}

## General
{: #general }

### Does CircleCI look at my code?
{: #does-circleci-look-at-my-code }
{:.no_toc}
CircleCI employees never look at your code without permission. If you have requested support, a support engineer may ask permission to look at your code to help you debug the problem.

See the CircleCI [security policy]({{site.baseurl}}/2.0/security/) for more details.

### Can I use CircleCI without creating base images?
{: #can-i-use-circleci-without-creating-base-images }
{:.no_toc}
Yes, CircleCI provides a selection of "convenience images" for use with the Docker executor. For a full list, along with usage instructions, visit the [CircleCI Developer Hub](https://circleci.com/developer/images) and the [CircleCI Images guide]({{site.baseurl}}/2.0/circleci-images/).

For the `machine` executor, see the [available machine images]({{site.baseurl}}/2.0/configuration-reference/#available-linux-machine-images) list.

For an introduction to execution environments and images, see the [Introduction to Execution Environments]({{site.baseurl}}/2.0/executor-intro/).

### Can I request new features?
{: #can-i-request-new-features }
{:.no_toc}
Yes, you can visit CircleCI's [Ideas](https://circleci.canny.io/) page to request new features, or view features that have already been requested. To request a new feature, you will first need to select a category from the **Give Feedback** section.

When viewing requested features, you can sort by **Trending**, **Top**, and **New**, as well as filter by the following:

- **Under Review**: CirlceCI is considering these feature requests.
- **Planned**: CircleCI has planned to work on these feature requests in the future.
- **In Progress**: CircleCI is currently working on these feature requests.
- **Complete**: CircleCI has added these feature requests to its current offerings.

---

## Migration
{: #migration}

### Can I migrate my existing CI/CD solution to CircleCI?
{: #can-i-migrate-my-existing-ci/cd-solution-to-circleci}
{:.no_toc}
Yes, CircleCI offers migration guides for the following:
- [AWS]({{site.baseurl}}/2.0/migrate-from-aws/)
- [Azure]({{site.baseurl}}/2.0/migrate-from-azure-devops/)
- [Buildkite]({{site.baseurl}}/2.0/migrate-from-buildkite/)
- [GitHub]({{site.baseurl}}/2.0/migrate-from-github-actions/)
- [GitLab]({{site.baseurl}}/2.0/migrate-from-gitlab/)
- [Jenkins]({{site.baseurl}}/2.0/migrate-from-jenkins/)
- [TeamCity]({{site.baseurl}}/2.0/migrate-from-teamcity/)
- [Travis CI]({{site.baseurl}}/2.0/migrate-from-travis-ci/)

You can also visit the [Migration Introduction]({{site.baseurl}}/2.0/introduction-to-circleci-migration/) page for more information.

---

## Hosting
{: #hosting }

### Is CircleCI available to enterprise customers?
{: #is-circleci-20-available-to-enterprise-customers }
{:.no_toc}
Yes, CircleCI server is available for installation on AWS or GCP. See the [CircleCI Server v3.x Overview]({{ site.baseurl }}/2.0/server-3-overview) for details and links to installation instructions. [Contact us](https://circleci.com/pricing/server/) to discuss your requirements.

### What are the differences between CircleCI’s hosting options?
{: #what-are-the-differences-between-circlecis-hosting-options }
{:.no_toc}
- **Cloud** - CircleCI manages the setup, infrastructure, security and maintenance of your services. You get instant access to new feature releases and automatic upgrades, alleviating the need for manual work on an internal system.

- **Server** - You install and manage CircleCI, through a service like AWS or GCP. Server installations are behind a firewall that your team sets up and maintains according to your data center policy. You have full administrative control for complete customization and management of upgrades as new versions are released.

---

## Pipelines
{: #pipelines}

### Is it possible to split the `.circleci/config.yml` into different files?
{: #is-it-possible-to-split-the-configyml-into-different-files }
{:.no_toc}
Splitting your `.circleci/config.yml` into multiple files is not supported. If you would like more information on this, you can view this [support article](https://support.circleci.com/hc/en-us/articles/360056463852-Can-I-split-a-config-into-multiple-files).

While splitting configuration files is not supported, CircleCI does support dynamic configurations, which allows you to create configuration files based on specific pipeline values or paths. See the [Dynamic Configuration]({{site.baseurl}}/2.0/dynamic-config/) page for more information.

### Can I trigger forked PRs using pipelines?
{: #can-i-build-forked-prs-using-pipelines }
{:.no_toc}
You can trigger pipelines to build PRs from forked repositories with CircleCI [API v2](https://circleci.com/docs/api/v2/). However, by default, CircleCI will not build a PR from a forked repository. If you would like to turn this feature on, navigate to **Project Settings > Advanced** in the web app. If you would like more information, you can view this [support article](https://support.circleci.com/hc/en-us/articles/360049841151-Trigger-pipelines-on-forked-pull-requests-with-CircleCI-API-v2).

### Can pipelines be scheduled to run at a specific time of day?
{: #can-pipelines-be-scheduled-to-run-at-a-specific-time-of-day }
{:.no_toc}
Yes, you can [scheduled pipelines]({{site.baseurl}}/2.0/scheduled-pipelines/). You can set up scheduled pipelines through the [CircleCI web app]({{site.baseurl}}/scheduled-pipelines/#project-settings), or with [CircleCI API v2]({{site.baseurl}}/2.0/scheduled-pipelines/#api).

If you are currently using [scheduled workflows]({{site.baseurl}}/2.0/workflows/#scheduling-a-workflow), please see the [migration guide]({{base.url}}/2.0/scheduled-pipelines/#migrate-scheduled-workflows) to update your scheduled workflows to scheduled pipelines.

### Why is my scheduled pipeline not running?
{: #why-is-my-scheduled-pipeline-not-running }
{:.no_toc}
If your scheduled pipeline is not running, verify the following things:

- Is the actor who is set for the scheduled pipelines still part of the organization?
- Is the branch set for the schedule deleted?
- Is your VCS organization using SAML protection? SAML tokens expire often, which can cause requests to fail.

### What time zone is used for scheduled pipelines?
{: #what-time-zone-is-used-for-scheduled-pipelines }
{:.no_toc}
Coordinated Universal Time (UTC) is the time zone in which schedules are interpreted.

### Are scheduled pipelines guaranteed to run at precisely the time scheduled?
{: #are-scheduled-pipelines-guaranteed-to-run-at-precisely-the-time-scheduled }
{:.no_toc}
CircleCI provides no guarantees about precision. A schedule will be run as if the commit was pushed at the configured time.

---

## Workflows
{: #workflows }

### How many jobs can I run concurrently?
{: #how-many-jobs-can-i-run-concurrently }
{:.no_toc}
The number of jobs you can run concurrently differs between [plans](https://circleci.com/pricing/). When using workflows to schedule jobs, you can use a [fan-out/fan-in method]({{site.baseurl}}/2.0/workflows/#fan-outfan-in-workflow-example) to run jobs concurrently.

### Can I use multiple executor types in the same workflow?
{: #can-i- use-multiple-executor-types-in-the-same-workflow }
{:.no_toc}
Yes, this is supported. See the [Sample Configuration]({{site.baseurl}}/2.0/sample-config/#sample-configuration-with-multiple-executor-types) page for examples.

### Can I build only the jobs that changed?
{: #can-i-build-only-the-jobs-that-changed }
{:.no_toc}
You can set up your workflows to conditionally run jobs based on specific updates to your repository. You can do this with [conditional workflows]({{site.baseurl}}/2.0/pipeline-variables/#conditional-workflows) and [dynamic configurations]({{site.baseurl}}/2.0/dynamic-config/). Dynamic configurations will dynamically generate CircleCI configuration and pipeline parameters, and run the resulting work within the same pipeline.

---

## Troubleshooting
{: #troubleshooting }

### Why are my jobs not running when I push commits?
{: #why-are-my-jobs-not-running-when-i-push-commits }
{:.no_toc}
In the CircleCI application, check the individual job and workflow views for error messages. More often than not, the error is because of formatting errors in your `.circleci/config.yml` file.

See the [YAML Introduction]({{site.baseurl}}/2.0/introduction-to-yaml-configurations/) page for more details.

After checking your `.circleci/config.yml` for formatting errors, search for your issue in the [CircleCI support center](https://support.circleci.com/hc/en-us).

### Why is my job queued?
{: #why-is-my-job-queued }
{:.no_toc}
A job might end up being queued because of a concurrency limit being imposed due your organization's plan. If your jobs are queuing often, you can consider [upgrading your plan](https://circleci.com/pricing/).


### Why are my builds queuing even though I am on the Performance plan?
{: #why-are-my-builds-queuing-even-though-i-am-on-performance-plan }
{:.no_toc}
In order to keep the system stable for all CircleCI customers, we implement different soft concurrency limits on each of the [resource classes]({{site.baseurl}}/2.0/configuration-reference/#resourceclass). If you are experiencing queuing on your jobs, it is possible you are hitting these limits. Please [contact CircleCI support](https://support.circleci.com/hc/en-us/requests/new) to request raises on these limits.

### Why can I not find my project on the Projects dashboard?
{: #why-can-i-not-find-my-project-on-the-projects-dashboard }
{:.no_toc}
If you are not seeing a project you would like to build, and it is not currently building on CircleCI, check your org in the top left corner of the CircleCI application. For instance, if the top left shows your user `my-user`, only projects belonging to `my-user` will be available under **Projects**.  If you want to build the project `your-org/project`, you must switch your organization on the application's organization switcher menu to `your-org`.

### How do Docker image names work? Where do they come from?
{: #how-do-docker-image-names-work-where-do-they-come-from }
{:.no_toc}
CircleCI currently supports pulling (and pushing with Docker Engine) Docker images from [Docker Hub](https://hub.docker.com/). For [official images](https://hub.docker.com/explore/), you can pull by simply specifying the name of the image and a tag:

```
golang:1.7.1-jessie
redis:3.0.7-jessie
```

For public images on Docker Hub, you can pull the image by prefixing the account or team username:

```
my-user/couchdb:1.6.1
```

### What is the best practice for specifying image versions?
{: #what-is-the-best-practice-for-specifying-image-versions }
{:.no_toc}
It is best practice **not** to use the `latest` tag for specifying image versions. It is also best practice to use a specific version and tag, for example `cimg/ruby:3.0.4-browsers`, to pin down the image and prevent upstream changes to your containers when the underlying base distribution changes. For example, specifying only `cimg/ruby:3.0.4` could result in unexpected changes from `browsers` to `node`. For more context, refer to [Docker image best practices]({{site.baseurl}}/2.0/using-docker/#docker-image-best-practices), and [CircleCI image best practices]({{site.baseurl}}/2.0/circleci-images/#best-practices).

### How can I set the timezone in Docker images?
{: #how-can-i-set-the-timezone-in-docker-images }
{:.no_toc}
You can set the timezone in Docker images with the `TZ` environment variable. A sample `.circleci/config.yml` with a defined `TZ` variable would look like the following:

```yaml
version: 2.1
jobs:
  build:
    docker:
      - image: your/primary-image:version-tag
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: mysql:5.7
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
           TZ: "America/Los_Angeles"
    working_directory: ~/your-dir
    environment:
      TZ: "America/Los_Angeles"
```

In this example, the timezone is set for both the primary image and an additional mySQL image.

A full list of available timezone options is [available on Wikipedia](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

---

## Architecture
{: #architecture }

### What operating systems does CircleCI support?
{: #what-operating-systems-does-circleci-20-support }
{:.no_toc}
- [Linux]({{site.baseurl}}/2.0/using-linuxvm/)
- [Android]({{site.baseurl}}/2.0/language-android/)
- [macOS]({{site.baseurl}}/2.0/using-macos/)
- [iOS]({{site.baseurl}}/2.0/ios-tutorial/)
- [Windows]({{site.baseurl}}/2.0/using-windows/)

### Which CPU architectures does CircleCI support?
{: #which-cpu-architectures-does-circleci-support }
{:.no_toc}
CircleCI supports `amd64` for Docker jobs, and both `amd64` and [Arm resources]({{site.baseurl}}/2.0/using-arm/) for machine jobs.

### Can I use IPv6 in my tests?
{: #can-i-use-ipv6-in-my-tests }
{:.no_toc}
You can use the [machine executor]({{site.baseurl}}/2.0/configuration-reference/#machine) for testing local IPv6 traffic. Unfortunately, we do not support IPv6 internet traffic, as not all of our cloud providers offer IPv6 support.

Hosts running with machine executor are configured with IPv6 addresses for `eth0` and `lo` network interfaces.

You can also configure Docker to assign IPv6 address to containers, to test services with IPv6 setup.  You can enable it globally by configuring docker daemon like the following:

```yaml
jobs:
  ipv6_tests:
    machine:
      # The image uses the current tag, which always points to the most recent
      # supported release. If stability and determinism are crucial for your CI
      # pipeline, use a release date tag with your image, e.g. ubuntu-2004:202201-02
      image: ubuntu-2004:current
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

---

## Billing
{: #billing }

Visit our [Pricing page](https://circleci.com/pricing/) to find details about CircleCI's plans.

### What are credits?
{: #what-are-credits }
{:.no_toc}
Credits are used to pay for users and usage based on machine type, size, and features such as Docker Layer Caching.

For example, the 25,000 credit package would provide 2,500 build minutes when using a Docker or Linux "medium" compute at 10 credits per minute. CircleCI provides multiple compute sizes so you can optimize builds between performance (improved developer productivity) and value.

When applicable, build time can be further reduced by using parallelism, which splits the job into multiple tests that are executed at the same time. With 2x parallelism, a build that usually runs for 2,500 minutes could be executed in 1,250 minutes, further improving developer productivity. Note that when two executors are running in parallel for 1,250 minutes each, total build time remains 2,500 minutes.

### Is there a way to share plans across organizations and have them billed centrally?
{: #is-there-a-way-to-share-plans-across-organizations-and-have-them-billed-centrally }
{:.no_toc}
Yes, log in to the CircleCI web app > select `Plan` in the sidebar > click `Share & Transfer`.

On non-free plans, you can share your plan with free organizations for which you have admin access using the `Add Shared Organization` option. All orgs you have shared your plan with will then be listed on the Share & Transfer page and child organizations will bill all credits and other usage to the parent org.

On non-free plans, you can transfer your plan to another free organization for which you have admin access using the `Transfer Plan` option. When you transfer a paid plan to another org, your org will be downgraded to the free plan.

### If a container is used for under one minute, do I have to pay for a full minute?
{: #if-a-container-is-used-for-under-one-minute-do-i-have-to-pay-for-a-full-minute }
{:.no_toc}
You pay to the next nearest credit. First we round up to the nearest second, and then up to the nearest credit.

### How do I buy credits? Can I buy in any increments?
{: #how-do-i-buy-credits-can-i-buy-in-any-increments }
{:.no_toc}
Every month, you are charged for your selected credit package at the beginning of the month.

### What do I pay for?
{: #what-do-i-pay-for }
{:.no_toc}
You can choose to pay for premium features per active user, compute, and optionally, premium support.


- Access to features, such as new machine sizes, are paid with a monthly fee of 25,000 credits per active user (not including applicable taxes).
- Compute is paid for monthly in credits for the machine size and duration you use:
  - Credits are sold in packages of 25,000 at $15 each (not including applicable taxes).
  - Credits rollover each month and expire after one year.
- Docker Layer Caching (DLC) is paid for with credits per usage, similar to
  compute credits.

### How do I calculate my monthly storage and network costs?
{: #how-do-I-calculate-my-monthly-storage-and-network-costs }
{:.no_toc}

Calculate your monthly storage and network costs by finding your storage and network usage on the [CircleCI web app](https://app.circleci.com/) by navigating to **Plan > Plan** Usage.

#### Storage
{: #storage }
{:.no_toc}

To calculate monthly storage costs from your daily usage, click on the **Storage** tab to see if your organization has accrued any overages beyond the GB-monthly allotment. Your overage (GB-Months/TB-Months) can be multiplied by 420 credits to estimate the total monthly costs. Example: 2 GB-Months overage x 420 credits = 840 credits ($.50).

#### Network
{: #network }
{:.no_toc}

Billing for network usage is only applicable to traffic from CircleCI to self-hosted runners. [Read More]({{site.baseurl}}/2.0/persist-data/#overview-of-storage-and-network-transfer).

Your network overage GB/TB can be multiplied by 420 credits to estimate the total monthly costs. Example: 2 GB-Months overage x 420 credits = 840 credits ($.50).

### How do I calculate my monthly IP ranges cost?
{: #how-do-I-calculate-my-monthly-IP-ranges-costs }
{:.no_toc}

Calculate your monthly IP ranges costs by finding your IP ranges usage on the [CircleCI app](https://app.circleci.com/) by navigating to Plan > Plan Usage.

In addition to the **IP Ranges Usage** summary, you can navigate to the **IP Ranges** tab to find more details about your data usage. In this tab, the IP ranges usage value represents the raw number of bytes in or out of the Docker container during execution of a job with IP ranges enabled.

This number includes the job's overall network transfer _and_ any other bytes that go in or out of the Docker container. Data used to pull in the Docker image to the container before the job starts executing will _not incur usage costs_ for jobs with IP ranges enabled.

This feature will consume 450 credits from your account for each GB of data used for jobs with IP ranges enabled. You can also view job-specific details of IP ranges usage in the **Resources** tab on the **Job Details** UI page. See [IP ranges pricing]({{site.baseurl}}/2.0/ip-ranges/#pricing) for more information.

### How do I predict my monthly IP ranges cost without enabling the feature first?
{: #how-do-i-predict-my-monthly-IP-ranges-cost-without-enabling-the-feature-first }
{:.no_toc}
You can view an approximation of network transfer for any Docker job (excluding Remote Docker) in the Resources tab on the Job Details UI page.  Convert this value to GB if it is not already in GB and multiply by 450 credits to predict the approximate cost of enabling IP ranges on that Docker job.

### Why does CircleCI have per-active-user pricing?
{: #why-does-circleci-have-per-active-user-pricing }
{:.no_toc}

Credit usage covers access to compute. We prefer to keep usage costs as low as possible to encourage frequent job runs, which is the foundation of a good CI practice. Per-active-user fees cover access to platform features and job orchestration. This includes features like dependency caching, artifact caching, and workspaces, all of which speed up build times without incurring additional compute cost.

### What constitutes an _Active User_?
{: #what-constitutes-an-active-user }
{:.no_toc}

An `active user` is any user who triggers the use of compute resources on non-OSS projects. This includes activities such as:

- Commits from users that trigger builds, including PR Merge commits.
- Re-running jobs in the CircleCI web application, including [SSH debug]({{ site.baseurl }}/2.0/ssh-access-jobs).
- Approving [manual jobs]({{ site.baseurl }}/2.0/workflows/#holding-a-workflow-for-a-manual-approval) (approver will be considered the actor of all downstream jobs).
- Using scheduled workflows
- Machine users

**Note:** If your project is [open-source]({{ site.baseurl }}/2.0/oss) you will **not** be considered an active user.

To find a list of your Active Users, log in to the CircleCI web app > click `Plan` > click `Plan Usage` > click on the `Users` tab.

### What happens when I run out of credits?
{: #what-happens-when-i-run-out-of-credits }
{:.no_toc}

On the **Performance plan**, when you reach 2% of your remaining credits, you will be refilled 25% of your credit subscription, with a minimum refill of 25,000 credits. For example, If your monthly package size is 100,000 credits, you will automatically be refilled 25,000 credits (at $.0006 each, not including applicable taxes) when you reach 2000 remaining credits.

If you notice that your account is receiving repeated refills, review your credit usage by logging in to the CircleCI web app > click `Plan` > click `Plan Usage`. In most cases, increasing your credit package should minimize repeat refills. You can manage your plan by clicking `Plan Overview`.

On the **Free plan**, jobs will fail to run once you have run out of credits.

### Do credits expire?
{: #do-credits-expire }
{:.no_toc}
**Performance plan**: Credits expire one year after purchase. Unused credits will be forfeited when the account subscription is canceled.

### How do I pay?
{: #how-do-i-pay }
{:.no_toc}
You can pay from inside the CircleCI app for monthly pricing.

### When do I pay?
{: #when-do-i-pay }
{:.no_toc}

On the **Performance plan**, at the beginning of your billing cycle, you will be charged for premium support tiers and your monthly credit allocation. Any subsequent credit refills _during_ the month (such as the auto-refilling at 25% on reaching 2% of credits available) will be paid _at the time of the refill_.

### Am I charged if my build is "Queued" or "Preparing"?
{: #am-i-charged-if-my-build-is-queued-or-preparing }
{:.no_toc}

No. If you are notified that a job is "queued", it indicates that your job is
waiting due to a **plan** or **concurrency** limit. If your job indicates that
it is "preparing", it means that CircleCI is setting up or _dispatching_ your
job so that it may run.

### What are the other renewal dates?
{: #what-are-the-other-renewal-dates }
{:.no_toc}

The first credit card charge on the day you upgrade to a paid plan or change paid plans, in addition to the following charges from CircleCI:

- On the monthly renewal date if your team is on the monthly plan.
- On the annual renewal date if your team is on the annual plan.
- On the last day of the month if your team is on the annual plan and there is an outstanding balance from adding new users or utilizing more credits.
- If you are on the Performance plan, anytime your team’s credit balance drops below your preset limit, another credit purchase will be processed.

### Are there credit plans for open source projects?
{: #are-there-credit-plans-for-open-source-projects }
{:.no_toc}

Open source organizations on our **Free plan** receive 400,000 free credits per month that can be spent on Linux open source projects.  Open-source credit availability and limits will not be visible in the UI.

If you build on macOS, we also offer organizations on our Free plan 25,000 free credits per month to use on macOS open source builds. For access to this, contact our team at billing@circleci.com. Free credits for macOS open source builds can be used on a maximum of 2 concurrent jobs per organization.

### I currently get free credits for open source projects on my container plan. How do I get discounts for open source on the Performance plan?
{: #i-currently-get-free-credits-for-open-source-projects-on-my-container-plan-how-do-i-get-discounts-for-open-source-on-the-performance-plan }
{:.no_toc}

CircleCI no longer offers discounts for open source customers on the Performance plan.

### Why does CircleCI charge for Docker layer caching?
{: #why-does-circleci-charge-for-docker-layer-caching }
{:.no_toc}

Docker layer caching (DLC) reduces build times on pipelines where Docker images are built by only rebuilding Docker layers that have changed (read more on the [Docker Layer Caching]({{site.baseurl}}/2.0/docker-layer-caching) page. DLC costs 200 credits per job run.

There are a few things that CircleCI does to ensure DLC is available to customers. We use solid-state drives and replicate the cache across zones to make sure DLC is available. We will also increase the cache as needed in order to manage concurrent requests and make DLC available for your jobs. All of these optimizations incur additional cost for CircleCI with our compute providers, which pass along to customers when they use DLC.

To estimate your DLC cost, look at the jobs in your config file with Docker layer caching enabled, and the number of Docker images you are building in those jobs. There are cases where a job can be written once in a config file but the job runs multiple times in a pipeline, for example, with parallelism enabled.

Note that the benefits of Docker layer caching are only apparent on pipelines that are building Docker images, and reduces image build times by reusing the unchanged layers of the application image built during your job. If your pipeline does not include a job where Docker images are built, Docker layer caching will provide no benefit.

### How do I migrate from a container-based plan to a usage-based plan?
{: #how-do-I-migrate-from-a-container-based-plan-to-a-usage-based-plan }
{:.no_toc}

CircleCI no longer offers the container-based plan. If you are currently using a container-based plan and need to migrate to a usage-based plan, please visit this [CircleCI Discuss post](https://discuss.circleci.com/t/migrating-from-a-container-paid-plan-to-a-usage-based-plan/42938) for more information.
