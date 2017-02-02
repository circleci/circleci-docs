# CircleCI Docs: Widgets

Many documentation pages will have widgets. These are discrete page elements that provide advanced functionality within Markdown.

The widgets available in CircleCI.com/docs/ are:

## OS Version Matrix

![OS Version Matrix Widget Screenshot](img/widget-os-matrix.png)

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
