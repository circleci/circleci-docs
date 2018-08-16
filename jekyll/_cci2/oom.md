---
layout: classic-docs
title: "Avoiding and Debugging Java Memory Errors"
description: "How to avoid and debug Java memory errors on CircleCI."
---

How to avoid and debug Java memory errors on CircleCI.

## Overview

By default,
CircleCI projects build in virtual environments with 4GB of RAM.
All of your project's processes share this RAM,
including databases, tests, tools, and frameworks.

One of these frameworks is the [Java Virtual Machine](https://en.wikipedia.org/wiki/Java_virtual_machine) (JVM).
Without any memory limits,
the JVM can pre-allocate a significant amount of memory.
CircleCI uses [cgroups](https://en.wikipedia.org/wiki/Cgroups)
to allocate resources to individual builds.
The JVM ignores its individual allocation
and consumes all available resources,
resulting in Out of Memory (OOM) errors.

Even when OOM errors appear,
the error messages lack detail.
To avoid these errors,
you can set JVM memory limits.
