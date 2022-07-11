---
layout: classic-docs
title: "Avoiding and Debugging Java Memory Errors"
description: "How to avoid and debug Java memory errors on CircleCI."
version:
- Cloud
- Server v3.x
- Server v2.x
---

How to avoid and debug Java memory errors on CircleCI.

## Overview
{: #overview }

The [Java Virtual Machine](https://en.wikipedia.org/wiki/Java_virtual_machine) (JVM) provides a portable execution environment for Java-based applications.
Without any memory limits, the JVM pre-allocates a fraction of
the total memory available in the system.
CircleCI runs container based builds on large machines with lots of memory.
Each container has a smaller memory limit than the total amount available
on the machine.

By default, Java's is configured so that it will use:
- More than `1/64th` of your total memory (for Docker Medium with 4GiB of RAM this will be 64 MiB)
- Less than `1/4th` of your total memory (for Docker Medium with 4GiB of RAM this will be 1GiB).

As of [June 3rd 2020](https://circleci.com/changelog/#container-cgroup-limits-now-visible-inside-the-docker-executor)
these limits are visible when using the Docker executor. This means that the recent versions of Java will correctly
detect the number of CPUs and amount of RAM available to the job.

For older versions of Java, This can lead to the JVM seeing a large amount of memory and CPUs
being available to it, and trying to use more than is allocated to the container. This pre-allocation can produce
Out of Memory (OOM) errors, which are difficult to debug because the error messages lack detail. Usually you will
see a `137` exit code, which means the process has been `SIGKILL`ed by the OOM killer (`137 = 128 + "kill -9"`).

You can see how much memory your container is allocated, and how much it has used, by looking at the following files:
```
/sys/fs/cgroup/memory/memory.limit_in_bytes
/sys/fs/cgroup/memory/memory.max_usage_in_bytes
```


## UseContainerSupport
{: #usecontainersupport }

Recent versions of Java (JDK 8u191, and JDK 10 and up) include
a flag `UseContainerSupport` which defaults on. This flag enables
the JVM to use the CGroup memory constraints available to the container,
rather than the much larger amount of memory on the machine.
Under Docker and other container runtimes, this will let the JVM more accurately
detect memory constraints, and set a default memory usage within those constraints.
You can use the `MaxRAMPercentage` flag to customise the fraction of available RAM that is used,
e.g. `-XX:MaxRAMPercentage=90.0`.

## Manual memory limits
{: #manual-memory-limits }

Even with cgroup support, the JVM can still use too much memory, e.g. if it executes a worker process pool.
To prevent the JVM from pre-allocating too much memory, declare memory limits
[using Java environment variables](#using-java-environment-variables-to-set-memory-limits).
To debug OOM errors,
look for the [appropriate exit code](#debugging-java-oom-errors).

## Using Java environment variables to set memory limits
{: #using-java-environment-variables-to-set-memory-limits }

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
[`MAVEN_OPTS`](#maven_opts)                     | no   | no     | 1     | no     | no
CLI args                                        | 1    | no     | no    | no     | no
{:class="table table-striped"}

The above environment variables are listed below,
along with details on why to choose one over another.

### `_JAVA_OPTIONS`
{: #javaoptions }

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
{: #javatooloptions }

This environment variable is [a safe choice](https://docs.oracle.com/javase/8/docs/platform/jvmti/jvmti.html#tooloptions)
for setting Java memory limits.
`JAVA_TOOL_OPTIONS` can be read by all Java virtual machines,
and you can easily override it
with command-line arguments
or more specific environment variables.

### `JAVA_OPTS`
{: #javaopts }

This environment variable is not read by the JVM.
Instead, several Java-based tools and languages use it
to pass memory limits to the JVM.

### `JVM_OPTS`
{: #jvmopts }

This environment variable is exclusive to Clojure.
`lein` uses `JVM_OPTS`
to pass memory limits to the JVM.

**Note:**
`JVM_OPTS` does not affect the memory of `lein` itself,
nor can it directly pass memory limits to Java.
To affect `lein`'s available memory,
use `LEIN_JVM_OPTS`.
To directly pass memory limits to Java,
use [`_JAVA_OPTIONS`](#_java_options) or [`JAVA_TOOL_OPTIONS`](#java_tool_options).

### `LEIN_JVM_OPTS`
{: #leinjvmopts }

This environment variable is exclusive to `lein`.

### `GRADLE_OPTS`
{: #gradleopts }

See the Gradle documentation for [memory settings](https://docs.gradle.org/current/userguide/build_environment.html#sec:configuring_jvm_memory).

This environment variable is exclusive to Gradle projects.
Use it
to overwrite memory limits set in `JAVA_TOOL_OPTIONS`.

### `MAVEN_OPTS`
{: #mavenopts }

See the Maven documentation for [memory settings](http://maven.apache.org/configure.html).

This environment variable is exclusive to Apache Maven projects.
Use it
to overwrite memory limits set in `JAVA_TOOL_OPTIONS`.

## Debugging Java OOM errors
{: #debugging-java-oom-errors }

Unfortunately, debugging Java OOM errors often comes down to finding an `exit
code 137` in your error output.

Ensure that your `-XX:MaxRAMPercentage=NN` or `-Xmx=NN` size is large enough for your applications to
completely build, while small enough that other processes can share the remaining memory of your CircleCI
build container.

Even if the JVM's maximum heap size is larger than the job's limit, the garbage collector may be able to keep up with the allocation rate and avoid your process using too much memory and being killed. The default number of threads allocated to the garbage collector is based on the number of CPUs available, so the [cgroup visibility change](https://circleci.com/changelog/#container-cgroup-limits-now-visible-inside-the-docker-executor) made on June 3rd 2020 may cause your application to consume more memory than before and be OOM killed. The best fix for this is to configure the maximum heap size within the job's available RAM, which will cause a full GC to be triggered soon enough to avoid breaching any limits.

If you are still consistently hitting memory limits,
consider [increasing your jobs's RAM allocation]({{site.baseurl}}/configuration-reference/#resource_class).

## See also
{: #see-also }

[Java Language Guide]({{ site.baseurl }}/language-java/)
[Android Tutorial]({{ site.baseurl }}/language-android/)
