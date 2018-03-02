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

**Note:** This feature is not supported for fork PRs.
