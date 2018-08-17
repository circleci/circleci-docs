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

You can set several Java environment variables
to manage JVM memory usage.
These variables have similar names
and interact with each other in complicated ways.

The below table shows these environment variables,
along with the precedence levels they take
when using different build tools.
The lower the number,
the higher the precedence level,
with 0 being the highest.

Java Environment Variable | Java | Gradle | Maven | Kotlin | Lein
--------------------------|------|--------|-------|--------|------
`_JAVA_OPTIONS`           | 0    | 0      | 0     | 0      | 0
`JAVA_TOOL_OPTIONS`       | 2    | 3      | 2     | 2      | 2
`JAVA_OPTS`               | no   | 2      | no    | 1      | no
`JVM_OPTS`                | *    | no     | no    | no     | *
`LEIN_JVM_OPTS`           | no   | no     | no    | no     | 1
`GRADLE_OPTS`             | no   | 1      | no    | no     | no
`MAVEN_OPTS`              | no   | 1      | no    | no     | no
CLI args                  | 1    | no     | no    | no     | no
{:class="table table-striped"}

\* `lein` passes the value of `JVM_OPTS` to the Java process it spawns.
However,
this environment variable does not affect `lein`
or any Java processes launched directly.
See the `JVM_OPTS` section below for more details.

### `_JAVA_OPTIONS`

### `JAVA_TOOL_OPTIONS`

### `JAVA_OPTS`

### `JVM_OPTS`

### `LEIN_JVM_OPTS`

### `GRADLE_OPTS`

### `MAVEN_OPTS`

## Debugging Java OOM Errors
