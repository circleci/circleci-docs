---
layout: classic-docs
title: "2.0 Documentation"
description: "Landing page for CircleCI 2.0"
permalink: /2.0/
---

Welcome to CircleCI 2.0! The release of CircleCI 2.0 includes many improvements for faster performance and greater control. If you are new to CI/CD, check out the [Overview]({{ site.baseurl }}/2.0/about-circleci/) for how it works. If you are already using CircleCI 1.0, refer to the [Migrating from 1.0 to 2.0]({{ site.baseurl }}/2.0/migrating-from-1-2/) document.

If you are a System Administrator, see the [2.0 Administrator’s Overview]({{ site.baseurl }}/2.0/overview/) document to get started and refer to the [Installing CircleCI 2.0 on Amazon Web Services with Terraform]({{ site.baseurl }}/2.0/aws/) for installation instructions.

## Setup Process
Use the following process to set up your code repository, run tests, and deploy your artifacts with CircleCI:

Task | Instructions
----|----------
Sign up and authorize your repository | [Sign Up and Try CircleCI 2.0]({{ site.baseurl }}/2.0/first-steps/)
Create a CircleCI configuration file in your repository | [Hello World]({{ site.baseurl }}/2.0/hello-world/)
Select the image and executor (Docker or Machine) for each job | [Specifying Container or Machine Images]({{ site.baseurl }}/2.0/executor-types/)
Configure a database | [Configuring Databases]({{ site.baseurl }}/2.0/postgres-config/)
Install dependencies for building your application | [CircleCI Demo Applications (Language Guides)]({{ site.baseurl }}/2.0/demo-apps/)
Cache dependencies to speed up your builds | [Caching Dependencies]({{ site.baseurl }}/2.0/caching/)
Write a job to run your tests | [Writing Jobs With Steps (Run Step Section)]({{ site.baseurl }}/2.0/configuration-reference/#run)
Automate your browser tests | [Install and Run Selenium to Automate Browser Testing]({{ site.baseurl }}/2.0/project-walkthrough/#install-and-run-selenium-to-automate-browser-testing)
Get test results | [Collecting Test Metadata]({{ site.baseurl }}/2.0/collect-test-data/)
Write a job to deploy artifacts | [Writing Jobs With Steps (Deploy Section)]({{ site.baseurl }}/2.0/configuration-reference/#deploy) and [Deployment Integrations]({{ site.baseurl }}/2.0/deployment_integrations/)
Set up Workflows | [Steps to Configure Workflows]({{ site.baseurl }}/2.0/migrating-from-1-2/#steps-to-configure-workflows), [Workflows Configuration Examples]({{ site.baseurl }}/2.0/workflows/#workflows-configuration-examples) and [Demo Workflows](https://github.com/CircleCI-Public/circleci-demo-workflows/)
Use workspaces in Workflows | [Using Workspaces to Share Data Among Jobs]({{ site.baseurl }}/2.0/workflows/#using-workspaces-to-share-data-among-jobs) and [Writing Jobs With Steps (`persist_to_workspace` Section)]({{ site.baseurl }}/2.0/configuration-reference/#persist_to_workspace)
Manually approve workflow steps | [Holding a Workflow for a Manual Approval]({{ site.baseurl }}/2.0/workflows/#holding-a-workflow-for-a-manual-approval)
{: class="table table-striped"}


## Features

The CircleCI 2.0 platform includes significant performance, stability, and reliability improvements along with the following new features:

- **First-class Docker Support**: Choose any image to run your job steps, customizable on a per-job basis on a particular Git branch. Speed up your run times with advanced layer caching. Build docker images with full docker CLI support and full support for docker compose. Support for all programming languages and custom environments that offer more predictable output. See [Specifying Container Images](https://circleci.com/docs/2.0/executor-types/) for instructions.

- **Workflows**: Orchestrate jobs and steps with great flexibility using a simple set of new keys in your configuration. Share temporary files between jobs with workspaces for fan-in, fan-out, parallel, and sequential runs. Hold a workflow for a manual approval and restart a workflow from a failed job. See [Orchestrating Workflows](https://circleci.com/docs/2.0/workflows/) for details.

- **Resource Allocation**: Configure your CPU and RAM needs on a per-job basis at the branch level, see the [resource_class documentation](https://circleci.com/docs/2.0/configuration-reference/#jobs) for instructions. **Note:** Paid accounts must request to use this feature by opening a support ticket (or by contacting their Customer Success Manager when applicable) and non-paid users must request to use this feature by sending an email to <support@circleci.com>.

- **Insights**: Access interactive charts and analyses in seconds. Visualize trends in your build history to identify and pinpoint bottlenecks. Understand all of your builds at a glance. View the builds that fail most, so you can fix the slowest tests to improve efficiency. See the [Collecting Test Metadata documentation](https://circleci.com/docs/2.0/collect-test-data/) for information.

- **Debugging with SSH and CLI**:  Perform local job runs, configuration validation and log in to a build with SSH for access to log files and to debug running processes. See [Using the CLI documentation](https://circleci.com/docs/2.0/local-jobs/) to learn about running local jobs and refer to [Debugging Jobs over SSH](https://circleci.com/docs/2.0/ssh-access-jobs/) for SSH instructions.

- **Parallelism**: Automatic provisioning of containers as they are freed without waiting for other jobs to finish. See the [Parallel Job Execution documentation]({{ site.baseurl }}/2.0/parallelism-faster-jobs/#nav-button) for examples.

- **Advanced Caching**: Speed up builds by caching files from run to run using keys that are easy to control with granular caching options for cache save and restore points throughout your jobs. Cache any files from run to run using keys you can control, see the [Caching Dependencies documentation](https://circleci.com/docs/2.0/caching/) for strategies and steps.

- **Contexts**: Contexts enable you to share environment variables across projects within an organization. Developers can configure jobs to run in the org-wide context with a single line in their workflows configuration, see [Using Contexts]({{ site.baseurl }}/2.0/contexts) for details.

We’re thrilled to have you here. Happy building!

_The CircleCI Team_
