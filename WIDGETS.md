# CircleCI Docs: Widgets

Many documentation pages will have widgets. These are discrete page elements that provide advanced functionality within Markdown.

The widgets available in CircleCI.com/docs/ are:


## Tabbed HTML Elements

![Tabbed Code Blocks Widget Screenshot](img/widget-tabbed-code-blocks.gif)

This allows you to create tabs to display alternate versions of something.
The exampel gif shows how you can use tabbed code blocks to display different
version of a code block between CircleCI v2.1 and 2.0
The example from the screenshot shows how you can use tabbed code blocks to display a CircleCI v2.1 and v2.0 config.

Here's how this would look in Jekyll's Markdown:

````
{:.tab.1.v2_1}
```bash
echo "This is brand new CircleCI v2.1 config!"
```


After the string `tab` you'll see the integer `1`.
This is how tabbed code blocks are grouped.
Everything with `1` appears together in a group.
Everything with `2` will appear in a separate group of tabs, and so on.
If you prefer, you can substitute `1` with any string so long as it is the same
between tabs, so that they may be grouped.

For example, you might group some screenshots of the "Jobs" page into tabs between cloud and
server. Doing so in Jekyll's Markdown might look like this:

```md
{:.tab.jobscreenshot.Cloud}
![]({{ site.baseurl }}/assets/img/docs/new-job-page.png)

{:.tab.jobscreenshot.Server}
![]({{ site.baseurl }}/assets/img/docs/old-job-page.png)
```

Resulting in the following:

![](assets/widget-tabbed-code-blocks_1.gif)

Periods (`.`) and spaces (` `) aren't supported in tab names.
Instead, use an underscore (`_`) and dash (`-`) respectively and they'll be rendered correctly.


## OS Version Matrix

![OS Version Matrix Widget Screenshot](assets/widget-os-matrix.png)

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
