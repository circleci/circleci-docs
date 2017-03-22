---
layout: enterprise
section: enterprise
title: "Building iOS with CircleCI Enterprise"
category: [resources]
order: 4
description: "iOS Overview in CircleCI Enterprise."
hide: true
---

CircleCI Enterprise currently supports iOS testing via a specialized Mac Fleet. In order to enable iOS testing, your fleet will include an "iOS Manager" box which connects to the Mac Fleet and remotely executes commands on VMs on Mac hardware. Once setup, iOS projects will be auto-detected, and all builds will be directed to the Mac(s). 

### Getting Access

We are currently in beta release for building iOS projects with CircleCI Enterprise. If you'd like to be a beta user, please reach out to <enterprise@circleci.com>.


### Overview of using a Mac Fleet

![A Diagram of the CircleCI Mac Fleet Architecture]({{site.baseurl}}/assets/img/docs/enterprise-ios-network-diagram.png)
