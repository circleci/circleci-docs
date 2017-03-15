---
layout: classic-docs
title: "Uploading Build Artifacts"
short-title: "Uploading Build Artifacts"
categories: [configuring-jobs]
order: 98
---

Sometimes you want to upload artifacts created during builds so that you can view them later. The following is an example of how to upload artifacts.

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

`store_artifacts` step will upload build artifacts. In this example, we upload two artifacts: `/tmp/artifact-1` and `/tmp//tmp/artifacts`. As you can see, you can upload a single file or a directory as artifacts. You can call multiple `store_artifacts` steps in a job. Once artifacts are successfully uploaded, you can view them in **Artifacts** tab of the build page from your browser.

Currently, `store_artifacts` step requires two fields: `path` and `destination`.

  - `path` is a path to a file or directory to be uploaded as artifacts.

  - `destination` is a name of the artifact. You will see names of artifacts when you view artifacts in your browser, instead of plain file names.

<div class="alert alert-warning" role="alert">
  <p><strong>Please Note:</strong> Currently 'destination' is a mandatory field but there are some good feedback from our Beta users to make this field optional. We'll be revisiting this topic in the near future.</p>
</div>
