---
layout: classic-docs
title: "How CircleCI handles security"
category: [administration]
description: "An overview of security measures taken at CircleCI."
---

This document outlines security initiatives talken by CircleCI.

## Overview
{: #overview }
Proactive security is a top priority at CircleCI, and security issues are acted upon immediately. Report security issues to <security@circleci.com> with an encrypted message using our security team's GPG key (ID: 0x4013DDA7, fingerprint: 3CD2 A48F 2071 61C0 B9B7 1AE2 6170 15B8 4013 DDA7).

## Encryption
{: #encryption }
CircleCI uses HTTPS or SSH for all networking in and out of our service including from the browser to our services application, from the services application to your builder fleet, from our builder fleet to your source control system, and all other points of communication. In short, none of your code or data travels to or from CircleCI without being encrypted unless you have code in your builds that does so at your discretion. Operators may also choose to go around our SSL configuration or not use TLS for communicating with underlying systems.

The nature of CircleCI is that our software has access to your code and whatever data that code interacts with. All jobs on CircleCI run in a sandbox (specifically, a Docker container or an ephemeral VM) that stands alone from all other builds and is not accessible from the Internet or from your own network. The build agent pulls code via git over SSH. Your particular test suite or job configurations may call out to external services or integration points within your network, and the response from such calls will be pulled into your jobs and used by your code at your discretion. After a job is complete, the container that ran the job is destroyed and rebuilt. All environment variables are encrypted using [HashiCorp Vault](https://www.vaultproject.io/). Environment variables are encrypted using AES256-GCM96 and are unavailable to CircleCI employees.

## Sandboxing
{: #sandboxing }
With CircleCI you control the resources allocated to run the builds of your code. This will be done through instances of our builder boxes that set up the containers in which your builds will run. By their nature, build containers will pull down source code and run whatever test and deployment scripts are part of the code base or your configuration. The containers are sandboxed, each created and destroyed for one build only (or one slice of a parallel build), and they are not available from outside themselves. The CircleCI service provides the ability to SSH directly to a particular build container. When doing this a user will have complete access to any files or processes being run inside that build container, so provide access to CircleCI only to those also trusted with your source code.

## Integrations
{: #integrations }
A few different external services and technology integration points touch CircleCI. The following list enumerates those integration points.

- **Web Sockets** We use [Pusher](https://pusher.com/) client libraries for WebSocket communication between the server and the browser, though for installs we use an internal server called slanger, so Pusher servers have no access to your instance of CircleCI nor your source control system. This is how we, for instance, update the builds list dynamically or show the output of a build line-by-line as it occurs. We send build status and lines of your build output through the web socket server (which unless you have configured your installation to run without SSL is done using the same certs over SSL), so it is encrypted in transit.

- **Replicated** For private installations of CircleCI Server, [Replicated](http://www.replicated.com/) is used to manage the installation wizard, licensing keys, system audit logs, software updates, and other maintenance and systems tasks for CircleCI. Your instance of CircleCI Server communicates with Replicated servers to send license key information and version information to check for updates. Replicated does not have access to your data or other systems, and CircleCI does not send any of your data to Replicated.

- **Source Control Systems** To use CircleCI you will set up a direct connection with your instance of GitHub Enterprise, GitHub.com, or other source control system. When you set up CircleCI you authorize the system to check out your private repositories. You may revoke this permission at any time through your GitHub application settings page and by removing Circle's Deploy Keys and Service Hooks from your repositories' Admin pages. While CircleCI allows you to selectively build your projects, GitHub's permissions model is "all or nothing" — CircleCI gets permission to access all of a user's repositories or none of them. Your instance of CircleCI will have access to anything hosted in those git repositories and will create webhooks for a variety of events (eg: when code is pushed, when a user is added, etc.) that will call back to CircleCI, triggering one or more git commands that will pull down code to your build fleet.

- **Dependency and Source Caches** Most CircleCI customers use S3 or equivalent cloud-based storage inside their private cloud infrastructure (Amazon VPC, etc) to store their dependency and source caches. These storage servers are subject to the normal security parameters of anything stored on such services, meaning in most cases our customers prevent any outside access.

- **Artifacts** To help prevent other builds from accessing your browser local storage when viewing artifacts, HTML and XHTML pages are hosted on their own project-specific subdomain of `*.circle-artifacts.com`. Non-HTML artifacts will usually be (`302 FOUND`) redirected to an S3 URL to allow for the highest download speed. Because these artifact types are hosted on a single S3 domain, artifacts may access your browser local storage on HTML and XHTML pages, and so you should avoid entering sensitive data into your browser for these URLs.

- **iOS Builds** If you are paying to run iOS builds on CircleCI hardware your source code will be downloaded to a build box on our macOS fleet where it will be compiled and any tests will be run. Similar to our primary build containers that you control, the iOS builds we run are sandboxed such that they cannot be accessed.

- **Docker** If you are using Docker images, refer to the public Docker [seccomp (security computing mode) profile](https://github.com/docker/engine/blob/e76380b67bcdeb289af66ec5d6412ea85063fc04/profiles/seccomp/default.json) for the Docker engine. CircleCI appends the following to the Docker default `seccomp` profile:

{% raw %}
```
[
  {
    "comment": "Allow create user namespaces",
    "names": [
      "clone",
      "setns",
      "unshare"
    ],
    "action": "SCMP_ACT_ALLOW",
    "args": [],
    "includes": {},
    "excludes": {}
  }
]
```
{% endraw %}