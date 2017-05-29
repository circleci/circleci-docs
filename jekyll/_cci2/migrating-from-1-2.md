---
layout: classic-docs
title: "Migrating from 1.0 to 2.0"
short-title: "Migrating from 1.0 to 2.0"
description: "Why and how to migrate from CircleCI 1.0 to 2.0"
categories: [migration]
order: 15
---

CircleCI 2.0 introduces new keys in `.circleci/config.yml`. This article will help you search and replace your 1.0 keys with 2.0 keys.

## Steps to Configure Required 2.0 Keys

1. Copy your existing `circle.yml` file into a new directory called `.circleci` at the root of your project repository.

2. Rename `.circleci/circle.yml` to `.circleci/config.yml`.

3. Add `version: 2` to the top of the `.circleci/config.yml` file.

4. Add the following two lines to your `config.yml` file, after the verison line. If your configuration includes `machine:`, replace `machine:` with the following two lines, nesting all of the following sections under `build`.
     ```
     jobs:
       build:
     ```
5. Add the language and version to your configuration using either the `docker:` and `- image:` keys in the example or by setting `machine: true`. If your configuration includes language and version as shown for `ruby:` below, replace it as shown.
     ```
       ruby:
         version: 2.3
     ```
     Replace with the following two lines:
     ```
         docker:
           - image: circleci/ruby:2.3
     ```
6. Nest `checkout:` under `steps:` by search and replacing
     ```
     checkout:
       post:
     ```
     With the following:
     ```
         steps:
           - checkout
           - run:
     ```
7. Validate your YAML at <http://codebeautify.org/yaml-validator> to check the changes. 

## Search and Replace Deprecated 2.0 Keys

- If your configuration sets a timezone, search and replace `timezone: America/Los_Angeles` with the following two lines:

```
    environment:
      TZ: "/usr/share/zoneinfo/America/Los_Angeles"
```

- If your configuration modifies $PATH, add the path to your `.bashrc` file and replace 

```
    environment:
    PATH: "/path/to/foo/bin:$PATH"
```

With the following to load it into your shell:

```
    environment:
       BASH_ENV: ~/.bashrc
```

- Search and replace the `hosts:` key, for example:

```  
hosts:
    circlehost: 127.0.0.1
```

With an appropriate `run` Step, for example:

```
    steps:
      - run: echo 127.0.0.1 circlehost | tee -a /etc/hosts
```


- Search and replace the `dependencies:`, `database`, or `test` and `override:` lines, for example:

```
dependencies:
  override:
    - <installed-dependency>
```

Is replaced with:

```
      - run:
          name: <name>
          command: <installed-dependency>
```

- Search and replace the `cache_directories:` key:

```
  cache_directories:
    - "vendor/bundle"
```

With the following, nested under `steps:` and customizing for your application as appropriate:

```
     - save_cache:
        key: dependency-cache
        paths:
          - vendor/bundle
```

- Add a `restore_cache:` key nested under `steps:`.

- Search and replace `deployment:` with the following, nested under `steps`:

```
     - deploy:
```

**Note:** Currently, 2.0 Beta does not include continuous deployment support. To write your own manual `deploy` steps, refer to the [Configuration Reference]({{ site.baseurl }}/2.0/configuration-reference/#deploy).

- Validate your YAML again at <http://codebeautify.org/yaml-validator> to check the changes. Fix up any issues and commit the updated `.circleci/config.yml` file. CircleCI automatically starts a test run on CircleCI 2.0 with a 2.0 icon on the builds page for that run.
