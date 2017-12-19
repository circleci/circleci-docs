---
layout: classic-docs
title: "Overview"
short-title: "Overview"
description: "Starting point for CircleCI 2.0 docs"
categories: [getting-started]
order: 1
---

*[2.0]({{ site.baseurl }}/2.0/) > Overview*

The following video describes continuous integration, provides a demo of the application, and includes a summary of continuous deployment.

<iframe width="560" height="315" src="https://www.youtube.com/embed/YGYoYSR-d98" frameborder="0" allowfullscreen></iframe>

## What is Continuious Integration?

**Continuous integration** is a practice that encourages developers to integrate their code into a `master` branch of a shared repository early and often. Instead of building out features in isolation and integrating them at the end of a development cycle, code is integrated with the shared repository by each developer multiple times throughout the day.

**Continuous Integration** is a key step to digital transformation.

**What?**    
Every developer commits daily to a shared mainline.  
Every commit triggers an automated build and test.  
If build and test fails, it’s repaired quickly - within minutes.  

**Why?**    
Improve team productivity, efficiency, and happiness.
Find problems and solve them, quickly.
Release higher quality, more stable products.

## CircleCI

**CircleCI** - Our mission is to empower technology-driven organizations to do their best work.  
We want to make engineering teams more productive through intelligent automation.

*CircleCI provides Enterprise-class support and services, with the flexibility of a startup.  
We work where you work: Linux, macOS, Android - SaaS or behind your firewall.  
Leverage the opportunities created by your modern Git repos.  
Set up in minutes out of the box, or fully customize to suit your needs.*

## First CircleCI Build

### Prerequisites

* Some basic knowledge of git and an existing GitHub.com account or ability to create one.
* Some basic terminal or `bash` know-how is helpful. Prior experience using the command line comes in handy.
* It is necessary to have your GitHub.com SSH Keys setup for the SSH-ing into your build section. The information you need for that is [here]<https://help.github.com/articles/connecting-to-github-with-ssh/>.

### Creating a Repository
* Navigate to your account on GitHub.com
  * Go to the **Repositories** tab and then select **New**
  * Alternatively you can navigate directly to <https://github.com/new>

![New GitHub Repo Banner]( {{ site.baseurl }}/assets/img/docs/GH_Repo-New-Banner.png)

* Select Initialize this repository with a README and click the Create repository button.

![Initialize with README checkbox]( {{ site.baseurl }}/assets/img/docs/create-repo-circle-101-initialise-readme.png)

### Adding a .yml File

CircleCI uses a YAML,  <https://en.wikipedia.org/wiki/YAML>, file to identify how you want your testing environment setup and what tests you want to run.
On CircleCI 2.0, this file must be called `config.yml` and must be in a hidden folder called `.circleci` (on Mac, Linux, and Windows systems, files and folders whose names start with a period are treated as system files that are hidden from users by default).

 * To create the file and folder on GitHub, click the **"Create new file"** button the repo page and type `.circleci/config.yml`.

 * You should now have in front of you a blank `config.yml` file in a `.circleci` folder.

* To start out with a simple config.yml, copy the text below into the file editing window on GitHub:

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

The `- image: circleci/ruby:2.4.1` text tells CircleCI what Docker image to use when it builds your project. CircleCI will use the image to boot up a "container" — a virtual computing environment where it will install any languages, system utilities, dependencies, web browsers, etc., that your project might need in order to run.

### Setting up Your Build on CircleCI

For this step, you will need a CircleCI account. Visit <https://circleci.com/signup> and click "Start with GitHub". You will need to give CircleCI access to your GitHub account in order to run your builds.

If you already have a CircleCI account then you can navigate to your dashboard: <https://circleci.com/dashboard>

Next, you will be given the option of "following" any projects you have access to that are already building on CircleCI (this would typically apply to developers connected to a company or organization's GitHub/Bitbucket account). On the next screen, you'll be able to add the repo you just created as a new project on Circle.

To add your new repo, ensure that your GitHub account is selected in the dropdown in the upper-left, find the repository you just created below, and click the "Setup project" button next to it.

![Add Project List]( {{ site.baseurl }}/assets/img/docs/CircleCI-add-new-project-list.png)

On the next screen, you're given some options for configuring your project on CircleCI. Leave everything as-is for now and just click the "Start building" button a bit down the page on the right.

![Setup Project Page]( {{ site.baseurl }}/assets/img/docs/CircleCI-2.0-setup-project-circle101.png)

![Start Building Button]( {{ site.baseurl }}/assets/img/docs/CircleCI-2.0-start-building.png)

### Running Your First CircleCI Build!

You should see your build start to run automatically—and pass! So, what just happened? Click on the green button and let's investigate.

1. **Spin up environment:** CircleCI used the `circleci/ruby:2.4.1` Docker image to launch a virtual computing environment.

2. **Checkout code:** CircleCI checked out your GitHub repository and "cloned" it into the virtual environment launched in step 1.

3. **echo:** this was the only other instruction in your `config.yml` file: CircleCI ran the echo command with the input "A first hello" (echo,  <https://linux.die.net/man/1/echo>, does exactly what you'd think it would do).

Even though there was no actual source code in your repo, and no actual tests configured in your `config.yml`, CircleCI considers your build to have "succeeded" because all steps completed successfully (returned an exit code, <https://en.wikipedia.org/wiki/Exit_status>, of 0. Most customers' projects are far more complicated, oftentimes with multiple Docker images and multiple steps, including a large number of tests—here's an example. You can learn more about all the possible steps one might put in a `config.yml` file <https://circleci.com/docs/2.0/configuration-reference>.

### Breaking Your Build!

Edit your `config.yml` file (you can just do this in the GitHub editor for simplicity) and replace `echo "A first hello"` with `notacommand`. Commit and push this change (or just hit "Commit" in the GitHub editor) to trigger a new build and see what happens!


### Using the Workflows Functionality

To see workflow in action you can edit your `.circle/config.yml` file. After you have the file in edit mode in your browser window, select the text from `build` and onwards in your file and copy and paste the text to duplicate that section.

That should look similar to the code block below:

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

Next we need to rename our two builds so that they have different names. In the example below the names are `one` and `two`. Change the contents of the echo statements to something different. To make the build take a longer period of time we can add a system sleep command.

Next, you need to add a `workflows` section to our config file. The workflows section can be placed anywhere in the file. Typically it is at the bottom of the file.


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

Commit these changes to your repository and navigate back over to the CircleCI dashboard.

![Running Workflows]( {{ site.baseurl }}/assets/img/docs/workflows-circle-101-running.png)

And drilling a little deeper into our workflow...

![More detaileds of Workflow]( {{ site.baseurl }}/assets/img/docs/inside-workflows-circle-101-running.png)

You can read more about workflows here: <https://circleci.com/docs/2.0/workflows/#overview>.

### Adding Some Changes to use the Workspaces Functionality

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

You can read more about workspaces here: <https://circleci.com/docs/2.0/workflows/#using-workspaces-to-share-data-among-jobs>.

### SSH-ing into Your Build

![Image of Terminal Icon]( {{ site.baseurl }}/assets/img/docs/SSH-screen.png)

For those who are comfortable with the terminal, you can SSH directly into your CircleCI jobs to troubleshoot issues with your builds by rerunning your build with the SSH enabled option.

*Note that you will need to add your SSH keys to your GitHub account:
<https://help.github.com/articles/connecting-to-github-with-ssh/>*.

![Image of Rebuild with SSH menu item]( {{ site.baseurl }}/assets/img/docs/rebuild-with-SSH.png)

![SSH build terminal string]( {{ site.baseurl }}/assets/img/docs/SSH-build-terminal-string.png)

Copy the `ssh` string from the enabling SSH section of your build. Open a terminal and paste in the `ssh` string.

Using some of the following commands see if you can find and view the contents of the file we created using workspaces

```
pwd     #  print what directory, find out where you are in the file system
ls -al   # list what files and directories are in the current directory
cd <directory_name>    # change directory to the <directory_name> directory
cat <file_name>    # show me the contents of the file <file_name>
```

## Further Resources and Links

Blog post on how to validate the CircleCI `config.yml` on every commit with a git hook:
<https://circleci.com/blog/circleci-hacks-validate-circleci-config-on-every-commit-with-a-git-hook/>

### CircleCI

* The CircleCI blog and how to follow it
  * <https://circleci.com/blog/>
* Relavant blog post  
  * <https://circleci.com/blog/what-is-continuous-integration/>
* Our other social media and GitHub
  * <https://github.com/circleci>
  * <https://twitter.com/circleci>
  * <https://www.facebook.com/circleci>

### Continuous Integration

* <https://martinfowler.com/articles/continuousIntegration.html>
* <https://en.wikipedia.org/wiki/Continuous_integration#Best_practices>

### YAML
* <https://en.wikipedia.org/wiki/YAML#Advanced_components>

## Summary

After a software repository on GitHub or Bitbucket is authorized and added as a project to circleci.com, every code change  triggers a build and automated tests in a clean container or VM configured for your requirements. CircleCI then sends an email notification of success or failure after the build and tests complete. CircleCI also includes integrated Slack, HipChat, Campfire, Flowdock, and IRC notifications. Code test coverage results are available from the details page for any project for which a reporting library is added.

CircleCI may be configured to deploy code to various environments, including AWS CodeDeploy, AWS EC2 Container Service (ECS), AWS S3, Google Container Engine (GKE), and Heroku. Other cloud service deployments are easily scripted using SSH or by installing the API client of the service with your job configuration.

## Customer Use Cases

The following section outlines two examples of real-world CircleCI usage.

### Coinbase
Coinbase runs CircleCI Enterprise behind their firewall for security and reliability. The [Coinbase case study report](https://circleci.com/customers/coinbase/) reveals that using CircleCI reduced their average time from merge to deploy in half, reduced operations time spent on continuous integration maintenance from 50% of one person's time to less than one hour per week, and increased developer throughput by 20%.

### SONY
Sony Japan continuously deploys microservices built with Go and Docker in minutes using the CircleCI hosted application as described in the [SONY case study report](https://circleci.com/customers/sony/). The NG-Core services are written in Go, packaged into Docker containers, pushed to Docker Hub, then deployed to AWS Elastic Beanstalk. In detail, the process looks like this:

1. The developer commits and pushes to GitHub
2. CircleCI receives a hook from GitHub, triggering a build
3. CircleCI pulls down the latest code, compiles the Go binaries, and creates a deployable image with docker build
4. Unit and integration tests are run, including some tests that use the final Docker image
5. The Docker image is pushed to Docker Hub, and a new deployment is triggered on Elastic Beanstalk
6. A final live system test is run after the deployment

The entire build and test processes each run about 5 minutes, and when deployments are triggered they run about an additional 10 minutes. The NG-Core team started development using this process in May of 2014, has been in production since January 2015, and they are extremely happy with the setup.

See the [CircleCI Customers page](https://circleci.com/customers/) for the complete set of case studies for companies large and small who are using CircleCI, including the following:

- [How **Fanatics** Team Efficiency Increased by 3x with CircleCI](https://circleci.com/customers/fanatics/)
- [CircleCI Enables **Cruise Automation** (Subsidiary of GM) to Run Many More Simulations](https://circleci.com/customers/cruise/)
- [**Shopify** has 130 Engineers Merging 300 Pull Requests and Deploying 100 Times a Week with CircleCI](https://circleci.com/customers/shopify/)

## Free Trial Options

CircleCI provides a free trial with the following options:

- **Cloud**: See [Signup and Try CircleCI]({{site.baseurl}}/2.0/first-steps/) to get started with the hosted application.
- **Server**: Refer to [CircleCI Trial Installation]({{site.baseurl}}/2.0/single-box/) for the Enterprise Trial instructions.
