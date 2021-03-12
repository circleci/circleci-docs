---
layout: classic-docs
title: "Using the CircleCI In-app Configuration Editor"
description: "Docs page on In-app configuration editor use and features"
version:
- Cloud
- Server v2.x
---

A UI environment, the CircleCI config editor, is provided for users who wish to modify their configurations without the use of the
[CircleCI CLI]({{ site.baseurl }}/2.0/local-cli/).

![Config Editor]({{ site.baseurl }}/assets/img/docs/config-editor-main.png)

The benefits of using the CircleCI config editor include:

- Automatic validation and error checking
- Auto-completion suggestions and configuration tooltips specific to CircleCI configuration syntax
- Education of CircleCI concepts
- Easily accessible CircleCI documentation, designed to best-suit your needs

## Getting started with the CircleCI config editor

In the CircleCI app, select a pipeline in the **All Pipelines** view.

To access the CircleCI Configuration Editor, select your desired branch from the *All Branches*
drop-down menu near the top of the screen.

You can also access the config editor:

- Upon selecting the **Set Up Project** button in the **Projects** view
- By selecting the 3 dots in the **Actions** column in the **Pipelines** view, then selecting *Configuration File* from the modal
- By selecting a job in the **Pipelines** view, selecting the 3 dots in the upper-right corner, and then selecting **Configuration File**

![Config Editor Access]({{ site.baseurl }}/assets/img/docs/config-editor-all-branches.png)

Once you select a branch, the **Edit Config** button will become enabled. Click it to access the configuration editor.

## Auto-completion

Like many traditional IDEs, the CircleCI configuration editor will provide auto-complete suggestions as you type, as well
as any supporting documentation.

![Auto-completion]({{ site.baseurl }}/assets/img/docs/config-editor-auto-complete.png)

## Smart tooltips

When hovering over a CircleCI definition in your configuration file, a tooltip will appear, giving you additional information specific to CircleCI configuration syntax.

![Tooltips]({{ site.baseurl }}/assets/img/docs/config-editor-tooltips.png)

## Automatic validation

The config editor will automatically validate your configuration yaml after every change.

At the bottom of the editor, you can verify that your configuration is valid.

For a valid configuration, you will see the following:

![Passing Configuration]({{ site.baseurl }}/assets/img/docs/config-editor-validate-pass.png)

For a failing validation, a red bar is displayed, as well as any errors, where they occur, and any relevant documentation 
that may assist in fixing the error (see the "DOCS" tab in the below screen shot).

![Failing Configuration]({{ site.baseurl }}/assets/img/docs/config-editor-validate-fail.png)

## Commit and run

Once your configuration is valid, you may commit to your VCS and re-run the pipeline, all from within the Config Editor,
by selecting the *Commit and Run* button in the upper-right corner.

![Commit and Run]({{ site.baseurl }}/assets/img/docs/config-editor-commit-and-run.png)

## See also

- [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/)
- [Using the CircleCI CLI]({{ site.baseurl }}/2.0/local-cli)