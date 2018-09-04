---
layout: classic-docs
title: "Avoiding and Debugging Java Memory Errors"
description: "How to avoid and debug Java memory errors on CircleCI."
---

How to avoid and debug Java memory errors on CircleCI.

## Overview

The [Java Virtual Machine](https://en.wikipedia.org/wiki/Java_virtual_machine) (JVM) provides a portable execution environment for Java-based applications.
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

The table below shows these environment variables,
along with the precedence levels they take
when using different build tools.
The lower the number,
the higher the precedence level,
with 0 being the highest.

Java Environment Variable                       | Java | Gradle | Maven | Kotlin | Lein
------------------------------------------------|------|--------|-------|--------|------
[`_JAVA_OPTIONS`](#_java_options)               | 0    | 0      | 0     | 0      | 0
[`JAVA_TOOL_OPTIONS`](#java_tool_options)       | 2    | 3      | 2     | 2      | 2
[`JAVA_OPTS`](#java_opts)                       | no   | 2      | no    | 1      | no
[`JVM_OPTS`](#jvm_opts)                         | *    | no     | no    | no     | *
[`LEIN_JVM_OPTS`](#lein_jvm_opts)               | no   | no     | no    | no     | 1
[`GRADLE_OPTS`](#gradle_opts)                   | no   | 1      | no    | no     | no
[`MAVEN_OPTS`](#maven_opts)                     | no   | 1      | no    | no     | no
CLI args                                        | 1    | no     | no    | no     | no
{:class="table table-striped"}

The above environment variables are listed below,
along with details on why to choose one over another.

### `_JAVA_OPTIONS`

This environment variable takes precedence over all others.
It is read directly by the JVM
and overwrites all other Java environment variables,
including command-line arguments.
Because of this power,
consider using a more specific Java environment variable.

**Note:**
`_JAVA_OPTIONS` is exclusive to Oracle.
If you are using a different runtime,
ensure that you check the name of this variable.
For example,
if you are using the IBM Java runtime,
then you would use `IBM_JAVA_OPTIONS`.

### `JAVA_TOOL_OPTIONS`

This environment variable is [a safe choice](https://docs.oracle.com/javase/8/docs/platform/jvmti/jvmti.html#tooloptions)
for setting Java memory limits.
`JAVA_TOOL_OPTIONS` can be read by all Java virtual machines,
and you can easily override it
with command-line arguments
or more specific environment variables.

### `JAVA_OPTS`

This environment variable is not read by the JVM.
Instead, several Java-based tools and languages use it
to pass memory limits to the JVM.

### `JVM_OPTS`

This environment variable is exclusive to Clojure.
`lein` uses `JVM_OPTS`
to pass memory limits to the JVM.

**Note:**
`JVM_OPTS` does not affect the memory of `lein` itself,
nor can it directly pass memory limits to Java.
To affect `lein`'s available memory,
use `LEIN_JVM_OPTIONS`.
To directly pass memory limits to Java,
use [`_JAVA_OPTIONS`](#_java_options) or [`JAVA_TOOL_OPTIONS`](#java_tool_options).

### `LEIN_JVM_OPTS`

This environment variable is exclusive to `lein`.

### `GRADLE_OPTS`

This environment variable is exclusive to Gradle projects.
Use it
to overwrite memory limits set in `JAVA_TOOL_OPTIONS`.

### `MAVEN_OPTS`

This environment variable is exclusive to Apache Maven projects.
Use it
to overwrite memory limits set in `JAVA_TOOL_OPTIONS`.

## Debugging Java OOM Errors

Unfortunately,
debugging Java OOM errors often comes down
to finding an `exit code 137` in your error output.

Fortunately, Oracle is aware of these challenges
and [has added command-line options](https://blogs.oracle.com/java-platform-group/java-se-support-for-docker-cpu-and-memory-limits).
Ensure that your `-Xmxn` maximum size is large enough
for your applications to completely build,
while small enough
that other processes can share the remaining memory of your CircleCI build container.

If you are still consistently hitting memory limits,
consider [increasing your project's RAM](https://circleci.com/docs/2.0/configuration-reference/#resource_class).

## See Also

[Java Language Guide]({{ site.baseurl }}/2.0/language-java/)
[Android Tutorial]({{ site.baseurl }}/2.0/language-android/)
