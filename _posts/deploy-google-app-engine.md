<!--

title: Continuous Deployment to Google App Engine
last_updated: July 19, 2013

-->

Setting up continuous deployment to Google App Engine is pretty straightforward. Here's
how you do it.

## Add Google App Engine SDK as a Dependency

First, you have to **install the SDK on your build VM.**
We don't do this by default, because it's very fast (under 10 seconds) and there are many
supported SDK versions to choose from.

You'll need to find the download URL for the SDK that you need. The official source for
SDK downloads is
[https://developers.google.com/appengine/downloads](https://developers.google.com/appengine/downloads).

This example [circle.yml](/docs/configuration)
fragment installs version 1.5.1 of the Python Google App Engine SDK. Modify it to
download the SDK you need:

```
dependencies:
  pre:
    - curl -o $HOME/google_appengine_1.9.13.zip https://storage.googleapis.com/appengine-sdks/featured/google_appengine_1.9.13.zip
    - unzip -q -d $HOME $HOME/google_appengine_1.9.13.zip
```

## Configure Deployment to Google App Engine

With the SDK installed, next you need to **configure continuous deployment.**
You may want to read up on configuring
[continuous deployment with circle.yml](/docs/configuration#deployment)
in general if your needs are more complex than what's shown in these examples.

For the sake of this example, let's deploy the master branch to
Google App Engine every time the tests are green. The commands differ slightly
depending on which language you're using, but they're all doing basically
the same thing:

### Python

Using [appcfg.py update](https://developers.google.com/appengine/docs/python/gettingstarted/uploading):

```
deployment:
  appengine:
    branch: master
    commands:
      - echo $APPENGINE_PASSWORD | $HOME/google_appengine/appcfg.py update --email=$APPENGINE_EMAIL --passin .
```

### Java

Using [appcfg.sh update](https://developers.google.com/appengine/docs/java/tools/uploadinganapp):

```
deployment:
  appengine:
    branch: master
    commands:
      - echo $APPENGINE_PASSWORD | $HOME/appengine-java-sdk/bin/appcfg.sh update --email=$APPENGINE_EMAIL --passin .
```

### Go

Using [appcfg.py update](https://developers.google.com/appengine/docs/go/tools/uploadinganapp):

```
deployment:
  appengine:
    branch: master
    commands:
      - echo $APPENGINE_PASSWORD | $HOME/google_appengine/appcfg.py update --email=$APPENGINE_EMAIL --passin .
```

### Credentials

In all three cases, the deployment command passes an email address and password to
the appcfg command. The credentials are stored in environment variables, which you can
manage through the web UI as described
[in this document](/docs/environment-variables#setting-environment-variables-for-all-commands-without-adding-them-to-git).

Python and Go users can also configure it to use non-interactive
oauth2 authentication, instead (The Java SDK's appcfg.sh does not appear to support this
usage.)
