---
layout: classic-docs
title: "Protecting against supply chain attacks"
description: "Protecting against supply chain attacks on CircleCI"
---

## Overview
{: #overview}

Modern software applications rely heavily on dependencies to provide core functionality. The software ecosystem relies heavily on CI/CD to publish source code and binaries to public repositories. Together, this gives the opportunity for malicious actors to circumvent standard security measures and attack supply chains directly, allowing them to infect many applications and websites simultaneously.

As a continuous delivery provider, CircleCI understands these risks. CircleCI goes to great lengths to protect the credentials you use to publish and deploy software. However, no CI/CD service provider can guarantee safety, and it is possible to insecurely use these platforms.

## Minimize risk as a publisher
{: #minimize-risk-as-a-publisher }

As both a downstream user or publisher of software, you can protect yourself and your users using a few tricks.

### Using contexts
{: #using-contexts }

When using CircleCI, you can split credentials and secrets into multiple [contexts]({{site.baseurl}}/contexts) that can be used individually, or combined in a build step. Avoid putting everything into the org-global context. This means that if there is a security error in one build step, only a small subset of your credentials are exposed. This effort is known as the [principle of least](https://en.wikipedia.org/wiki/Principle_of_least_privilege). As an example, the step where you download dependencies and execute their build
scripts should not have access to your deploy keys because nothing in that step needs them.

Additionally, you can put sensitive contexts used for deploying and signing software into [restricted contexts]({{site.baseurl}}/contexts/#restricting-a-context) that are governed by your VCS groups. These secrets are only then accessible to authorized users. In combination with restricted contexts, you can reduce the likelihood of exposing credentials to malicious code by also using VCS branch protection, which requires a review before merging.

### Minimize risk as a developer
{: #minimize-risk-as-a-developer }

As a developer, a significant portion of your dependencies and tool chain are likely automatically published through continuous delivery. You can mitigate risks by pinning dependencies.

## Pinning Dependencies
{: #pinning-dependencies }

Most tools such as Yarn, cargo, and pip support the ability to create and use lock files to pin dependency versions and hashes. Some tools can enforce installation using only packages with versions and hashes specified. This is a baseline defense against bad actors publishing malicious packages with a higher SemVer number, adding malicious distribution types to an existing package version, or overwriting the contents at a given version number.

Consider the following simple method for installing a Python project using pip and pip-tools.

```shell
$ echo ‘flask’ > requirements.in
$ pip-compile --generate-hashes requirements.in --output-file requirements.txt
$ pip install --no-deps -r requirements.txt
```

This adds a single top-level dependency called `flask` to an input file, then generates secure hashes for all transitive dependencies and locks their versions. Installation using the `--no-deps` flag ensures that only the dependencies listed in the requirements file are installed and nothing else.

Likewise, a similar example will ensure only exactly the known dependencies are installed when using `yarn`.

```shell
$ yarn add express

# during your build
$ yarn install  --frozen-lockfile
```

Many tools for scanning dependency files exist, and many are first-party for a given language or tool chain. On CircleCI, there are orbs available that offer
[dependency scanning](https://circleci.com/developer/orbs?query=&category=Security), and cron jobs for periodic scanning to ensure your applications are scanning more often than your pushes.

Using dependency pinning with hashes like this prevents malicious binaries or packages from silently replacing known good versions. It protects against a narrow range of attacks where the upstream repository is compromised. This can protect your workstation and CI builds.

## See also
{: #see-also }


- [Security recommendations]({{site.baseurl}}/security-recommendations)