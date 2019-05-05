---
layout: classic-docs
title: "Debugging Container ID Cannot Be Mapped to Host ID Error"
short-title: "Debugging Container ID Cannot Be Mapped to Host ID Error"
description: "Debugging 'Container ID XXX cannot be mapped to a host ID' error when starting a container"
categories: [troubleshooting]
order: 21
---
*[Reference]({{ site.baseurl }}/2.0/reference/) > Debugging Container ID Cannot Be Mapped to Host ID Error*

When starting a container,
you may see this error message:

```
failed to register layer: Error processing tar file (exit status 1): container id 1000000 cannot be mapped to a host id
```

This document explains the problem and how to fix it.

## Background

The user namespace (`userns`) is a feature of the Linux kernel
that adds another security layer to Linux containers.
The `userns` allows a host machine
to run containers outside its UID/GID namespace.
This means all containers can have a root account (UID 0) in their own namespace
and run processes without receiving root privileges from the host machine.

When a `userns` is created,
the Linux kernel provides a mapping between the container and the host machine.
For example,
if you start a container
and run a process with UID 0 inside of it,
the Linux kernel maps the container's UID 0 to a non-privileged UID on the host machine.
This allows the container to run a process as if it were the root user,
while **actually** being run by the non-root user on the host machine.

## Problem

The error is caused by a `userns` remapping failure.
CircleCI runs Docker containers with `userns` enabled
in order to securely run customers' containers.
The host machine is configured with a valid UID/GID for remapping.
This UID/GID **must be** in the range of 0 - 65535.

When Docker starts a container,
Docker pulls an image
and extracts layers from that image.
If a layer contains files with UID/GID outside of the accepted range,
Docker cannot successfully remap
and fails to start the container.

## Solution

To fix this error,
you must update the files' UID/GID
and re-create the image.

If you are not the image maintainer, congratulations:
it's not your responsibility.
Contact the image maintainer
and report the error.

If you are the image maintainer,
identify the file with the high UID/GID
and correct it.
First, grab the high UID/GID from the error message.
In the example presented at the top of this document,
this value is `1000000`.
Next, start the container and look for the files which receive that invalid value.

Below is an example
of finding an invalid file inside [circleci/doc-highid](https://hub.docker.com/r/circleci/doc-highid)
using the `find` command:

```bash
# Start a shell inside the container
$ docker run -it circleci/doc-highid sh

# Find the file with high UID/GID
$ find / \( -uid 1000000 \)  -ls 2>/dev/null
     50      0 -rw-r--r--   1 veryhigh veryhigh        0 Jul  9 03:05 /file-with-high-id

# Confirm that the file has high UID/GID
$ ls -ln file-with-high-id
-rw-r--r-- 1 1000000 1000000 0 Jul  9 03:05 file-with-high-id
```

After locating the offending file,
change its ownership
and re-create the image.

**Note:**
It is possible for an invalid file to be generated and removed
while a container is building.
In this case,
you may have to modify the `RUN` step in the Dockerfile itself.
Adding `&& chown -R root:root /root` to the problem step
should fix the problem without creating a bad interim.
