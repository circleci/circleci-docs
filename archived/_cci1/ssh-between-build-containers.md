---
layout: classic-docs
title: SSH between build containers
categories: [parallelism]
description: SSH between build containers
last_updated: Apr 22, 2015
sitemap: false
---

When running a parallel build, we’ll populate each container with SSH
credentials for the other containers running the build.

The containers are indexed starting at 0, so to SSH into container 7
from any other container you can do:

```
ssh node6
```

### Uses

You can use this feature if you want to manually
collect metadata, synchronize a certain operation across the fleet, or
just transfer arbitrary data between parallel build containers.
