---
layout: classic-docs
title: "Sign Up and Try CircleCI"
short-title: "Sign Up and Try CircleCI"
description: "First step for using CircleCI"
categories: [getting-started]
order: 2
version:
- Cloud
---

To run your very first build on CircleCI, go to the [Sign Up](https://circleci.com/signup/) page. Sign up with your GitHub or Bitbucket account, or your email address for the option to connect to your code (including your GitLab projects) later in the process.

## Sign up with GitHub or Bitbucket
{: #vcs-signup }

1. Click on either [**Sign Up with GitHub**](https://circleci.com/auth/vcs-connect?connection=Github) or [**Sign Up with Bitbucket**](https://circleci.com/auth/vcs-connect?connection=Bitbucket) to start the authentication process and allow CircleCI to access your code.   

    If you are using GitHub, you have the option to limit CircleCI, preventing access to your private repositories. To do this, use the drop down menu at the side of the Sign Up button, and select **Public Repos Only** from the list.
    {: class="alert alert-info"}  

2. Type your GitHub or Bitbucket username, password, and two-factor authorization if applicable, then click **Sign In/Login**.

3. Click the **Authorize Application** or equivalent button. You will be redirected to the CircleCI pipelines dashboard.

4. Use the **Projects** page of the CircleCI app to start building your project code.

## Sign up with GitLab
{: #gitlab-signup }

1. Click [**Sign Up with GitLab**](https://circleci.com/auth/signup/).

2. Enter your email address, and then set a secure password for your CircleCI account. A verification email is sent to the email address provided.

3. You will be taken to a screen with the option to create a new project from your GitLab repository. Follow the prompts to connect to your GitLab account. Once you have selected a repository and created a new project, you will be redirected to the CircleCI web app dashboard.

The full set of documentation for integrating GitLab with CircleCI can be found on the [GitLab SaaS integration page]({{site.baseurl}}/gitlab-integration).
{: class="alert alert-info"}

## Sign up with email
{: #email-signup }

1. Click [**Sign Up with Email**](https://circleci.com/auth/signup/).

2. Enter your email address, and then set a secure password for your CircleCI account. A verification email is sent to the email address provided.

3. If you do not want to connect to your code and only wish to continue with the email signup, click **Cancel**. You will be taken to a screen where you can respond to prompts that best describe your role and your engineering organization.

4. Explore some example projects within the CircleCI app if you do not want to connect to your code at this time. You can take a look at a popular open source project building on CircleCI ([React by Facebook](https://app.circleci.com/pipelines/github/facebook/react)), or one of our own sample projects: a [sample JavaScript app](https://app.circleci.com/pipelines/github/CircleCI-Public/sample-javascript-cfd/), and a [sample Python app](https://app.circleci.com/pipelines/github/CircleCI-Public/sample-python-cfd/).   

You will be able to start exploring features such as [pipelines]({{site.baseurl}}/pipelines/) and [workflows]({{site.baseurl}}/workflows). The Dashboard, Projects, Organization Settings, and Plan pages are not available until you connect your code.  

Otherwise, when you are ready, you can connect to your GitHub, BitBucket, or GitLab accounts from the CircleCI web app.  

## Terms
{: #terms}

By signing up, you are agreeing to our [SaaS Agreement](https://circleci.com/terms-of-service/) and [Privacy Policy](https://circleci.com/privacy/). We ask for read/write access to make your experience seamless on CircleCI. If you are a GitHub user and aren’t ready to share access to your private projects, you can choose public repos instead. Protected by reCAPTCHA, Google [Privacy Policy](https://policies.google.com/privacy?hl=en) and [Terms of Service](https://policies.google.com/terms?hl=en) apply.

## Next steps
{: #next-steps }

- Go to [Hello World]({{ site.baseurl }}/hello-world/) page to learn the basics of setting up projects, switching orgs, and the [`.circleci/config.yml`]({{ site.baseurl }}/configuration-reference/) file that determines your execution environment and automates your tests.
- Read the [Concepts]({{ site.baseurl }}/concepts/) page for an overview of foundational CircleCI concepts such as pipelines, executors and images, workflows, and jobs.
