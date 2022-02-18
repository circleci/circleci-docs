---
layout: classic-docs
title: packagecloud へのパッケージのパブリッシュ
categories:
  - how-to
description: CircleCI を使用して packagecloud にパッケージをパブリッシュする方法
version:
  - Cloud
  - Server v3.x
  - Server v2.x
---

[packagecloud](https://packagecloud.io) は、ホスティングされているパッケージ リポジトリ サービスです。 packagecloud を使用すると、事前構成なしで npm、Maven (Java)、Python、apt、yum、RubyGem の各リポジトリをホスティングすることができます。

* TOC
{:toc}

## Configure environment variables
{: #configure-environment-variables }

### `$PACKAGECLOUD_TOKEN` の設定
{: #set-the-dollarpackagecloudtoken }

Under project settings in CircleCI, create an environment variable with the name `PACKAGECLOUD_TOKEN`, containing the value of a packagecloud API token. This environment variable will be used to authenticate with the packagecloud API directly, or using the packagecloud CLI.

The packagecloud CLI will automatically read this environment variable from the system when interacting with repositories.

Alternatively, if you prefer to keep your sensitive environment variables checked into git, but encrypted, you can follow the process outlined at [circleci/encrypted-files](https://github.com/circleci/encrypted-files).

{:.no_toc}

### packagecloud:enterprise 用の `$PACKAGECLOUD_URL` の設定
{: #set-the-dollarpackagecloudurl-for-packagecloudenterprise }

_**Only set the `$PACKAGECLOUD_URL` if you're a packagecloud:enterprise customer**_

This setting is only for packagecloud:enterprise customers. Under project settings in CircleCI, set the `$PACKAGECLOUD_URL` environment variable to the URL of the packagecloud:enterprise installation.

## packagecloud CLI のインストール
{: #install-the-packagecloud-cli }

To use the packagecloud CLI from CircleCI, install it using RubyGems by adding the following `run` step to your `.circleci/config.yml` under the job that is configured to deploy the package:

```yml
- run:
   name: packagecloud CLI のインストール
   command: gem install package_cloud
```

The CLI will automatically use the `$PACKAGECLOUD_TOKEN` environment variable to authenticate against the packagecloud service.

### Using dependency caching
{: #using-dependency-caching }

If you want to cache this dependency between builds, you can add the `package_cloud` gem to a `Gemfile` and follow CircleCI's guide for [Caching Dependencies]({{ site.baseurl }}/2.0/caching/).

## Pushing packages with the packagecloud CLI
{: #pushing-packages-with-the-packagecloud-cli }

The build processes for package types will vary, but pushing them into a packagecloud repository is quite simple. To add packages to a repository from your CircleCI builds, add a step in your `deploy` configuration that uses the packagecloud CLI.

The following is a full example `.circleci/config.yml` that will checkout a git repository, run a `make` task (this command can be anything configured to build your package), then deploy the package to a packagecloud repo.

```yaml
version: 2
defaults: &defaults
  working_directory: ~/repo
  docker:
    - image: circleci/ruby:2.7
      auth:
        username: mydockerhub-user
        password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
jobs:
  build:
    <<: *defaults
    steps:
      - checkout
      - run:
          name: Build the package
          command: make
      - persist_to_workspace:
          root: ~/repo
          paths: .
  deploy:
    <<: *defaults
    steps:
      - attach_workspace:
          at: ~/repo
      - run:
          name: packagecloud CLI のインストール
          command: gem install package_cloud
      - run:
          name: deb パッケージのプッシュ
          command: package_cloud push example-user/example-repo/debian/jessie debs/packagecloud-test_1.1-2_amd64.deb
workflows:
  version: 2
  package-deploy:
    jobs:
      - build
      - deploy:
          requires:
            - build
```

## Deploy `npm` packages
{: #deploy-npm-packages }

CircleCI users can deploy packages directly to npm registries hosted on packagecloud.

### Configure the test job
{: #configure-the-test-job }

This job will retrieve the project code, install its dependencies and run any tests in the NodeJS project:

```yaml
jobs:
  test:
    <<: *defaults
    steps:
      - checkout

      - restore_cache:
          keys:
          - v1-dependencies-.
          # 正確な一致が見つからない場合は、最新のキャッシュの使用にフォールバックします
          - v1-dependencies-

      - run: npm install
      - run:
          name: テストの実行
          command: npm test

      - save_cache:
          paths:
            - node_modules
          key: v1-dependencies-

      - persist_to_workspace:
          root: ~/repo
          paths: .
```

### Configure the deploy job
{: #configure-the-deploy-job }

The next job configured is the deploy job. This job will authenticate and publish to the packagecloud npm registry:

```yaml
jobs:
...
  deploy:
    <<: *defaults
    steps:
      - attach_workspace:
          at: ~/repo
      - run:
          name: レジストリ URL の設定
          command: npm set registry https://packagecloud.io/example-user/example-repo/npm/
      - run:
          name: レジストリでの認証
          command: echo "//packagecloud.io/example-user/example-repo/npm/:_authToken=$PACKAGECLOUD_TOKEN" > ~/repo/.npmrc
      - run:
          name: パッケージのパブリッシュ
          command: npm publish
```

* *Set registry URL* : This command sets the registry to URL that will be used by the `npm` CLI.
* *Authenticate with the registry* : This command will set the `authToken` to be used by the `npm` CLI to the environment variable configured in the project settings.
* *Publish package* : Publish the package to the configured npm registry on packagecloud.

The packagecloud npm registry URL is in the following format:

```
https://packagecloud.io/:username/:repo_name/npm/
```

The full `.circleci/config.yml` should look something like this:

```yaml
version: 2
defaults: &defaults
  working_directory: ~/repo
  docker:
    - image: circleci/node:8.9.1
      auth:
        username: mydockerhub-user
        password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
jobs:
  test:
    <<: *defaults
    steps:
      - checkout

      - restore_cache:
          keys:
          - v1-dependencies-.
          # 正確な一致が見つからない場合は、最新のキャッシュの使用にフォールバックします
          - v1-dependencies-

      - run: npm install
      - run:
          name: テストの実行
          command: npm test

      - save_cache:
          paths:
            - node_modules
          key: v1-dependencies-

      - persist_to_workspace:
          root: ~/repo
          paths: .
  deploy:
    <<: *defaults
    steps:
      - attach_workspace:
          at: ~/repo
      - run:
          name: レジストリ URL の設定
          command: npm set registry https://packagecloud.io/example-user/example-repo/npm/
      - run:
          name: レジストリでの認証
          command: echo "//packagecloud.io/example-user/example-repo/npm/:_authToken=$PACKAGECLOUD_TOKEN" > ~/repo/.npmrc
      - run:
          name: パッケージのパブリッシュ
          command: npm publish
workflows:
  version: 2
  test-deploy:
    jobs:
      - test
      - deploy:
          requires:
            - test
```

The workflows section will tie together both the `test` and `deploy` jobs into sequential steps in the build process.

You can read more about publishing npm packages to packagecloud on the CircleCI blog post: [Publishing npm Packages Using CircleCI](https://circleci.com/blog/publishing-npm-packages-using-circleci-2-0/)

## packagecloud API の使用方法
{: #using-the-packagecloud-api }

Packagecloud also provides a robust API to manage package repositories. You can read more about the [packagecloud API](https://packagecloud.io/docs/api) and how to upload, delete, and promote packages across repositories.

{:.no_toc}

## 関連項目
{: #see-also }

[アーティファクトの保存とアクセス]({{ site.baseurl }}/2.0/artifacts/)
