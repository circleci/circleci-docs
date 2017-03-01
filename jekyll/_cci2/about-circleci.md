---
layout: classic-docs2
title: "About CircleCI"
short-title: "About CircleCI"
categories: [what-is-circleci]
order: 1
---

CircleCI is a modern **continuous integration** and **continous delivery** platform.

Our hosted solution is available at <https://circleci.com/> or you can run [CircleCI Enterprise](https://circleci.com/enterprise/) behind the firewall, inside your private cloud or data center.

## Continuous Integration 

Continuous Integration regularly tests all changes that you make to your code-base. Developers push code into a shared repository several times a day. The integrations are then verified by an automated build and test tool. CircleCI is here to do that for you.

Integrating regularly means that you detect errors early. Each change is usually small, so it's relatively easy to find the code that introduced the problem.

You will likely include several types of tests: 

* [Unit Tests][wiki-unittest]
* [Integration Tests][wiki-inttest]
* [Functional Tests][wiki-functest] (also known as End-to-End tests) 

[Software Testing][wiki-codetest] covers a broad range of techniques, processes and tools. The way that you write tests varies depending on the language and framework you are using.

## Continuous Deployment

If your tests pass, then you can deploy your code to development, staging, production, or other environments. The way you do this will depend on the infrastructure you are deploying to. Some examples:

* [AWS CodeDeploy][doc-awscd]
* [AWS EC2 Container Service (ECS)][doc-awsecs]
* [AWS S3][doc-awss3]
* [Google Container Engine (GKE)][doc-gke]
* [Heroku][doc-heroku]
* [Deploy Using SSH][doc-sshdeploy]

## CircleCI's Role

CircleCI integrates with your version control system (GitHub/Bitbucket) and automatically runs a series of steps every time a change is detected in the repository (e.g., when you push commits or open a PR).

A CircleCI job consists of a series of steps which are generally:

* Dependencies
* Testing
* Deployment


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