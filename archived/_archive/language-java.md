---
layout: classic-docs
title: Continuous Integration and Continuous Deployment with Java
short-title: Java
categories: [languages]
description: Continuous Integration and Continuous Deployment with Java
sitemap: false
---

CircleCI supports building Java applications using most common JDKs and build tools.
Before each build, we look at your repository and infer commands to run, so most
setups should work automatically.
If your project has special requirements, you can augment or override inferred commands
with a [circle.yml]( {{ site.baseurl }}/1.0/configuration/) file.

### Version

We have several versions of JDK pre-installed on [Ubuntu 12.04]( {{ site.baseurl }}/1.0/build-image-precise/#java) and [Ubuntu 14.04]( {{ site.baseurl }}/1.0/build-image-trusty/#java) build images.

If you’d like a particular version, you can specify it in your circle.yml.

```
machine:
  java:
    version: openjdk7
```
Available tools may differ between build image versions, see [Differences Between Trusty and Precise]({{ site.baseurl }}/1.0/differences-between-trusty-and-precise) for more information.

### Dependencies & Tests

CircleCI supports Apache Ant, Play Framework, Gradle, and Apache Maven out of the box. **Note**: Play Framework is not  installed on Ubuntu 14.04 instances, only on 12.04 instances. 
Depending on your build tooling, we will infer different commands:

<table class='table'>
  <thead>
    <tr>
      <th>Tool</th>
      <th>Dependency Resolution</th>
      <th>Testing</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Maven</td>
      <td>
        `mvn dependency:resolve`
      </td>
      <td>
        `mvn integration-test`
      </td>
    </tr>
    <tr>
      <td>Ant</td>
      <td></td>
      <td>
        `ant`
      </td>
    </tr>
    <tr>
      <td>Gradle</td>
      <td>
        `gradle dependencies`
      </td>
      <td>
        `gradle test`
      </td>
    </tr>
    <tr>
      <td>Play</td>
      <td>
        `play dependencies`
      </td>
      <td>
        `play test`
      </td>
    </tr>
  </tbody>
</table>

You can easily customize inferred build commands in your `circle.yml` by setting the `override`, `pre`, `post` in the [dependencies]( {{ site.baseurl }}/1.0/configuration/#dependencies) and [test]( {{ site.baseurl }}/1.0/configuration/#test) sections.
