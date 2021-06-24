---
layout: classic-docs
title: Server launch-agent compatibility
short-title: Server launch-agent compatbilitiy
categories: [platforms]
description: Launch-agent compatibility table for server
order: 31
version:
- Server v3.x
---

NOTE: CircleCI Runner is not yet available on the current version of Server
3.x; however, it will be available for preview before the next release. Please
[contact us](https://circleci.com/contact/) for more information.
The information on this page is relevant to intallations of CircleCI server v3.x and is supplementary to the <<runner-installation#,Runner Installation guide>>.
Each minor version of server is compatible with a specific version of
`circleci-launch-agent`. The table below enumerates which version of `circleci-launch-agent` to use
depending on your version of server:

Server version  | Runner
----------------|---------------------------------
3.0             | Runner not supported
3.1             | 1.0.11147-881b608
{: class="table table-striped"}
