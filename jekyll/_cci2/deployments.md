---
layout: classic-docs
title: "Deployments"
short-title: "Deployments"
categories: [configuring-jobs]
order: 7
---

The following example shows how to configure your job to deploy using a `deploy` step with some pseudo commands.

```YAML
version: 2
jobs:
  build:
    docker:
      - image: my-image
    working_directory: /tmp/my-project
    steps:
      - run: <do-some-stuff>
      - deploy:
          name: Maybe Deploy
          command: |
            if [ "${CIRCLE_BRANCH}" == "master" ]; then
              <your-deploy-commands>
            fi
```

The most important piece of this example is that we're checking whether the current branch is the `master` branch.

```
command: |
  if [ "${CIRCLE_BRANCH}" == "master" ]; then
    ...
  fi
```

Without this check, `<your-deploy-commands>` will be executed every time this job is triggered.

To learn more about the `deploy` step, please check out our [documentation]({{ site.baseurl }}/2.0/configuration-reference/#deploy).
