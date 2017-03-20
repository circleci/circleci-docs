# Artifactory 

## Deploy

Artifactory has great documentation explaining how to leverage their [REST API](https://www.jfrog.com/confluence/display/RTF/Artifactory+REST+API).

We figure we use this space to highlight some sample projects that will show you how to best leverage using CircleCI and Artifactory together. 

It is super important for you to have created your Repository before starting this example, otherwise CircleCI will have nowhere to store your dependencies.

## JFrog CLI
If you want to use the JFrog CLI you can install it by adding the following to your circle.yml.

```
dependencies:
  pre:
    - curl -fL https://getcli.jfrog.io | sh

```

Now we need to configure jfrog to use our credentials in a secure way. We configure the client to use our artifactory_url, along with our username and apikey. These can be entered under `Project Settings->Environment Variables`

```
    - ./jfrog rt config --url $ARTIFACTORY_URL --user $ARTIFACTORY_USER --apikey $ARTIFACTORY_APIKEY

```

If you'd like to upload JAR files use the following example:

```
    - ./jfrog rt u "multi*/*.jar" <artifactory_repo_name> --build-name=<name_you_give_to_build> --build-number=$CIRCLE_BUILD_NUM --flat=false
```

If you'd like to upload WAR files use the following example:

```
    - ./jfrog rt u "multi*/*.war" <artifactory_repo_name> --build-name=<name_you_give_to_build> --build-number=$CIRCLE_BUILD_NUM --flat=false
```

The full circle.yml file would look something like the following:

```
machine:
  java:
    version: openjdk7
dependencies:
  override:
    - mvn --fail-never dependency:go-offline || true
  pre:
    - curl -fL https://getcli.jfrog.io | sh
compile:
  override:
    - mvn clean install
    - ./jfrog rt config --url $ARTIFACTORY_URL --user $ARTIFACTORY_USER --apikey $ARTIFACTORY_APIKEY
    - ./jfrog rt u "multi*/*.jar" <artifactory_repo_name> --build-name=<name_you_give_to_build> --build-number=$CIRCLE_BUILD_NUM --flat=false
    - ./jfrog rt u "multi*/*.war" <artifactory_repo_name> --build-name=<name_you_give_to_build> --build-number=$CIRCLE_BUILD_NUM --flat=false
    - ./jfrog rt bce <name_you_give_to_build> $CIRCLE_BUILD_NUM
    - ./jfrog rt bp <name_you_give_to_build> $CIRCLE_BUILD_NUM
``` 

The sample project is found [here](https://github.com/GERey/circleci-generic-artifactory). Stay tuned for language specific examples.
