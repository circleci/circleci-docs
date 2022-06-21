---
layout: classic-docs
title: "Supported Languages Guide"
short-title: "Supported Languages"
description: "A list of sample CircleCI applications for several popular languages"
redirect_from: /2.0/tutorials/
categories: [language-guides]
order: 0
version:
- Cloud
- Server v3.x
- Server v2.x
---

Code that builds on Linux or iOS will generally build on CircleCI. We’ve created several demo applications in various languages, so you can learn by example from an app written in the same language as your application. Each language listed below has an associated guide and public repository on GitHub. Fork them and follow along!

{% include snippets/language-guides.md %}

## Supported languages
{: #supported-languages }
- Clojure (v1.2.0 and later)
- Elixir (v1.2 and later)
- Go (v1.7 and later)
- Java (Java 8 and later)
- JavaScript (Node.js 4 and later)
- PHP (PHP 5 and later)
- Python (Python 2 and later)
- React Native
- Ruby on Rails (Ruby 2 and later)
- Scala and sbt

Build projects in C, C#, C++, Clojure, Elixir, Erlang, Go, Groovy, Haskell, Haxe, Java, JavaScript, Node.js, Perl, PHP, Python, Ruby, Rust, Scala and many more.

## Platform tutorials
{: #platform-tutorials }

Use the tutorial associated with your platform to learn about the customization that is possible in a [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/).

Platform Guide | Description
----|----------
[Linux Project Tutorial]({{ site.baseurl }}/2.0/project-walkthrough/) | Complete walkthrough of setting up a Python project with Flask to build with CircleCI.
[iOS Project Tutorial]({{ site.baseurl }}/2.0/ios-tutorial/) | Full example of setting up an iOS project in CircleCI.
[Android Project Tutorial]({{ site.baseurl }}/2.0/language-android/) | Full example of setting up an Android project in CircleCI.
[Windows Project Tutorial]({{ site.baseurl }}/2.0/hello-world-windows/) | Full example of setting up a .NET project in CircleCI.
{: class="table table-striped"}

## See also
{: #see-also }

Refer to the [Getting Started Introduction]({{ site.baseurl }}/2.0/getting-started/) for the steps to run your first build.
