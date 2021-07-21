---
layout: classic-docs
title: "Security recommendations"
category: [administration]
order: 5
description: "CircleCI security recommendations."
---

This document outlines recommended best practices to ensure the security of your data and secrets when using CircleCI.

* TOC
{:toc}

## Checklist for using CircleCI securely as a customer
{: #checklist-for-using-circleci-securely-as-a-customer }

If you are getting started with CircleCI, there are some security best practices you can ask your team to consider as _users_ of CircleCI:

- Minimize the number of secrets (private keys / environment variables) your
  build needs and rotate secrets regularly.
  - It is important to rotate secrets regularly in your organization, especially as team members come and go.
  - Rotating secrets regularly means your secrets are only active for a certain amount of time, helping to reduce possible risks if keys are compromised.
  - Ensure the secrets you _do_ use are of limited scope - with only enough permissions for the purposes of your build. Understand the role and permission systems of other platforms you use outside of CircleCI; for example, IAM permissions on AWS, or GitHub's [Machine User](https://developer.github.com/v3/guides/managing-deploy-keys/#machine-users) feature.
- Sometimes user misuse of certain tools might accidentally print secrets to stdout which will land in your logs. Please be aware of:
  - running `env` or `printenv` which will print all your environment variables to stdout.
  - literally printing secrets in your codebase or in your shell with `echo`.
  - programs or debugging tools that print secrets on error.
- Consult your VCS provider's permissions for your organization (if you are in an organizations) and try to follow the [Principle of Least Privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege).
- Use Restricted Contexts with teams to share environment variables with a select security group. Read through the [contexts]({{ site.baseurl }}/2.0/contexts/#restricting-a-context) document to learn more.
- Ensure you audit who has access to SSH keys in your organization.
- Ensure that your team is using Two-Factor Authentication (2FA) with your VCS ([Github 2FA](https://help.github.com/en/articles/securing-your-account-with-two-factor-authentication-2fa), [Bitbucket](https://confluence.atlassian.com/bitbucket/two-step-verification-777023203.html)). If a user's GitHub or Bitbucket account is compromised a nefarious actor could push code or potentially steal secrets.
- If your project is open source and public, please make note of whether or not you want to share your environment variables. On CircleCI, you can change a project's settings to control whether your environment variables can pass on to _forked versions of your repo_. This is **not enabled** by default. You can read more about these settings and open source security in our [Open Source Projects document]({{site.baseurl}}/2.0/oss/#security).


## See also
{: #see-also }
{:.no_toc}

[GitHub and Bitbucket Integration]({{ site.baseurl }}/2.0/gh-bb-integration/)
