---
layout: classic-docs
title: "Migrating From Github Actions"
categories: [migration]
description: "Migrating from Github Actions"
---

This document provides an overview of how to migrate from Github Actions to CircleCI.

## Why Migrate From Github Actions to CircleCI?

Given that Github Actions is directly built into Github, why would developers want to use CircleCI?

The reason is because CircleCI is a first-class CI tool. CI/CD is what we specialize in, and we have been doing it for over 8 years since the company's founding. On top of normal features you'd expect from any CI/CD tool, what sets us apart from others are the various additional features that boost productivity:

1. **Test Parallelism** - CircleCI offers not only [concurrent job execution]({{ site.baseurl }}/2.0/workflows/) but also the ability to split tests between parallel environments. You can dramatically cut build times by splitting workloads between different containers. [Examples of that here]({{ site.baseurl }}/2.0/parallelism-faster-jobs/#using-the-circleci-cli-to-split-tests).
2. **Resource Classes** - CircleCI offers various different sizes of executors, great for adjusting according to lighter or heavier workloads on a node. [Documentation here]({{ site.baseurl }}/2.0/optimizations/#resource-class).
3. **SSH Into Builds** - CircleCI offers the ability to securely SSH into a build environment to tail logs, work with files, and directly interact with an environment. This is highly useful for debugging failing builds. [Documentation here]({{ site.baseurl }}/2.0/ssh-access-jobs/).
4. **Docker Layer Caching** - On top of normal dependency caching, CircleCI offers caching specific to Docker image layers. This means subsequent builds of your Docker images will run faster, cutting even more time off your commit-to-deploy workflows. [Documentation here]({{ site.baseurl }}/2.0/docker-layer-caching/).

We have a number of other features that set our system apart. [Sign up for a free account today](https://circleci.com/signup/) and try us out, or if you're interested in CircleCI for your team, [contact our sales team](https://circleci.com/talk-to-us/?source-button=MigratingFromGithubActionsDoc) to set up a trial.

## Prerequisites

This document assumes that you have an account with CircleCI that is linked to a repository. If you don't, consider going over our [getting started guide]({{ site.baseurl }}/2.0/getting-started/).

## Concepts

### Jobs and Workflows

Both Github Actions and CircleCI share similar functionality around "jobs" and "workflows", differing primarily in the configuration syntax. A workflow is an end-to-end flow of jobs, which in turn consist of individual commands to achieve an atomic task (e.g. "run unit tests" or "build a Docker image").

#### Github Actions Workflow Config

```
name: My Workflow

on: [push]

jobs:
  job_1:
    name: Job 1
    ...
  job_2:
    name: Job 2
    needs: job_1
    ...
```

#### CircleCI Workflow Config

```
jobs:
  job_1:
    ...
  job_2:
    ...

workflows:
  my_workflow:
    jobs:
      - job_1
      - job_2:
          requires:
            - job_1
```

### Actions and Orbs
"Actions" in Github are reusable commands or tasks to run inside a job. However, they are limited in that they are written for Docker container execution or in JavaScript, limiting the scopes in which they can be applied.

CircleCI offers similar functionality in our [Orbs](https://circleci.com/docs/2.0/orb-intro/#section=configuration). The primary different is that CircleCI Orbs are just packaged, reusable YAML, and subsequently you can orbify reusable jobs, executors, or commands.

Github offers browsing of Actions in their Marketplace; CircleCI has an [Orb Registry](https://circleci.com/orbs/registry/) as well as an [Integrations Page](https://circleci.com/integrations/) containing numerous Certified, Partner, and community Orbs.

