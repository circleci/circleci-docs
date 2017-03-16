---
layout: classic-docs
title: "Uploading Build Artifacts"
short-title: "Uploading Build Artifacts"
categories: [configuring-jobs]
order: 6
---

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
          destination: artifact-dir
```

Using the `store_artifacts` step, we upload 2 build artifacts: a file (`/tmp/artifact-1`) and a directory (`/tmp/artifacts`). Once the artifacts are successfully uploaded, you can view them in the **Artifacts** tab of the build page in your browser. There is no limit on the  number of `store_artifacts` steps a job can have.

Currently, `store_artifacts` requires 2 fields: `path` and `destination`.

  - `path` is a path to the file or directory to be uploaded as artifacts.
  - `destination` is the artifact name. You will see these names instead of plain file names when viewing artifacts in your browser. This field is currently mandatory, but we've received feedback from Beta users that this should be optional. We'll be revisiting this during the rest of the Beta.
