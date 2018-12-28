---
layout: classic-docs
title: Adding Status Badges
description: How to embed a CircleCI status badge in any web page or document
---

This document describes how to create a badge that displays your project's build status (passed or failed) in a README or other document.

## Overview

Status badges are commonly embedded in project READMEs,
although they can be placed in any web document.
CircleCI provides a tool to generate embed code for status badges.
By default, a badge displays the status of a project's default branch,
though you can also select other branches.

You can generate code for the following formats:

- Image URL
- Markdown
- Textile
- Rdoc
- AsciiDoc
- reStructuredText
- pod

## Steps

1. In the _Notifications_ section of your project's settings,
   click _Status Badges_.
2. By default, the badge displays the status of your project's default branch.
   If you want to show the status of a different branch,
   use the _Branch_ dropdown menu to select it.
3. (Optional)
   If your project is private,
   you will need to [create a project API token]({{ site.baseurl }}/2.0/managing-api-tokens/#creating-a-project-api-token).
4. (Optional)
   If you created a token in the previous step,
   select the token you want to use in the _API Token_ dropdown menu.
5. Select the appropriate language from the _Embed Code_ dropdown menu.
6. Copy and paste the generated link in the document where you want to display the status badge.

## Customization

If you find the default status badge too minimal,
you can use the [shield style](https://shields.io/).
To use the shield style,
replace `style=svg` with `style=shield`
in the link you generated above.

## See Also

[Status]({{ site.baseurl }}/2.0/status/)
