---
layout: classic-docs
title: "Avoiding and Debugging Java Memory Errors"
description: "How to avoid and debug Java memory errors on CircleCI."
---

How to avoid and debug Java memory errors on CircleCI.

## Overview

The [Java Virtual Machine](https://en.wikipedia.org/wiki/Java_virtual_machine) (JVM) is a framework
used for Android and Java development.
Without any memory limits,
the JVM pre-allocates a significant amount of memory.
This pre-allocation can produce Out of Memory (OOM) errors,
which are difficult
to debug because the error messages lack detail.

To prevent the JVM from pre-allocating too much memory,
declare memory limits
[using Java environment variables](#using-java-environment-variables-to-set-memory-limits).
To debug OOM errors,
look for the [appropriate exit code](#debugging-java-oom-errors).

## Using Java Environment Variables to Set Memory Limits

## Debugging Java OOM Errors
