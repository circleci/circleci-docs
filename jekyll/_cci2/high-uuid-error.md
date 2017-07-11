---
layout: classic-docs
title: "Container ID XXX cannot be mapped to a host ID"
short-title: "Container ID XXX cannot be mapped to a host ID"
description: "Debugging 'Container ID XXX cannot be mapped to a host ID' error when starting a container"
categories: [troubleshooting]
order: 21
---

The error `container id 1000000 cannot be mapped to a host id ` indicates that CircleCI could not start your
container because the userns remapping failed.

This document explains what this error means and how to fix it.

```
75c416ea735c: Pull complete
c6ff40b6d658: Pull complete
a7050fc1f338: Pull complete
f0ffb5cf6ba9: Pull complete
be232718519c: Pull complete
9dea4940377d: Pull complete
7aa04d3ad875: Pull complete
24bb62285b16: Pull complete
56bec22e3559: Pull complete
failed to register layer: Error processing tar file(exit status 1): container id 1000000 cannot be mapped to a host id
```

### What is userns?

The user namespace, or sometimes just userns, is a feature of the Linux kernel that adds another layer of security into
the Linux container technology. The userns allows a host machine to run containers in different UID/GID namespaces from
the host machine. This means all containers can have UID 0 (root account) in it's own namespace and run processes without the host machine giving root priviledges to the container.

When a userns is created, the Linux kernel provides a mapping of UID/GID between the container and the host machine.
For example, say you run start a container and run a process with UID 0 inside the container.

The Linux kernel maps the container's UID 0 to non-privileged UID such as UID 65534 on the host machine. Because of this mapping, the process inside the container can run as if run by the root user but it is actually run by the non-root user on the host machine.

### How Docker and CircleCI use userns

CircleCI runs Docker containers with userns enabled in order to run customers' containers securely.
When Docker starts a container, Docker pull an image and extract image layers form the image. If a layer contains files created with UID/GID outside the remapping range that CircleCI configured on the host machine, say UID 1000000, Docker cannot remap the UID/GID and fails to start the container. This is what's exactly what's happening in the error you see at the top of this document.

### What should I do?

When you hit this error, you need to update the files' UID/GID and re-create the image.

Please contact the image maintainer and report the error details.

If you are an image maintainer, you need to look for which file has high UID/GID and correct it accordingly.

Here is one way to find such file inside [circleci/doc-highid](https://hub.docker.com/r/circleci/doc-highid).

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

Once you find which file has high UID/GID, make sure to change the ownership of the file and re-create the image.
