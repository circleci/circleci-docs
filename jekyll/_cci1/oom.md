---
layout: classic-docs
title: Your build hit the 4G memory limit
categories: [troubleshooting]
description: What happens when your build hit the 4G memory limit
last_updated: Feb 25, 2014
---

Your build contains a message that says:

> Warning: The build VMs have a memory limit of 4G. Your build hit this
> limit on one or more containers, and your build results are likely
> invalid.

The reason for this is your builds run in a VM with 4GB of
available RAM. If you go over that limit, Linux kills a process,
somewhat arbitrarily.

Hitting the RAM limit typically indicates a bug, such as a process not
freeing resources.

## Debugging

Builds which run out of memory in this way result in a file being
generated called `memory-usage.txt`, which you will find in the artifacts
tab on the build page. This contains information that should help you
debug your build.

If `memory-usage.txt` does not include enough information, you can SSH
into your build. Use the [SSH button](/docs/ssh-build/)
to ssh into a running build and run `top`.

Hit `Shift + M` to sort by memory usage and watch what process is using
the most memory while your tests run.

The number to pay attention to is the RES (short for resident) column.
This tracks the actual RAM used by a process. Note that the 4GB limit
applies to the sum of all processes running in your container, not
just a single process.

One thing to keep in mind is that the %MEM you see in top is the
percentage of the entire machine, not just the container that your builds
are running in. The Out-Of-Memory killer typically runs when a process
uses up 2-3% of total memory.

## Setting memory limits for the JVM

JVM is known to pre-allocate significant amounts of memory in large
chunks, which sometimes can result in the OOM errors.

If that is the case for you, you can
limit the JVM’s usage of memory by declaring the limits in the
`JAVA_OPTS` environment variable, like this:

```
machine:
  environment:
    _JAVA_OPTIONS: "-Xms512m -Xmx1024m"
```

Note that you might want to use larger numbers depending on the other
processes running during your build. Check the contents of your
`memory-usage.txt` for the memory usage of the rest of the processes and
adjust the parameters accordingly.

## Out of memory errors in Android builds

Gradle does not respect the `$JAVA_OPTS` variable,
so for Android builds you should limit the JVM’s heap by adding the
`$GRADLE_OPTS` variable with the following contents to your
`circle.yml` file:

```
machine:
  environment:
    GRADLE_OPTS: '-Dorg.gradle.jvmargs="-Xmx2048m -XX:+HeapDumpOnOutOfMemoryError"'
```

If your tests actually need more than 4GB of RAM, please
[contact us](mailto:support@circleci.com).
