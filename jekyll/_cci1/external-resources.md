---
layout: classic-docs
title: Using Resources External to Your Repository
categories: [configuration-tasks]
description: How to use resources not in your repository
last_updated: Feb 2, 2012
order: 57
sitemap: false
---

There are a number of techniques to do this:

*   CircleCI supports `git submodule`, and has advanced SSH key management to let you access multiple repositories from a single test suite.
    From your project's **Project Settings > Checkout SSH keys**
    page, you can add a "user key" with one-click, allowing you access code from multiple repositories in your test suite.
    Git submodules can be easily set up in your `circle.yml` file (see [example 1](/docs/1.0/configuration/#checkout)).
*   CircleCI's VMs are connected to the internet. You can download dependencies directly while setting up your project, using
    `curl` or `wget`.
