---
layout: enterprise
section: enterprise
title: "Security Features"
category: [resources]
order: 5
description: "CircleCI Enterprise security features."
sitemap: false
---

This document outlines security features built into CircleCI Enterprise and related integrations.

* TOC 
{:toc}

## Overview
Security is our top priority at CircleCI, we are proactive and we act on security issues immediately. Report security issues to <security@circleci.com> with an encrypted message using our security team's GPG key (ID: 0x4013DDA7, fingerprint: 3CD2 A48F 2071 61C0 B9B7 1AE2 6170 15B8 4013 DDA7).

## Encryption
CircleCI Enterprise uses HTTPS or SSH for all networking in and out of our service including from the browser to our services application, from the services application to your builder fleet, from our builder fleet to your source control system, and all other points of communication. In short, none of your code or data travels to or from CircleCI Enterprise without being encrypted unless you have code in your builds that does so at your discretion. Operators may also choose to go around our SSL configuration or not use TLS for communicating with underlying systems.

The nature of CircleCI Enterprise is that our software has access to your code and whatever data that code interacts with. All builds on CircleCI run in sandbox (specifically, an LXC container) that stands alone from all other builds and is not accessible from the Internet or from your own network. The build container pulls code via git over SSH. Your particular test suite or build configuration may call out to external services or integration points within your network, and the response from such calls will be pulled into your build and used by your code at your discretion. After a build is complete the container that ran the build is destroyed and rebuilt. All environment variables you store inside CircleCI are encrypted at rest and sent to your build containers using SSH.

## Sandboxing
With CircleCI Enterprise you control the resources allocated to run the builds of your code. This will be done through instances of our builder boxes that set up the containers in which your builds will run. By their nature, build containers will pull down source code and run whatever test and deployment scripts are part of the code base or your configuration. The containers are sandboxed, each created and destroyed for one build only (or one slice of a parallel build), and they are not available from outside themselves. The CircleCI Enterprise service provides the ability to SSH directly to a particular build container. When doing this a user will have complete access to any files or processes being run inside that build container, so provide access to CircleCI Enterprise only to those also trusted with your source code.

## Integrations
A few different external services and technology integration points touch CircleCI Enterprise. The following list enumerates those integration points.

- **Web Sockets** We use [Pusher](https://pusher.com/) client libraries for WebSocket communication between the server and the browser, though for Enterprise installs we use an internal server called slanger, so Pusher servers have no access to your instance of CircleCI Enterprise nor your source control system. This is how we, for instance, update the builds list dynamically or show the output of a build line-by-line as it occurs. We send build status and lines of your build output through the web socket server (which unless you have configured your installation to run without SSL is done using the same certs over SSL), so it is encrypted in transit.

- **Replicated** We use [Replicated](http://www.replicated.com/) to manage the installation wizard, licensing keys, system audit logs, software updates, and other maintenance and systems tasks for CircleCI Enterprise. Your instance of CircleCI Enterprise communicates with Replicated servers to send license key information and version information to check for updates. Replicated does not have access to your data or other systems, and we do not send any of your data to Replicated.

- **Source Control Systems** To use CircleCI Enterprise you will set up a direct connection with your instance of GitHub Enterprise, GitHub.com, or other source control system. When you set up CircleCI Enterprise you authorize the system to check out your private repositories. You may revoke this permission at any time through your GitHub application settings page and by removing Circle's Deploy Keys and Service Hooks from your repositories' Admin pages. While CircleCI Enterprise allows you to selectively build your projects, GitHub's permissions model is "all or nothing" — CircleCI Enterprise gets permission to access all of a user's repositories or none of them. Your instance of CircleCI Enterprise will have access to anything hosted in those git repositories and will create webhooks for a variety of events (eg: when code is pushed, when a user is added, etc.) that will call back to CircleCI Enterprise, triggering one or more git commands that will pull down code to your build fleet.

- **Dependency and Source Caches** Most CircleCI Enterprise customers use S3 or equivalent cloud-based storage inside their private cloud infrastructure (Amazon VPC, etc) to store their dependency and source caches. These storage servers are subject to the normal security parameters of anything stored on such services, meaning in most cases our customers prevent any outside access.

- **Artifacts** It is common to use S3 or similar hosted storage for artifacts. Assuming these resources are secured per your normal policies they are as safe from any outside intrusion as any other data you store there.

- **iOS Builds** If you are paying to run iOS builds on CircleCI hardware your source code will be downloaded to a build box on our macOS fleet where it will be compiled and any tests will be run. Similar to our primary build containers that you control, the iOS builds we run are sandboxed such that they cannot be accessed.



