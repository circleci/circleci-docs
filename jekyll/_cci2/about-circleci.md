---
layout: classic-docs
title: "Overview"
short-title: "Overview"
description: "Starting point for CircleCI 2.0 docs"
categories: [getting-started]
order: 1
---

CircleCI is a modern continuous integration and continuous delivery (CI/CD) platform that automates build, test, and deployment of software and is free to try using the [Sign Up](https://circleci.com/signup/) button. CircleCI 2.0 is also installable inside your private cloud or data center, see the [Administrator's Overview](https://circleci.com/2.0/overview/) document for details.

## How to Ship Code Faster Using Continuous Integration and Delivery

The following video describes continuous integration, provides a demo of the application, and includes a summary of continous deployment.

<iframe width="560" height="315" src="https://www.youtube.com/embed/YGYoYSR-d98" frameborder="0" allowfullscreen></iframe>

## Overview

After a software repository on GitHub or Bitbucket is authorized and added as a project to circleci.com, every code change  triggers a build  and automated tests in a clean container or VM configured for your requirements. CircleCI then sends an email notification of success or failure after the build and tests complete. CircleCI also includes integrated Slack, HipChat, Campfire, Flowdock, and IRC notifications. Code test coverage results are available from the details page for any project for which a reporting library is added.

CircleCI may be configured to deploy code to various environments, including AWS CodeDeploy, AWS EC2 Container Service (ECS), AWS S3, Google Container Engine (GKE), and Heroku. Other cloud service deployments are easily scripted using SSH or by installing the API client of the service with your job configuration.

## Customer Use Cases

The following section outlines two examples of real-world CircleCI usage. 

### Coinbase
Coinbase runs CircleCI Enterprise behind their firewall for security and reliability. The [Coinbase case study report](https://circleci.com/customers/coinbase/) reveals that using CircleCI reduced their average time from merge to deploy in half, reduced operations time spent on continuous integration maintenance from 50% of one person's time to less than one hour per week, and increased developer throughput by 20%. 

### SONY 
Sony Japan continuously deploys microservices built with Go and Docker in minutes using the CircleCI hosted application as described in the [SONY case study report](https://circleci.com/customers/sony/). The NG-Core services are written in Go, packaged into Docker containers, pushed to Docker Hub, then deployed to AWS Elastic Beanstalk. In detail, the process looks like this:

1. The developer commits and pushes to GitHub
2. CircleCI receives a hook from GitHub, triggering a build
3. CircleCI pulls down the latest code, compiles the Go binaries, and creates a deployable image with docker build
4. Unit and integration tests are run, including some tests that use the final Docker image
5. The Docker image is pushed to Docker Hub, and a new deployment is triggered on Elastic Beanstalk
6. A final live system test is run after the deployment

The entire build and test processes each run about 5 minutes, and when deployments are triggered they run about an additional 10 minutes. The NG-Core team started development using this process in May of 2014, has been in production since January 2015, and they are extremely happy with the setup.

See the [CircleCI Customers page](https://circleci.com/customers/) for the complete set of case studies for companies large and small who are using CircleCI, including the following:

- [How **Fanatics** Team Efficiency Increased by 3x with CircleCI](https://circleci.com/customers/fanatics/)
- [CircleCI Enables **Cruise Automation** (Subsidiary of GM) to Run Many More Simulations](https://circleci.com/customers/cruise/)
- [**Shopify** has 130 Engineers Merging 300 Pull Requests and Deploying 100 Times a Week with CircleCI](https://circleci.com/customers/shopify/)

## Free Trial Options

CircleCI provides a free trial with the following options:

- **Cloud**: See [Signup and Try CircleCI](https://circleci.com/docs/2.0/first-steps/) to get started with the hosted application.
- **Server**: Refer to [CircleCI Trial Installation](https://circleci.com/docs/2.0/single-box/) for the Enterprise Trial instructions.











