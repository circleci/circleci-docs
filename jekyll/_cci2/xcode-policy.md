---
layout: classic-docs
title: CircleCI Xcode Image Release, Update and Deprecation Policy
short-title: CircleCI Xcode Image Release, Update and Deprecation Policy
categories: [platforms]
description: CircleCI Xcode Image Release, Update and Deprecation Policy
order: 31
version: 
- Cloud
---

* TOC
{:toc}

## Overview
{:.no_toc}

This document outlines the CircleCI Xcode release, update and deprecation policy. By having a defined Xcode image policy, we ensure that we are able to continue releasing new images quickly and easily, including beta images.

## Xcode Image Retention and Deprecation

We aim to retain 4 major versions of Xcode, with more recent versions having a larger number of images to choose from.

Example with Xcode 12 being the latest major version being released:

Xcode Version  | Action
----------------|---------------------------------
Xcode 12 | We will keep all major.minor versions at the latest patch version
Xcode 11 | We will keep all major.minor versions at the latest patch version
Xcode 10 | As further Xcode 12 releases are announced, we will begin deprecating older versions of Xcode 10 in stages
Xcode 9 | We retain a single image which will be the last stable release of Xcode 9
Xcode 8 | Removed entirely
{: class="table table-striped"}

Future example when Xcode 13 enters Beta:

Xcode Version | Action
----------------|---------------------------------
Xcode 13 | Beta image will be released and updated as per the beta image policy
Xcode 12 | We will keep all `major.minor` versions at the latest patch version
Xcode 11 | We will keep all `major.minor` versions at the latest patch version during the beta period and begin to flag images for deprecation during the Xcode 13 release cycle
Xcode 10 | All images except for the final release will be flagged for deprecation and removed when Xcode 13 reaches GM
Xcode 9 | Flagged for deprecation, removed when Xcode 13 reaches GM
{: class="table table-striped"}

When an image is selected for deprecation and removal, we will create an announcement on our [Discuss forum](https://discuss.circleci.com/c/announcements/39), along with reaching out via email to developers who have requested one of the deprecated images in their recent jobs. We will always aim to provide 4 weeks notice.

We will never automatically redirect requests for images to different major.minor versions, so when one of these images is removed, jobs will start to fail if the config has not been updated.

## Xcode Patches

We retain the latest patch version of each Xcode `major.minor` version we support. Once a new patch version has been released, we will deprecate the previous patch version and redirect all requests to the new patch.

As patches are generally backwards compatible, redirects will be put in place within 24 hours of a new patch release. If any major issues are discovered, we will issue a rollback and make both versions temporarily available.

**Example:**

When Xcode `12.0.1` is released, we will remove the previous patch version, `12.0.0`, and automatically redirect all requests for `12.0.0` to `12.0.1`.

## Beta Image Support

We endeavour to make beta Xcode versions available on the macOS executor as soon as we can, to allow developers to test their apps ahead of the next stable Xcode release.

Unlike our stable images (which are frozen and will not change), once a new beta image is released it will overwrite the previous beta image until a GM (stable) image is released, at which point the image is frozen and no longer updated. If you are requesting an image using an Xcode version that is currently in beta, please expect it to change when Apple releases a new Xcode beta with minimal notice. This can include breaking changes in Xcode/associated tooling which are beyond our control.

To read about our customer support policy regarding beta images, please check out this [support center article](https://support.circleci.com/hc/en-us/articles/360046930351-What-is-CircleCI-s-Xcode-Beta-Image-Support-Policy-).

## Xcode Image Releases

We closely track and monitor Apple’s Xcode releases and always endeavor to release new images as quickly as possible. We can not provide an official SLA turnaround time for this as it is highly dependent on any changes made in Xcode and macOS.

New images are always announced on our [Discuss site](https://discuss.circleci.com/c/announcements/39) along with release notes and will be added to the table of [Xcode versions in the documentation](https://circleci.com/docs/2.0/testing-ios/#supported-xcode-versions). 

## macOS Versions

Each Xcode image is built on top of a clean macOS install. We aim to keep the macOS version as stable as possible by only updating it when the minimum version requirement for Xcode is increased. When this occurs, we will update the macOS version to the latest stable version that is available.

When a new major version of macOS (e.g., `10.15` or `11.0`) is released, we will usually start to use this version after a minimum of two minor Xcode releases have passed to allow for any major bugs and issues to be resolved. The release timing for this is entirely dependent on Apple’s own release cycle, but will always be announced ahead of time on our [Discuss forum](https://discuss.circleci.com/c/announcements/39).

## Exceptions

At any time, we reserve the right to work outside of the information in this document if circumstances require. In the event that we are required to make an exception to the policy, we will endeavour to provide as much notice and clarity as possible. In these cases, an announcement will be posted on our [Discuss forum](https://discuss.circleci.com/c/announcements/39), along with additional outreach, such as an email notice, where possible.
