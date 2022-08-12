---
layout: classic-docs
title: "Using the CircleCI In-app Configuration Editor"
description: "Docs page on In-app configuration editor use and features"
version:
- Cloud
- Server v4.x
- Server v3.x
---

With the CircleCI configuration editor, you can modify your configuration files without the use of the [CircleCI CLI]({{site.baseurl}}/local-cli/) or a text editor. Using the CircleCI configuration editor gives you the ability to modify your CI/CD processes quickly, and in a unified fashion.

![Configuration Editor]({{site.baseurl}}/assets/img/docs/config-editor-main.png)

The benefits of using the CircleCI configuration editor include:

- Automatic validation and error checking
- Auto-complete suggestions
- Configuration tooltips specific to CircleCI configuration syntax
- Education of CircleCI concepts
- Easily accessible CircleCI documentation

## Getting started with the CircleCI configuration editor
{: #getting-started-with-the-circleci-configuration-editor }

In the [CircleCI web UI](https://app.circleci.com/), select a pipeline in the **Dashboard's All Pipelines** view.

To access the CircleCI configuration editor, select your desired branch from the **All Branches** drop-down menu near the top of the screen. Once you select a branch, the **Edit Config** button will become enabled, and you can access the configuration editor.

![Configuration Editor Access]({{site.baseurl}}/assets/img/docs/config-editor-all-branches.png)

There are a few other ways to access configuration files throughout the web UI. If you are setting up a project through the **Set Up Project** button, you will see a **Fast** option, which will bring you to a default configuration file to edit (to be used if your repository does not already have a configuration file).

In the **Pipelines** view in a pipeline's row, and in the **Workflows** view at the top of the page, you will see the three dot menu (meatball menu). Clicking this menu will allow you to open the configuration file.

## Auto-completion
{: #auto-completion }

The CircleCI configuration editor provides auto-complete suggestions as you type, with the ability to click on a suggestion to find out more. You will also find links to relevant documentation within the auto-completion tooltip.

![Auto-completion]({{site.baseurl}}/assets/img/docs/config-editor-auto-complete.png)

## Configuration tab options
{: #configuration-menu }

At the bottom of the editor, you will see tabs for **Linter**, **Docs**, and the name of your workflow (in this case **Sample**).

The built in linter will validate your YAML after every change and show you errors if there is a problem. A green or red bar is always visible across the bottom of the page, and will indicate if your YAML is valid (green) or has an error (red). There is also a toggle switch to view the YAML as JSON within the validation bar.

The docs tab will link out to some helpful documentation relating to configuration files.

The workflow tab will show you all the jobs in the workflow, and link out to the individual job's **Job** view in the web UI.

![Suggested Docs]({{site.baseurl}}/assets/img/docs/config-editor-docs.png)

When hovering over a key-value pair in your configuration file, a tooltip will appear, giving you additional information specific to CircleCI configuration syntax.

![Tooltips]({{site.baseurl}}/assets/img/docs/config-editor-tooltips.png)

## Save and run
{: #save-and-run }

Once your changes are made and your configuration is valid, you may commit to your VCS and re-run the pipeline by clicking the **Save and Run** button. A modal will pop up, and you will see the option to commit on the branch you are working from, or you can choose to create a new branch for the commit.

If you are not making changes on your main branch, you will need to open a pull request on your VCS to save the changes to your main branch when you are ready.

![Save and run]({{site.baseurl}}/assets/img/docs/config-editor-commit-and-run.png)

## See also
{: #see-also }

- [CircleCI Configuration Reference]({{site.baseurl}}/configuration-reference)
- [Using the CircleCI CLI]({{site.baseurl}}/local-cli)
