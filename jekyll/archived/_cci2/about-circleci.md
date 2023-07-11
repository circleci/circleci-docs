---
layout: classic-docs
title: CircleCI overview
description: An overview of CircleCI, continuous integration and continuous delivery
contentTags:
  platform:
  - Cloud
  - Server v4.x
  - Server v3.x
---

## Introduction
{: #introduction }

CircleCI's mission is to manage change so software teams can innovate faster. CircleCI empowers technology-driven organizations to do their best work -- and make engineering teams more productive and innovative by managing change. CircleCI provides enterprise-class support and services, and works where you work: Linux, macOS, Android, and Windows - in the cloud or on your servers.

Build, test, and deploy by using intelligent automation.

![CircleCI process diagram]({{site.baseurl}}/assets/img/docs/arch.png)

## What is CI/CD?
{: #what-is-ci-cd }

**Continuous integration (CI)** is a practice that integrates code into a chosen branch of a shared repository, early and often. Instead of building out features in isolation and integrating them at the end of a development cycle, code is integrated with the shared repository by developers multiple times throughout the day by committing daily to a shared mainline. Every commit triggers automated tests and builds. If these fail, they can be repaired quickly.

**Continuous delivery (CD)** is a practice that produces reliable releases to a chosen development environment, like a staging or production branch.

The CI/CD process allows developers to release higher quality, more stable products.

## CircleCI in your workflow
{: #circleci-in-your-workflow}

A software repository on a supported version control system (VCS) needs to be authorized and added as a project on [circleci.com](https://circleci.com). Every code change then triggers automated tests in a clean container or virtual machine. CircleCI runs each [job](/docs/glossary/#job) in a separate [container](/docs/glossary/#container) or [virtual machine](https://circleci.com/developer/images?imageType=machine).

CircleCI sends an email notification of success or failure after the tests complete. CircleCI also includes integrated [Slack and IRC notifications](/docs/notifications). Code test coverage results are available from the details page for any project for which a reporting library is added.

CircleCI may be configured to deploy code to various environments, including (but not limited to):
- AWS S3
- AWS EC2 Container Service (ECS)
- Google Cloud Platform (GCP)
- Azure Container Registry
- Heroku
- Firebase
- Android
- iOS

The [orbs registry](https://circleci.com/developer/orbs) contains packages of reusable configuration that can be used for common deployment targets. Orbs simplify and streamline your configuration.

Other cloud service deployments can be scripted using SSH, or by installing the API client of the service with your job configuration.

## Learn More
{: #learn-more }

### On CircleCI Academy
{: #on-circleci-academy }
- [CI/CD 101 workshop](https://academy.circleci.com/cicd-basics?access_code=public-2021)
- [General developer training](https://academy.circleci.com/general-developer-training?access_code=public-2021)

### On our blog
{: #on-our-blog }
- [Config best practices: dependency caching](https://circleci.com/blog/config-best-practices-dependency-caching/)
- [Automate and scale your CI/CD with CircleCI orbs](https://circleci.com/blog/automate-and-scale-your-ci-cd-with-circleci-orbs/)
- [How to secure your CI pipeline](https://circleci.com/blog/secure-ci-pipeline/)

## Next steps
{: #next-steps }
- [Benefits of CircleCI](/docs/benefits-of-circleci)
- [CirceCI concepts](/docs/concepts)