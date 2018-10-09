---
layout: classic-docs
title: Git errors during npm install
description: Git errors during npm install
last_updated: Sep 16, 2013
sitemap: false
---

When your tests run, during the
`npm install`
step, you might see something like this:

```
npm ERR! git clone ssh://git@github.com/someuser/somerepo.git Cloning into bare repository '/home/ubuntu/.npm/_git-remotes/ssh-git-github-com-creativelive-shared-git-01234abc'...
npm ERR! git clone ssh://git@github.com/someuser/somerepo.git
npm ERR! git clone ssh://git@github.com/someuser/somerepo.git ERROR: Repository not found.
npm ERR! git clone ssh://git@github.com/someuser/somerepo.git fatal: Could not read from remote repository.
npm ERR! git clone ssh://git@github.com/someuser/somerepo.git
npm ERR! git clone ssh://git@github.com/someuser/somerepo.git Please make sure you have the correct access rights
npm ERR! git clone ssh://git@github.com/someuser/somerepo.git and the repository exists.
npm ERR! Error: Command failed: ERROR: Repository not found.
npm ERR! fatal: Could not read from remote repository.
npm ERR!
npm ERR! Please make sure you have the correct access rights
npm ERR! and the repository exists.
npm ERR!
npm ERR!     at ChildProcess.exithandler (child_process.js:540:15)
npm ERR!     at ChildProcess.EventEmitter.emit (events.js:96:17)
npm ERR!     at maybeClose (child_process.js:638:16)
npm ERR!     at Process._handle.onexit (child_process.js:680:5)
npm ERR! If you need help, you may report this log at:
npm ERR!     <http://github.com/isaacs/npm/issues>
npm ERR! or email it to:
npm ERR!     <npm-@googlegroups.com>
```

This happens because you have a git repository listed as a dependency in your package.json file:

```
"somepackage": "git://github.com/someorg/somerepo.git"
```

If the repository is public, just change the dependency to use a
`http` url:

```
"somepackage": "https://github.com/someorg/somerepo"
```

If the repository is private, you will need to enable user keys
from your project's **Project settings > Checkout SSH keys**
page.
