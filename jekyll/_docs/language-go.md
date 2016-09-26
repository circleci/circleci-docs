---
layout: classic-docs
title: Continuous Integration and Continuous Deployment with Go(Golang)
short-title: Go(Golang)
categories: [languages]
description: "Continuous Integration and Continuous Deployment with Go(Golang)."
---

CircleCI has built-in support to compile, test, and deploy Go applications. We 
inspect your code before each build to infer your dependencies and tests. If 
your project has any additional requirements, you can augment or override our 
inferred commands via a [circle.yml][config-doc] file checked into your repo's 
root directory.

## Version

The pre-installed version of Go can vary depending on which image your build is 
using:

- [Ubuntu 14.04][trusty-doc] - go{{ site.data.trusty.versions.golang }}
- [Ubuntu 12.04][precise-doc] - go{{ site.data.precise.versions.golang }}

## Dependencies

By default, CircleCI will run `go get` to retrieve all of your project's 
dependencies. This means that any dependency that exists as an import within 
the source code will be brought in. These packages are stored within the Go 
Workspace (`/home/ubuntu/.go_workspace`), which is a cached directory. This 
means that in future builds, packages that haven't changed don't need to be 
re-downloaded, which saves build time.

Next CircleCI runs `go build` to build your project and all dependencies.

You can customize what happens in the [dependencies][config-doc-dep] phase by 
using `pre`, `override`, or `post`. The `circle.yml` equivalent of CircleCI's 
Inference is the following:

```
dependencies:
  override:
    # './...' is a relative pattern which means all subdirectories
    - go get -t -d -v ./...
    - go build -v
```

## Databases

CircleCI has pre-installed more than a dozen databases and queues, including 
PostgreSQL and MySQL. If needed, you can 
[manually set up your test database][db-doc] from `circle.yml`.

## Testing

Go has a lovely testing framework built right into its toolset. CircleCI takes 
advantage of that and by default will run `go test`. Of course you can run any 
additional tests and commands in the `pre`, `override`, and `post` sections. 
See [test configuration][config-doc-test] for more information.

***Note: Remember that unlike other build phases, commands in `test` will run regardless of whether the previous command failed or not.***

The `circle.yml` equivalent of CircleCI's Inference is the following:

```
test:
  override:
    # './...' is a relative pattern which means all subdirectories
    - go test -v -race ./...
```

## Deployment

CircleCI offers first-class support for [deployment][config-doc-deploy]. When a 
build is green (all tests pass), CircleCI will deploy your project as directed 
in your `circle.yml` file. We can deploy to popular PaaS's as well as generic 
physical and virtual servers under your control.

## Environment

```
machine:
  environment:
    # GOROOT is not set by default
    GOROOT: ""
    PATH: "/usr/local/go/bin:/usr/local/go_workspace/bin:~/.go_workspace/bin:${PATH}"
    GOPATH: "${HOME}/.go_workspace:/usr/local/go_workspace:${HOME}/.go_project"
```

Every project built on CircleCI has a standard [CircleCI environment][env-doc] 
that they're built in. The following is what we configure specifically for Go 
projects.

The `go` binary is located in the default location of `/usr/local/go/bin/go`. 
Since the install is in the default location, `GOROOT` is not set. If you 
install your own version of Go, make sure to set the location in `GOROOT`.

CircleCI places all projects in the `ubuntu` user's home directory as 
`/home/ubuntu/<REPO_NAME>`. To work with Go's expected directory structure, a 
symlink is placed to your project's directory at 
`/home/ubuntu/.go_project/src/github.com/<USER>/<REPO_NAME>`.

Project dependencies are placed in their own workspace. For example, if we 
imported a package called 'calculator' from the Acme company, it would be 
downloaded to `/home/ubuntu/.go_workspace/src/github.com/acme/calculator`.



[config-doc]: {{ site.baseurl }}/configuration/
[precise-doc]: {{ site.baseurl }}/build-image-precise/#go
[trusty-doc]: {{ site.baseurl }}/build-image-trusty/#go
[config-doc-dep]: {{ site.baseurl }}/configuration/#dependencies
[db-doc]: {{ site.baseurl }}/manually/#dependencies
[config-doc-test]: {{ site.baseurl }}/configuration/#test
[config-doc-deploy]: {{ site.baseurl }}/configuration/#deployment
[env-doc]: {{ site.baseurl }}/environment/
