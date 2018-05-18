---
layout: classic-docs
title: "API Permissions on CircleCI"
short-title: "API Permissions"
description: "How to Change API Permissions on CircleCI"
order: 20
---

To access a project's details
using the CircleCI API,
you must create project-specific API tokens.
This document describes the token options,
as well as how to create and revoke them.

## Overview

There are two major uses
for API tokens:

1. To view the status of a build.
2. To view the artifacts of a job.

In both cases, CircleCI provides read-only access.
