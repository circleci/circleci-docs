---
layout: classic-docs
title: Continuous Integration and Continuous Deployment with Java
short-title: Java
categories: [languages]
description: Continuous Integration and Continuous Deployment with Java
---

Circle supports building Java applications using most common JDKs and build tools.
Before each build, we look at your repository and infer commands to run, so most
setups should work automatically.
If your project has special requirements, you can augment or override inferred commands
with a [circle.yml](/docs/configuration) file.

### Version

Circle has [several versions of the Oracle JDK](/docs/environment/#java)
available. We use `{{ site.data.versions.default_java_version }}`
as the default; if you'd like a particular version, you can specify it in your `circle.yml`

### Dependencies & Tests

Circle supports ant, play, gradle, and maven out of the box.
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

You can easily customize inferred build commands in your `circle.yml`
by setting the `override`, `pre`, `post` in the
[dependencies](/docs/configuration/#dependencies) and
[test](/docs/configuration/#test) sections.
