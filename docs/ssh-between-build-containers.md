---

title: SSH between build containers
layout: doc
tags:
  - parallelism

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
collect metadata, synchronise a certain operation across the fleet, or
just transfer arbitrary data between parallel build containers.
