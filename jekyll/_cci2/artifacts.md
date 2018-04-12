---
layout: classic-docs
title: "Storing and Accessing Build Artifacts"
short-title: "Storing and Accessing Build Artifacts"
description: "Example of uploading artifacts created during a build"
categories: [configuring-jobs]
order: 70
---

*[Basics]({{ site.baseurl }}/2.0/basics/) > Storing and Accessing Build Artifacts*

This document describes how to work with Artifacts in the following sections:

* TOC
{:toc}

## Artifacts Overview

Artifacts persist data after a {% comment %} TODO: Job {% endcomment %}Workflow is completed and may be used for longer-term storage of the outputs of your build process. For example, a Java project that produces a `.jar` file. When the Java build/test process passes, the output of the process (the `.jar` file) can be stored as an artifact. The `.jar` file is available to download from the CircleCI artifacts system long after the workflow that created it has finished.

![artifacts data flow]( {{ site.baseurl }}/assets/img/docs/Diagram-v3-Artifact.png)

Another example of an Artifact is a project that is packaged as an Android app where the `.apk` file is uploaded to Google Play. 

If your {% comment %} TODO: Job {% endcomment %}build produces persistent artifacts such as screenshots, coverage reports, core files, or
deployment tarballs, CircleCI can automatically save and link them for you.

![artifacts tab screeshot]( {{ site.baseurl }}/assets/img/docs/artifacts.png)

Find links to the artifacts at the top of the {% comment %} TODO: Job {% endcomment %}build page. Artifacts are stored on Amazon S3. There is a 3GB `curl` file size limit.

Artifacts are designed to be useful around the time of the build. It is best practice not to rely on artifacts as a software distribution mechanism with long term future guarantees.

## Uploading Artifacts

To upload artifacts created during builds, use the following example:

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

The `store_artifacts` step uploads two build artifacts: a file (`/tmp/artifact-1`) and a directory (`/tmp/artifacts`). After  the artifacts successfully upload, view them in the **Artifacts** tab of the {% comment %} TODO: Jobs {% endcomment %}build page in your browser. There is no limit on the number of `store_artifacts` steps a job can run.

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

```YAML
version: 2.0
jobs:
  build:
    docker:
      - image: gcc:latest
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

When CircleCI runs a build, a link to the core dump file appears under the Artifacts tab of the {% comment %} TODO: Job {% endcomment %}build summary.

## Downloading All Artifacts for a {% comment %} TODO: Job {% endcomment %}Build on CircleCI  

Use the following procedure to download your artifacts with `curl`.

1. Create an API token in the application by going to [User Settings > Personal API Tokens](https://circleci.com/account/api).

2. Click Create New Token, add a name in the dialog box and click Add API Token. Name tokens to help you remember where they are used.

3. Copy the token string that appears in the table.

4. CD to a directory where you would like the artifacts files to be downloaded and run the following command, copying in the token from Step 3:

```
export CIRCLE_TOKEN=':your_token'

curl https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/:build_num/artifacts?circle-token=$CIRCLE_TOKEN | grep -o 'https://[^"]*' > artifacts.txt

<artifacts.txt xargs -P4 -I % wget %?circle-token=$CIRCLE_TOKEN
```

Note 1: Replace all the variables above that start with a *:* (colon) with real values for your project (don't include the colon).

Note 2: `:vcs-type` will be `github` or `bitbucket`.

Note 3: In the example, the `xargs` command runs four processes to download files in parallel. Adjust this value to your needs.

Explanation: The line beginning with `curl` fetches all the artifacts details for a {% comment %} TODO: Job {% endcomment %}build and pipes it through the `grep` command to extract just the URLs. The results are saved to the `artifacts.txt` file. Then, `xargs` reads the file and downloads each artifact to the current directory.  
