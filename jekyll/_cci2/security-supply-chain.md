---
layout: classic-docs
title: "Protecting Against Supply Chain Attacks"
description: "Protecting Against Supply Chain Attacks on CircleCI"
---

## Overview
{: #overview}

Modern software applications rely heavily on dependencies to provide core
functionality. The software ecosystem relies heavily on CI/CD to publish source
code and binaries to public repositories. Together, this gives the opportunity
for malicious actors to circumvent standard security measures and attack supply
chains directly, allowing them to infect many applications and websites
simultaneously.

Continuous delivery providers, like CircleCI, understand these risks. We know we
are the holder of many keys, and we go to great lengths to protect the
credentials you use to publish and deploy software. No CI/CD-as-a-Service
provider can guarantee safety, and it is possible to use these platforms in insecure ways.

## Minimizing risk as a publisher
{: #minimizing-risk-as-a-publisher }

As both a downstream user or publisher of software, you can protect yourself and
your users using a few tricks.

### Using contexts
{: #using-contexts }

When using CircleCI, you can split credentials and secrets into multiple
[contexts]({{site.baseurl}}/contexts) that can be used individually or
combined in a build step. Avoid putting everything into the org-global context.
This means that if there is a security error in one build step, only a small
subset of your credentials are exposed. This effort is known as the [principle
of least](https://en.wikipedia.org/wiki/Principle_of_least_privilege). As an
example, the step where you download dependencies and execute their build
scripts should not have access to your deploy keys simply because nothing in
that step needs them.

Additionally, you can put sensitive contexts used for deploying and signing
software into [restricted contexts]({{site.baseurl}}/contexts/#restricting-a-context)
that are governed by your GitHub groups. These secrets are only then accessible
to authorized users. Combining this with GitHub branch protection requiring
review before merging can help reduce the likelihood of exposing credentials to
malicious code.

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

```shell
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

```shell
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
