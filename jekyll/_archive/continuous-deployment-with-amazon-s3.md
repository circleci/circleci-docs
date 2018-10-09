---
layout: classic-docs
title: Continuous Deployment with Amazon S3
categories: [how-to]
description: Continuous Deployment with Amazon S3
sitemap: false
---


Deploying to an Amazon S3 bucket is pretty straight-forward with CircleCI due 
to preinstalled support for Amazon's [awscli][awscli-link].

## Authentication

The easiest way to authenticate `awscli` is to set the *Access Key ID* and 
*Secret Access Key* in your Project's Settings page on CircleCI. Here you can 
see an image of what the page looks like and where the navigation link is for CircleCI 
Docs.

<span class="align-center">![](  {{ site.baseurl }}/assets/img/docs/aws-permissions.png)</span>

Create a new [IAM][iam-link] user specifically for CircleCI. This is best 
practice for security purposes. You can also authenticate with `awscli` using 
other support methods such as environment variables, "profile" files, etc.

## Deployment

To deploy a project to S3, you can use the following command in the `deployment` 
section of `circle.yml`:

```aws s3 sync <path-to-files> s3://<bucket-URL> --delete```

For example, here is a snippet of a `circle.yml` file that shows how we deploy 
CircleCI Docs:

```
#...
deployment:
  prod:
    branch: master
    commands:
      - aws s3 sync jekyll/_site/docs s3://circle-production-static-site/docs/ --delete
#...
```



[awscli-link]: https://aws.amazon.com/cli/
[iam-link]: http://docs.aws.amazon.com/general/latest/gr/root-vs-iam.html
