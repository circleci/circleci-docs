---
layout: classic-docs
title: Docker Btrfs volume error
last_updated: Mar 29, 2016
description: Docker Btrfs issue
sitemap: false
---

When you build a Docker image on CircleCI, you will see the following strange error:

```
Error removing intermediate container 9988070f8621: Cannot destroy container 9988070f8621135d7af41973b9e20a9kdk9178795c0fa1371b0ff111238a4e76a: Driver btrfs failed to remove root filesystem 9988070f8621135d7af41973b9e20a9kdk9178795c0fa1371b0ff111238a4e76a: Failed to destroy btrfs snapshot: operation not permitted
```

When Docker creates a container, the container is created on Btrfs, the 
filesystem that we use to store all build containers, and removing a container 
is equivalent to removing a Btrfs subvolume. However, the Docker process doesn't 
have permission to remove btrfs subvolumes, resulting in the error. 
Please see [this](https://github.com/docker/docker/issues/9939) issue 
for more details.

Normally, this is a red-herring and doesn't affect your builds, so you can simply 
ignore it. You can add the `--rm=false` flag to `docker build` to avoid seeing 
this issue.
