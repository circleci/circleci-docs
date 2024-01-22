---
layout: classic-docs
title: Adding Status Badges
description: How to embed a CircleCI status badge in any web page or document
contentTags:
  platform:
  - Cloud
  - Server v4.x
  - Server v3.x
---

This document describes how to create a badge that displays your project's build status (passed or failed) in a README or other document.

## Overview
{: #overview }

Status badges are commonly embedded in project READMEs, although they can be placed in any web document. CircleCI provides a tool to generate embed code for status badges. By default, a badge displays the status of a project's default branch, though you can also display the status of specific branches.

A badge status allows teams to quickly see build statuses in their repo. Badges change appearance depending on their status (success, failure).

You can generate code for the following formats:
- Image URL
- Markdown
- Textile
- Rdoc
- AsciiDoc
- reStructuredText
- pod

## Generating a status badge
{: #generating-a-status-badge }

To generate your own status badge, you will need to know, and substitute, the following variables in the code snippets below:

- `<PROJECT_NAME>` - Your project's name. Example: `circleci-docs`
- `<ORG_NAME>` - The organization or user name the project in question belongs to
- `<VCS>` - your VCS provider (`gh` for "github" and `bb` for Bitbucket)
- `<LINK>` - The link you want the status badge to go to when clicked (example: the pipeline overview page)
- Optional: an API token (to create badges for private projects)

The following examples demonstrate how to generate a status badge for various template languages. Each example also provides a status badge code for a specific branch.

{:.tab.status.Markdown}
```text
# Template:
[![<ORG_NAME>](https://circleci.com/<VCS>/<ORG_NAME>/<PROJECT_NAME>.svg?style=svg)](<LINK>)

# Example:
[![CircleCI](https://circleci.com/gh/circleci/circleci-docs.svg?style=svg)](https://circleci.com/gh/circleci/circleci-docs)

# Example for specific branch:
[![CircleCI](https://circleci.com/gh/circleci/circleci-docs/tree/teesloane-patch-5.svg?style=svg)](https://circleci.com/gh/circleci/circleci-docs/?branch=teesloane-patch-5)
```

{:.tab.status.Textile}
```text
# Template:
!https://circleci.com/<VCS>/<ORG_NAME>/<PROJECT_NAME>.svg?style=svg!:<LINK>

# Example:
!https://circleci.com/gh/circleci/circleci-docs.svg?style=svg!:https://circleci.com/gh/circleci/circleci-docs

# Example for specific branch:
!https://circleci.com/gh/circleci/circleci-docs/tree/teesloane-patch-5.svg?style=svg!:https://circleci.com/gh/circleci/circleci-docs/?branch=teesloane-patch-5
```

{:.tab.status.Rdoc}
```text
# Template:
{<img src="https://circleci.com/<VCS>/<ORG_NAME>/<PROJECT_NAME>.svg?style=svg" alt="<ORG_NAME>" />}[https://circleci.com/gh/<ORG_NAME>/<PROJECT_NAME>]

# Example:
{<img src="https://circleci.com/gh/circleci/circleci-docs.svg?style=svg" alt="CircleCI" />}[https://circleci.com/gh/circleci/circleci-docs]

# Example for specific branch:
{<img src="https://circleci.com/gh/circleci/circleci-docs/tree/teesloane-patch-5.svg?style=svg" alt="CircleCI" />}[https://circleci.com/gh/circleci/circleci-docs/?branch=teesloane-patch-5]
```

{:.tab.status.Asciidoc}
```text
# Template:
image:https://circleci.com/<VCS>/<ORG_NAME>/<PROJECT_NAME>.svg?style=svg["<ORG_NAME>", link="https://circleci.com/<VCS>/<ORG_NAME>/<PROJECT_NAME>"]

# Example:
image:https://circleci.com/gh/circleci/circleci-docs.svg?style=svg["CircleCI", link="https://circleci.com/gh/circleci/circleci-docs"]

# Example for specific branch:
image:https://circleci.com/gh/circleci/circleci-docs/tree/teesloane-patch-5.svg?style=svg["CircleCI", link="https://circleci.com/gh/circleci/circleci-docs/?branch=teesloane-patch-5"]
```

{:.tab.status.reStructuredText}
```text
# Template:
.. image:: https://circleci.com/<VCS>/<ORG_NAME>/<PROJECT_NAME>.svg?style=svg
    :target: https://circleci.com/<VCS>/<ORG_NAME>/<PROJECT_NAME>

# Example:
.. image:: https://circleci.com/gh/circleci/circleci-docs.svg?style=svg
    :target: https://circleci.com/gh/circleci/circleci-docs

# Example for specific branch:
.. image:: https://circleci.com/gh/circleci/circleci-docs/tree/teesloane-patch-5.svg?style=svg
    :target: https://circleci.com/gh/circleci/circleci-docs/?branch=teesloane-patch-5
```

{:.tab.status.pod}
```text
# Template:
=for HTML <a href="https://circleci.com/<VCS>/<ORG_NAME>/<PROJECT_NAME>"><img src="https://circleci.com/<VCS>/<ORG_NAME>/<PROJECT_NAME>.svg?style=svg"></a>

# Example:
=for HTML <a href="https://circleci.com/gh/circleci/circleci-docs"><img src="https://circleci.com/gh/circleci/circleci-docs.svg?style=svg"></a>

# Example for specific branch:
=for HTML <a href="https://circleci.com/gh/circleci/circleci-docs/?branch=teesloane-patch-5"><img src="https://circleci.com/gh/circleci/circleci-docs/tree/teesloane-patch-5.svg?style=svg"></a>

```

## Creating badges for private repositories
{: #creating-badges-for-private-repositories }

**NOTE:** To create a status badge for a private project you will need to create an **api token** _specifically scoped to "status"_ and include that token in the url string of your badge. Consider the following markdown image badge snippet against the original markdown example above; it has a URL parameter for a token added.

```markdown
[![CircleCI](https://circleci.com/<VCS>/<ORG_NAME>/<PROJECT_NAME>.svg?style=svg&circle-token=<YOUR_STATUS_API_TOKEN>)](<LINK>)
```

To create a status API token, go to the [CircleCI web app](https://app.circleci.com/), navigate to a specific project, go to **Project Settings -> API Permissions**, and create a token scoped to `status`.

## Different styles
{: #different-styles }

If you find the default status badge too minimal, you can use the [shield style](https://shields.io/). To use the shield style, replace `style=svg` with `style=shield` in the link you generated above.

![Passed `svg` version]({{site.baseurl}}/assets/img/docs/svg-passed.png)

![Failed `svg` version]({{site.baseurl}}/assets/img/docs/svg-failed.png)

![Passing shield version]({{site.baseurl}}/assets/img/docs/shield-passing.png)

![Failing shield version]({{site.baseurl}}/assets/img/docs/shield-failing.png)
