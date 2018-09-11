---
layout: classic-docs
title: Build artifacts
categories: [reference]
description: Dealing with build artifacts
sitemap: false
---

If your build produces persistent artifacts such as screenshots, coverage reports, or
deployment tarballs, we can automatically save and link them for you.

Before each build, we create an empty directory and export its path in the
read-only `$CIRCLE_ARTIFACTS`
[environment variable]( {{ site.baseurl }}/1.0/environment-variables/).

If you prefer, you can also
[configure directories and files whose contents will]( {{ site.baseurl }}/1.0/configuration/#artifacts)
be saved.

After the build finishes, everything in these directories is saved and linked to the build.

![](  {{ site.baseurl }}/assets/img/docs/artifacts.png)

You'll find links to the artifacts at the top of the build page. You can also consume them via our [API]( {{ site.baseurl }}/api/v1-reference/#build-artifacts).

You can also access your artifacts in your browser with the following URL:

```
https://circleci.com/api/v1.1/project/:vcs-type/:org/:repo/:build_num/artifacts/:container-index/path/to/artifact
```

**Note:** This URL is only accessible if you are logged into CircleCI with an account that has permissions to view / edit the project.

`:vcs-type` is either `github` or `bitbucket`. You can use `latest` in place of `:build_num` together with query parameters `branch` and `filter` to access the artifact from the latest build on a branch. `filter` can have a value of `completed`, `successful`, or `failed` and defaults to `completed`.

For example:

```
https://circleci.com/api/v1.1/project/github/circleci/mongofinil/63/artifacts/0/$CIRCLE_ARTIFACTS/hello.txt
```

Artifacts are stored on Amazon S3. There is a 3GB file size limit per file as they are uploaded by `curl`.

Artifacts are designed to be useful around the time of the build. We don't recommend relying on them as a software distribution mechanism with long term future guarantees.
