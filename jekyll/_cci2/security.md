---
layout: classic-docs
title: "Security Features"
category: [administration]
order: 5
description: "CircleCI security features."
---

This document outlines security features built into CircleCI and related integrations.

* TOC
{:toc}

## Overview
Security is our top priority at CircleCI, we are proactive and we act on security issues immediately. Report security issues to <security@circleci.com> with an encrypted message using our security team's GPG key (ID: 0x4013DDA7, fingerprint: 3CD2 A48F 2071 61C0 B9B7 1AE2 6170 15B8 4013 DDA7).

## Encryption
CircleCI uses HTTPS or SSH for all networking in and out of our service including from the browser to our services application, from the services application to your builder fleet, from our builder fleet to your source control system, and all other points of communication. In short, none of your code or data travels to or from CircleCI without being encrypted unless you have code in your builds that does so at your discretion. Operators may also choose to go around our SSL configuration or not use TLS for communicating with underlying systems.

The nature of CircleCI is that our software has access to your code and whatever data that code interacts with. All jobs on CircleCI run in a sandbox (specifically, a Docker container or an ephemeral VM) that stands alone from all other builds and is not accessible from the Internet or from your own network. The build agent pulls code via git over SSH. Your particular test suite or job configurations may call out to external services or integration points within your network, and the response from such calls will be pulled into your jobs and used by your code at your discretion. After a job is complete, the container that ran the job is destroyed and rebuilt. All environment variables are encrypted using [Hashicorp Vault](https://www.vaultproject.io/). Environment variables are encrypted using AES256-GCM96 and are unavailable to CircleCI employees.

## Sandboxing
With CircleCI you control the resources allocated to run the builds of your code. This will be done through instances of our builder boxes that set up the containers in which your builds will run. By their nature, build containers will pull down source code and run whatever test and deployment scripts are part of the code base or your configuration. The containers are sandboxed, each created and destroyed for one build only (or one slice of a parallel build), and they are not available from outside themselves. The CircleCI service provides the ability to SSH directly to a particular build container. When doing this a user will have complete access to any files or processes being run inside that build container, so provide access to CircleCI only to those also trusted with your source code.

## Integrations
A few different external services and technology integration points touch CircleCI. The following list enumerates those integration points.

- **Web Sockets** We use [Pusher](https://pusher.com/) client libraries for WebSocket communication between the server and the browser, though for installs we use an internal server called slanger, so Pusher servers have no access to your instance of CircleCI nor your source control system. This is how we, for instance, update the builds list dynamically or show the output of a build line-by-line as it occurs. We send build status and lines of your build output through the web socket server (which unless you have configured your installation to run without SSL is done using the same certs over SSL), so it is encrypted in transit.

- **Replicated** For private installations of CircleCI Server, [Replicated](http://www.replicated.com/) is used to manage the installation wizard, licensing keys, system audit logs, software updates, and other maintenance and systems tasks for CircleCI. Your instance of CircleCI Server communicates with Replicated servers to send license key information and version information to check for updates. Replicated does not have access to your data or other systems, and CircleCI does not send any of your data to Replicated.

- **Source Control Systems** To use CircleCI you will set up a direct connection with your instance of GitHub Enterprise, GitHub.com, or other source control system. When you set up CircleCI you authorize the system to check out your private repositories. You may revoke this permission at any time through your GitHub application settings page and by removing Circle's Deploy Keys and Service Hooks from your repositories' Admin pages. While CircleCI allows you to selectively build your projects, GitHub's permissions model is "all or nothing" — CircleCI gets permission to access all of a user's repositories or none of them. Your instance of CircleCI will have access to anything hosted in those git repositories and will create webhooks for a variety of events (eg: when code is pushed, when a user is added, etc.) that will call back to CircleCI, triggering one or more git commands that will pull down code to your build fleet.

- **Dependency and Source Caches** Most CircleCI customers use S3 or equivalent cloud-based storage inside their private cloud infrastructure (Amazon VPC, etc) to store their dependency and source caches. These storage servers are subject to the normal security parameters of anything stored on such services, meaning in most cases our customers prevent any outside access.

- **Artifacts** It is common to use S3 or similar hosted storage for artifacts. Assuming these resources are secured per your normal policies they are as safe from any outside intrusion as any other data you store there.

- **iOS Builds** If you are paying to run iOS builds on CircleCI hardware your source code will be downloaded to a build box on our macOS fleet where it will be compiled and any tests will be run. Similar to our primary build containers that you control, the iOS builds we run are sandboxed such that they cannot be accessed.

- **Docker** If you are using Docker images, refer to the public Docker [seccomp (security computing mode) profile](https://github.com/docker/engine/blob/e76380b67bcdeb289af66ec5d6412ea85063fc04/profiles/seccomp/default.json) for the Docker engine. CircleCI appends the following to the Docker default `seccomp` profile:

{% raw %}
```
[
  {
    "comment": "Allow create user namespaces",
    "names": [
      "clone",
      "setns",
      "unshare"
    ],
    "action": "SCMP_ACT_ALLOW",
    "args": [],
    "includes": {},
    "excludes": {}
  }
]
```
{% endraw %}

## Audit Logs
Server customers who installed CircleCI on your environments are able to use the audit log feature on UI.
※ Cloud customer needs to [contact CircleCI support](https://support.circleci.com/hc/en-us/requests/new) to request Audit log, and only an admin user of your organization is able to request this.

CircleCI logs important events in the system for audit and forensic analysis purposes. Audit logs are separarate from system logs that track performance and network metrics.

Complete Audit logs may be downloaded from the Audit Log page within the Admin section of the application as a CSV file.  Audit log fields with nested data contain JSON blobs.

**Note:** In some situations, the internal machinery may generate duplicate events in the audit logs. The `id` field of the downloaded logs is unique per event and can be used to identify duplicate entries.

### Audit Log Events
{:.no_toc}

<!-- TODO: automate this from event-cataloger -->
Following are the system events that are logged. See `action` in the Field section below for the definition and format.

- context.create
- context.delete
- context.env_var.delete
- context.env_var.store
- project.env_var.create
- project.env_var.delete
- project.settings.update
- user.create
- user.logged_in
- user.logged_out
- workflow.job.approve
- workflow.job.finish
- workflow.job.scheduled
- workflow.job.start


### Audit Log Fields
{:.no_toc}

- **action:** The action taken that created the event. The format is ASCII lowercase words separated by dots, with the entity acted upon first and the action taken last. In some cases entities are nested, for example, `workflow.job.start`.
- **actor:** The actor who performed this event. In most cases this will be a CircleCI user. This data is a JSON blob that will always contain `id` and and `type` and will likely contain `name`.
- **target:** The entity instance acted upon for this event, for example, a project, an org, an account, or a build. This data is a JSON blob that will always contain `id` and and `type` and will likely contain `name`.
- **payload:** A JSON blob of action-specific information. The schema of the payload is expected to be consistent for all events with the same `action` and `version`.
- **occurred_at:** When the event occurred in UTC expressed in ISO-8601 format with up to nine digits of fractional precision, for example '2017-12-21T13:50:54.474Z'.
- **metadata:** A set of key/value pairs that can be attached to any event. All keys and values are strings. This can be used to add additional information to certain types of events.
- **id:** A UUID that uniquely identifies this event. This is intended to allow consumers of events to identify duplicate deliveries.
- **version:** Version of the event schema. Currently the value will always be 1. Later versions may have different values to accommodate schema changes.
- **scope:** If the target is owned by an Account in the CircleCI domain model, the account field should be filled in with the Account name and ID. This data is a JSON blob that will always contain `id` and `type` and will likely contain `name`.
- **success:** A flag to indicate if the action was successful.
- **request:** If this event was triggered by an external request this data will be populated and may be used to connect events that originate from the same external request. The format is a JSON blob containing `id` (the request ID assigned to this request by CircleCI), `ip_address` (the original IP address in IPV4 dotted notation from which the request was made, eg. 127.0.0.1), and `client_trace_id` (the client trace ID header, if present, from the 'X-Client-Trace-Id' HTTP header of the original request).

## Checklist To Using CircleCI Securely as a Customer

If you are getting started with CircleCI there are some things you can ask your team to consider for security best practices as _users_ of CircleCI:

- Minimise the number of secrets (private keys / environment variables) your
  build needs and rotate secrets regularly.
  - It is important to rotate secrets regularly in your organization, especially as team members come and go.
  - Rotating secrets regularly means your secrets are only active for a certain amount of time, helping to reduce possible risks if keys are compromised.
  - Ensure the secrets you _do_ use are of limited scope - with only enough permissions for the purposes of your build. Consider carefully adjudicating the role and permission systems of other platforms you use outside of CircleCI; for example, when using something such as IAM permissions on AWS, or Github's [Machine User](https://developer.github.com/v3/guides/managing-deploy-keys/#machine-users) feature.
- Sometimes user misuse of certain tools might accidentally print secrets to stdout which will land in your logs. Please be aware of:
  - running `env` or `printenv` which will print all your environment variables to stdout.
  - literally printing secrets in your codebase or in your shell with `echo`.
  - programs or debugging tools that print secrets on error.
- Consult your VCS provider's permissions for your organization (if you are in an organizations) and try to follow the [Principle of Least Privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege).
- Use Restricted Contexts with teams to share environment variables with a select security group. Read through the [contexts]({{ site.baseurl }}/2.0/contexts/#restricting-a-context) document to learn more.
- Ensure you audit who has access to SSH keys in your organization.
- Ensure that your team is using Two-Factor Authentication (2FA) with your VCS ([Github 2FA](https://help.github.com/en/articles/securing-your-account-with-two-factor-authentication-2fa), [Bitbucket](https://confluence.atlassian.com/bitbucket/two-step-verification-777023203.html)). If a user's GitHub or Bitbucket account is compromised a nefarious actor could push code or potentially steal secrets.
- If your project is open source and public, please make note of whether or not you want to share your environment variables. On CircleCI, you can change a project's settings to control whether your environment variables can pass on to _forked versions of your repo_. This is **not enabled** by default. You can read more about these settings and open source security in our [Open Source Projects document]({{site.baseurl}}/2.0/oss/#security).


## See Also
{:.no_toc}

[GitHub and Bitbucket Integration]({{ site.baseurl }}/2.0/gh-bb-integration/)
