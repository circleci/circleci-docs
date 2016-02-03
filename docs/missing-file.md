---

title: An important file is missing from your repository
layout: doc
tags:
  - troubleshooting
  - filesystem

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
