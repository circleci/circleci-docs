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

To run your very first build on CircleCI, go to the [Sign Up](https://circleci.com/signup/){:target="_blank"} page. Sign up with your GitHub or Bitbucket account, or your email address for the option to connect to your code later in the process.

## Sign up with GitHub or BitBucket
{: #vcs-signup }

1. Click on either **Sign Up with GitHub** or **Sign Up with Bitbucket** to start the authentication process and allow CircleCI to access your code. **Note:** if you are using GitHub, you have the option to limit CircleCI, preventing access to your private repositories. To do this, use the drop down menu at the side of the Sign Up button, and select Public Repos Only from the list.
    <!-- start: experiment code - #docs-discovery -->
    <div class="signup-and-try-block">
      <div class="signup-buttons">
        <div class="signup-button-wrapper gh-signup-button-wrapper">
          <a class="track-signup-link gh-signup-button no-external-icon" target="_blank" href="https://circleci.com/auth/vcs-connect?connection=Github">
            <img class="gh-icon" src="{{site.baseurl}}/assets/img/icons/companies/github.svg"/>
            <div class="button-text">Sign up with GitHub</div>
          </a>
          <button class="gh-dropdown-button">
            <div class="gh-dropdown-caret"></div>
          </button>
          <ul class="gh-signup-dropdown">
            <li><a class="gh-link track-signup-link" target="_blank" href="https://circleci.com/login/">All Repos</a></li>
            <li><a class="gh-link track-signup-link" target="_blank" href="https://circleci.com/login-public/">Public Repos Only</a></li>
          </ul>
        </div>
        <div class="signup-button-wrapper">
          <a href="https://circleci.com/auth/vcs-connect?connection=Bitbucket" target="_blank" class="track-signup-link bb-signup-button no-external-icon">
            <img class="gh-icon" src="{{site.baseurl}}/assets/img/icons/companies/bitbucket.svg"/>
            <div class="button-text">Sign up with BitBucket</div>
          </a>
        </div>
      </div>
    </div>
    <!-- end: experiment code -->
2. Type your GitHub or Bitbucket username, password, and two-factor authorization if applicable, then click Sign In/Login.

3. Click the Authorize Application or equivalent button. The CircleCI Pipelines Dashboard appears.

4. Use the Projects page of the CircleCI app to start building your project code.

## Sign up with email
{: #email-signup }

1. Click **Sign Up with Email**.

    <!-- start: experiment code - #docs-discovery -->
    <div class="signup-and-try-block">
      <div class="signup-button-wrapper">
        <div class="signup-buttons">
        <a href="https://circleci.com/auth/signup/" class="track-signup-link email-signup-button no-external-icon">
            <img class="gh-icon" src="{{site.baseurl}}/assets/img/icons/companies/circleci.svg"/>
            <div class="button-text">Sign Up with Email</div>
        </a>
        </div>
      </div>
    </div>
    <!-- end: experiment code -->

2. Enter your email address, and then set a secure password for your CircleCI account. A verification email is sent to the email address provided.

3. Select the options that best describe you and your engineering organization.

4. Connect to your code, or explore some example projects within the CircleCI app if you don't want to connect to your code at this time.

    - Connect to your GitHub or Bitbucket account to build and deploy your projects on CircleCI. Type your GitHub or Bitbucket username, password, and two-factor authorization if applicable, then click Sign In/Login.
    - Explore the app using a popular open source project building on CircleCI ([React by Facebook](https://app.circleci.com/pipelines/github/facebook/react)), or one of our own sample projects: a [sample JavaScript app](https://app.circleci.com/pipelines/github/CircleCI-Public/sample-javascript-cfd/), and a [sample Python app](https://app.circleci.com/pipelines/github/CircleCI-Public/sample-python-cfd/). You'll be able to start exploring features such as [pipelines]({{ site.baseurl }}/2.0/pipelines/) and [workflows]({{ site.baseurl }}/2.0/workflows). The Dashboard, Projects, Organization Settings, and Plan pages are not available until you connect your GitHub or Bitbucket accounts.

## Terms
{: #terms}

By signing up, you are agreeing to our [SaaS Agreement](https://circleci.com/terms-of-service/) and [Privacy Policy](https://circleci.com/privacy/). We ask for read/write access to make your experience seamless on CircleCI. If you are a GitHub user and aren’t ready to share access to your private projects, you can choose public repos instead. Protected by reCAPTCHA, Google [Privacy Policy](https://policies.google.com/privacy?hl=en) and [Terms of Service](https://policies.google.com/terms?hl=en) apply.

## Next steps
{: #next-steps }

- Go to [Hello World]({{ site.baseurl }}/2.0/hello-world/) page to learn the basics of setting up projects, switching orgs, and the [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file that determines your execution environment and automates your tests.
- Read the [Concepts]({{ site.baseurl }}/2.0/concepts/) page for an overview of foundational CircleCI concepts such as pipelines, executors and images, workflows, and jobs.
