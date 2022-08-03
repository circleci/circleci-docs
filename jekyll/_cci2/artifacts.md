---
layout: classic-docs
title: "Storing Build Artifacts"
short-title: "Storing Build Artifacts"
description: "Example of uploading artifacts created during a build"
order: 70
version:
- Cloud
- Server v3.x
- Server v2.x
---

This document describes how to work with Artifacts on CircleCI.

* TOC
{:toc}

## Artifacts overview
{: #artifacts-overview }

Artifacts persist data after a job is completed and may be used for storage of the outputs of your build process.

For example, when a Java build/test process finishes, the output of the process is saved as a `.jar` file. CircleCI can store this file as an artifact, keeping it available after the process has finished.

![artifacts data flow]({{site.baseurl}}/assets/img/docs/Diagram-v3-Artifact.png)

Another example of an artifact is a project that is packaged as an Android app where the `.apk` file is uploaded to Google Play.

If a job produces persistent artifacts such as screenshots, coverage reports, core files, or deployment tarballs, CircleCI can automatically save and link them for you.

Navigate to a pipeline's **Job** page on the [CircleCI web app](https://app.circleci.com/) to find the **Artifacts** tab. Artifacts are stored on Amazon S3 and are protected with your CircleCI account for private projects. There is a 3GB `curl` file size limit.

![artifacts tab screenshot]({{site.baseurl}}/assets/img/docs/artifacts.png)

By default, artifact storage duration is set to 30 days. This can be customized on the [CircleCI web app](https://app.circleci.com/) by navigating to **Plan > Usage Controls**. Currently, 30 days is also the maximum storage duration you can set.

For information on managing network and storage usage, see the [Persisting Data]({{site.baseurl}}/persist-data) page.

**Note:**
Uploaded artifact filenames are encoded using the [Java URLEncoder](https://docs.oracle.com/javase/7/docs/api/java/net/URLEncoder.html). Keep this in mind if you are expecting to find artifacts at a given path within the application.

## Uploading artifacts
{: #uploading-artifacts }

To upload artifacts created during builds, use the following example:

{:.tab.artifacts.Cloud}
```yaml
version: 2.1
jobs:
  build:
    docker:
      - image: python:3.6.3-jessie
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference

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

{:.tab.artifacts.Server_3}
```yaml
version: 2.1
jobs:
  build:
    docker:
      - image: python:3.6.3-jessie
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference

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

{:.tab.artifacts.Server_2}
```yaml
version: 2
jobs:
  build:
    docker:
      - image: python:3.6.3-jessie
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference

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

The `store_artifacts` step uploads two build artifacts: a file (`/tmp/artifact-1`) and a directory (`/tmp/artifacts`). After the artifacts successfully upload, view them in the **Artifacts** tab of the **Job** page in your browser. If you are uploading hundreds of artifacts, then consider [compressing and uploading as a single compressed file](https://support.circleci.com/hc/en-us/articles/360024275534?input_string=store_artifacts+step) to accelerate this step. There is no limit on the number of `store_artifacts` steps a job can run.

Currently, `store_artifacts` has two keys: `path` and `destination`.

  - `path` is a path to the file or directory to be uploaded as artifacts.
  - `destination` **(optional)** is a prefix added to the artifact paths in the artifacts API. The directory of the file specified in `path` is used as the default.

## Uploading core files
{: #uploading-core-files }

This section describes how to get [core dumps](http://man7.org/linux/man-pages/man5/core.5.html) and push them as artifacts for inspection and debugging. The following example creates a short C program that runs [`abort(3)`](http://man7.org/linux/man-pages/man3/abort.3.html) to crash the program.

1. Create a `Makefile` with the following lines:

     ```
     all:
       gcc -o dump main.c
     ```

2. Create a `main.c` file with the following lines.

     ```c
     #include <stdlib.h>

     int main(int argc, char **argv) {
         abort();
     }
     ```

3. Run `make` and `./dump` on the generated program to print `Aborted (core dumped)`!

Following is a full `config.yml` that compiles the example C abort program, and collects the core dumps as artifacts.

{:.tab.artifacts2.Cloud}
```yaml
version: 2.1
jobs:
  build:
    docker:
      - image: gcc:8.1.0
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    working_directory: ~/work
    steps:
      - checkout
      - run: make
      - run: |
          # tell the operating system to remove the file size limit on core dump files
          ulimit -c unlimited
          ./dump
      - run:
          command: |
            mkdir -p /tmp/core_dumps
            cp core.* /tmp/core_dumps
          when: on_fail
      - store_artifacts:
          path: /tmp/core_dumps
```

{:.tab.artifacts2.Server_3}
```yaml
version: 2.1
jobs:
  build:
    docker:
      - image: gcc:8.1.0
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    working_directory: ~/work
    steps:
      - checkout
      - run: make
      - run: |
          # tell the operating system to remove the file size limit on core dump files
          ulimit -c unlimited
          ./dump
      - run:
          command: |
            mkdir -p /tmp/core_dumps
            cp core.* /tmp/core_dumps
          when: on_fail
      - store_artifacts:
          path: /tmp/core_dumps
```

{:.tab.artifacts2.Server_2}
```yaml
version: 2
jobs:
  build:
    docker:
      - image: gcc:8.1.0
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    working_directory: ~/work
    steps:
      - checkout
      - run: make
      - run: |
          # tell the operating system to remove the file size limit on core dump files
          ulimit -c unlimited
          ./dump
      - run:
          command: |
            mkdir -p /tmp/core_dumps
            cp core.* /tmp/core_dumps
          when: on_fail
      - store_artifacts:
          path: /tmp/core_dumps
```

The `ulimit -c unlimited` removes the file size limit on core dump files. With the limit removed, every program crash creates a core dump file in the current working directory. The core dump file is named `core.%p.%E` where `%p` is the process id and `%E` is the pathname of the executable. See the specification in `/proc/sys/kernel/core_pattern` for details.

Finally, the core dump files are stored to the artifacts service with `store_artifacts` in the `/tmp/core_dumps` directory.

![Core Dump File in Artifacts Page]( {{ site.baseurl }}/assets/img/docs/core_dumps.png)

When CircleCI runs a job, a link to the core dump file appears in the **Artifacts** tab of the **Job** page.

## Downloading all artifacts for a build on CircleCI
{: #downloading-all-artifacts-for-a-build-on-circleci }

To download your artifacts with `curl`, follow the steps below.

1. [Create a personal API token]({{ site.baseurl }}/managing-api-tokens/#creating-a-personal-api-token) and copy it to a clipboard.

2. In a Terminal window, `cd` to a directory where you want to store the artifacts.

3. Run the commands below. Use the table beneath the commands to substitute actual values for all variables that start with `:`.

```shell
# Set an environment variable for your API token.
export CIRCLE_TOKEN=':your_token'

# `curl` gets all artifact details for a build
# then, the result is piped into `grep` to extract the URLs.
# finally, `wget` is used to download the the artifacts to the current directory in your terminal.

curl -H "Circle-Token: $CIRCLE_TOKEN" https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/:build_num/artifacts \
   | grep -o 'https://[^"]*' \
   | wget --verbose --header "Circle-Token: $CIRCLE_TOKEN" --input-file -
```

Similarly, if you want to download the _latest_ artifacts of a build, replace the curl call with a URL that follows this scheme:

```shell
curl -H "Circle-Token: <circle-token>" https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/latest/artifacts
```

You can read more about using CircleCI's API to interact with artifacts in our [API reference guide](https://circleci.com/docs/api/v1/#artifacts).

Placeholder   | Meaning                                                                       |
--------------|-------------------------------------------------------------------------------|
`:your_token` | The personal API token you created above.
`:vcs-type`   | The version control system (VCS) you are using. Either `github` or `bitbucket`.
`:username`   | The VCS project account username or organization name for the target project. Located at the top left of the screen in the CircleCI application.
`:project`    | The name of the target VCS repository.
`:build_num`  | The number of the job (aka. build) for which you want to download artifacts.
{: class="table table-striped"}

## Artifact storage customization
{: #artifacts-and-self-hosted-runner }

When using self-hosted runners, there is a network and storage usage limit included in your plan. There are certain actions related to artifacts that will accrue network and storage usage. Once your usage exceeds your limit, charges will apply.

Retaining an artifact for a long period of time will have storage cost implications, therefore, it is best to determine why you are retaining artifacts. One benefit of retaining an artifact might be so you can use it to troubleshoot why a build is failing. Once the build passes, the artifact is likely not needed. Setting a low storage retention for artifacts is recommended if this suits your needs.

You can customize storage usage retention periods for artifacts on the [CircleCI web app](https://app.circleci.com/) by navigating to **Plan > Usage Controls**. For information on managing network and storage usage, see the [Persisting Data]({{site.baseurl}}/persist-data/#managing-network-and-storage-use) page.

## Artifacts optimization
{: #artifacts-optimization }

#### Check which artifacts are being uploaded
{: #check-which-artifacts-are-being-uploaded }


Often we see that the `store_artifacts` step is being used on a large directory when only a few files are really needed, so a simple action you can take is to check which artifacts are being uploaded and why.

If you are using parallelism in your jobs, it could be that each parallel task is uploading an identical artifact. You can use the `CIRCLE_NODE_INDEX` environment variable in a run step to change the behavior of scripts depending on the parallel task run.

#### Uploading large artifacts
{: #uploading-large-artifacts }


Artifacts that are text can be compressed at very little cost. If you must upload a large artifact you can upload them to your own bucket at _no_ cost.

If you are uploading images/videos of UI tests, filter out and upload only failing tests. Many organizations upload all of the images from their UI tests, many of which will go unused.

If your pipelines build a binary or uberJAR, consider if these are necessary for every commit. You may wish to only upload artifacts on failure or success, or perhaps only on a single branch using a filter.

#### Only upload test results on failure
{: #only-upload-test-results-on-failure }

[The `when` attribute](/docs/configuration-reference#the-when-attribute) lets you filter what happens within a step in your configuration. The `when` attribute can be set to `on_success`, `on_fail` or `always`. To only upload artifacts for tests that have failed, add the `when: on_fail` line to your job as follows:

```yaml
steps:
  - run:
      name: Testing application
      command: make test
      shell: /bin/bash
      working_directory: ~/my-app
      no_output_timeout: 30m
      environment:
        FOO: bar

  - run: echo 127.0.0.1 devhost | sudo tee -a /etc/hosts

  - run: |
      sudo -u root createuser -h localhost --superuser ubuntu &&
      sudo createdb -h localhost test_db

  - run:
      name: Upload Failed Tests
      command: curl --data fail_tests.log http://example.com/error_logs
      when: on_fail
```

## Next steps
{: #next-steps }

- [Persisting Data]({{site.baseurl}}/persist-data)
- [Caching Dependencies]({{site.baseurl}}/caching)
- [Caching Strategies]({{site.baseurl}}/caching-strategy)
- [Workspaces]({{site.baseurl}}/workspaces)
- [Optimizations Overview]({{site.baseurl}}/optimizations)
