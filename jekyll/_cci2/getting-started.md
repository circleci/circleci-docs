---
layout: classic-docs
title: "Getting Started Introduction"
short-title: "Getting Started Introduction"
description: "A tutorial for getting your first green CircleCI build"
categories: [getting-started]
order: 41
---

This document provides a step-by-step tutorial for getting your first successful (green) build on CircleCI 2.0.

* TOC
{:toc}

## Prerequisites for Running Your First Build
{:.no_toc}

* Some basic knowledge of Git and an existing GitHub.com account or the ability to create one. This procedure uses a new GitHub repository, but CircleCI also supports the use of Bitbucket.
* Some basic terminal or `bash` knowledge and prior experience using the command line is helpful.

## Creating a Repository
1. Navigate to your account on GitHub.com
  * Go to the **Repositories** tab and then select **New** or navigate directly to [https://github.com/new](https://github.com/new). ![]( {{ site.baseurl }}/assets/img/docs/GH_Repo-New-Banner.png)

2. Select Initialize this repository with a README and click the Create repository button. ![]( {{ site.baseurl }}/assets/img/docs/create-repo-circle-101-initialise-readme.png)

## Adding a .yml File

CircleCI uses a [YAML](https://en.wikipedia.org/wiki/YAML) file to identify how you want your testing environment set up and what tests you want to run.
On CircleCI 2.0, this file must be called `config.yml` and must be in a hidden folder called `.circleci`. On Mac, Linux, and Windows systems, files and folders whose names start with a period are treated as *system* files that are hidden from users by default.

1. To create the file and folder on GitHub, click the **Create new file** button on the repo page and type `.circleci/config.yml`. You should now have in front of you a blank `config.yml` file in a `.circleci` folder.

2. To start out with a simple `config.yml`, copy the text below into the file editing window on GitHub:

    ```yml
    version: 2
    jobs:
      build:
        docker:
          - image: circleci/ruby:2.4.1
        steps:
          - checkout
          - run: echo "A first hello"
    ```

3. Commit the file by entering comments and clicking the Commit New File button. ![]( {{ site.baseurl }}/assets/img/docs/commit-new-file.png)

The `- image: circleci/ruby:2.4.1` text tells CircleCI what Docker image to use when it builds your project. CircleCI will use the image to boot up a "container" — a virtual computing environment where it will install any languages, system utilities, dependencies, web browsers, and tools, that your project might need to run.

## Setting up Your Build on CircleCI

1. For this step, you will need a CircleCI account. If you already have a CircleCI account then you can navigate to your [dashboard](https://circleci.com/dashboard), or if you are using  CircleCI Server substitute your hostname: `https://<your-circleci-hostname>.com/dashboard`. If you don't have an account yet, visit the CircleCI [signup page](https://circleci.com/signup) and click "Start with GitHub". You will need to give CircleCI access to your GitHub account to run your builds.

2. Next, you will be given the option of *following* any projects you have access to that are already building on CircleCI (this would typically apply to developers connected to a company or organization's GitHub account). On the next screen, you'll be able to add the repo you just created as a new project on CircleCI.

3. To add your new repo, ensure that your GitHub account is selected in the dropdown in the upper-left, Select the Add Projects page, and find the repository you just created in the list, then click the **Set Up project** button next to it. ![]( {{ site.baseurl }}/assets/img/docs/CircleCI-add-new-project-list.png)

4. On the next screen, you're given some options for configuring your project on CircleCI. Leave everything as-is for now and just click the **Start building** button a bit down the page on the right. ![]( {{ site.baseurl }}/assets/img/docs/CircleCI-2.0-setup-project-circle101.png) ![]( {{ site.baseurl }}/assets/img/docs/CircleCI-2.0-start-building.png)

## Running Your First CircleCI Build!

You should see your build start to run automatically—and pass! So, what just happened? Click on the green Success button on the CircleCI dashboard to investigate the following parts of the run:

1. **Spin up environment:** CircleCI used the `circleci/ruby:2.4.1` Docker image to launch a virtual computing environment.

2. **Checkout code:** CircleCI checked out your GitHub repository and "cloned" it into the virtual environment launched in Step 1.

3. **echo:** This was the only other instruction in your `config.yml` file: CircleCI ran the echo command with the input "A first hello" ([echo](https://linux.die.net/man/1/echo), does exactly what you'd think it would do).

Even though there was no actual source code in your repo, and no actual tests configured in your `config.yml`, CircleCI considers your build to have "succeeded" because all steps completed successfully (returned an [exit code](https://en.wikipedia.org/wiki/Exit_status) of 0). Most projects are far more complicated, oftentimes with multiple Docker images and multiple steps, including a large number of tests. You can learn more about all the possible steps one may put in a `config.yml` file in the [Configuration Reference](https://circleci.com/docs/2.0/configuration-reference).

### Breaking Your Build!
{:.no_toc}

Edit your `config.yml` file in the GitHub editor for simplicity and replace `echo "A first hello"` with `notacommand`. Click the **Commit change** button in the GitHub editor. When you navigate back to the {% comment %} TODO: Jobs {% endcomment %}Builds page in CircleCI, you will see that a new build was triggered. This build will fail with a red Failed button and will send you a notification email of the failure.


### Using the Workflows Functionality
{:.no_toc}

1. To see Workflows in action, edit your `.circleci/config.yml` file. After you have the file in edit mode in your browser window, select the text from `build` and onwards in your file and copy and paste the text to duplicate that section. That should look similar to the code block below:

    ```yml
    version: 2
    jobs:
      build:
        docker:
          - image: circleci/ruby:2.4.1
        steps:
          - checkout
          - run: echo "A first hello"
      build:
        docker:
          - image: circleci/ruby:2.4.1
        steps:
          - checkout
          - run: echo "A first hello"
    ```

2. Next, rename your two jobs so that they have different names. In this example they are named `one` and `two`. Change the contents of the echo statements to something different. To make the {% comment %} TODO: Job {% endcomment %}build take a longer period of time we can add a system `sleep` command.

3. Add a `workflows` section to your `config.yml` file. The workflows section can be placed anywhere in the file. Typically it is found either at the top or the bottom of the file.


    ```yml
    version: 2
    jobs:
      one:
        docker:
          - image: circleci/ruby:2.4.1
        steps:
          - checkout
          - run: echo "A first hello"
          - run: sleep 25
      two:
        docker:
          - image: circleci/ruby:2.4.1
        steps:
          - checkout
          - run: echo "A more familiar hi"
          - run: sleep 15
    workflows:
      version: 2
      one_and_two:
        jobs:
          - one
          - two
    ```

4. Commit these changes to your repository and navigate back over to the CircleCI dashboard. ![]( {{ site.baseurl }}/assets/img/docs/workflows-circle-101-running.png)

5. Click on the link for your workflow to see that these two jobs run in parallel. ![]( {{ site.baseurl }}/assets/img/docs/inside-workflows-circle-101-running.png)

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

![]( {{ site.baseurl }}/assets/img/docs/SSH-screen.png)

If you are comfortable with the terminal, you can SSH directly into your CircleCI jobs to troubleshoot issues with your builds by rerunning your {% comment %} TODO: Job {% endcomment %}build with the SSH enabled option.

*Note that you will need to add your SSH keys to your GitHub account:
<https://help.github.com/articles/connecting-to-github-with-ssh/>*.


{:.tab.switcher.Cloud}
![Rebuild With SSH]( {{ site.baseurl }}/assets/img/docs/rebuild-with-SSH_newui.png)

{:.tab.switcher.Server}
![Rebuild With SSH]( {{ site.baseurl }}/assets/img/docs/rebuild-with-SSH.png)


Copy the `ssh` string from the enabling SSH section of your build. Open a terminal and paste in the `ssh` string.

Using some of the following commands, see if you can find and view the contents of the file you created using workspaces:

```
pwd                  #  print what directory, find out where you are in the file system
ls -al               # list what files and directories are in the current directory
cd <directory_name>  # change directory to the <directory_name> directory
cat <file_name>      # show me the contents of the file <file_name>
```

## See Also
{:.no_toc}

[Blog post](https://circleci.com/blog/circleci-hacks-validate-circleci-config-on-every-commit-with-a-git-hook/) on how to validate the CircleCI `config.yml` on every commit with a git hook.

### CircleCI
{:.no_toc}

* The CircleCI blog and how to follow it
  * <https://circleci.com/blog/>
* Relevant blog post  
  * <https://circleci.com/blog/what-is-continuous-integration/>
* Our other social media and GitHub
  * <https://github.com/circleci>
  * <https://twitter.com/circleci>
  * <https://www.facebook.com/circleci>

### Continuous Integration
{:.no_toc}

* <https://martinfowler.com/articles/continuousIntegration.html>
* <https://en.wikipedia.org/wiki/Continuous_integration#Best_practices>

### YAML
{:.no_toc}

* <https://en.wikipedia.org/wiki/YAML#Advanced_components>
