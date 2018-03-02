---
layout: classic-docs
title: Embedding Build Status Badges
---

[Basics]({{ site.baseurl }}/2.0/basics/) > Embedding Build Status Badges

This document describes how to create a badge that displays your project's build status.
You can generate code for the following formats: Image URL, Markdown, Textile, Rdoc, AsciiDoc, reStructuredText, and pod.

## Overview

CircleCI provides build status badges for projects and branches.
Status badges are commonly embedded in project READMEs,
although they can be placed virtually anywhere.

## Steps

CircleCI provides a tool to generate embed code for status badges.

1. In the _Notifications_ section of your project's settings,
click _Status Badges_.
2. By default,
the badge displays the status of your project's default branch.
If you want to show the status of a different branch,
use the Branch dropdown menu to select it.
3. (Optional)
If your project is private,
you will need an API token for viewing a project's details.
If you haven't created a token yet,
click on the _API Permissions_ in the _Permissions_ section.
Click _Create Token_,
choose the _Status_ scope,
and create  a label for the token.
4. (Optional)
If you created a token in the previous step,
select the token you want to use in the _API Token_ dropdown menu.
5. Select the appropriate language from the _Embed Code_ dropdown menu.
6. Copy and paste the generated link to the document where you want to display the status badge.

## Customization

If you find the standard status badge ugly, you can use the highly-attractive shield style. Behold the difference:

- Standard ![](https://circleci.com/gh/circleci/circle.png?circle-token=3cc80b12ab3627373c76e13735b8bc00a1259b9e)
- Shield ![](https://circleci.com/gh/circleci/circle.svg?style=shield&circle-token=3cc80b12ab3627373c76e13735b8bc00a1259b9e)

To use the shield style, simply replace `style=svg` with `style=shield` in the link you generated above.
