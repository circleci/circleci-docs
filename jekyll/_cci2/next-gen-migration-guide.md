---
layout: classic-docs
title: "Migrating to next-gen Convenience Images"
short-title: "Migrating to next-gen Convenience Images"
description: "A guide for migrating from using legacy images to next-gen images."
order: 30
version:
- Cloud
- Server v4.x
- Server v3.x
- Server v2.x
---

* TOC
{:toc}


## Overview
{: #overview }

In 2020 CircleCI introduced the next generation (next-gen) of convenience images. These new images are designed to replace the legacy convenience images that were released during the [announcement of CircleCI 2.0](https://circleci.com/blog/say-hello-to-circleci-2-0/). The next-gen CircleCI convenience images are designed from the ground up for a CI/CD environment. They are designed to be faster, more efficient, and most importantly, more reliable. You can learn more about all of the features [on our blog post](https://circleci.com/blog/announcing-our-next-generation-convenience-images-smaller-faster-more-deterministic/). As we begin to deprecate the legacy images, this document provides information on the migration process.

Moving from a legacy to next-gen image requires a change to the namespace. All legacy images have a Docker namespace of `circleci`, while next-gen images have a Docker namespace of `cimg`. For example, migrating from the legacy Ruby or Python image to the respective next-gen image can be done as follows:

```diff
- circleci/ruby:2.7.4
+ cimg/ruby:2.7.4
```

```diff
- circleci/python:3.8.4
+ cimg/python:3.8.4
```

## Changes
{: #changes }

### Deprecated images
{: #deprecated-images }

Several changes are being made to existing images. The following images will be deprecated without next-gen equivalents:

* `buildpack-deps`
* `JRuby`
* `DynamoDB`

If you are using the `buildpack-deps` image, the suggestion is to use the new CircleCI Base image, `cimg/base`. For the other two images, you can install the software yourself in the base image or use a 3rd-party image instead.

Also, the following image will be renamed:

* The Go image will be changed from `golang` to `go`

All Legacy to Next-Gen image changes are captured below in this table:

| Legacy Image | Next-Gen Image |
| --- | --- |
| circleci/buildpack-deps | cimg/base |
| circleci/jruby | No suggested path |
| circleci/dynamodb | No suggested path |
| circleci/golang | cimg/go |
{: class="table table-striped"}

### Browser Testing
{: #browser-testing }

With legacy images, there were 4 different variant tags you could use to get browser testing for a particular image. For example, if you were doing browser testing with the Python v3.7.0 image, you might have used Docker image: circleci/python:3.7.0-browsers. These 4 tags have now been consolidated into a single tag designed to be used together with the [CircleCI Browser Tools orb](https://circleci.com/developer/orbs/orb/circleci/browser-tools).

| Legacy variant tags | Next-gen variant tags |
| --- | --- |
| `-browsers` | `-browsers` + browser orb tools  |
| `-browsers-legacy` | |
| `-node-browsers` | |
| `-node-browsers-legacy` | |
{: class="table table-striped"}

The new, single browsers variant tag includes Node.js, common utilities to use in browser testing such as Selenium, but not the actual browsers. Please note the browsers are no longer pre-installed. Instead, browsers such as Google Chrome and Firefox, as well as their drivers Chromedriver and Gecko, are installed via the `browsers-tools` orb. This provides the flexibility to mix and match the browser versions you need in a build rather than using strictly what CircleCI provides. You can find examples of how to use this orb [here](https://circleci.com/developer/orbs/orb/circleci/browser-tools#usage-install_browsers).

Using Ubuntu as the Single Base OS

Legacy images had variant tags for several different base operating systems. Some images were versions of Debian and Ubuntu, while other images provided several different bases. This is no longer the case. All CircleCI next-gen images are based on the latest LTS release of Ubuntu.

With the base image, at least two LTS releases and non-EOL’d standard releases will be supported.


## Troubleshooting
{: #troubleshooting }

When migrating to a next-gen image, there might be some software issues. Common issues include:
* A library you were using now has a different version.
* An apt package is no longer pre-installed. In this scenario simply install that package using:

```shell
sudo apt-get update && sudo apt-get install -y <the-package>
```

Each image has its own GitHub repository. You can find them [here](https://github.com/CircleCI-Public?q=cimg-&type=&language=&sort=). These repositories are where you can learn more about an image, what makes up the image, open GitHub issues, and contribute PRs. If you are having an issue with an image, especially if it is a migration issue, you can open up a GitHub issue and ask questions. You can also [open a support ticket](https://support.circleci.com/hc/en-us/requests/new) or reach out on [CircleCI Discuss](https://discuss.circleci.com/t/legacy-convenience-image-deprecation/41034).
