---
layout: classic-docs
title: An important file is missing from your repository
description: What to do when an important file is missing from your repository
last_updated: Feb 3, 2013
sitemap: false
---

Developers commonly omit certain files from their repositories, especially files containing application settings, passwords and API keys.
However, these files can be essential for the proper running of their programs, and often contain settings which can't be reasonably inferred by CircleCI.

If you wish to remove important files from your repository, you should add a rough copy of the file under a similar name, such as
`config/app.yml.ci`.
You can then copy it to its correct place with some simple commands:

```
checkout:
  post:
    - cp config/app.yml.ci config/app.yml
```

For a `database.yml` file, it's even simpler - just include it without the important settings like production and staging database keys.
