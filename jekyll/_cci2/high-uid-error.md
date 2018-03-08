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

The user namespace (userns) is a feature of the Linux kernel
that adds another security layer to Linux containers.
The userns allows a host machine
to run containers outside its UID/GID namespace.
This means all containers can have a root account (UID 0) in their own namespace
and run processes without receiving root privileges from the host machine.

When a userns is created,
the Linux kernel provides a mapping between the container and the host machine.
For example,
if you start a container
and run a process with UID 0 inside of it,
the Linux kernel maps the container's UID 0 to a non-privileged UID on the host machine.
This allows the container to run a process as if it were the root user,
while **actually** being run by the non-root user on the host machine.

## Problem

The error is caused by a userns remapping failure.
CircleCI runs Docker containers with userns enabled
in order to securely run customers' containers.
The host machine is configured with a range of valid UID/GID values for remapping.

When Docker starts a container,
Docker pulls an image
and extracts layers from that image.
If a layer contains files with UID/GID values outside the defined range,
Docker cannot successfully remap
and fails to start the container.

## Solution

When you hit this error, you need to update the files' UID/GID and re-create the image.

Please contact the image maintainer and report the error details.

If you are an image maintainer, you need to look for which file has high UID/GID and correct it accordingly.

Here is one way to find such a file inside [circleci/doc-highid](https://hub.docker.com/r/circleci/doc-highid).

First, grab the high UID/GID value from `container id XXX cannot be mapped to a host id` error message in CircleCI.
For example, the value is `1000000` in the error message you see at the top of this document.

Second, start the container and look for which files get the high value. There are multiple ways to do this, but one way is using `find` command. Note that the following example only works with BSD/GNU `find` command. If BSD/GNU `find` is not installed in your container, you may need to use different commands.

```
# Start a shell inside the container
$ docker run -it circleci/doc-highid sh

# Find the file with high UID/GID
$ find / \( -uid 1000000 \)  -ls 2>/dev/null
     50      0 -rw-r--r--   1 veryhigh veryhigh        0 Jul  9 03:05 /file-with-high-id

# Confirm that the file has high UID/GID
$ ls -ln file-with-high-id
-rw-r--r-- 1 1000000 1000000 0 Jul  9 03:05 file-with-high-id
```

Once you find which file has a high UID/GID, make sure to change the ownership of the file and re-create the image.
