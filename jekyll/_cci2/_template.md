---
layout: classic-docs
title: "Title"
description: "Description"
---

A short description of the feature or topic.

## Overview

{: #overview}

## Use Cases

{: #Use Cases}

Short description of who this feature or article is for, to help readers scan and know whether the following content is relevant to them. Use bullet list to show various intended user groups:

- Use case one.
- Use case two.

## Section one

{: #section one }

As both a downstream user or publisher of software, you can protect yourself and
your users using a few tricks.

| Heading 1 | Heading 2 |
| --------- | --------- |
| row text  | row text  |
| row text  | row text  |

{: class="table table-striped"}

### Sub section

{: #sub-section }

Links to other docs pages should be in the following form:
[contexts]({{site.baseurl}}/2.0/contexts). And to insert an image place the image in `jekyll/assets/img/docs` and then use the following syntax: 
![Env Vars Interpolation Example]({{site.baseurl}}/assets/img/docs/env-vars-example-ui.png)

### Minimizing risk as a developer

{: #minimizing-risk-as-a-developer }

If you are a developer using software, a significant portion of your
dependencies and even tool chain are likely automatically published via
continuous delivery.

## Pinning Dependencies

{: #pinning-dependencies }

Most tools such as yarn, cargo, and pip support the ability to create and use
lock files to pin dependency versions and even hashes. Some tools can enforce
installation using only packages with versions and hashes specified. This is a
baseline defense against bad actors publishing malicious packages with a higher
SemVer number, adding malicious distribution types to an existing package
version, or overwriting the contents at a given version number.

Consider the following simple method for installing a Python project using pip and pip-tools.

```sh
$ echo ‘flask’ > requirements.in
$ pip-compile --generate-hashes requirements.in --output-file requirements.txt
$ pip install --no-deps -r requirements.txt
```

This adds a single top-level dependency called `flask` to an input file, then
generates secure hashes for all transitive dependencies and locks their
versions. Installation using the `--no-deps` flag ensures that only the
dependencies listed in the requirements file are installed and nothing else.

Likewise, a similar example will ensure only exactly the known dependencies are
installed when using `yarn`.

$ yarn add express

```sh
$ yarn add express

# during your build
$ yarn install  --frozen-lockfile
```

Many tools for scanning dependency files exist, and many are first party for a
given language or tool chain. On CircleCI, there are orbs available that offer
[dependency scanning](https://circleci.com/developer/orbs?query=&category=Security),
and cron jobs for periodic scanning to ensure your
applications are scanning more often than your pushes.

Using dependency pinning with hashes like this prevents malicious binaries or
packages from silently replacing known good versions. It protects against a
narrow range of attacks where the upstream repository is compromised. This can
protect your workstation and CI builds.

## Conclusion

{: #conclusion }

CI/CD build systems can be trusted with deploy keys and other secrets, but using
them safely still falls on the project maintainers. On CircleCI, it is easy to
enforce isolation by splitting secrets into multiple contexts, using multiple
build steps, and passing artifacts between steps by using workspace persistence.
Security is a team sport, and being careful with your builds helps protect
downstream develops and end users.
