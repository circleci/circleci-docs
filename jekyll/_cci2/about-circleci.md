---
layout: classic-docs
title: "Overview"
short-title: "Overview"
description: "Starting point for CircleCI 2.0 docs"
categories: [getting-started]
order: 1
---

CircleCI is a modern continuous integration and continuous delivery (CI/CD) platform. The hosted solution is available at <https://circleci.com/>. The [CircleCI Enterprise](https://circleci.com/enterprise/) solution is installable inside your private cloud or data center. Both are free to try for two weeks. CircleCI automates build, test, and deployment of software. 

![CircleCI Example Flow with GitHub]({{ site.baseurl }}/assets/img/docs/how_it_works.png)

For example, after a software repository on GitHub or Bitbucket is authorized and added as a project to the circleci.com SaaS application, every new commit triggers a build and notification of success or failure through webhooks. CircleCI also supports Slack, HipChat, Campfire, Flowdock, and IRC notifications. Code coverage results are available from the details page for any project for which a reporting library is added.

CircleCI can also be configured to deploy code to various environments, including the following:

* AWS CodeDeploy
* AWS EC2 Container Service (ECS)
* AWS S3
* Google Container Engine (GKE)
* Heroku

Other cloud service deployments can be easily scripted using SSH or by installing the API client of the service with your job configuration.

