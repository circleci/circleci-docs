# Local Development Instructions

##README.md
Bitbucket Pipelines Pipe: AWS Elastic Beanstalk
Deploy your code using AWS Elastic Beanstalk.

YAML Definition
Add the following snippet to the script section of your bitbucket-pipelines.yml file:

- pipe: atlassian/aws-elasticbeanstalk-deploy:1.0.0
  variables:
    AWS_ACCESS_KEY_ID: '<string>' # Optional if already defined in the context.
    AWS_SECRET_ACCESS_KEY: '<string>' # Optional if already defined in the context.
    AWS_DEFAULT_REGION: '<string>' # Optional if already defined in the context.
    AWS_OIDC_ROLE_ARN: "<string>" # Optional by default. Required for OpenID Connect (OIDC) authentication.
    APPLICATION_NAME: '<string>'
    ENVIRONMENT_NAME: '<string>'
    ZIP_FILE: '<string>'
    # S3_BUCKET: '<string>' # Optional.
    # S3_KEY: '<string>' # Optional.
    # VERSION_LABEL: '<string>' # Optional.
    # DESCRIPTION: '<string>' # Optional.
    # WAIT: '<boolean>' # Optional.
    # WAIT_INTERVAL: '<integer>' # Optional.
    # WARMUP_INTERVAL: '<integer>' # Optional.
    # COMMAND: '<string>' # Optional.
    # DEBUG: '<boolean>' # Optional.
Variables
Basic usage
Variable	Usage
AWS_ACCESS_KEY_ID (**)	AWS access key.
AWS_SECRET_ACCESS_KEY (**)	AWS secret key.
AWS_DEFAULT_REGION (**)	The AWS region code (us-east-1, us-west-2, etc.) of the region containing the AWS resource(s). For more information, see Regions and Endpoints in the Amazon Web Services General Reference.
AWS_OIDC_ROLE_ARN	The ARN of the role you want to assume. Required for OpenID Connect (OIDC) authentication. See Authentication.
APPLICATION_NAME (*)	The name of the Elastic Beanstalk application.
ENVIRONMENT_NAME (*)	Environment name.
ZIP_FILE (*)	The application source bundle to deploy (zip, jar, war).
S3_BUCKET	Bucket name used by Elastic Beanstalk to store artifacts. Default: ${APPLICATION_NAME}-elasticbeanstalk-deployment.
S3_KEY	Bucket location used by Elastic Beanstalk to store artifacts. Default: ${APPLICATION_NAME}/${VERSION_LABEL}.
VERSION_LABEL	Version label for the new application revision. Default: ${APPLICATION_NAME}-${BITBUCKET_BUILD_NUMBER}-${BITBUCKET_COMMIT:0:8}.
DESCRIPTION	Description for the new application revision. Default: a URL pointing to the pipeline result page.
WAIT	Wait for deployment to complete. Default: false.
WAIT_INTERVAL	Time to wait between polling for deployment to complete (in seconds). Default: 10.
WARMUP_INTERVAL	Time to wait for 'Green' or 'Yellow' environment's health (in seconds). Default: 0.
COMMAND	Command to be executed during the deployment. Valid options are all, upload-only, deploy-only. Default: all.
DEBUG	Turn on extra debug information. Default: false.
(*) = required variable. This variable needs to be specified always when using the pipe.	
(**) = required variable. If this variable is configured as a repository, account or environment variable, it doesn’t need to be declared in the pipe as it will be taken from the context. It can still be overridden when using the pipe.	
Advanced usage
If COMMAND is set to upload-only

Variable	Usage
AWS_ACCESS_KEY_ID (**)	AWS access key.
AWS_SECRET_ACCESS_KEY (**)	AWS secret key.
AWS_DEFAULT_REGION (**)	The AWS region code (us-east-1, us-west-2, etc.) of the region containing the AWS resource(s). For more information, see Regions and Endpoints in the Amazon Web Services General Reference.
AWS_OIDC_ROLE_ARN	The ARN of the role you want to assume. Required for OpenID Connect (OIDC) authentication. See Authentication.
APPLICATION_NAME (*)	The name of the Elastic Beanstalk application.
COMMAND (*)	Command to be used. Use upload-only here.
ZIP_FILE (*)	The application source bundle to deploy (zip, jar, war).
S3_BUCKET	Bucket name used by Elastic Beanstalk to store artifacts. Default: ${APPLICATION_NAME}-elasticbeanstalk-deployment}.
VERSION_LABEL	Version label for the new application revision. Default: ${ENVIRONMENT_NAME}_${BITBUCKET_COMMIT:0:8}_YYYY-mm-dd_HHMMSS).
DESCRIPTION	Description for the new application revision. Default: "".
DEBUG	Turn on extra debug information. Default: false.
(*) = required variable. This variable needs to be specified always when using the pipe.	
(**) = required variable. If this variable is configured as a repository, account or environment variable, it doesn’t need to be declared in the pipe as it will be taken from the context. It can still be overridden when using the pipe.	
If COMMAND is set to deploy-only

Variable	Usage
AWS_ACCESS_KEY_ID (**)	AWS access key.
AWS_SECRET_ACCESS_KEY (**)	AWS secret key.
AWS_DEFAULT_REGION (**)	The AWS region code (us-east-1, us-west-2, etc.) of the region containing the AWS resource(s). For more information, see Regions and Endpoints in the Amazon Web Services General Reference.
AWS_OIDC_ROLE_ARN	The ARN of the role you want to assume. Required for OpenID Connect (OIDC) authentication. See Authentication.
APPLICATION_NAME (*)	The name of the Elastic Beanstalk application.
COMMAND (*)	Command to be used. Use deploy-only here.
ENVIRONMENT_NAME (*)	Environment name.
VERSION_LABEL	Version label for the new application revision. Default: ${ENVIRONMENT_NAME}_${BITBUCKET_COMMIT:0:8}_YYYY-mm-dd_HHMMSS).
WAIT	Wait for deployment to complete. Default: false.
WAIT_INTERVAL	Time to wait between polling for deployment to complete (in seconds). Default: 10.
WARMUP_INTERVAL	Time to wait for 'Green' or 'Yellow' environment's health (in seconds). Default: 0.
DEBUG	Turn on extra debug information. Default: false.
(*) = required variable. This variable needs to be specified always when using the pipe.	
(**) = required variable. If this variable is configured as a repository, account or environment variable, it doesn’t need to be declared in the pipe as it will be taken from the context. It can still be overridden when using the pipe.	
Details
This pipe deploys a new version of an application to an Elastic Beanstalk environment associated with the application.

With Elastic Beanstalk, you can quickly deploy and manage applications in the AWS Cloud without worrying about the infrastructure that runs those applications. Elastic Beanstalk reduces management complexity without restricting choice or control. You simply upload your application, and Elastic Beanstalk automatically handles the details of capacity provisioning, load balancing, scaling, and application health monitoring.

For advanced use cases and best practices, we recommend build once and deploy many approach. So, if you have multiple environments we recommend using the COMMAND variable to separate your CI/CD workflow into different operations / pipes:

COMMAND: 'upload-only': It will upload the artifact and release a version in Elastic Beanstalk.
COMMAND: 'deploy-only': It will deploy the specified version to the desired environment(s).
Prerequisites
An IAM user is configured with sufficient permissions to perform a deployment to your application and upload artifacts to the S3 bucket.
You have configured the Elastic Beanstalk application and environment.
An S3 bucket has been set up to which deployment artifacts will be copied. Use name ${APPLICATION_NAME}-elasticbeanstalk-deployment to automatically use it.
Authentication
Supported options:

Environment variables: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY. Used by default.

Assume role provider with OpenID Connect (OIDC). More details in the Bitbucket Pipelines Using OpenID Connect guide Integrating aws bitbucket pipeline with oidc. Make sure that you setup OIDC before:

configure Bitbucket Pipelines as a Web Identity Provider in AWS
attach to provider your AWS role with required policies in AWS
setup a build step with oidc: true in your Bitbucket Pipelines
pass AWS_OIDC_ROLE_ARN (*) variable that represents role having appropriate permissions to execute actions on AWS Elastic Beanstalk resources
Examples
Basic example:
Upload the artifact application.zip and deploy your environment.

script:
  - pipe: atlassian/aws-elasticbeanstalk-deploy:1.0.0
    variables:
      AWS_ACCESS_KEY_ID: $AWS_ACCESS_KEY_ID
      AWS_SECRET_ACCESS_KEY: $AWS_SECRET_ACCESS_KEY
      AWS_DEFAULT_REGION: 'us-east-1'
      APPLICATION_NAME: 'my-app-name'
      ENVIRONMENT_NAME: 'production'
      ZIP_FILE: 'application.zip'
Upload the artifact application.zip and deploy your environment. AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY and AWS_DEFAULT_REGION are configured as repository variables, so there is no need to declare them in the pipe.

script:
  - pipe: atlassian/aws-elasticbeanstalk-deploy:1.0.0
    variables:
      APPLICATION_NAME: 'my-app-name'
      ENVIRONMENT_NAME: 'production'
      ZIP_FILE: 'application.zip'
Advanced example:
Deploy a new version of your CloudFormation stack with OpenID Connect (OIDC) alternative authentication without required AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY. Parameter oidc: true in the step configuration and variable AWS_OIDC_ROLE_ARN are required:

- step:
    oidc: true
    script:
      - pipe: atlassian/aws-elasticbeanstalk-deploy:1.0.0
        variables:
          AWS_DEFAULT_REGION: $AWS_DEFAULT_REGION
          AWS_OIDC_ROLE_ARN: 'arn:aws:iam::123456789012:role/role_name'
          APPLICATION_NAME: 'my-app-name'
          ENVIRONMENT_NAME: 'production'
          ZIP_FILE: 'application.zip'
Upload the artifact application.zip and create a version deploy-$BITBUCKET_BUILD_NUMBER-multiple in Elastic Beanstalk.

- pipe: atlassian/aws-elasticbeanstalk-deploy:1.0.0
  variables:
    AWS_ACCESS_KEY_ID: $AWS_ACCESS_KEY_ID
    AWS_SECRET_ACCESS_KEY: $AWS_SECRET_ACCESS_KEY
    AWS_DEFAULT_REGION: $AWS_DEFAULT_REGION
    APPLICATION_NAME: 'application-test'
    COMMAND: 'upload-only'
    ZIP_FILE: 'application.zip'
    S3_BUCKET: 'application-test-bucket'
    VERSION_LABEL: 'deploy-$BITBUCKET_BUILD_NUMBER-multiple'
Upload the artifact application.zip to the custom S3 bucket location:

- pipe: atlassian/aws-elasticbeanstalk-deploy:1.0.0
  variables:
    AWS_ACCESS_KEY_ID: $AWS_ACCESS_KEY_ID
    AWS_SECRET_ACCESS_KEY: $AWS_SECRET_ACCESS_KEY
    AWS_DEFAULT_REGION: $AWS_DEFAULT_REGION
    APPLICATION_NAME: 'application-test'
    COMMAND: 'upload-only'
    ZIP_FILE: 'application.zip'
    S3_BUCKET: 'application-test-bucket'
    S3_KEY: 'environment_prod'
    VERSION_LABEL: 'deploy-$BITBUCKET_BUILD_NUMBER-multiple'
Deploy your version deploy-$BITBUCKET_BUILD_NUMBER-multiple into the environment production and wait until the deployment is completed to see the status.

- pipe: atlassian/aws-elasticbeanstalk-deploy:1.0.0
  variables:
    AWS_ACCESS_KEY_ID: $AWS_ACCESS_KEY_ID
    AWS_SECRET_ACCESS_KEY: $AWS_SECRET_ACCESS_KEY
    AWS_DEFAULT_REGION: $AWS_DEFAULT_REGION
    APPLICATION_NAME: 'application-test'
    COMMAND: 'deploy-only'
    VERSION_LABEL: 'deploy-$BITBUCKET_BUILD_NUMBER-multiple'
    ENVIRONMENT_NAME: 'production'
    WAIT: 'true'
Deploy multicontainer Docker environment as an AWS Elastic Beanstalk application to AWS Cloud and wait until the deployment is completed to see the status. You can find the complete source code for the sample multicontainer app by following this link example-aws-elasticbeanstalk-deploy-docker-multicontainer repository.

- step:
    name: Build docker-multicontainer-v2 App
    script:
    - zip -r docker-multicontainer-v2.zip cron.yaml Dockerrun.aws.json .ebextensions php-app proxy
    artifacts:
    - docker-multicontainer-v2.zip
- step:
    name: Deploy to AWS EBS
    caches:
      - pip
    script:
    - pipe: atlassian/aws-elasticbeanstalk-deploy:1.0.0
      variables:
        AWS_ACCESS_KEY_ID: $AWS_ACCESS_KEY_ID
        AWS_SECRET_ACCESS_KEY: $AWS_SECRET_ACCESS_KEY
        AWS_DEFAULT_REGION: 'us-east-1'
        APPLICATION_NAME: 'test-ebs-multi-docker'
        ENVIRONMENT_NAME: 'TestEbsMultiDocker-env'
        ZIP_FILE: 'docker-multicontainer-v2.zip'
        WAIT: 'true'
Deploy your version deploy-$BITBUCKET_BUILD_NUMBER-multiple into the environment production and wait 60 sec. until the deployment is completed to see operational status of the environment; then extra wait 30 sec. for environment's health status Green or Yellow to make sure that your app instances are available and processing requests.

- pipe: atlassian/aws-elasticbeanstalk-deploy:1.0.0
  variables:
    AWS_ACCESS_KEY_ID: $AWS_ACCESS_KEY_ID
    AWS_SECRET_ACCESS_KEY: $AWS_SECRET_ACCESS_KEY
    AWS_DEFAULT_REGION: $AWS_DEFAULT_REGION
    APPLICATION_NAME: 'application-test'
    COMMAND: 'deploy-only'
    VERSION_LABEL: 'deploy-$BITBUCKET_BUILD_NUMBER-multiple'
    ENVIRONMENT_NAME: 'production'
    WAIT_INTERVAL: 60
    WARMUP_INTERVAL: 30
    WAIT: 'true'
Support
If you'd like help with this pipe, or you have an issue or feature request, let us know on Community.

If you're reporting an issue, please include:

the version of the pipe
relevant logs and error messages
steps to reproduce
License
Copyright (c) 2018 Atlassian and others. Apache 2.0 licensed, see LICENSE.txt file.
There are two ways to work on CircleCI docs locally: with Docker and with [Ruby](https://www.ruby-lang.org/en/)/[Bundler](https://bundler.io/).

## 1. Local Development with Docker (recommended)

1. Install Docker for your platform: <https://docs.docker.com/engine/install/>
1. Clone the CircleCI docs repo: `git clone --recurse-submodules https://github.com/circleci/circleci-docs.git`
_(If you already cloned the project and forgot `--recurse-submodules`, run `git submodule update --init`)_
1. Run `npm install` to fetch dependencies
1. Run `npm run webpack-dev` to create needed js assets
1. Run `docker-compose up`
1. The docs site will now be running on <http://localhost:4000/docs/>

**Note:** If you want to submit a pull request to update the docs, you'll need to [make a fork](https://github.com/circleci/circleci-docs#fork-destination-box) of this repo and clone your version in step 2 above. Then when you push your changes to your fork you can submit a pull request to us.


## 2. Local Development with Ruby and Bundler (alternative to Docker)

If you already have a stable Ruby environment (currently Ruby 2.7.2) and feel comfortable installing dependencies, install Jekyll by following [this guide](https://jekyllrb.com/docs/installation/).

Check out the [Gemfile](https://github.com/circleci/circleci-docs/blob/master/Gemfile) for the Ruby version we're currently using. We recommend [RVM](https://rvm.io/) for managing multiple Ruby versions.

We also use a gem called [HTMLProofer](https://github.com/gjtorikian/html-proofer) to test links, images, and HTML. The docs site will need a passing build to be deployed, so use HTMLProofer to test everything before you push changes to GitHub.

You're welcome to use [Bundler](https://bundler.io/) to install these gems.

## Building js assets

Our js assets are compiled by webpack and put into a place where the jekyll build can find them.

Anytime you are working on js be sure to run:

```bash
$ npm install
$ npm run webpack-watch
```

## First Run

To get a local copy of our docs, run the following commands:

```bash
git clone https://github.com/circleci/circleci-docs.git
git clone --recurse-submodules https://github.com/circleci/circleci-docs.git
cd circleci-docs/jekyll
JEKYLL serve -Iw
```

Jekyll will build the site and start a web server, which can be viewed in your browser at <http://localhost:4000/docs/>. `-w` tells Jekyll to watch for changes and rebuild, while `-I` enables an incremental rebuild to keep things efficient.

For more info on how to use Jekyll, check out [their docs](https://jekyllrb.com/docs/usage/).

## Markdownlinter

Prerequisites:

- Installed npm packages at the root of the repository `npm install`
- Installed gems at the root of the repository `bundle install`

You can lint the markdown using the [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2)

```bash
.PATH=$(npm bin):$PATH markdownlint-cli2 jekyll/_cci2/*.md
```

You can also autofix the issues by adding `fix: true` to the configuration file `.markdownlint-cli2.jsonc`.

## Working on search

If you want to work on the way search works on docs, follow the below instructions.

1. Create your own [algolia](https://www.algolia.com/) account to use for development
1. Either take your admin API key for your account, or create an API key with write permissions. Create a file `./jekyll/_algolia_api_key` with the API key as its content.
1. Update the `application_id` and `api_key` fields in the algolia section of `./jekyll/_config.yml` to match your own account. Do not commit these changes.
1. Index the blog content to your own account via `bundle exec jekyll algolia`. If you have docs running in a container via docker compose, you can run `docker exec -it circleci-docs_jekyll_1 /bin/bash` to SSH into the container, cd into `./jekyll` and run the aforementioned command. You will see an error regarding the number of records being too high - this shouldn't matter for development, just be aware the search index you're using locally is incomplete.
1. You should now be able to search your own index via the locally running docs.

## Editing Docs Locally

The docs site includes Bootstrap 3, JS, and CSS, so you'll have access to all of its [reusable components](https://v4-alpha.getbootstrap.com/components/alerts/).

All docs live in folders named after the version of CircleCI. The only two you need to worry about are `jekyll/_cci1` and `jekyll/_cci2`. These correspond to CircleCI Classic and CircleCI 2.0, respectively.

1. Create a branch and switch to it:

    `git checkout -b <branch-name>`

2. Add or modify Markdown files in these directories according to our [style guide](CONTRIBUTING#style-guide).

3. When you're happy with your changes, commit them with a message summarizing what you did:

    `git commit -am "commit message"`

4. Push your branch up:

    `git push origin <branch-name>`

## Adding New Articles

New articles can be added to the [jekyll/_cci2](https://github.com/circleci/circleci-docs/tree/master/jekyll/_cci2) directory in this repo.

When you make a new article, you'll need to add [**front matter**](https://jekyllrb.com/docs/frontmatter/). This contains metadata about the article you're writing and is required so everything works on our site.

Front matter for our docs will look something like:

```
---
layout: classic-docs
title: "Your Doc Title"
short-title: "Short Title"
categories: [category-slug]
order: 10
---
```

`layout` and `title` are the only required variables. `layout` describes visual settings shared across our docs. `title` will appear at the top of your article and appear in hypenated form for the URL.

The remaining variables (`categories`, `short-title`, and `order`) are deprecated and no longer used in documentation. Navigation links to each article are manually added to category landing pages. If you're having trouble deciding where to put an article, a CircleCI docs lead can help.

### Headings & Tables of Contents

Jekyll will automatically convert your article's title into a level one heading (#), so we recommend using level two (##), level three (###) and level four (####) headings when structuring your article.

If your article has more than three headings after the title, please use a table of contents. To add a table of contents, use the following reference name:

```
* TOC
{:toc}
```

This will create an unordered list for every heading level in your article (the `* TOC` line will not display).

If you want to exclude a heading from a TOC, you can specify that with another reference name:

```
# Not in the TOC
{:.no_toc}
```

## Submitting Pull Requests

After you are finished with your changes, please follow our [Contributing Guide](CONTRIBUTING.md) to submit a pull request.

## Docker Tag List for CircleCI Convenience Images

The Docker tag list for convenience images, located in ./jekyll/_cci2/circleci-images.md, is dynamically updated during a CircleCI build.
There's usually no need to touch this.
If you'd like to see an updated list generated locally however, you can do so by running `./scripts/pull-docker-image-tags.sh` from the root of this repo.
Note that you'll need the command-line tool [jq](https://stedolan.github.io/jq/) installed.

## Updating the API Reference

Our API is handled in two possible places currently:
- [Old version](https://circleci.com/docs/api/v1-reference/) - This currently
  accessible via the CircleCI landing page > Developers Dropdown > "Api"
- [New Version using Slate](https://circleci.com/docs/api/v1/#section=reference) -
  A newer API guide, built with [Slate](https://github.com/lord/slate)

**What is Slate?**

Slate is a tool for generating API documentation. Slate works by having a user
clone or fork its Github Repo, having the user fill in the API spec into a
`index.html.md` file, and then generating the static documentation using Ruby
(via `bundler`).

**How do we use Slate?**

We have cloned slate into our docs repo ("vendored" it) so that the whole
project is available under `circleci-docs/src-api`. Because Slate is not a
library, it is required that we vendor it and use its respective build
steps to create our API documentation.

**Making changes to the documentation**

When it comes time to make changes to our API, start with the following:

- All changes to the API happen in `circleci-docs/src-api/source/` folder.
- Our API documentation is broken up into several documents in the `source/includes` folder. For example, all API requests related to `Projects` are found in the `circleci-docs/src-api/source/includes/_projects.md` file.
- Within the `/source` folder, the `index.html.md` has an `includes` key in the front matter. The includes key gathers the separated files in the `includes` folder and merges them into a single file at build time.
- Because Slate builds the entire API guide into a _single html_ file, we can view the artifact file on CircleCI whenever a build is run.

The following is an example workflow to contribute to a document (from Github, no less):

- Navigate to the file you want to edit (example: [`src-api/source/includes/_projects.md`](https://github.com/circleci/circleci-docs/blob/master/src-api/source/includes/_projects.md))
- Click the `edit` button on GitHub and make your changes.
- Commit your changes and submit a PR.
- Go to the CircleCI web app, find the build for the latest commit for your PR
- Go to the `Artifacts` tab and navigate to `circleci-docs/api/index.html` to view the built file.

**Local Development with Slate**

- If you want to see your changes live before committing them, `cd` into
  `src-api` and run `bundle install` followed by `bundle exec middleman server`.
- You may need a specific version of Ruby for bundler to work (2.3.1).

## Preview Deploy

If your branch ends with `-preview` and passed all tests, docs pages are automatically deployed to our preview site. The link to the preview site will appear at the end `deploy-preview` job in CircleCI.

Note that preview deploys will be automatically cleaned up after certain time so that you don't have to do it manually.
