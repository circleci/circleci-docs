---
layout: classic-docs
title: "2.0 Docs"
description: "Landing page for CircleCI 2.0"
permalink: /2.0/
---

Welcome to CircleCI 2.0! The release of CircleCI 2.0 includes many improvements for faster performance and greater control. If you are new to CircleCI, check out the [Overview]({{ site.baseurl }}/2.0/about-circleci/) for how it works and then use the [Hello World]({{ site.baseurl }}/2.0/hello-world/) doc to start your first project build. Refer to the [Sample 2.0 config.yml File]({{ site.baseurl }}/2.0/sample-config/) to try out multiple jobs with workflow orchestration, then head over to the [2.0 Project Tutorial]({{ site.baseurl }}/2.0/project-walkthrough/).

If you are an Administrator, see the [2.0 Administrator’s Overview]({{ site.baseurl }}/enterprise/overview/) document to get started and refer to the [Installing CircleCI 2.0 on Amazon Web Services with Terraform]({{ site.baseurl }}/enterprise/aws/) document for installation instructions.

## Programming Language Support

Code that builds on Linux will generally build on CircleCI 2.0. For some language versions, CircleCI provides demo applications with YAML file templates and instructions: 

- **Android**, see the [Android Language Guide]({{ site.baseurl }}/2.0/language-android/)
- **Clojure 1.2.0 and later**, see the [Clojure Language Guide]({{ site.baseurl }}/2.0/language-clojure/)
- **Elixir 1.2 and later**, see the [Elixir Language Guide]({{ site.baseurl }}/2.0/language-elixir/)
- **Go 1.7 and later**, see the [Go Language Guide]({{ site.baseurl }}/2.0/language-go/)
- **Java 8 and later**, see the [Java Language Guide]({{ site.baseurl }}/2.0/language-java/)
- **Node.js 4 and later**, see the [JavaScript Language Guide]({{ site.baseurl }}/2.0/language-javascript/)
- **PHP 5 and later**, see the [PHP Language Guide]({{ site.baseurl }}/2.0/language-php/)
- **Python 2 and later**, see the [Python Language Guide]({{ site.baseurl }}/2.0/language-python/)
- **Ruby 2 and later**, see the [Ruby and Rails Guide]({{ site.baseurl }}/2.0/language-ruby/) 

Build projects in C, C#, C++, Clojure, Elixir, Erlang, Go, Groovy, Haskell, Haxe, Java, JavaScript, Node.js, Perl, PHP, Python, Ruby, Rust, Scala and many more. 

## Features

The CircleCI 2.0 platform includes significant performance, stability, and reliability improvements along with the following new features:

- **First-class Docker Support**: Choose any image to run your job steps, customizable on a per-job basis on a particular Git branch. Speed up your run times with advanced layer caching. Build docker images with full docker CLI support and full support for docker compose. Support for all programming languages and custom environments that offer more predictable output. See [Specifying Container Images](https://circleci.com/docs/2.0/executor-types/) for instructions.

- **Workflows**: Orchestrate jobs and steps with great flexibility using a simple set of new keys in your configuration. Share temporary files between jobs with workspaces for fan-in, fan-out, parallel, and sequential runs. Hold a workflow for a manual approval and restart a workflow from a failed job. See [Orchestrating Workflows](https://circleci.com/docs/2.0/workflows/) for details.

- **Resource Allocation**: Configure your CPU and RAM needs on a per-job basis at the branch level, see the [resource_class documentation](https://circleci.com/docs/2.0/configuration-reference/#jobs) for instructions. Paid accounts may request this feature by opening a support ticket (or via their Customer Success Manager when applicable) and non-paid users by sending an email to <support@circleci.com>.

- **Insights**: Access interactive charts and analyses in seconds. Visualize trends in your build history to identify and pinpoint bottlenecks. Understand all of your builds at a glance. View the builds that fail most, so you can fix the slowest tests to improve efficiency. See the [Collecting Test Metadata documentation](https://circleci.com/docs/2.0/collect-test-data/) for information.

- **Debugging with SSH and CLI**:  Perform local job runs, configuration validation and log in to a build with SSH for access to log files and to debug running processes. See [Using the CLI documentation](https://circleci.com/docs/2.0/local-jobs/) to learn about running local jobs and refer to [Debugging Jobs over SSH](https://circleci.com/docs/2.0/ssh-access-jobs/) for SSH instructions.

- **Parallelism**: Automatic provisioning of containers as they are freed without waiting for other jobs to finish. See the [Parallel Job Execution documentation]({{ site.baseurl }}/2.0/parallelism-faster-jobs/#nav-button) for examples.

- **Advanced Caching**: Speed up builds by caching files from run to run using keys that are easy to control with granular caching options for cache save and restore points throughout your jobs. Cache any files from run to run using keys you can control, see the [Caching Dependencies documentation](https://circleci.com/docs/2.0/caching/) for strategies and steps.

- **Contexts**: Contexts enable you to share environment variables across projects within an organization. Developers can configure jobs to run in the org-wide context with a single line in their workflows configuration, see [Using Contexts]({{ site.baseurl }}/2.0/contexts) for details.

We’re thrilled to have you here. Happy building!

_The CircleCI Team_
