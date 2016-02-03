---

title: Continuous Integration and Continuous Deployment with Scala
layout: doc
short_title: Scala
tags:
  - scala
  - language-guides

---

Circle supports building Scala applications with `sbt`. Before each
build we look at your repository and infer commands to run, so most
setups should work automatically.

If you'd like something specific that's not being inferred,
[you can say so](/docs/configuration) with
[a configuration file](/docs/config-sample)
checked into the root of your repository.

### Version

Circle has [several versions of Scala](/docs/environment#scala)
available.

You can specify the JVM version you want to run Scala on top of by
following
[the steps described in the Java doc](https://circleci.com/docs/configuration#java-version).

### Using a custom version of sbt

The latest version of sbt currently supported by CircleCI is `0.13.1`.
If you would like to use a different version of sbt for your builds, we
suggest upgrading it manually. Here is an example of installing the
version `0.13.7` of sbt by downloading a binary from Bintray:

```
dependencies:
  pre:
    - wget -q https://dl.bintray.com/sbt/debian/sbt-0.13.7.deb
    - sudo dpkg -i sbt-0.13.7.deb
  cache_directories:
    - "~/.ivy2"
    - "~/.sbt"
```

Another option would be to use the `jar`s provided by Typesafe:

```
machine:
  environment:
    SBT_VERSION: 0.13.7
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

Circle can [cache directories](/docs/configuration#cache-directories)
in between builds to avoid unnecessary work.

By default, when we detect a Scala project, we will run `sbt
test:compile` to resolve the dependencies and `sbt test:test` to run the
tests. You can customize the commands that are run by setting the
`override`, `pre` and / or `post` in the `dependencies` and `test`
sections.
