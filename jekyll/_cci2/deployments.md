---
layout: classic-docs
title: "Deployments"
short-title: "Deployments"
description: "How to set up conditional deployment"
categories: [deploying]
order: 5
---

The following example shows how to add the `deploy` step to your `config.yml` to set up conditional deployment for your application.

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

The most important piece of this example is that we're checking whether the current branch is the `master` branch before running any deploy commands. Without this check, `<your-deploy-commands>` would be executed every time this job is triggered.

To learn more about the `deploy` step, please check out our [documentation]({{ site.baseurl }}/2.0/configuration-reference/#deploy).
