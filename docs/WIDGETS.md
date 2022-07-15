# CircleCI Docs: Widgets & Plugins

This page details some of the augmentations either in the documentation presentation, built process etc.

## Tabbed HTML Elements

![Tabbed Code Blocks Widget Screenshot](./assets/widget-tabbed-code-blocks.gif)

Tabbed HTML elements allow you to create tabs to display alternate versions of something. The example gif above shows how you can use tabbed  blocks to display different version of a screenshot between CircleCI Cloud and Server.

Here's how this would look in Jekyll's Markdown:

```md
{:.tab.jobscreenshot.Cloud}
![Some alt text]({{ site.baseurl }}/assets/img/docs/new-job-page.png)

{:.tab.jobscreenshot.Server}
![Some alt text]({{ site.baseurl }}/assets/img/docs/old-job-page.png)
```

And in asciidoc:

```adoc
[.tab.jobscreenshot.Cloud]
--
Description text paragraph blah blah

.Image titlex
image::new-job-page.png[Some alt text]
--

[.tab.jobscreenshot.Server]
--
Description text paragraph blah blah

.Image title
image::old-job-page.png[Some alt text]
--
```

Using the example line `{:.tab.jobscreenshot.Cloud}`, let's look at how usage of tabs is broken down.

`.tab` creates a class called "tab"; it must be the first class.

Next, you have a string that can be (almost) anything. In this case it is `jobscreenshot`. It could just as easily be `my_code_sample`. All tabs that share this group name will be grouped together.

Finally, you have the third part of the tab classes: `Cloud`. This is the _name_ of the tab as it will appear in the UI. 

### Limitations:

Periods (`.`) and spaces (` `) aren't supported in tab names.
Instead, use an underscore (`_`) and dash (`-`) respectively and they'll be rendered correctly.


## OS Version Matrix

![OS Version Matrix Widget Screenshot](./assets/widget-os-matrix.png)

Use this widget to display which version (if any) of some software is available on a given operating system (OS) supported by CircleCI. This only applies to CircleCI 1.0.

Version numbers can be passed as either strings or from Jekyll datafiles.

```
{% include os-matrix.html trusty=site.data.trusty.versions.summary.docker precise="v1.7.1" macos="n/a" %}
```

If an OS doesn’t support some software, there’s no need to pass any variable at all.

For example, if we had software that was only compatible with Ubuntu 14.04 “Trusty”, we would write:

```
{% include os-matrix.html trusty=site.data.trusty.versions.summary.docker %}
```

## Unused Image cleanup

This is a Jekyll plugin that can detect what images aren't being used in our docs anymore and moves them to `assets/img/docs/_unused/`. You can find the source code for the script in `jekyll/_plugins/find_unused_images.rb`. The plugin hooks into Jekyll's build process and is turned off by default. 
