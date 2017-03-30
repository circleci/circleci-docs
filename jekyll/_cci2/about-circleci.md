---
layout: classic-docs
title: "About CircleCI"
short-title: "About CircleCI"
description: "Starting point for CircleCI 2.0 docs"
categories: [getting-started]
order: 1
---

CircleCI is a modern **continuous integration** and **continuous delivery** platform.

Our hosted solution is available at <https://circleci.com/>, or you can run [CircleCI Enterprise](https://circleci.com/enterprise/) behind the firewall, inside your private cloud or data center.

## Continuous Integration

Continuous integration is a development practice where you regularly test all changes made to your codebase.

Several times a day, developers push code to a shared repository. The code is then verified by an automated build and test tool. CircleCI integrates with your version control system (GitHub/Bitbucket) and automatically runs a series of steps every time a commit is pushed.

Integrating regularly helps detect errors early. Since each change is usually small, it’s much easier to find the code that introduced a problem.

You’ll likely write several types of tests:

* [Unit Tests][wiki-unittest]
* [Integration Tests][wiki-inttest]
* [Functional Tests][wiki-functest] (or End-to-End tests)

[Software Testing][wiki-codetest] covers a broad range of techniques, processes and tools. The way you write tests varies depending on the language and framework you are using.

## Continuous Deployment

If your tests pass, you can deploy your code to different environments, like development, staging, or production. How you do that will depend on the infrastructure you’re deploying to. Some examples:

* [AWS CodeDeploy][doc-awscd]
* [AWS EC2 Container Service (ECS)][doc-awsecs]
* [AWS S3][doc-awss3]
* [Google Container Engine (GKE)][doc-gke]
* [Heroku][doc-heroku]
* [Deploy Using SSH][doc-sshdeploy]

## Next Steps

Set up an account and link a project by following these [first steps]({{ site.baseurl }}/2.0/first-steps/), then check out our [Project Walkthrough]({{ site.baseurl }}/2.0/project-walkthrough/).

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
[first-steps]: {{ site.baseurl }}/2.0/first-steps/
