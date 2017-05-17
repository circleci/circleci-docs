---
layout: classic-docs
title: "Overview"
short-title: "Overview"
description: "Starting point for CircleCI 2.0 docs"
categories: [getting-started]
order: 1
---

CircleCI is a modern continuous integration and continuous delivery (CI/CD) platform. The hosted solution is available at <https://circleci.com/>. The [CircleCI Enterprise](https://circleci.com/enterprise/) solution is installable inside your private cloud or data center. Both are free to try for two weeks. CircleCI automates build, test, and deployment of software artifacts to any service with an API or to any machine with `sshd`. 

![CircleCI Example Flow with GitHub]({{ site.baseurl }}/assets/img/docs/how_it_works.png)

For example, after a software repository on GitHub or Bitbucket is authorized and added as a project to the circleci.com SaaS application, every new commit triggers a build and notification of success or failure through webhooks. CircleCI also supports Slack, HipChat, Campfire, Flowdock, and IRC notifications. Code coverage results are available from the details page for any project for which a reporting library is added.

CircleCI is then able to automatically deploy code to various environments based on successful tests. The following  infrastructure deployment mechanisms are integrated with CircleCI:

* AWS CodeDeploy
* AWS EC2 Container Service (ECS)
* AWS S3
* Google Container Engine (GKE)
* Heroku
* SSH
