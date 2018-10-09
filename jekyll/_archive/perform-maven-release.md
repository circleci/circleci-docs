---
layout: classic-docs
title: Perform a Maven Release
categories: [how-to]
description: How to perform a maven release
sitemap: false
---

Using the [CircleCI REST API]({{ site.baseurl }}/1.0/api/) and some additional configuration, it’s possible to [perform a Maven release](http://maven.apache.org/maven-release/maven-release-plugin/examples/prepare-release.html).

## Preparation

### User Key

First, create a user key for your project since your build environment will need the ability to push new commits to your source repository. You can create a user key by going to the "Checkout SSH keys" section of your Project Settings. If a user key hasn't already been added, click the button "Create and add [username] key".

### POM file

You will also need to prepare your project's `pom.xml` according to the
[release plugin usage](http://maven.apache.org/maven-release/maven-release-plugin/usage.html). This process mainly consists of adding an `scm` block with a `developerConnection` and a declaration of the latest release plugin.

For GitHub projects, the `scm` block will look like the following, replacing `ORG` and `PROJECT`:

```
<scm>
  <developerConnection>scm:git:git@github.com:ORG/PROJECT.git</developerConnection>
  <tag>HEAD</tag>
</scm>
```

Additionally, configure the tag syntax within the `plugin` declaration to simplify the Maven invocation below.

```
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-release-plugin</artifactId>
    <version>2.5.3</version>
    <configuration>
        <tagNameFormat>v@{project.version}</tagNameFormat>
    </configuration>
</plugin>
```

This particular example results in `v1.2.3` type version tags derived from the project's version.

### CircleCI project file

Finally, add a "conditional hook" to your `circle.yml` that will be activated by triggering the build via the API.

In your configuration's `test` section, create or add to the `post` steps as shown here:

```
test:
  post:
    - if [[ $GIT_USER_EMAIL ]]; then git config --global user.email "$GIT_USER_EMAIL" ; fi
    - if [[ $GIT_USER_NAME ]]; then git config --global user.name "$GIT_USER_NAME" ; fi
    - if [[ $RELEASE ]]; then mvn -B release:prepare -DreleaseVersion=$RELEASE -DdevelopmentVersion=$NEXT ; fi
```

This snippet implies four noteworthy environment variables:

* `GIT_USER_EMAIL`
* `GIT_USER_NAME`
* `RELEASE`
* `NEXT`

The variable names shown here are arbitrary, but make sure to reference the same ones when invoking the build below. The use and invocation of the target `release:prepare` can be customized as needed for your project.

## Trigger a Maven release build

Using your REST client of choice, you can trigger a Maven release by invoking something like this example `curl` operation:

```
curl -X POST -H "Content-Type: application/json" -d '{
    "build_parameters": {
        "RELEASE": "1.1.1",
        "NEXT": "1.2-SNAPSHOT",
        "GIT_USER_EMAIL": "me@example.com",
        "GIT_USER_NAME": "Via CircleCI"
    }
}' "https://circleci.com/api/v1.1/project/github/ORG/PROJECT/tree/master?circle-token=TOKEN"
```

**NOTE**: replace `TOKEN` in the URL shown with the API token from your [account dashboard](https://circleci.com/account/api){:rel="nofollow"}. Be sure to also replace `ORG` and `PROJECT` in the URL shown.

Within the JSON body, adjust these fields as needed for this particular release build:

* `GIT_USER_EMAIL` : your actual email address used for typical commits to this repo
* `GIT_USER_NAME` : your real name or a CI indicator, such as "Via CircleCI".
   The latter makes it easier to spot CI commits in your log history.
* `RELEASE` : a non-SNAPSHOT version that you want to release
* `NEXT` : the next development version to set in the POM; should
  end with "-SNAPSHOT"
