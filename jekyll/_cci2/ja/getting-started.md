---
layout: classic-docs
title: "入門ガイド"
short-title: "入門ガイド"
description: "CircleCI を使用して初めてのビルドを成功させるためのチュートリアル"
categories:
  - getting-started
order: 41
---

This document provides a step-by-step tutorial for getting your first successful (green) build on CircleCI.

* 目次
{:toc}

## 初回のビルド実行にあたっての前提条件
{:.no_toc}

* Some basic knowledge of Git.
* A GitHub or Bitbucket account, of which you are logged into. We will use GitHub for this guide but you can follow the equivalent processes for Bitbucket if required.
* An account on CircleCI.
* Some basic terminal or `bash` knowledge and prior experience using the command line is helpful.

## リポジトリを作成する

Begin by creating a new repository on GitHub. You may skip this section if you intend to use an existing repository.

1. Navigate to GitHub and [create a new repository](https://github.com/new). 
2. Input the name of your repository, in this case "hello-world", then click **Initialize this repository with a README**. Finally, click **Create repository**.

![Creating a Repository]( {{ site.baseurl }}/assets/img/docs/getting-started--new-repo.png){:.img--bordered}

## Setting up CircleCI

If you have not yet, create an account on CircleCI by navigating to [the signup page](https://circleci.com/signup/) and clicking on **Sign Up with GitHub**.

1. Navigate to the CircleCI [Project Page](https://app.circleci.com/projects/).
2. If you are part of any organizations, you will need to select the organization you wish to work under in order to setup your repository with CircleCI.
3. Once on the Project page, find the project you are using, in our case `hello-world`, and click **Set Up Project**.

4. On the following screen, choose a language from the dropdown to get a pre-populated config.yml file with suggested best-practices for your project. For this example, because we have an empty repository, we will use the `Hello
World` configuration example at the bottom of the list.
    
    ![Getting a sample configuration]( {{ site.baseurl }}/assets/img/docs/getting-started--sample-config.png){:.img--bordered}
  
    **Note:** Based on which language you choose you can view related documentation in the sidebar on the right of the screen

5. Click **Start Building** and follow the prompt to add your config to a new branch and start your first pipeline. **Note:** You can also manually add a `config.yml` to your project root under a `.circleci` folder and push this to your VCS provider.
    
    ![Automatic Commit]( {{ site.baseurl }}/assets/img/docs/getting-started--auto-commit.png){:.img--bordered}

6. You will be taken to the Pipelines page where you can view your newly running build.

## Digging Into Your First Pipeline

You should see your pipeline start to run automatically—and pass! So, what just happened? Click on the green **Success** button on your pipeline to investigate the following parts of the run:

![First Successful Pipeline]( {{ site.baseurl }}/assets/img/docs/getting-started--first-success.png){:.img--bordered}

1. **Which workflows ran?**: After clicking **Success**, we are taken to a page listing the jobs that ran. If this is your first build, you probably only ran **one job** (which automatically runs inside **one workflow**). In our case, we only ran one job, called `welcome/run`. Click on `welcome/run` and let's investigate the steps of our job.
    
    ![Investigate build]( {{ site.baseurl }}/assets/img/docs/getting-started--first-success-workflow.png){:.img--bordered}


2. **Spin up environment:** CircleCI used an [orb](https://circleci.com/orbs) to help provide some defaults for this project. By using an orb, we can get quick access to common configuration. In this case, `circleci/welcome-orb@0.4.1` provides a "pre-built" job you can run which simply greets the user.

3. **Views step results:** Every job is made up of a series of steps - some steps, like [`checkout`]({{site.baseurl}}/2.0/configuration-reference/#checkout) are special, reserved commands in CircleCI. Other steps are specified by a user to achieve a specific purpose. Because we are using the `welcome` orb, we don't see custom steps; they are configured in the orb. But no problem! We can view the [source of an orb](https://circleci.com/developer/orbs/orb/circleci/welcome-orb) online.

Even though there was no actual source code in your repo, and no actual tests configured in your `config.yml`, CircleCI considers your build to have "succeeded" because all steps completed successfully (returned an [exit code](https://en.wikipedia.org/wiki/Exit_status) of 0). Most projects are far more complicated, oftentimes with multiple Docker images and multiple steps, including a large number of tests. You can learn more about all the possible steps one may put in a `config.yml` file in the [Configuration Reference](https://circleci.com/docs/2.0/configuration-reference).

### ビルドを意図的に失敗させる
{:.no_toc}

Let's get a bit more complex. Let's edit our `.circleci/config.yml` file now. On GitHub, it is possible to edit files directly. Use the URL below and substitute the name of your repository and username (replace the text with `{brackets}`) and then paste it in your browser. If you are already familiar with Git, use your text-editor and push your changes with git.

`https://github.com/{username}/{repo}/edit/circleci-project-setup/.circleci/config.yml`

Let's use the [Node orb](https://circleci.com/developer/orbs/orb/circleci/node). Paste the following into your `config.yml`

```yaml
version: 2.1
orbs:
  node: circleci/node@1.1
jobs:
  build:
    executor:
      name: node/default
      tag: '10.4'
    steps:
      - checkout
      - node/with-cache:
          steps:
            - run: npm install
      - run: npm run test
```

Then, commit your change in the GitHub editor and return to the Projects page in CircleCI. You should see a new pipelines running... and it will fail! What's going on?

The Node orb runs some common Node tasks. Because we are working with an empty repository, running `npm run test`, a Node script, causes our configuration to fail. How would we fix this? You would need to setup a Node project in your repository; a topic for another tutorial. You can view several [demo applications]({{site.baseurl}}/2.0/demo-apps/) that go into more detail on setting up CircleCI with various languages and frameworks.

## Using the Workflows Functionality
{:.no_toc}

You do not have to use orbs to use CircleCI. The following example details how to create a custom configuration that also uses the [workflow feature]({{site.baseurl}}/2.0/workflows) of CircleCI.

1. Take a moment and read the comments in the code block below. Of course, we do not want to be copying and pasting code without understanding what we are doing. Now, to see Workflows in action, edit your `.circleci/config.yml` file and copy and paste the following text into it. 

   ```yaml
   version: 2
   jobs: # we now have TWO jobs, so that a workflow can coordinate them!
     one: # This is our first job.
       docker: # it uses the docker executor
         - image: circleci/ruby:2.4.1 # specifically, a docker image with ruby 2.4.1
           auth:
             username: mydockerhub-user
             password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
       # Steps are a list of commands to run inside the docker container above.
       steps:
         - checkout # this pulls code down from GitHub
         - run: echo "A first hello" # This prints "A first hello" to stdout.
         - run: sleep 25 # a command telling the job to "sleep" for 25 seconds.
     two: # This is our second job.
       docker: # it runs inside a docker image, the same as above.
         - image: circleci/ruby:2.4.1
           auth:
             username: mydockerhub-user
             password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
       steps:
         - checkout
         - run: echo "A more familiar hi" # We run a similar echo command to above.
         - run: sleep 15 # and then sleep for 15 seconds.
   # Under the workflows: map, we can coordinate our two jobs, defined above.
   workflows:
     version: 2
     one_and_two: # this is the name of our workflow
       jobs: # and here we list the jobs we are going to run.
         - one
         - two
   ```

1. Commit these changes to your repository and navigate back over to the CircleCI Pipelines page. You should see your CircleCI pipeline running.

2. Click on the running pipeline to view the workflow you have created. You should see that two jobs ran (or are currently running!) concurrently.

Read more about workflows in the [Orchestrating Workflows](https://circleci.com/docs/2.0/workflows/#overview) documentation.

### Adding Some Changes to use the Workspaces Functionality
{:.no_toc}

Each workflow has an associated workspace which can be used to transfer files to downstream jobs as the workflow progresses. You can use workspaces to pass along data that is unique to this run and which is needed for downstream jobs. Try updating `config.yml` to the following:

```yml
version: 2
jobs:
  one:
    docker:
      - image: circleci/ruby:2.4.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: echo "A first hello"
      - run: mkdir -p my_workspace
      - run: echo "Trying out workspaces" > my_workspace/echo-output
      - persist_to_workspace:
          # Must be an absolute path, or relative path from working_directory
          root: my_workspace
          # Must be relative path from root
          paths:
            - echo-output      
  two:
    docker:
      - image: circleci/ruby:2.4.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: echo "A more familiar hi"  
      - attach_workspace:
          # Must be absolute path or relative path from working_directory
          at: my_workspace

      - run: |
          if [[ $(cat my_workspace/echo-output) == "Trying out workspaces" ]]; then
            echo "It worked!";
          else
            echo "Nope!"; exit 1
          fi
workflows:
  version: 2
  one_and_two:
    jobs:
      - one
      - two:
          requires:
            - one
```

Read more about workspaces [here](https://circleci.com/docs/2.0/workflows/#using-workspaces-to-share-data-among-jobs).

### SSH into Your {% comment %} TODO: Job {% endcomment %}Build
{:.no_toc}

If you are comfortable with the terminal, you can SSH directly into your CircleCI jobs to troubleshoot issues with your builds by rerunning your {% comment %} TODO: Job {% endcomment %}build with the SSH enabled option.

*Note that you will need to add your SSH keys to your GitHub account: <https://help.github.com/articles/connecting-to-github-with-ssh/>*.


{:.tab.switcher.Cloud}
![Rebuild With SSH]({{ site.baseurl }}/assets/img/docs/rebuild-with-SSH_newui.png)

{:.tab.switcher.Server}
![Rebuild With SSH]({{ site.baseurl }}/assets/img/docs/rebuild-with-SSH.png)

Copy the `ssh` string from the enabling SSH section of your build. Open a terminal and paste in the `ssh` string.

Using some of the following commands, see if you can find and view the contents of the file you created using workspaces:

    pwd                  #  print what directory, find out where you are in the file system
    ls -al               # list what files and directories are in the current directory
    cd <directory_name>  # change directory to the <directory_name> directory
    cat <file_name>      # show me the contents of the file <file_name>
    

## Collaborating with Teammates

It is easy for teammates and collaborators to view and follow your projects. Teammates can make a free CircleCI account at any time to view your pipelines, even if they are not committing any code.

## See Also
{:.no_toc}

[Blog post](https://circleci.com/blog/circleci-hacks-validate-circleci-config-on-every-commit-with-a-git-hook/) on how to validate the CircleCI `config.yml` on every commit with a git hook.

### CircleCI
{:.no_toc}

* The [CircleCI blog](https://circleci.com/blog/).
* [What is continuous integration?](https://circleci.com/blog/what-is-continuous-integration/)
* CircleCI on [GitHub](https://github.com/circleci), [Twitter](https://twitter.com/circleci) and [Facebook](https://www.facebook.com/circleci)

### Continuous Integration
{:.no_toc}

* [Martin Fowler - Continuous Integration](https://martinfowler.com/articles/continuousIntegration.html)
* [Best Practices](https://ja.wikipedia.org/wiki/継続的インテグレーション) 

### YAML
{:.no_toc}

* [Advanced Concepts](https://en.wikipedia.org/wiki/YAML#Advanced_components)