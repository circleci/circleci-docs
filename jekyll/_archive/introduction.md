---
layout: classic-docs
title: Introduction to Continuous Integration and CircleCI
short-title: Introduction to CircleCI
categories: [getting-started]
description: "An introduction to Continuous Integration, Continuous Deployment, and how CircleCI can help."
order: 10
sitemap: false
---

CircleCI acts as a platform for both [Continuous Integration][wiki-ci] and Continuous Deployment.

## Continuous Integration 

The general idea is to test all changes that you are making to your code base. You can accomplish this with: 

* [Unit Tests][wiki-unittest]
* [Integration Tests][wiki-inttest]
* [Functional Tests][wiki-functest] (also known as End-to-End tests) 

In general, [Software Testing][wiki-codetest] is a huge topic with tons of concepts. The way that you write tests varies depending on what language and framework you are using.

## Continuous Deployment 

If your tests pass, then you can deploy your code to development, staging, production, or other environments. The way you do this will depend on the infrastructure you are deploying to. Some examples:

* [AWS CodeDeploy][doc-awscd]
* [AWS EC2 Container Service (ECS)][doc-awsecs]
* [AWS S3][doc-awss3]
* [Google Container Engine (GKE)][doc-gke]
* [Heroku][doc-heroku]
* [Deploy Using SSH][doc-sshdeploy]

## CircleCI's Role

Now that we have some context on CI and CD, we can discuss how CircleCI fits into this flow.

CircleCI integrates with your version control system (GitHub/Bitbucket) and automatically runs a series of steps every time a change is detected in the repository (e.g., when you push commits or open a PR).

A CircleCI build consists of a series of steps which are generally:

* Dependencies
* Testing
* Deployment 

If you are using best practices for your project, CircleCI will infer settings automatically. You can also configure each phase [manually][doc-manually].



[wiki-ci]: https://en.wikipedia.org/wiki/Continuous_integration
[wiki-unittest]: https://en.wikipedia.org/wiki/Unit_testing
[wiki-inttest]: https://en.wikipedia.org/wiki/Integration_testing
[wiki-functest]: https://en.wikipedia.org/wiki/Functional_testing
[wiki-codetest]: https://en.wikipedia.org/wiki/Software_testing
[doc-awscd]:  {{ site.baseurl }}/1.0/continuous-deployment-with-aws-codedeploy/
[doc-awsecs]:  {{ site.baseurl }}/1.0/continuous-deployment-with-aws-ec2-container-service/
[doc-awss3]:  {{ site.baseurl }}/1.0/continuous-deployment-with-amazon-s3/
[doc-gke]:  {{ site.baseurl }}/1.0/continuous-deployment-with-google-container-engine/
[doc-heroku]:  {{ site.baseurl }}/1.0/continuous-deployment-with-heroku/
[doc-sshdeploy]:  {{ site.baseurl }}/1.0/introduction-to-continuous-deployment/#deploy-over-ssh
[doc-manually]:  {{ site.baseurl }}/1.0/manually/
