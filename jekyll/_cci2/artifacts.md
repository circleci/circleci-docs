---
layout: classic-docs
title: "Uploading Build Artifacts"
short-title: "Uploading Build Artifacts"
description: "Example of uploading artifacts created during a build"
categories: [configuring-jobs]
order: 70
---
If your build produces persistent artifacts such as screenshots, coverage reports, or
deployment tarballs, CircleCI can automatically save and link them for you.

Before each build, CircleCI creates an empty directory and exports its path in the
read-only `$CIRCLE_ARTIFACTS` environment variable.

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

Sometimes, you'll want to upload artifacts created during builds so you can view them later. The following is an example of how to do that:

```YAML
version: 2
jobs:
  build:
    docker:
      - image: python:3.6.0

    working_directory: /tmp
    steps:
      - run:
          name: Creating Dummy Artifacts
          command: |
            echo "my artifact file" > /tmp/artifact-1;
            mkdir /tmp/artifacts;
            echo "my artifact files in a dir" > /tmp/artifacts/artifact-2;

      - store_artifacts:
          path: /tmp/artifact-1
          destination: artifact-file

      - store_artifacts:
          path: /tmp/artifacts
```

Using the `store_artifacts` step, we upload 2 build artifacts: a file (`/tmp/artifact-1`) and a directory (`/tmp/artifacts`). Once the artifacts are successfully uploaded, you can view them in the **Artifacts** tab of the build page in your browser. There is no limit on the  number of `store_artifacts` steps a job can have.

Currently, `store_artifacts` takes 2 fields: `path` and `destination`.

  - `path` is a path to the file or directory to be uploaded as artifacts.
  - `destination` **(Optional)** is a prefix added to the artifact paths in the artifacts API. (default: the directory of the file specified in `path`)

