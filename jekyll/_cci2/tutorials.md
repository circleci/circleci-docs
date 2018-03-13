---
layout: classic-docs
title: "Tutorials & 2.0 Sample Apps"
description: "Tutorials and 2.0 Sample Apps with Guides"
---
Watch the video to learn about how to use CircleCI convenience images.

<iframe width="560" height="315" src="https://www.youtube.com/embed/PgIwBzXBn7M" frameborder="0" allowfullscreen></iframe>

## Hello World and Sample Files

Use the Hello World document and sample `config.yml` files to start configuring your build.

Document | Description
----|----------
<a href="{{ site.baseurl }}/2.0/hello-world/">Hello World</a> | Simple steps to get started with a `config.yml` file template for an app that prints Hello World.
<a href="{{ site.baseurl }}/2.0/sample-config/">Sample `config.yml` Files</a> | Four sample `config.yml` files using parallel Workflows, sequential Workflows, fan-in/fan-out Workflows, and building Linux and iOS in one configuration file.
{: class="table table-striped"}

## Tutorials 

Use the tutorial associated with your platform to learn about the customization that is possible in a `.circleci/config.yml`.

Platform Guide | Description
----|----------
<a href="{{ site.baseurl }}/2.0/project-walkthrough/">Linux Project Tutorial</a> | Complete walkthrough of setting up a Python project with Flask to build with CircleCI 2.0.
<a href="{{ site.baseurl }}/2.0/ios-tutorial/">iOS Project Tutorial</a> | Full example of setting up an iOS project in CircleCI 2.0.
<a href="{{ site.baseurl }}/2.0/language-android/">Android Project Tutorial</a> | Full example of setting up an Android project in CircleCI 2.0.
{: class="table table-striped"}

## Sample Apps with Companion Guides

Refer to the Sample Apps to get help with building the language and framework in which your application is written.

Language in which your App is written | Framework | GitHub Repo Name
 ---------|-----------|-----------------
 [Android] | Gradle | [android-image](https://github.com/circleci/circleci-images/tree/master/android)
 [Android](https://github.com/CircleCI-Public/circleci-demo-react-native/blob/master/README.md{:target="_blank"}) | React Native | [circleci-demo-react-native]
 [Clojure] | Luminus | [circleci-demo-clojure-luminus]
 [Elixir] | Phoenix | [circleci-demo-elixir-phoenix]
 [Go] | Go | [circleci-demo-go]
 [iOS] | Xcode | [circleci-demo-ios]
 [iOS](https://github.com/CircleCI-Public/circleci-demo-react-native/blob/master/README.md{:target="_blank"}) | React Native | [circleci-demo-react-native]
 [Java] | Spring | [circleci-demo-java-spring]
 [JavaScript] | React | [circleci-demo-javascript-express]
 [JavaScript](https://github.com/CircleCI-Public/circleci-demo-react-native/blob/master/README.md{:target="_blank"}) | React Native | [circleci-demo-react-native]
 [PHP] | Laravel | [circleci-demo-php-laravel]
 [Python] | Django | [circleci-demo-python-django]
 [Python]({{ site.baseurl }}/2.0/project-walkthrough/) | Flask | [circleci-demo-python-flask]
 [React Native](https://github.com/CircleCI-Public/circleci-demo-react-native/blob/master/README.md{:target="_blank"}) | React Native | [circleci-demo-react-native]
 [Ruby and Rails] | Rails | [circleci-demo-ruby-rails]
{: class="table table-striped"}

## Sample Workflows

Workflow Example | GitHub Repo
------|-----------
Parallel | [parallel-jobs](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/parallel-jobs/.circleci/config.yml{:target="_blank"})
Sequential | [sequential-branch-filter](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/sequential-branch-filter/.circleci/config.yml{:target="_blank"})
Fan-in / Fan-out | [fan-in-fan-out](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/fan-in-fan-out/.circleci/config.yml)
Workspace Forwarding | [workspace-forwarding](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/workspace-forwarding/.circleci/config.yml{:target="_blank"})
{: class="table table-striped"}

[Android]: {{ site.baseurl }}/2.0/language-android/
[Clojure]: {{ site.baseurl }}/2.0/language-clojure/
[Elixir]: {{ site.baseurl }}/2.0/language-elixir/
[Go]: {{ site.baseurl }}/2.0/language-go/
[iOS]: {{ site.baseurl }}/2.0/ios-tutorial/
[Java]: {{ site.baseurl }}/2.0/language-java/
[JavaScript]: {{ site.baseurl }}/2.0/language-javascript/
[PHP]: {{ site.baseurl }}/2.0/language-php/
[Python]: {{ site.baseurl }}/2.0/language-python/
[Ruby and Rails]: {{ site.baseurl }}/2.0/language-ruby/

[circleci-demo-clojure-luminus]: https://github.com/CircleCI-Public/circleci-demo-clojure-luminus
[circleci-demo-elixir-phoenix]: https://github.com/CircleCI-Public/circleci-demo-elixir-phoenix
[circleci-demo-go]: https://github.com/CircleCI-Public/circleci-demo-go
[circleci-demo-java-spring]: https://github.com/CircleCI-Public/circleci-demo-java-spring
[circleci-demo-javascript-express]: https://github.com/CircleCI-Public/circleci-demo-javascript-express
[circleci-demo-ios]: https://github.com/CircleCI-Public/circleci-demo-ios
[circleci-demo-php-laravel]: https://github.com/CircleCI-Public/circleci-demo-php-laravel
[circleci-demo-python-django]: https://github.com/CircleCI-Public/circleci-demo-python-django
[circleci-demo-python-flask]: https://github.com/CircleCI-Public/circleci-demo-python-flask
[circleci-demo-react-native]: https://github.com/CircleCI-Public/circleci-demo-react-native
[circleci-demo-ruby-rails]: https://github.com/CircleCI-Public/circleci-demo-ruby-rails


We’re thrilled to have you here. Happy building!

_The CircleCI Team_
