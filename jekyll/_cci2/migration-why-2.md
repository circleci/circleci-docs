---
layout: classic-docs2
title: "Why Migrate to CircleCI 2.0?"
short-title: "Why Migrate to 2.0?"
categories: [migrating-from-1-2]
order: 1
---

While CircleCI 1.0 is a powerful CI/CD platform, it has some current limitations that make building software harder than it needs to be. This document explains some of those limitations and how they are addressed in CircleCI 2.0.

## Native Docker Support

Although 1.0 does support Docker, it’s limited to older versions that don’t have access to Docker’s latest features.

This is because 1.0 uses LXC as a base container with a BTRFS file system. Recent versions of Docker don’t run properly in this environment, which means users can’t access Docker’s full featureset on 1.0.

In 2.0, if your job uses Docker, we’ll run your job on a dedicated VM so you can access all of Docker’s features.

## Flexible Job Configuration

1.0 infers your project type and automatically runs the most suitable test and build commands. Running builds are divided into well-defined steps that are performed in order. For example, 1.0 always saves your dependency cache before running tests.

While this configuration can be powerful, there are some drawbacks. Maybe you want to disable inference. Or maybe you need to save the dependency cache _after_ running tests since the tests themselves create _more_ dependencies.

In 2.0, jobs are broken into granular steps. You can compose these steps within a job at your discretion. This gives you greater flexibility to run your build the way you want it.

To learn more, please see [Configuring CircleCI 2.0]( {{ site.baseurl }}/2.0/configuration) section.

## Custom Build Image

In 1.0, you’re restricted to the build image CircleCI provides. In Linux builds, there are 2 images you can use: Ubuntu 12.04 and 14.04. While these images come with many languages and tools pre-installed, it’s frustrating if you need a version of a service or dependency that isn’t included.

Maybe you want to use a different version of MySQL than the one included in either of these images. Installing that adds time and complexity to your builds.

In 2.0, we support almost all public Docker images. You can also create a custom image and run jobs on that. You can even compose multiple images together (like MySQL 5.7 + Redis 3.2) and run jobs on them as if they were a single image.

To learn more, please see [Pod]( {{ site.baseurl }}/2.0/configuration/#pod-build-images) section.
