---
layout: classic-docs
title: CircleCI 1.0 Continuous Deployment with AWS CodeDeploy 
categories: [how-to]
description: Continuous Deployment with AWS CodeDeploy
last_updated: September 29, 2014
sitemap: false
---

## Getting Started with CodeDeploy on CircleCI

AWS CodeDeploy is a deployment system that enables developers to automate the
deployment of applications to EC2 instances, and to update the applications as
required.

### AWS infrastructure
The first step to continuous deployment with CodeDeploy is setting up your EC2
instances, tagging them so you can define deployment groups, installing the
CodeDeploy agent on your hosts and setting up trust-roles so that CodeDeploy
can communicate with the CodeDeploy agents.
AWS provide a good [getting started with CodeDeploy guide][] for this part of
the process.

[getting started with CodeDeploy guide]: http://docs.aws.amazon.com/en_us/console/codedeploy/applications-user-guide


### CodeDeploy application
A CodeDeploy application is a collection of settings about where your
application can be deployed, how many instances can be deployed to at once,
what should be considered a failed deploy, and information on the trust-role to
use to allow CodeDeploy to interact with your EC2 instances.

**Note**: A CodeDeploy application does not specify what is to be deployed or what to
do during the deployment.
*What* to deploy is an archive of code/resources stored in S3 called an
`application revision`.
*How* to deploy is specified by the `AppSpec` file located inside the
application revision.

The [AppSpec][] file lives in your repo and tells CodeDeploy which files from
your application to deploy, where to deploy them, and also allows you specify
lifecycle scripts to be run at different stages during the deployment. You can
use these lifecycle scripts to stop your service before a new version is
deployed, run database migrations, install dependencies etc.

An [application revision][] is a zipfile or tarball containing the code/resources
to be deployed. It's usually created by packaging up your entire repo but can
be a sub-directory of the repo if desired. The `AppSpec` file must be stored
in the application revision as `<application-root>/appspec.yml`.

Generally speaking you'll have one application in your repo and so your
application revision can be created by packaging up your whole repo (excluding
`.git`). In this case `appspec.yml` should be placed in your repo root directory.

Application revisions are stored in [S3][] and are identified by the
combination of a bucket name, key, eTag, and for versioned buckets, the
object's version.

The most straightforward way to configure a new application is to log on to the
[CodeDeploy console][] which can guide you through the process of [creating a new
application][].

[AppSpec]: http://docs.aws.amazon.com/codedeploy/latest/userguide/writing-app-spec.html
[application revision]: http://docs.aws.amazon.com/codedeploy/latest/userguide/how-to-prepare-revision.html
[S3]: http://aws.amazon.com/s3/
[CodeDeploy console]: https://console.aws.amazon.com/codedeploy/home
[creating a new application]: https://console.aws.amazon.com/codedeploy/home#/applications/new



## Configuring CircleCI

CircleCI will automatically create new application revisions, upload them to
S3, and both trigger and watch deployments when you get a green build.

### Step 1: Create an IAM user for CircleCI to use
You should create an [IAM user][] to use solely for builds on
CircleCI, that way you have control over exactly which of your resources can be
accessed by code running as part of your build.

Take note of the Access Key ID and Secret Access Key allocated to your new IAM
user, you'll need these later.

For deploying with CodeDeploy your IAM user needs to be able to access S3 and
CodeDeploy at a minimum.

#### S3 IAM policy
CircleCI needs to be able to upload application revisions to your S3 bucket.
Permissions can be scoped down to the common-prefix you use for application
revision keys if you don't want to give access to the entire bucket.

The following policy snippet allows us to upload to `my-bucket` as long as the
key starts with `my-app`.

    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": [
            "s3:PutObject"
          ],
          "Resource": [
            "arn:aws:s3:::my-bucket/my-app*"
          ]
        }
      ]
    }


#### CodeDeploy IAM policy
CircleCI also needs to be able to create application revisions, trigger
deployments and get deployment status. If your application is called `my-app`
and your account ID is `80398EXAMPLE` then the following policy snippet gives
us sufficient access:

    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": [
            "codedeploy:RegisterApplicationRevision",
            "codedeploy:GetApplicationRevision"
          ],
          "Resource": [
            "arn:aws:codedeploy:us-east-1:80398EXAMPLE:application:my-app"
          ]
        },
        {
          "Effect": "Allow",
          "Action": [
            "codedeploy:CreateDeployment",
            "codedeploy:GetDeployment"
          ],
          "Resource": [
            "arn:aws:codedeploy:us-east-1:80398EXAMPLE:deploymentgroup:my-app/*"
          ]
        },
        {
          "Effect": "Allow",
          "Action": [
            "codedeploy:GetDeploymentConfig"
          ],
          "Resource": [
            "arn:aws:codedeploy:us-east-1:80398EXAMPLE:deploymentconfig:CodeDeployDefault.OneAtATime",
            "arn:aws:codedeploy:us-east-1:80398EXAMPLE:deploymentconfig:CodeDeployDefault.HalfAtATime",
            "arn:aws:codedeploy:us-east-1:80398EXAMPLE:deploymentconfig:CodeDeployDefault.AllAtOnce"
          ]
        }
      ]
    }


**Note:** This is the minimal policy necessary for creating deployments to
`my-app`. You will need to add additional `Resource` statements for each
additional CodeDeploy application. Alternatively, you can use wildcards in the
resource specification.

If you want to use custom deployment configurations then we will also need the
`GetDeploymentConfig` permission for each of the custom deployment
configurations, check out the [CodeDeploy IAM docs][] for more information.

[IAM user]: http://docs.aws.amazon.com/general/latest/gr/root-vs-iam.html
[CodeDeploy IAM docs]: http://docs.aws.amazon.com/codedeploy/latest/userguide/access-permissions.html


### Step 2: Configure CircleCI to use your new IAM user
Go to your project's **Project Settings > AWS keys** page, enter your IAM
user's Access Key ID and Secret Access Key and hit "Save AWS keys".
Your AWS keys are stored encrypted but it's important to note that they need to
be made available to code inside your build containers; anyone who can commit
code to your repo or trigger an ssh build will be able to read the AWS keys.
This is another important reason to use IAM to limit the resources the keys
can access!


### Step 3: (Optional) Configure packaging and revision storage
CircleCI needs some additional information to be able to package up your app
and register new revisions:
1. The directory in your repo to package up. This is relative to your repo's
   root, `/` means the repo's root directory, `/app` means the `app` directory
   in your repo's root directory.
2. Where to store new revisions in S3. The bucket name and a pattern to use to
   generate new keys within that bucket. You can use [substitution variables][]
   in your key pattern to help generate a unique key for each application
   revision.
3. Which AWS region your application lives in. Each application revision must
   be registered in the same AWS region that the CodeDeploy application was
   created in.

If you want to be able to deploy this application from several different
branches (e.g. deploy `development` to your staging instances and `master` to
your production instances) you can configure these project-wide application
settings in the CircleCI UI at **Project Settings > AWS CodeDeploy**. The
main benefit is that you will have a simpler [circle.yml][] file.

You can also skip this step and configure everything in your [circle.yml][]


### Step 4: Configure deployment parameters
Configure your CodeDeploy deployment using the `codedeploy` block in
[circle.yml][]. At a minimum you need to tell CircleCI which application to
deploy and which deployment group the selected branch should be deployed to.
Any additional settings will override the project-wide configuration in the
project settings UI:

    deployment:
      staging:
        branch: development
        codedeploy:
          my-app:
            deployment_group: staging-instance-group

The benefit of project-wide application settings comes when you want to deploy
the same app to different deployment groups:

    deployment:
      staging:
        branch: development
        codedeploy:
          my-app:
            deployment_group: staging-instance-group
      production:
        branch: master
        codedeploy:
          my-app:
            deployment_group: production-instance-group

If you wanted to override the S3 location for the application revisions
built for your production deployments (**Note:** you must specify both the
bucket name and key pattern if you override `revision_location`):

    deployment:
      production:
        branch: master
        codedeploy:
          my-app:
            deployment_group: production-instances
            revision_location:
              revision_type: S3
              s3_location:
                bucket: production-bucket
                key_pattern: apps/my-app-master-{SHORT_COMMIT}-{BUILD_NUM}

If you haven't provided [project-wide settings](#step-3-optional-configure-packaging-and-revision-storage)
you need to provide all the information for your deployment in your
[circle.yml][]:

    deployment:
      staging:
        branch: development
        codedeploy:
          my-app:
            application_root: /
            revision_location:
              revision_type: S3
              s3_location:
                bucket: staging-bucket
                key_pattern: apps/my-app-{SHORT_COMMIT}-{BUILD_NUM}
            region: us-east-1
            deployment_group: staging-instances
            deployment_config: CodeDeployDefault.AllAtOnce


Breaking this down: there's one entry in the `codedeploy` block which is
named with your CodeDeploy application's name (in this example we're
deploying an application called `my-app`).

The sub-entries of `my-app` tell CircleCI where and how to deploy the `my-app`
application.

* `application_root` is the directory to package up into an application revision. It
  is relative to your repo and must start with a `/`.
  `/` means the repo root directory.
  The entire contents of `application_root` will be packaged up into a zipfile and
  uploaded to S3.
* `revision_location` tells CircleCI where to upload application revisions to.
  * `revision_type` is where to store the revision - currently only S3 is supported
  * `bucket` is the name of the bucket that should store your application
    revision bundles.
  * `key_pattern` is used to generate the S3 key. You can use [substitution variables][]
    to generate unique keys for each build.
* `region` is the AWS region your application lives in
* `deployment_group` names the deployment group to deploy the new revision to.
* `deployment_config` [optional] names the deployment configuration. It can be
  any of the standard three CodeDeploy configurations (FOO, BAR, and BAZ) or
  if you want to use a custom configuration you've created you can name it
  here.


### Key Patterns
Rather than overwriting a single S3 key with each new revision CircleCI can
generate unique keys for application revisions using substitution variables.

The available variables are:
* `{BRANCH}`: the branch being built
* `{COMMIT}`: the full SHA1 of the commit being build
* `{SHORT_COMMIT}`: the first 7 characters of the commit SHA1
* `{BUILD_NUM}`: the build number

For a unique key you'll need to embed at least one of `{COMMIT}`,
`{SHORT_COMMIT}`, or `{BUILD_NUM}` in your key pattern.

If you'd rather use a versioned bucket just use a fixed string for the key
pattern and we'll use the object's versioning info instead.


## Pre- and post-deployment steps
Unlike other deployment options you don't need to specify pre- or
post-deployment steps in your `circle.yml`.

CodeDeploy provides first class support for your application's lifecycle via
lifecycle scripts. As a result you can start/stop services, run database
migrations, install dependencies etc. across all your instances in a consistent
manner.

[substitution variables]: #key-patterns
[circle.yml]: /docs/1.0/configuration/#deployment
