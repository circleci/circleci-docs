---
layout: classic-docs
title: Continuous Integration and Continuous Deployment with Scala
short-title: Scala
categories: [languages]
description: Continuous Integration and Continuous Deployment with Scala
sitemap: false
---

CircleCI supports building Scala applications with `sbt`. Before each
build we look at your repository and infer commands to run, so most
setups should work automatically.

If you'd like something specific that's not being inferred,
[you can say so]( {{ site.baseurl }}/1.0/configuration/) with
[a configuration file]( {{ site.baseurl }}/1.0/config-sample/)
checked into the root of your repository.

### Version

We pre-install [several versions of Scala on Ubuntu 12.04 build image]( {{ site.baseurl }}/1.0/build-image-precise/#scala).

You can specify the JVM version you want to run Scala on top of by
following
[the steps described in the Java doc]( {{ site.baseurl }}/1.0/configuration/#java-version).

### Using a custom version of sbt

The latest version of sbt currently supported by CircleCI is `0.13.9`.
If you would like to use a different version of sbt for your builds, we
suggest upgrading it manually. Here is an example of installing the
version `0.13.12` of sbt by downloading a binary from Bintray:

```
dependencies:
  pre:
    - wget -q https://dl.bintray.com/sbt/debian/sbt-0.13.12.deb
    - sudo dpkg -i sbt-0.13.12.deb
  cache_directories:
    - "~/.ivy2"
    - "~/.sbt"
```

Another option would be to use the `jar`s provided by Typesafe:

```
machine:
  environment:
    SBT_VERSION: 0.13.12
    SBT_OPTS: "-Xms512M -Xmx1536M -Xss1M -XX:+CMSClassUnloadingEnabled
-XX:MaxPermSize=256M"
dependencies:
  cache_directories:
    - "~/.sbt"
  pre:
    - wget --output-document=$HOME/bin/sbt-launch.jar
      https://repo.typesafe.com/typesafe/ivy-releases/org.scala-sbt/sbt-launch/"$SBT_VERSION"/sbt-launch.jar
    - echo "java $SBT_OPTS -jar \`dirname \$0\`/sbt-launch.jar \"\$@\""
      > $HOME/bin/sbt
    - chmod u+x $HOME/bin/sbt
    - which sbt
    - sbt sbt-version
```

### Dependencies & Tests

CircleCI can [cache directories]( {{ site.baseurl }}/1.0/configuration/#cache-directories)
in between builds to avoid unnecessary work.

By default, when we detect a Scala project, we will run `sbt
test:compile` to resolve the dependencies and `sbt test:test` to run the
tests. You can customize the commands that are run by setting the
`override`, `pre` and / or `post` in the `dependencies` and `test`
sections.
