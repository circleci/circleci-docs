---
layout: enterprise
section: enterprise
title: "CircleCI 2.0 Behind The Firewall - Preview Release"
category: [advanced-config]
order: 0
description: "Pre-release access to CircleCI 2.0 functionality behind your firewall"
hide: true
---

## Overview

CircleCI 2.0 is our new infrastructure that provides a number of new valuable options for your development teams, including:
* New configuration paradigm with any number of jobs and workflows to orchestrate them. 
* Custom images for execution on a per-job basis.
* Fine-grained performance with custom caching & per-job CPU/memory allocation.

Starting in Q2 2017 we will be offering a preview release to an expanding set of customers. To participate, contact your Account Executive.

## Phase 1: "Alpha"
A handful of customers will be participating in our Alpha release, with the expectation that they will provide active feedback on the installation process, performance profile of their Alpha installation, and any other issues that arise. The Alpha release will have the following constraints:
* Requires setting up a fresh installation that will be entirely disposable (no ability to migrate data from an Alpha install to your existing CircleCI Installation).
* Requires teams to build a new CircleCI 2.0 configuration in their repositories. 
* Only available on AWS.
* Need to manually set up a separate worker cluster.
* No Workflows functionality in the Alpha release.
* Little to no documentation -- support from our Sales and Success Engineers will be available (which is part of why we need to limit Alpha access).
* HTTP only for internal communications between workers and the output processor (HTTPS coming in Beta), so only should be run on a trusted network.
* No "machine" executor for running jobs inside VMs or doing a remote Docker host - Full Docker features can be achieved using privileged containers in your worker fleet and setting up a shared Docker on the hosts.

## Phase 2: "Beta"
An expanded set of customers will be invited in waves to try CircleCI 2.0 features in their existing installation of CircleCI, with the expectation that they will provide feedback directly to CircleCI about their experience operating the new infrastructure and any issues their teams encounter when making the transition to the new configuration. The Beta will have the following constraints:
* Only available on AWS.
* Requires teams to build a new CircleCI 2.0 configuration in their repositories. 
* Admin-led opt-in on a per-project basis -- teams will not automatically get 2.0 functionality in the Beta.

## Phase 3: "General Availability"
All customers with CircleCI installed will be able to get access to CircleCI 2.0 features on their current installation with no restrictions under their current agreement and support level.

