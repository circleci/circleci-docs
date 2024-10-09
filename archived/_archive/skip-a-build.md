---
layout: classic-docs
title: CircleCI 1.0 Skipping a build
categories: [configuration-tasks]
description: How to skip a build
order: 65
sitemap: false
---

CircleCI supports the `[ci skip]` or `[skip ci]` standard for ignoring builds.

When code changes are pushed to your VCS provider (GitHub or Bitbucket), if the last commit has `[ci skip]` or `[skip ci]` anywhere in the commit message title or description, then none of the commits in that push will be built automatically by CircleCI.

**Note:** the 'title' of a Git commit is the first line. The 'description' (sometimes called 'comment' or 'body') is separated from the 'title' by a blank line and can contain several lines of text. Be aware that previous commit titles may be added to the description automatically (e.g. during a rebase) and if they contain `[ci skip]` then the build will be skipped even though you didn't specify it explicitly in the 'title'.

Currently neither `[ci skip]` nor `[skip ci]` supports fork PRs.

If you decide you want to build a skipped commit, you can click the 'Rebuild' button on the build details page in CircleCI to override the `[ci skip]` or `[skip ci]` tag.

## Examples

### 1. `[ci skip]` in commit title

```
$ git log origin/master..HEAD

commit 63ce74221ff899955dd6258020d6cb9accede893
Author: Daniel Woelfel <daniel@circleci.com>
Date:   Wed Jan 23 16:48:25 2017 -0800

    fix misspelling [ci skip]
```

When pushed to your VCS provider, this commit will not be built on CircleCI.

### 2. `[ci skip]` in commit description

```
$ git log origin/master..HEAD

commit 99b4ce4d59e79cb379987b39c65f7113631f0635
Merge: 16ba8ca adc6571
Author: Daniel Woelfel <daniel@circleci.com>
Date:   Tue Apr 25 15:56:42 2016 -0800

    A quite big new feature

    Fix bug in feature
    Refactor feature code
    First attempt at feature [ci skip]
```

The last three lines are the commit description. This could be descriptive text, or, as in this example, from squashed commit titles after a rebase. Since one of these contains `[ci skip]` the build will be skipped.

### 3. Two commits skipped because `[ci skip]` present in last commit when pushed

```
$ git log origin/master..HEAD

commit 63ce74221ff899955dd6258020d6cb9accede893
Author: Daniel Woelfel <daniel@circleci.com>
Date:   Wed Jan 23 16:48:25 2013 -0800

    fix misspelling [ci skip]

commit 463147193b2fe561cfb12a9787434dd726390fcd
Author: Daniel Woelfel <daniel@circleci.com>
Date:   Wed Jan 23 16:30:24 2013 -0800

     add documentation
```

In this example both commits are skipped because they were pushed together.
