---
layout: classic-docs
title: "Manual Orb Authoring Process"
description: "Authoring simple orbs manually without the orb development kit."
version:
- Cloud
---

This guide covers the steps required to create a simple [orb]({{site.baseurl}}/orb-intro), manually, without using the orb development kit. We recommend the [orb development kit]({{site.baseurl}}/orb-development-kit) for most orb projects.

## 1. Create a namespace
{: #create-a-namespace }

If you have not already done so, claim a namespace for your user/organization using the following command, substituting your namespace choice and GitHub organization name:
```shell
circleci namespace create <name> --org-id <your-organization-id>
```

## 2. Create your orb
{: #create-your-orb }

Create your orb inside your namespace. At this stage no orb content is being generated, but the naming is reserved for when the orb is published. **If you are using CircleCI server, you should ensure the `--private` flag is used here to keep your orbs private within your installation**.
To create a **[public]({{site.baseurl}}/orb-intro/#public-orbs)** orb:
```shell
circleci orb create <my-namespace>/<my-orb-name>
```
To create a **[private]({{site.baseurl}}/orb-intro/#private-orbs)** orb:
```shell
circleci orb create <my-namespace>/<my-orb-name> --private
```

Next, create the content of your orb in a YAML file. Here is a simple example to get you started:
```yaml
version: 2.1
description: A greeting command orb
commands:
    greet:
        description: Greet someone with a "hello".
        parameters:
            to:
                type: string
                default: World
        steps:
            - run: echo "Hello, << parameters.to >>"
```

## 3. Pack a configuration (optional)
{: #pack-a-configuration }

The CLI pack command (different than `circleci orb pack`) allows you to create a single YAML file from several separate files (based on directory structure and file contents). The `pack` command implements [FYAML](https://github.com/CircleCI-Public/fyaml), a scheme for breaking YAML documents across files in a directory tree. This is particularly useful for breaking up source code for large orbs and allows custom organization of your orbs' YAML configuration.

```shell
circleci config pack
```

How you **name** and **organize** your files when using the `pack` command will determine the final `orb.yml` output. Consider the following folder structure example:

```shell
$ tree
.
└── your-orb-source
    ├── @orb.yml
    ├── commands
    │   └── foo.yml
    └── jobs
        └── bar.yml

3 directories, 3 files
```

The unix `tree` command is great for printing out folder structures. In the example tree structure above, the `pack` command will map the folder names and file names to **YAML keys**, and map the file contents as the **values** to those keys.

The following command will `pack` up the example folder from above:

```shell
$ circleci config pack your-orb-source
```

And the output will be in your `.yml` file:

```yaml
# Contents of @orb.yml appear here
commands:
  foo:
    # contents of foo.yml appear here
jobs:
  bar:
    # contents of bar.yml appear here
```

### Other configuration packing capabilities
{: #other-configuration-packing-capabilities }

A file beginning with `@` will have its contents merged into its parent folder level. This can be useful at the top level of an orb, when one might want generic `orb.yml` to contain metadata, but not to map into an `orb` key-value pair.

Thus:

```shell
$ cat foo/bar/@baz.yml
{baz: qux}
```

Is mapped to:

```yaml
bar:
  baz: qux
```

## 4. Validate your orb
{: #validate-your-orb }

Validate your orb code using the CLI:

```
circleci orb validate /tmp/orb.yml
```

### Processing a configuration (optional)
{: #processing-a-configuration }

Running the following command validates your configuration, but will also display expanded source configuration alongside your original configuration (useful if you are using orbs):

```shell
circleci config process
```

Consider the following example configuration that uses the link:https://circleci.com/developer/orbs/orb/circleci/node[`node`] orb:

```yml
version: 2.1

orbs:
  node: circleci/node@4.7.0

workflows:
  version: 2
  example-workflow:
      jobs:
        - node/test
```

Running the following command will output a YAML file like the example below (which is a mix of the expanded source and the original configuration commented out):

```shell
circleci config process .circleci/config.yml
```
```yml
{% raw %}
# Orb 'circleci/node@4.7.0' resolved to 'circleci/node@4.7.0'
version: 2
jobs:
  node/test:
    docker:
    - image: cimg/node:13.11.0
      auth:
        username: mydockerhub-user
        password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
    - checkout
    - run:
        command: |
          if [ ! -f "package.json" ]; then
            echo
            echo "---"
            echo "Unable to find your package.json file. Did you forget to set the app-dir parameter?"
            echo "---"
            echo
            echo "Current directory: $(pwd)"
            echo
            echo
            echo "List directory: "
            echo
            ls
            exit 1
          fi
        name: Checking for package.json
        working_directory: ~/project
    - run:
        command: |
          if [ -f "package-lock.json" ]; then
            echo "Found package-lock.json file, assuming lockfile"
            ln package-lock.json /tmp/node-project-lockfile
          elif [ -f "npm-shrinkwrap.json" ]; then
            echo "Found npm-shrinkwrap.json file, assuming lockfile"
            ln npm-shrinkwrap.json /tmp/node-project-lockfile
          elif [ -f "yarn.lock" ]; then
            echo "Found yarn.lock file, assuming lockfile"
            ln yarn.lock /tmp/node-project-lockfile
          fi
          ln package.json /tmp/node-project-package.json
        name: Determine lockfile
        working_directory: ~/project
    - restore_cache:
        keys:
        - node-deps-{{ arch }}-v1-{{ .Branch }}-{{ checksum "/tmp/node-project-package.json" }}-{{ checksum "/tmp/node-project-lockfile" }}
        - node-deps-{{ arch }}-v1-{{ .Branch }}-{{ checksum "/tmp/node-project-package.json" }}-
        - node-deps-{{ arch }}-v1-{{ .Branch }}-
    - run:
        command: "if [[ ! -z \"\" ]]; then\n  echo \"Running override package installation command:\"\n  \nelse\n  npm ci\nfi\n"
        name: Installing NPM packages
        working_directory: ~/project
    - save_cache:
        key: node-deps-{{ arch }}-v1-{{ .Branch }}-{{ checksum "/tmp/node-project-package.json" }}-{{ checksum "/tmp/node-project-lockfile" }}
        paths:
        - ~/.npm
    - run:
        command: npm run test
        name: Run NPM Tests
        working_directory: ~/project
workflows:
  version: 2
  example-workflow:
    jobs:
    - node/test

# Original config.yml file:
# version: 2.1
#
# orbs:
#   node: circleci/node@4.7.0
#
# workflows:
#   version: 2
#   example-workflow:
#       jobs:
#         - node/test
{% endraw %}
```

## 5. Publish your orb
{: #publish-your-orb }

Publish a dev version of your orb:
```shell
circleci orb publish /tmp/orb.yml <my-namespace>/<my-orb-name>@dev:first
```

Once you are ready to push your orb to production, you can publish it manually using `circleci orb publish` or promote it directly from the dev version. Using the following command will increment the dev version to become `0.0.1`:
```shell
circleci orb publish promote <my-namespace>/<my-orb-name>@dev:first patch
```

Your orb is now published, in an immutable form, as a production version and can be used safely in CircleCI projects. You can pull the source of your orb using:
```shell
circleci orb source <my-namespace>/<my-orb-name>@0.0.1
```

## List available orbs
{: #list-available-orbs }

List your available orbs using the CLI:

To list **[public]({{site.baseurl}}/orb-intro/#public-orbs)** orbs:
```shell
circleci orb list <my-namespace>
```

To list **[private]({{site.baseurl}}/orb-intro/#private-orbs)** orbs:
```shell
circleci orb list <my-namespace> --private
```

## Next Steps
{: #next-steps }

For more information on how to use the `circleci orb` command, see the CLI [documentation](https://circleci-public.github.io/circleci-cli/circleci_orb.html).
