---
layout: classic-docs
title: Continuous Integration and Continuous Deployment with Node.js
short-title: Node.js
categories: [languages]
last_updated: February 13, 2015
---

Circle has great support for Node.js applications.
We inspect your code before each build to infer your settings, dependencies, and test steps.

If your project has any special requirements, you can augment or override our
inferred commands from a [circle.yml]({{ site.baseurl }}/configuration)
file checked into your repo's root directory. You can also add [deployment]({{ site.baseurl }}/configuration#deployment)
commands that will run after a green build.

### Version

Circle has [several Node versions]({{ site.baseurl }}/environment#nodejs)
pre-installed.
We use `{{ versions.default_node }}`
as our default version. If you'd like a specific version, then you can specify it in your circle.yml:

```
machine:
  node:
    version: 0.10.22
```

### Dependencies

If Circle finds a `package.json`, we automatically run `npm install` to fetch
all of your project's dependencies.
If needed, you can add custom dependencies commands from your circle.yml.
For example, you can override our default command to pass a special flag to `npm`:

```
dependencies:
  override:
    - npm install --dev
```

### npm authentication

If you need to authenticate with `npm` before downloading the
dependencies, you could store the `npm` credentials in the
[secure environment
variables](https://circleci.com/docs/environment-variables#setting-environment-variables-for-all-commands-without-adding-them-to-git)
and then use the following script to perform the authentication:

```
#!/bin/bash
set -o nounset
set -o errexit

npm login <<!
$NPM_USERNAME
$NPM_PASSWORD
$NPM_EMAIL
!
```

### Databases

We have pre-installed more than a dozen [databases and queues]({{ site.baseurl }}/environment#databases),
including PostgreSQL and MySQL. If needed, you can
[manually set up your test database]({{ site.baseurl }}/manually#dependencies) from your circle.yml.

### Testing

Circle will run `npm test` when you specify a test script in `package.json`.
We also run your Mocha tests as well as run any `test` targets in Cakefiles or Makefiles.

You can [add additional test commands]({{ site.baseurl }}/configuration#test)
from your circle.yml. For example, you could run a custom `test.sh` script:

```
test:
  post:
    - ./test.sh
```

### Deployment

Circle offers first-class support for [deployment]({{ site.baseurl }}/configuration#deployment).
When a build is green, Circle will deploy your project as directed
in your `circle.yml` file.
We can deploy to Nodejitsu and other PaaSes as well as to
physical servers under your control.

If you have any trouble, please [contact us](mailto:sayhi@circleci.com)
and we will be happy to help.
