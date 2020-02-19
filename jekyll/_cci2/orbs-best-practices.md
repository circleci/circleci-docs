---
layout: classic-docs
title: "Orbs Best Practices"
short-title: "Best Practices for Orbs"
description: "a guide to best practices for orbs"
categories: [getting-started]
order: 1
---

A collection of best practices and strategies for authoring orbs. CircleCI orbs are shareable packages of configuration elements, including jobs, commands, and executors.

## Guidelines

### Metadata

- Ensure all commands, jobs, executors, and parameters have detailed descriptions.
- Provide a `source_url`, and if available, `home_url` [via the `display` key]({{ site.baseurl }}/2.0/orb-author/#describing-your-orb).
- Define any prerequisites such as obtaining an API key in the description.
- Be consistent and concise in naming your orb elements. For example, don't mix "kebab case" and "snake case."


### Examples

- Must have at least 1 [usage example]({{ site.baseurl }}/2.0/orb-author/#providing-usage-examples-of-orbs).
- Show orb version as `x.y` (patch version may not need to be included) in the example.
- Example should include most common/simplest use case calling a top-level job or other base-case elements if no job is present.
- If applicable, you may want to showcase the use of [pre and post steps]({{ site.baseurl }}/2.0/reusing-config/#using-pre-and-post-steps) in conjunction with an orb’s job. 

### Commands

- In general, all orbs should contain at least one command. 
- Some exceptions may include creating an orb for the sole task of providing an executor.
- Combine one or more parameterizable steps to simplify a task.
- All commands available to the user should complete a full task. Do not create a command for the sole purpose of being a “partial” to another command unless it can be used on its own.
- It is possible not all CLI commands need to be transformed into an orb command. Single line commands with no parameters do not necessarily need to have an orb command alias.
- Command descriptions should call out any dependencies or assumptions, particularly if you intend for the command to run outside of a provided executor in your orb.
- It is a good idea to check for the existence of required parameters, environment variables or other dependancies as a part of your command.

example:
```
if [ -z "$<<parameters.SECRET_API_KEY>>" ]; then
  echo "Error: The parameter SECRET_API_KEY is empty. Please ensure the environment variable <<parameters.SECRET_API_KEY>> has been added."
  exit 1
fi
```

### Parameters

- When possible, use defaults for parameters unless a user input is essential. 
- Utilize the [“env_var_name” parameter type]({{ site.baseurl }}/2.0/reusing-config/#environment-variable-name) to secure API keys, webhook urls or other sensitive data. 
- [Injecting steps as a parameter]({{ site.baseurl }}/2.0/reusing-config/#steps) is a useful way to run user defined steps within a job between your orb-defined steps.Good for if you need to perform an action both before and after user-defined tasks - for instance, you could run user-provided steps between your caching logic inside the command.

**Installing binaries and tools**
  - Set an `install-path` parameter, ideally with a default value of `/usr/local/bin`, and ensure to install the binary to this parameterized location. This may often avoid the issue of needing `root` privileges in environments where the user may not have root.
  - If `root`is required for your use case, it is recommended to add pre-flight checks to determine if the user has root permissions and gracefully fail with a descriptive error message alerting the user they need proper permissions.
  - Add the binary to the user's path via `$BASH_ENV` so the user may call the binary from a separate [run]({{ site.baseurl }}/2.0/configuration-reference/#run) statement. This is required when installing to a non-default path.
  example:
```
echo `export PATH="$PATH:<<parameters.install-path>>"` >> $BASH_ENV
```


### Jobs

 - Jobs should utilize Commands defined within the orb to orchestrate common use cases for this orb.
 - Plan for flexibility
 - Plan how users might utilize post-steps, pre-steps, or steps as a parameter.
 - Consider creating pass-through parameters. 
 - If a job utilizes an executor or command that accepts parameters, the job will need those parameters as well if they are to be passed down to the executor or commands.
- Never hard-code the executor. Utilize a parameterizable (ex: ‘default’) executor that is able to have the image or tag overwritten.

### Executors

- At least one executor per supported OS (MacOs, Windows, Docker, VM).
- Must include a “default” executor.
- Executor should be parameterized to allow the user to overwrite the version/tag in the event an issue arises with the included image.

### Imported Orbs

- Should import full semver immutable version of orb. This protects your orb from changes to the dependancy orb (like a lock file).
- [Partner Only] - Should only import Certified/Partnered namespaces, or Orbs of the same namespace.

### Maintainability

- Deploy full CI/CD for your orb with a fully automated build > test > deploy workflow using the [Orb Starter Kit (Beta)](https://github.com/CircleCI-Public/orb-starter-kit). This handles all of the below.
- Optional: Utilize a destructured orb pattern to more easily maintain individual orb components.

### Deployment

#### Versioning

- Utilize [semver versioning](https://semver.org/) (x.y.z)
- Major: Incompatible changes
- Minor: Add new features (backwards compatible)
- Patch: Minor bug fixes, metadata updates, or other safe actions.

View our Orb Deployment best practices here: [coming soon]

This section is handled automatically via the Orb Starter Kit.

### GitHub/Bitbucket

GitHub has the ability to tag repositories with "_topics_". This is used as a datapoint in GitHub search but more importantly, in their Explore page to group repositories by tags. We suggest using the topic `circleci-orbs` for a repo containing an orb. This allows users to view a listing of orb repos whether they are CircleCI, Partner, or community orbs on [this page](https://github.com/topics/circleci-orbs).

[How to add a topic to a GitHub repository](https://help.github.com/en/articles/classifying-your-repository-with-topics)
