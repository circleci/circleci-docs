---
layout: classic-docs
title: Introduction to Continuous Integration and CircleCI
short-title: Introduction to CircleCI
categories: [getting-started]
description: "An introduction to Continuous Integration, Continuous Deployment, and how CircleCI can help."
---

Typically CircleCI is used to do [Continuous Integration][wiki-ci] and Continuous Deployment. 

## Continuous Integration 

The general idea is to test all changes that you are making to your code base. You can accomplish this with: 

* [Unit Tests][wiki-unittest]
* [Integration Tests][wiki-inttest]
* [Functional Tests][wiki-functest] (also known as End to End tests) 

[Software Testing][wiki-codetest] in general is a huge topic with tons of concepts. The way that you write tests varies depending on what language and framework you are using.

## Continuous Deployment 

If your tests pass, then you can deploy your code to development, staging, production, etc... The specific way that you do this depends on what type of infrastructure you are deploying too. Some examples:

* [AWS CodeDeploy][doc-awscd]
* [AWS EC2 Container Service (ECS)][doc-awsecs]
* [AWS S3][doc-awss3]
* [Google Container Engine (GKE)][doc-gke]
* [Heroku][doc-heroku]
* [Deploy Using SSH][doc-sshdeploy]

## How does CircleCI help you 

Now that we have a basic context of what CI and CD is, we can talk about how CircleCI fits into this picture. CircleCI integrates with your version control system (either GitHub or Bitbucket) and automatically runs a series of steps every time that we detect a change to your repository (when you push commits or a PR is opened). 

A CircleCI build consists of a series of steps which are generally:

* Dependencies
* Testing
* Deployment 

We have some inference that can detect these automatically if you are using best practices for standard projects. You can also configure each of these phases [manually][doc-manually]. 



[wiki-ci]: https://en.wikipedia.org/wiki/Continuous_integration
[wiki-unittest]: https://en.wikipedia.org/wiki/Unit_testing
[wiki-inttest]: https://en.wikipedia.org/wiki/Integration_testing
[wiki-functest]: https://en.wikipedia.org/wiki/Functional_testing
[wiki-codetest]: https://en.wikipedia.org/wiki/Software_testing
[doc-awscd]: {{site.baseurl}}/continuous-deployment-with-aws-codedeploy/
[doc-awsecs]: {{site.baseurl}}/continuous-deployment-with-aws-ec2-container-service/
[doc-awss3]: {{site.baseurl}}/continuous-deployment-with-amazon-s3/
[doc-gke]: {{site.baseurl}}/continuous-deployment-with-google-container-engine/
[doc-heroku]: {{site.baseurl}}/continuous-deployment-with-heroku/
[doc-sshdeploy]: {{site.baseurl}}/introduction-to-continuous-deployment/#deploy-over-ssh
[doc-manually]: {{site.baseurl}}/manually/
