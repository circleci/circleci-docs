---
layout: classic-docs
page-type: index
title: "CircleCI 1.0 Documentation"
permalink: /1.0/
sitemap: false
---

CircleCI is a modern continuous integration and continuous delivery (CI/CD) platform. The hosted solution is available at <https://circleci.com/>. The [CircleCI Enterprise](https://circleci.com/enterprise/) solution is installable inside your private cloud or data center. Both are free to try for two weeks. If you are new to CircleCI, check out the [Getting Started with CircleCI]({{ site.baseurl }}/1.0/getting-started/).

## Overview

CircleCI automates build, test, and deployment of software for mobile, enterprise, and web applications. 

![CircleCI Example Flow with GitHub]({{ site.baseurl }}/assets/img/docs/how_it_works.png)

For example, after a software repository on GitHub or Bitbucket is authorized and added as a project to the circleci.com SaaS application, every new commit triggers a build and notification of success or failure through webhooks. CircleCI also supports Slack, HipChat, Campfire, Flowdock, and IRC notifications. Code coverage results are available from the details page for any project for which a reporting library is added.

## Programming Language Support

CircleCI 1.0 supports the use of any language version that is installable on Ubuntu 14.04. Additional versions may be installed at runtime, see the [Ubuntu 14.04 Trusty doc]({{ site.baseurl }}/1.0/build-image-trusty/#programming-languages) for the defaults. For some language versions, CircleCI provides demo applications, as follows:  

- **Go 1.5.3**, see the [Golang Guide]({{ site.baseurl }}/1.0/language-go/)
- **Haskell 7.4 and later**, see the [Haskell Guide]({{ site.baseurl }}/1.0/language-haskell/)
- **Java JDK6 and later**, see the [Java Guide]({{ site.baseurl }}/1.0/language-java/)
- **Node.js all versions**, see the [Node Guide]({{ site.baseurl }}/1.0/language-nodejs/)
- **PHP 5 and later**, see the [PHP Guide]({{ site.baseurl }}/1.0/language-php/)
- **Python 2.x or 3.x**, see the [Python Guide]({{ site.baseurl }}/1.0/language-python/)
- **Ruby 1.8 and later**, see the [Ruby/Rails Guide]({{ site.baseurl }}/1.0/language-ruby-on-rails/) 
- **Scala 0.13.11 and later**, see the [Scala Guide]({{ site.baseurl }}/1.0/language-scala/)

CircleCI works with projects written in C, C#, C++, Clojure, Elixir, Erlang, Groovy, Haxe, Javascript, Perl, Rust, Scala and many more!

## Continuous Deployment 

CircleCI is able to automatically deploy code to various environments based on successful tests. The following continuous deployment mechanisms are integrated with CircleCI:

* AWS CodeDeploy
* AWS EC2 Container Service (ECS)
* AWS S3
* Google Container Engine (GKE)
* Heroku
* SSH

