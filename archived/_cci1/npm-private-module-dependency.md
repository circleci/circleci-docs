---
layout: classic-docs
title: "How to Use Private npm Modules with CircleCI"
short-title: "Private npm Modules"
description: "How to authenticate with a npm registry so that you can use private npm modules on CircleCI."
sitemap: false
---

## Authenticating
To install a private npm module as a dependency, some form of authentication 
needs to be done. There's two ways to do this:

* **Using `npm login`**. This is the most common way, but needs a fancy command 
  to get it working in a CI environment. You can find instructions for this [here][1].

* **Using npm tokens**. Newer versions of npm support tokens (Requires npm version 5.5.1 or greater). The official npm 
  docs covers tokens [here][2]. The summary version is that when `npm login` is 
  used on your local machine, a token is generated and saved in the corresponding 
  `.npmrc` for that module/project. Note `.npmrc` must exist in your file system or token replacement will fail silently.

  To configure CircleCI to use this token, find token in the `.npmrc` file
  (format is 00000000-0000-0000-0000-000000000000) and set it as a [private
  environment variables][3] `NPM_TOKEN`. Finally, add a script to inject this
  configuration into the container’s `~/.npmrc` file.

  ```
  dependencies:
    pre:
      - echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >> ~/.npmrc
  ```

## Alternate Registries

By default, using `npm login` will use npm's official module registry 
`https://registry.npmjs.org/`. If the private modules happens to be on a 
third-party registry, maybe your own, you can add 
`--registry=http://registry.acme.io` to the command. Here's an example:

```
dependencies:
  pre:
    - echo -e "$NPM_USER\n$NPM_PASS\n$NPM_EMAIL" | npm login --registry=http://registry.acme.io
```

*Note: The example above is if you went with the first method of authenticating above.*


## Not Using a Registry At All

If you don't want to login to a remote registry to download private modules, 
`npm install` gives you other options.

* **Local directory**. If you can get the module via other means (maybe a 
script), then you can run `npm install .` if you are in the directory or `npm 
install path/to/module` for elsewhere in the file system.
* **Git**. You can always rely on a Git repository like this `npm install git://github.com/acme/private-module.git`


[1]:  {{ site.baseurl }}/1.0/npm-login/ 
[2]: https://docs.npmjs.com/private-modules/ci-server-config
[3]:  {{ site.baseurl }}/1.0/configuration/#environment
