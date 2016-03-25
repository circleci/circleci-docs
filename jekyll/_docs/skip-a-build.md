---
layout: classic-docs
title: Skip a build
categories: [how-to]
description: How to skip a build
---

CircleCI supports the `[ci skip]` or `[skip ci]` standard for ignoring builds.

CircleCI won't run the build if we find `[ci skip]` or `[skip ci]` anywhere in the commit message of the head commit.
You can use the handy retry button on the build page if you decide that you want to run the build after all.

## Example

If Daniel pushes his last two commits now, CircleCI won't run tests for that push:

```
$ git log origin/master..HEAD

commit 63ce74221ff899955dd6258020d6cb9accede893
Author: Daniel Woelfel <daniel@circleci.com>
Date:   Wed Jan 23 16:48:25 2013 -0800

    fix misspelling [ci skip]

commit 463147193b2fe561cfb12a9787434dd726390fcd
Author: Daniel Woelfel <daniel@circleci.com>
Date:   Wed Jan 23 16:30:24 2013 -0800

    add "Skip a build" doc
```

Note that if the commits were in the opposite order, then the push would have been built. Currently neither `[ci skip]` nor `[skip ci]` supports fork PRs.
