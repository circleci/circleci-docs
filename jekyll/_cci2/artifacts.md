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

![]( {{ site.baseurl }}/assets/img/docs/artifacts.png)

Find links to the artifacts at the top of the build page. Artifacts are stored on Amazon S3. There is a 3GB file size limit per file as they are uploaded by `curl`.

Artifacts are designed to be useful around the time of the build. We don't recommend relying on them as a software distribution mechanism with long term future guarantees.

To upload artifacts created during builds so you can view them later, use the following example:

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

The `store_artifacts` step uploads two build artifacts: a file (`/tmp/artifact-1`) and a directory (`/tmp/artifacts`). After  the artifacts successfully upload, view them in the **Artifacts** tab of the build page in your browser. There is no limit on the number of `store_artifacts` steps a job can run.

Currently, `store_artifacts` has two keys: `path` and `destination`.

  - `path` is a path to the file or directory to be uploaded as artifacts.
  - `destination` **(Optional)** is a prefix added to the artifact paths in the artifacts API. The directory of the file specified in `path` is used as the deafult.

