---
layout: classic-docs
title: CircleCI Xcode Image Release, Update and Deprecation Policy
short-title: CircleCI Xcode Image Release, Update and Deprecation Policy
categories: [platforms]
description: CircleCI Xcode Image Release, Update and Deprecation Policy
order: 31
contentTags: 
  platform:
  - Cloud
---

* TOC
{:toc}

## Overview
{: #overview }
{:.no_toc}

This document outlines the CircleCI Xcode release, update, and deprecation policy. By having a defined Xcode image policy, we ensure that we are able to continue releasing new images quickly and easily, including beta images.

You will find the most up to date information on these images on the [CircleCI Developer Hub](https://circleci.com/developer/machine/image/macos) macOS machine image page.

## Xcode image retention and deprecation
{: #xcode-image-retention-and-deprecation }

We aim to retain 4 major versions of Xcode, with more recent versions having a larger number of images to choose from.

For example, with Xcode 14 being the latest major version being released:

Xcode Version  | Action
----------------|---------------------------------
Xcode 14 | We will retain all `major.minor` versions at the latest patch version
Xcode 13 | We will retain the 4 latest `major.minor` versions at the latest patch version
Xcode 12 | We retain a single image which will be the last stable release of Xcode 12
Xcode 11 | We retain a single image which will be the last stable release of Xcode 11
Xcode 10 | Removed entirely
{: class="table table-striped"}

Future example, when Xcode 15 enters Beta:

Xcode Version | Action
----------------|---------------------------------
Xcode 15 | Beta image will be released and updated as per the beta image policy
Xcode 14 | The latest 4 `major.minor` versions will be retained at the latest patch version, older images will be flagged for deprecation and removed when Xcode 15 reaches RC
Xcode 13 | All images except for the final release will be flagged for deprecation and removed when Xcode 15 reaches RC
Xcode 12 | All images except for the final release will be flagged for deprecation and removed when Xcode 15 reaches RC
Xcode 11 | Flagged for deprecation, removed entirely when Xcode 15 reaches RC
{: class="table table-striped"}

When an image is selected for deprecation and removal, we will create an announcement on our [Discuss forum](https://discuss.circleci.com/c/announcements/39), along with reaching out via email to developers who have requested one of the deprecated images in their recent jobs. We will always aim to provide four weeks' notice where possible.

We will never automatically redirect requests for images to different `major.minor` versions, so when one of these images is removed, jobs will start to fail if the `.circleci/config.yml` has not been updated.

## Xcode patches
{: #xcode-patches }

We retain the latest patch version of each Xcode `major.minor` version we support. Once a new patch version has been released, we will deprecate the previous patch version and automatically redirect all requests to the new patch version.

As patches are generally backwards compatible, redirects will be put in place within 24 hours of a new patch release. If any major issues are discovered, we retain the ability to issue a rollback and make both versions temporarily available.

**Example:**

When Xcode `13.2.1` was released, we removed the previous patch version, `13.2.0`, and automatically redirected all requests for `13.2.0` to `13.2.1`.

## Beta image support
{: #beta-image-support }

We aim to make beta Xcode versions available on the macOS executor as soon as we can, to allow developers to test their apps ahead of the next stable Xcode release.

Unlike our stable images (which are frozen once released and do not change), once a new beta image is released it will overwrite the previous beta image until an RC/Stable image is released, at which point the image is frozen and no longer updated. If you are requesting an image using an Xcode version that is currently in beta, please take into consideration that it will change when Apple releases a new Xcode beta with minimal notice. This can include breaking changes in Xcode and associated tooling which are beyond our control. We do not recommend using beta images for production pipelines.

To read about our customer support policy regarding beta images, please check out this [support center article](https://support.circleci.com/hc/en-us/articles/360046930351-What-is-CircleCI-s-Xcode-Beta-Image-Support-Policy-).

## Xcode image releases
{: #xcode-image-releases }

We closely track and monitor Apple’s Xcode releases and always aim to release new images as quickly as possible. Typically we aim to support a new Xcode image within a couple of days, however please note that this is not an SLA. We can not, and do not, provide an official SLA turnaround time for new Xcode images.

New images are always announced on our [Discuss site](https://discuss.circleci.com/c/announcements/39) along with release notes, and will be added to the table of [Xcode versions in the documentation]({{site.baseurl}}/using-macos/#supported-xcode-versions).

## macOS versions
{: #macos-versions }

Each Xcode image is built on top of a clean macOS install. We aim to keep the macOS version reasonably up to date with the latest version available. Generally our images can be up to 2 minor/patch versions behind the latest stable version.

We aim to keep the macOS version aligned across our different macOS executors (for example, VM and Metal), however this may not always be the case. Please check the [Software Manifest]({{site.baseurl}}/using-macos/#supported-xcode-versions) file for the image for the most accurate information.

When a new major version of macOS (for example, `12.0` or `13.0`) is released, we will usually start to use this version after a minimum of two minor Xcode releases have passed to allow for any major bugs and issues to be resolved. The release timing for this is entirely dependent on Apple’s own release cycle, but will always be announced on our [Discuss forum](https://discuss.circleci.com/c/announcements/39).

## Exceptions
{: #exceptions }

At any time, we reserve the right to work outside of the information in this document if the circumstances require. In the event that we are required to make an exception to the policy, we will aim to provide as much notice and clarity as possible. In these cases, an announcement will be posted on our [Discuss forum](https://discuss.circleci.com/c/announcements/39), along with additional outreach, such as an email notice, where possible.
