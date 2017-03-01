---
layout: classic-docs2
title: "Why migrating to 2.0?"
short-title: "Why migrating to 2.0?"
categories: [migrating-from-1-2]
order: 1
---

While CircleCI 1.0 was very powerful CI/CD platform, there are some limitations. In 2.0, we've studied our whole platform thoroughly in order to overcome these limitations.

Here are some known limitations in 1.0 that are addressed in 2.0. If you come across one of them, this is a good time to consider moving to 2.0!

## Native Docker Support

Although there is Docker support in CircleCI 1.0, the versions of Docker that you can use is old and we couldn't support all of Docker's functionalitities.

This is because there are some technical challenges in 1.0 where we use LXC as a base container technology and Docker doesn't go well with LXC.

In 2.0, when your build needs to use Docker, we will run your build on a dedicated VM so that you have the access to full Docker's features.

## Flexible Build Configuration

CircleCI 1.0 infers your project type and automatically runs the most suitable test and build commands for you.

Also we run your builds in a very well-defined steps and orders. For example, we always save dependency cache before running test commands.

Although there are very powerful, there are some drawbacks: sometimes you may want to disable inference. In other time, you may want to save dependency cache after tests run because
some of dependencies are created during the tests.

In 2.0, build steps are small parts. You can use these parts to compose your build as you wish. In this way, you will gain the great flexibility to define your build.

To learn more, please see [Configuring CircleCI 2.0]( {{ site.baseurl }}/2.0/2.0/configuration) section.

## Custom Build Image

In 1.0, you have to use build image that CircleCI provides. In Linux builds, there are two images that you can use: Ubuntu 12.04 and 14.04. While many languages and tools are pre-installed in these images, sometimes you want to use different images.

For example, you may want to use a different version of MySQL from the one installed in the images.

In 2.0, we support almost all public Docker images. You can also create a custom image and run builds on the image. You can even use multiple image, say MySQL 5.7 and Redis 3.2 images, and run builds on the images as if it's a single image.

To learn more, please see [Pod]( {{ site.baseurl }}/2.0/2.0/configuration/#pod-build-images) section.
