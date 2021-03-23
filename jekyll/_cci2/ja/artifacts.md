---
layout: classic-docs
title: "ビルド アーティファクトの保存"
short-title: "ビルド アーティファクトの保存"
description: "ビルド中に作成されるアーティファクトのアップロード例"
order: 70
version:
  - Cloud
  - Server v2.x
---

以下のセクションに沿って、アーティファクトの操作方法を説明します。

* TOC
{:toc}

## Artifacts overview

Artifacts persist data after a job is completed and may be used for storage of the outputs of your build process.

たとえば、Java のビルドおよびテストのプロセスが 1 つ終了すると、プロセスの出力が `.jar` ファイルとして保存されます。 CircleCI can store this file as an artifact, keeping it available after the process has finished.

![アーティファクトのデータ フロー]( {{ site.baseurl }}/assets/img/docs/Diagram-v3-Artifact.png)

Android アプリとしてパッケージ化されるプロジェクトの場合は、`.apk` ファイルが Google Play にアップロードされます。これもアーティファクトの一種です。

ジョブによってスクリーンショット、カバレッジ レポート、コア ファイル、デプロイ ターボールなどの永続的アーティファクトが生成される場合、CircleCI はそれらを自動的に保存およびリンクします。

![artifacts tab screenshot]( {{ site.baseurl }}/assets/img/docs/artifacts.png)

Find links to the artifacts under the "Artifacts" tab on the **Job page**. アーティファクトは Amazon S3 に保存され、プライベート プロジェクト用の CircleCI アカウントを使用して保護されます。 `curl` ファイルのサイズは 3 GB に制限されています。

**Artifacts will be accessible for thirty days after creation**. If you are relying on them as a source of documentation or persistent content, we recommend deploying the output to a dedicated output target such as S3, or GitHub Pages or Netlify for static websites.

**Note:** Uploaded artifact filenames are encoded using the [Java URLEncoder](https://docs.oracle.com/javase/7/docs/api/java/net/URLEncoder.html). Keep this in mind if you are expecting to find artifacts at a given path within the application.

## Uploading artifacts

To upload artifacts created during builds, use the following example:

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

The `store_artifacts` step uploads two build artifacts: a file (`/tmp/artifact-1`) and a directory (`/tmp/artifacts`). After the artifacts successfully upload, view them in the **Artifacts** tab of the **Job page** in your browser. If you're uploading hundreds of artifacts, then consider [compressing and uploading as a single compressed file](https://support.circleci.com/hc/en-us/articles/360024275534?input_string=store_artifacts+step) to accelerate this step.  
There is no limit on the number of `store_artifacts` steps a job can run.


Currently, `store_artifacts` has two keys: `path` and `destination`.

  - `path` は、アーティファクトとしてアップロードされるファイルまたはディレクトリのパスです。
  - `destination` **(Optional)** is a prefix added to the artifact paths in the artifacts API. `path` で指定されたファイルのディレクトリがデフォルトとして使用されます。

## Uploading core files

This section describes how to get [core dumps](http://man7.org/linux/man-pages/man5/core.5.html) and push them as artifacts for inspection and debugging. The following example creates a short C program that runs [`abort(3)`](http://man7.org/linux/man-pages/man3/abort.3.html) to crash the program.

1. 以下の行を含む `Makefile` を作成します。

     ```
     all:
       gcc -o dump main.c
     ```

2. 以下の行を含む `main.c` ファイルを作成します。

     ```C
     # <stdlib.h> を含めます

     int main(int argc, char **argv) {
         abort();
     }
     ```

3. 生成されたプログラムで `make` と `./dump` を実行し、`Aborted (core dumped)`! を印刷します。

Following is a full `config.yml` that compiles the example C abort program, and collects the core dumps as artifacts.

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

When CircleCI runs a job, a link to the core dump file appears in the Artifacts tab of the **Job page**.

## Downloading all artifacts for a build on CircleCI

To download your artifacts with `curl`, follow the steps below.

1. [パーソナル API トークンを作成]({{ site.baseurl }}/2.0/managing-api-tokens/#パーソナル-api-トークンの作成)し、クリップボードにコピーします。

2. ターミナル ウィンドウで、アーティファクトを保存するディレクトリに `cd` します。

3. 以下のコマンドを実行します。 `:` で始まる変数は、コマンドの下に掲載した表を参照して、実際の値に置き換えてください。

```bash
export CIRCLE_TOKEN=':your_token'

curl -H "Circle-Token: $CIRCLE_TOKEN" https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/:build_num/artifacts \
   | grep -o 'https://[^"]*' \
   | wget --verbose --header "Circle-Token: $CIRCLE_TOKEN" --input-file -
```

Similarly, if you want to download the _latest_ artifacts of a build, replace the curl call with a URL that follows this scheme:

```bash
curl -H "Circle-Token: <circle-token>" https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/latest/artifacts
```

You can read more about using CircleCI's API to interact with artifacts in our [API reference guide](https://circleci.com/docs/api/v1/#artifacts).

| プレースホルダー      | 意味                                                                           |
| ------------- | ---------------------------------------------------------------------------- |
| `:your_token` | 上記で作成した個人用の API トークン。                                                        |
| `:vcs-type`   | 使用しているバージョン管理システム (VCS)。 `github` または `bitbucket` のいずれかとなります。                |
| `:username`   | ターゲット プロジェクトの VCS プロジェクト アカウントのユーザー名または組織名。 CircleCI アプリケーションの画面左上に表示されています。 |
| `:project`    | ターゲット VCS リポジトリの名前。                                                          |
| `:build_num`  | アーティファクトをダウンロードする対象のビルドの番号。                                                  |
{: class="table table-striped"}

### Description of commands
{:.no_toc}

First, the CIRCLE_TOKEN environment variable is created. Then, the `curl` command fetches all artifact details for a build and pipes them to `grep` to extract the URLs. Using `sed` your circle token is appended to the file to create a unique file name. Finally, `wget` is used to download the artifacts to the current directory in your terminal.


## See also
{:.no_toc}

[Caching Dependencies]({{ site.baseurl }}/2.0/caching/)
