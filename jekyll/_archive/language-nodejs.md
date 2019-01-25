---
layout: classic-docs
title: "CircleCI 1.0 Continuous Integration and Continuous Deployment with Node.js"
short-title: "Node.js"
categories: [languages]
description: "Continuous Integration and Continuous Deployment with Node.js"
sitemap: false
---

CircleCI has great support for Node.js applications.
We inspect your code before each build to infer your settings, dependencies, and test steps.

If your project has any special requirements, you can augment or override our
inferred commands from a [circle.yml]( {{ site.baseurl }}/1.0/configuration/)
file checked into your repo's root directory. You can also add [deployment]( {{ site.baseurl }}/1.0/configuration/#deployment)
commands that will run after a green build.

### Version

We have many versions of NodeJS pre-installed on [Ubuntu 12.04]( {{ site.baseurl }}/1.0/build-image-precise/#nodejs) and [Ubuntu 14.04]( {{ site.baseurl }}/1.0/build-image-trusty/#nodejs) build images.

If you don't want to use the default, you can specify your version in `circle.yml`:

```
machine:
  node:
    version: 0.10.22
```

### Dependencies

If CircleCI finds a `package.json`, we automatically run `npm install` to fetch
all of your project's dependencies.
If needed, you can add custom dependencies commands from your circle.yml.
For example, you can override our default command to pass a special flag to `npm`:

```
dependencies:
  override:
    - npm install --dev
```

### npm authentication

If you need to authenticate with `npm` before downloading dependencies, 
instructions are available [here]( {{ site.baseurl }}/1.0/npm-login/).

### Databases

We have pre-installed more than a dozen databases and queues,
including PostgreSQL and MySQL. If needed, you can
[manually set up your test database]( {{ site.baseurl }}/1.0/manually/#dependencies) from your circle.yml.

### Testing

CircleCI will run `npm test` when you specify a test script in `package.json`.
We also run your Mocha tests as well as run any `test` targets in Cakefiles or Makefiles.

You can [add additional test commands]( {{ site.baseurl }}/1.0/configuration/#test)
from your circle.yml. For example, you could run a custom `test.sh` script:

```
test:
  post:
    - ./test.sh
```

### Deployment
CircleCI offers first-class support for [deployment]( {{ site.baseurl }}/1.0/configuration/#deployment).
When a build is green,
CircleCI will deploy your project according to the configuration in your `circle.yml` file.
We can deploy to other Platforms as a Service (PaaS) providers as well as physical servers you manage.
