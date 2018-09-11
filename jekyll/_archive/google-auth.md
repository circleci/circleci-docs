---
layout: classic-docs
title: Authentication with Google Cloud Platform
categories: [how-to]
description: Authentication with Google Cloud Platform
sitemap: false
---

Before using the `gcloud` command line tool to deploy your app to Google Cloud 
Platform, you'll need to authenticate it in order to give it the correct 
permissions. In order to do this, you'll need to create a 
[JSON Service Account][]. This Service Account can then be encoded in base64 
and added as a [CircleCI environment variable][]. Your build script can then decode 
the JSON file and it use to authenticate the gcloud tool, which can then be 
used to deploy and interact with your project.

## Creating and downloading the JSON Service Account

To create and download a Service Account you can visit 
<https://console.developers.google.com/apis/credentials/serviceaccountkey?project=_>, 
or just go to go to <https://console.developers.google.com/>, and then on the 
left-hand menu click 'API Manager', then 'Credentials', then 'New credentials', 
then select 'Service account key'. Create a new service account, give it a 
name, make sure it's in the JSON format, then click 'Create'. This will 
download the Service Account JSON file.

Please keep in mind that the Service Account is a credential that can be used 
to interact with the project on your behalf, so keep it secret along with any 
other credentials.

## Adding the Service Account to the CircleCI environment

Once the Service Account is created, the next step is to add it as an
environment variable to your CircleCI environment. First, you'll need to encode
it in base64 format. To do so, on Linux or macOS, type:

```
base64 <your-service-account.json>
```

and then copy the result of that command. Windows users will need to use 
[certutil][].

Once you have copied the value of your JSON Service Account, go to your 
CircleCI project, click 'Project Settings' in the top right, then click 
'Environment Variables' on the left hand side. For the Name field we'll call 
this variable `GCLOUD_SERVICE_KEY`, and paste the value of your encoded Service 
Account into the Value field, then click 'Save variables'. Your Service Account 
can now be accessed from within your CircleCI build job.

## Using the Service Account to Authenticate the gcloud tool

Once your encoded Service Account is added as an environment variable, the next 
step is to decode it in your build script and use it to authenticate the 
`gcloud` tool. Here is an example of how to do that:

```
echo $GCLOUD_SERVICE_KEY | base64 --decode --ignore-garbage > ${HOME}/gcloud-service-key.json
```

To use certain services such as Google Cloud Datastore, you will need to set the environment variable
__$GOOGLE_APPLICATION_CREDENTIALS__ to __${HOME}/gcloud-service-key.json__

To do so click on Builds - __[Choose your project]__ - Environment Variables - Add Variable

This decodes the secret into a file named `gcloud-service-key.json`. Next, 
authenticate the `gcloud` command with that account. Updating first is a good 
best-practice, and don't forget to set your project:

```
sudo /opt/google-cloud-sdk/bin/gcloud --quiet components update
sudo /opt/google-cloud-sdk/bin/gcloud auth activate-service-account --key-file ${HOME}/gcloud-service-key.json
sudo /opt/google-cloud-sdk/bin/gcloud config set project $GCLOUD_PROJECT
```

## Security Considerations

If you add the Service Account to your CircleCI environment, that environment 
now contains credentials which if compromised could compromise your project. 
One danger is that someone submits a PR to your project that changes the 
CircleCI build to print your credentials or otherwise use the gcloud tool to do 
malicious actions. Fortunately, by default CircleCI does not provide UI 
configured environment variables to Pull Requests. You can read more about this 
topic [here][fork-pr-builds].



[JSON Service Account]: https://developers.google.com/identity/protocols/OAuth2ServiceAccount
[CircleCI environment variable]:  {{ site.baseurl }}/1.0/environment-variables/
[certutil]: http://stackoverflow.com/questions/16945780/decoding-base64-in-batch
[fork-pr-builds]:  {{ site.baseurl }}/1.0/fork-pr-builds/
