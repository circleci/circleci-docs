---
layout: classic-docs2
title: "Why migrating to 2.0?"
short-title: "Why migrating to 2.0?"
categories: [migrating-from-1-2]
order: 1
---

While CircleCI 1.0 is a very powerful CI/CD platform, it has some limitations for the way teams build software today. CircleCI 2.0 has been built from the groud up to meet the needs of modern container based workflows and addresses the issues you may have found limiting in 1.0.

This document explains some of the limitations of 1.0 and how they are addressed in 2.0. If 1.0 is not meeting your needs due to one of these issues then we recommend you give 2.0 a try.

## Native Docker Support

Although there is Docker support in CircleCI 1.0, the versions of Docker that you can use are old and we can't support all of Docker's functionality.

This is because 1.0 use LXC as a base container with BTRFS as a file system. Recent versions of Docker do not run properly in this environment and many features are unavailable.

In 2.0, when your job needs to use Docker, we will run your job on a dedicated VM so that you have access to all Docker's features.

## Flexible Job Configuration

CircleCI 1.0 infers your project type and automatically runs the most suitable test and build commands for you.

We run your builds in well-defined steps. For example, we always save dependency cache before running test commands.

Although this is very powerful, there are some drawbacks: sometimes you may want to disable inference. Or you may want to save the dependency cache after tests run because
some other dependencies are created during the tests.

In 2.0, job steps are small parts. You can use these parts to compose your job as you wish. This gives you great flexibility to run things that way you want.

To learn more, please see [Configuring CircleCI 2.0]( {{ site.baseurl }}/2.0/configuration) section.

## Custom Build Image

In 1.0, you have to use a build image that CircleCI provides. In Linux builds, there are two images that you can use: Ubuntu 12.04 and 14.04. While many languages and tools are pre-installed in these images, it's frustrating if you need a version of a service or dependency that isn't preinstalled.

For example, you may want to use a different version of MySQL from the one installed in the images. Installing it will add complexity and time to your builds.

In 2.0, we support almost all public Docker images. You can create a custom image and run jobs on it. You can even use multiple images, say MySQL 5.7 and Redis 3.2, and run jobs on the images as if it's a single image.

To learn more, please see [Pod]( {{ site.baseurl }}/2.0/configuration/#pod-build-images) section.
