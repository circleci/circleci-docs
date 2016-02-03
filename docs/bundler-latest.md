---

title: Do you need the latest version of Bundler?
layout: doc
tags:
  - troubleshooting
  - ruby

---

CircleCI typically tracks the latest stable version of bundler.
Your project may occasionally need to use a pre-release version, which is easy to add to your build.
Just add the following to your [circle.yml](/docs/configuration) file.

```
dependencies:
  pre:
    - gem install bundler --pre
```
