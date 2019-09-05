---
layout: classic-docs
title: "Storing Build Artifacts"
short-title: "Storing Build Artifacts"
description: "Example of uploading artifacts created during a build"
categories: [configuring-jobs]
order: 70
---

This document describes how to work with Artifacts in the following sections:

* TOC
{:toc}

## Artifacts Overview

Artifacts persist data after a job is completed
and may be used for longer-term storage of the outputs of your build process.

For example, when a Java build/test process finishes,
the output of the process is saved as a `.jar` file.
CircleCI can store this file as an artifact,
keeping it available long after the process has finished.

![artifacts data flow]( {{ site.baseurl }}/assets/img/docs/Diagram-v3-Artifact.png)

Another example of an artifact is a project that is packaged as an Android app where the `.apk` file is uploaded to Google Play. 

If a job produces persistent artifacts such as screenshots, coverage reports, core files, or
deployment tarballs, CircleCI can automatically save and link them for you.

![artifacts tab screeshot]( {{ site.baseurl }}/assets/img/docs/artifacts.png)

Find links to the artifacts at the top of the **Job page**.
Artifacts are stored on Amazon S3 and are protected with your CircleCI account for private projects.
There is a 3GB `curl` file size limit.
Artifacts are designed
to be useful around the time of the build.
It is best practice
not to rely on artifacts as a software distribution mechanism with long term future guarantees.

**Note:**
Uploaded artifact filenames are encoded
using the [Java URLEncoder](https://docs.oracle.com/javase/7/docs/api/java/net/URLEncoder.html).
Keep this in mind
if you are expecting
to find artifacts at a given path within the application.

## Uploading Artifacts

To upload artifacts created during builds, use the following example:

```yaml
version: 2
jobs:
  build:
    docker:
      - image: python:3.6.3-jessie

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

The `store_artifacts` step uploads two build artifacts: a file (`/tmp/artifact-1`) and a directory (`/tmp/artifacts`). After the artifacts successfully upload, view them in the **Artifacts** tab of the **Job page** in your browser. If you're uploading hundreds of artifacts, then consider [compressing and uploading as a single compressed file](https://support.circleci.com/hc/en-us/articles/360024275534?input_string=store_artifacts+step) to accelerate this step.  
There is no limit on the number of `store_artifacts` steps a job can run.  


Currently, `store_artifacts` has two keys: `path` and `destination`.

  - `path` is a path to the file or directory to be uploaded as artifacts.
  - `destination` **(Optional)** is a prefix added to the artifact paths in the artifacts API. The directory of the file specified in `path` is used as the default.

## Uploading Core Files

This section describes how to get [core dumps](http://man7.org/linux/man-pages/man5/core.5.html) and push them as artifacts for inspection and debugging. The following example creates a short C program that runs [`abort(3)`](http://man7.org/linux/man-pages/man3/abort.3.html) to crash the program.

1. Create a `Makefile` with the following lines:

     ```
     all:
       gcc -o dump main.c
     ```

2. Create a `main.c` file with the following lines.

     ```C
     #include <stdlib.h>
     
     int main(int argc, char **argv) {
         abort();
     }
     ```

3. Run `make` and `./dump` on the generated program to print `Aborted (core dumped)`!

Following is a full `config.yml` that compiles the example C abort program, and collects the core dumps as artifacts.

```yaml
version: 2
jobs:
  build:
    docker:
      - image: gcc:8.1.0
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

When CircleCI runs a job,
a link to the core dump file appears in the Artifacts tab of the **Job page**.

## Downloading All Artifacts for a Build on CircleCI

To download your artifacts with `curl`,
follow the steps below.

1. [Create a personal API token]({{ site.baseurl }}/2.0/managing-api-tokens/#creating-a-personal-api-token)
and copy it to a clipboard.

2. In a Terminal window,
`cd` to a directory
where you want
to store the artifacts.

3. Run the commands below.
Use the table beneath the commands
to substitute actual values
for all variables that start with `:`.

```bash
export CIRCLE_TOKEN=':your_token'

curl https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/$build_number/artifacts?circle-token=$CIRCLE_TOKEN \
   | grep -o 'https://[^"]*' \
   | sed -e "s/$/?circle-token=$CIRCLE_TOKEN/" \
   | wget -v -i -
```

Similarly, if you want to download the _latest_ artifacts of a build, replace the curl call with a URL that follows this scheme:

```bash
curl https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/latest/artifacts?circle-token=:token
```

You can read more about using CircleCI's API to interact with artifacts in our [API reference guide](https://circleci.com/docs/api/#artifacts).

Placeholder   | Meaning                                                                       |
--------------|-------------------------------------------------------------------------------|
`:your_token` | The personal API token you created above.
`:vcs-type`   | The version control system (VCS) you are using. Either `github` or `bitbucket`.
`:username`   | The VCS project account username or organization name for the target project. Located at the top left of the screen in the CircleCI application.
`:project`    | The name of the target VCS repository.
`:build_num`  | The number for the build for which you want to download artifacts.
{: class="table table-striped"}

### Description of Commands
{:.no_toc}

First, the CIRCLE_TOKEN environment variable is created. Then, the `curl`
command fetches all artifact details for a build and pipes them to `grep` to
extract the URLs. Using `sed` your circle token is appended to the file to
create a unique file name. Finally, `wget` is used to download the artifacts to
the current directory in your terminal.


## See Also
{:.no_toc}

[Caching Dependencies]({{ site.baseurl }}/2.0/caching/)
