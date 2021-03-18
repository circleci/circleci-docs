---
layout: classic-docs
title: CircleCI Runner in Server
short-title: CircleCI Runner in Server
categories: [platforms]
description: How to set up a Runner in Server
order: 31
version:
- Server v3.x
---

## Authentication

When creating namespaces, resource classes and tokens, the CLI needs to be configured to connect to the Server 
deployment either via `--host HOSTNAME` and `--token TOKEN` flags, or the CircleCI CLI's configuration file.

####  Resource class example
```plaintext
circleci runner resource-class create <resource-class> <description> --host HOSTNAME --token TOKEN
```

## Configuration file

When setting up a Runner, the configuration file should include `host` property.

```yaml
api:
    auth_token: AUTH_TOKEN
    host: HOSTNAME
runner:
  name: RUNNER_NAME
  command_prefix: ["sudo", "-niHu", "circleci", "--"]
  working_directory: /opt/circleci/workdir/%s
  cleanup_working_directory: true
```

## Version

Specific server version works with specific runner version. The table below presents the mapping.

Server Version  | Runner
----------------|---------------------------------
3.0 | TBD
{: class="table table-striped"}
