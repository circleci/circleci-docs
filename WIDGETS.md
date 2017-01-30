# CircleCI Docs: Widgets

Many documentation pages will have some sort of widget. These are discrete page elements that provide some advanced functionality within the Markdown with little effort.

Here are widgets available within CircleCI.com/docs/.

## OS Version Matrix

![OS Version Matrix Widget Screenshot](img/widget-os-matrix.png)

This widget is used to display which version, if any, of a specific software is available on a specific CircleCI supported operating system (OS). This applies to CircleCI 1.0 only.

Version numbers can be passed as a string or from Jekyll datafiles. Here's an example:

```
{% include os-matrix.html trusty=site.data.trusty.versions.summary.docker precise="v1.7.1" macos="n/a" %}
```

If an OS doesn't have that software, you can pass "n/a" or better yet, leave the variable out completely. For example, if we had a software that was Ubuntu 14.04 "Trusty" only, we could do:

```
{% include os-matrix.html trusty=site.data.trusty.versions.summary.docker %}
```
