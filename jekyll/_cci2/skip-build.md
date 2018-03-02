---
layout: classic-docs
title: Skipping a Build
---

By default,
CircleCI automatically builds a project
whenever you push changes to a version control system (VCS).
You can override this behavior
by adding a `[ci skip]` or `[skip ci]` tag
anywhere in a commit's title or description.
This not only skips the marked commit,
but also **all other commits** in the push.

If you later decide to build a skipped commit,
click the _Rebuild_ button on the build details page in CircleCI.
This overrides any `[ci skip]` or `[skip ci]` tags added to commits.

**Note:**
This feature is not supported for fork PRs.

## Examples

### Commit Title

```bash
$ git log origin/master..HEAD

commit 63ce74221ff899955dd6258020d6cb9accede893
Author: Daniel Woelfel <daniel@circleci.com>
Date:   Wed Jan 23 16:48:25 2017 -0800

    fix misspelling [ci skip]
```

When pushed to a VCS,
this commit will not be built on CircleCI
because of the `[ci skip]` in the commit title.

### Commit Description

```bash
$ git log origin/master..HEAD

commit 99b4ce4d59e79cb379987b39c65f7113631f0635
Merge: 16ba8ca adc6571
Author: Daniel Woelfel <daniel@circleci.com>
Date:   Tue Apr 25 15:56:42 2016 -0800

    A large feature with squashed commits

    Fix bug in feature
    Refactor feature code
    First attempt at feature [ci skip]
```

When pushed to a VCS,
this commit will not be built on CircleCI
because of the `[ci skip]` in the commit description.

**Note:**
If you push multiple commits at once,
a single `[ci skip]` or `[skip ci]` will skip the build **for all commits**.
