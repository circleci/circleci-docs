---
layout: enterprise
section: enterprise
title: "Why Choose CircleCI?"
category: [resources]
order: 0
description: "Reasons why you would want to choose CircleCI."
hide: true
sitemap: false
---

Get your green builds pushed safely and securely with the industry’s most powerful and loved software delivery platform. Here’s why we should be a part of your team:

## Build Isolation
* Each build runs in a clean LXC Container, so you can be confident you're getting a fresh run of your tests.
* SSH directly to the containers running your build for advanced debugging.
* Full scripting capabilities, including `sudo`.

## Developer-Driven Configuration
* Build configuration lives in code via a `circle.yml` file, allowing each developer to tweak builds on a per-branch basis when needed.
* No centralized plugins to manage, so no bottlenecks on DevOps needing to configure each change to your builds.
* Store your secrets securely in env vars that will automatically be made available to your builds.

## Fast Builds
* Parallelism allows splitting your tests across any number of containers, each of which runs as completely clean build. Tests can be automatically split based on timing distribution, or you can manually configure your test splits.
* A wide array of packages are pre-installed on the build containers and are ready to go, including most popular databases, languages, and frameworks.
* Dependency caching saves time on subsequent builds.

## Broad, Extensible Coverage
* First-class support for Docker builds
* First-class support for iOS builds
* Extensive API for custom integrations
* Automated inference gets most projects building with little or no configuration, but you are unrestricted in what languages, frameworks, and dependencies you can use in your builds.

## GitHub Friendly
* Direct integration with GitHub for authentication and authorization, so you don't need to reprovision accounts for your team.
* Automatic creation of hooks make it a breeze to get your repos set up to build when anyone on your team commits code.
* Quickly see the build status of your pull requests, and easily configure triggering builds when tagging your repo.

## Knowledgeable Support
* More than support, CircleCI is part of your team. All our support staff are developers, including active rotation from our product engineers. Our support staff is around the globe, so trusted help is available 24/7.
* Active [community forums](https://discuss.circleci.com/) provide access to other developers with similar environments.
* [Premium support](https://circleci.com/support/premium-support/) packages and our partner network are available when you need extra help.





## Choosing CircleCI Enterprise vs. CircleCI.com
---
The four most common reasons you might choose CircleCI Enterprise over our cloud product are:

1. **Regulatory and Policy Considerations.** Many organizations, particularly in the financial industry, face regulatory requirements that prevent them from allowing their code to leave their direct control. Other organizations have policies for a variety of reasons that prevent their teams from using cloud-based services that are managed by a third party. With CircleCI Enterprise you have complete control over access to your source code, test databases, and other resources.

2. **GitHub Enterprise Support.** Organizations that prefer to use GitHub Enterprise over GitHub.com can’t, as of today, use CircleCI.com (we do plan to support it soon!), so CircleCI Enterprise is a great solution for them.

3. **Customized Build Environment.** On CircleCI.com we strive to provide all builds the right environment, which we do by putting a vast array of software into our build containers. Sometimes, though, people have specific needs that we don’t have in our default environment so they need to pull them in as part of their build. In some cases, that can result in added minutes to download and install those dependencies. With CircleCI Enterprise you can customize exactly what’s in the containers that run your builds, tuning the environment to have specific packages and versions your teams needs as soon as each build starts.

4. **Tuning Build Resources.** On CircleCI.com each build container has 2CPUs and 4GB of RAM. For most teams that works well, and you can always take advantage of our parallelism to split your tests across many containers (Worth noting: _we can increase the RAM allocated to your builds on CircleCI.com to 8GB or even higher in special cases_). Some teams, though, have specialized needs that require very large amounts of memory or that can’t take advantage of parallelism and need a lot of CPU power in each container. With CircleCI Enterprise you control your build fleet and can tune the CPU and RAM that is allocated to your containers.
