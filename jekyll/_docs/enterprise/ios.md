---
layout: enterprise
title: "Building iOS with CircleCI Enterprise"
category: [resources]
order: 4
description: "iOS Overview in CircleCI Enterprise."
visible: 0
---

CircleCI Enterprise currently supports iOS testing via our Mac Fleet. In order to enable iOS testing, your fleet will include a new "iOS Manager" box which connects to our iOS Fleet, and remotely executes commands on Mac hardware. Once setup, iOS projects will be auto-detected, and all builds will be directed to the mac containers. 

![A Diagram of the CircleCI iOS Architecture]({{site.baseurl}}/assets/img/docs/enterprise-ios-network-diagram.png)

We do not currently support running builds on your own hardware, but if you're interested please let us know!


### Getting Access

We are currently prototyping a very limited beta release for building iOS projects with CircleCI Enterprise. If you'd like to be added to the list of potential beta users, please reach out to <enterprise@circleci.com>.
