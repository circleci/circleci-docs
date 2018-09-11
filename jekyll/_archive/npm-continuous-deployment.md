---
layout: classic-docs
title: "Continuous Deployment with npm"
description: "How to configure CircleCI to publish packages to npmjs.org automatically."
sitemap: false
---

Setting up CircleCI to publish packages to the npm registry makes it easy for project collaborators to release new package versions in a consistent and predictable way.

1.  Obtain the npm authToken for the account that you wish to use to publish the package.

    You can do that by logging in to npm (`npm login`). This will save the
    authToken to the `~/.npmrc` file. Look for the following line:

    ```
    //registry.npmjs.org/:_authToken=00000000-0000-0000-0000-000000000000
    ```

    In this case, the authToken is `00000000-0000-0000-0000-000000000000`.

2.  Go to your [project settings]( {{ site.baseurl }}/1.0/environment-variables/#setting-environment-variables-for-all-commands-without-adding-them-to-git), and set the `NPM_TOKEN` variable to the
    obtained authToken.

3.  Configure CircleCI to add the authToken to `~/.npmrc`:

    ```yaml
    dependencies:
      pre:
        - echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >> ~/.npmrc
    ```

4.  Configure CircleCI to run `npm publish` on tagged commits:

    ```yaml
    deployment:
      npm:
        tag: /v[0-9]+(\.[0-9]+)*/
        commands:
          - npm publish
    ```

5.  When you want to publish a new version to npm, run `npm version` to create a new version:

    ```
    npm version 10.0.1
    ```

    This will update the `package.json` file and creates a tagged Git commit.
    Next, push the commit with tags:

    ```
    git push --follow-tags
    ``` 
6.  If tests passed, CircleCI will publish the package to npm automatically.
