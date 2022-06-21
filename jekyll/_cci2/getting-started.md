---
layout: getting-started-guide-experimental
title: "Your First Green Build"
short-title: "Your First Green Build"
description: "A tutorial for getting your first green CircleCI build"
categories: [getting-started]
order: 41
toc: true
---

Follow this step-by-step guide to get your first successful green build on CircleCI using a GitHub repository.

* TOC
{:toc}

## Prerequisites for running your first build
{: #prerequisites-for-running-your-first-build }
{:.no_toc}

* Some basic knowledge of Git.
* A GitHub or Bitbucket account. We will use GitHub in this guide but you can follow the equivalent steps for Bitbucket if necessary.
* An account on CircleCI, connected to your version control system. If you do not already have an account, visit the [Signup page](https://circleci.com/signup/) to create one (optional: read through the [Sign Up & Try]({{site.baseurl}}/2.0/first-steps/) instructions).
* Prior experience using the terminal or command line is helpful, as well as some basic `bash` knowledge.

## Create a repository
{: #creating-a-repository }

1. Log in to GitHub and begin the process to [create a new repository](https://github.com/new).
1. Enter a name for your repository (for example, `hello-world`).
1. Select the option to initialize the repository with a README file.
1. Finally, click **Create repository**.

There is no need to add any source code for now.

## Set up CircleCI
{: #setting-up-circleci }

1. Navigate to the CircleCI [**Projects** page](https://app.circleci.com/projects/). If you created your new repository under an organization, you will need to select the organization name.
1. You will be taken to the **Projects** dashboard. On the dashboard, select the project you want to set up (`hello-world`).
1. Select the option to commit a starter CI pipeline to a new branch, and click **Set Up Project**. This will create a file `.circleci/config.yml` at the root of your repository on a new branch called `circleci-project-setup`.

Congratulations! You will soon have your first green build. If you are happy with this configuration, you can merge it into your main branch later.

## Dig into your first pipeline
{: #digging-into-your-first-pipeline }

So, what just happened?

1. On your project's pipeline page, click the green **Success** button, which brings you to the workflow that ran (`say-hello-workflow`).
2. Within this workflow, the pipeline ran one job, called `say-hello`. Click `say-hello` to see the steps in this job:  
    a. Spin up environment  
    b. Preparing environment variables  
    c. Checkout code  
    d. Say hello  

Every job is made up of a series of steps. Some steps, like [`checkout`]({{site.baseurl}}/2.0/configuration-reference/#checkout), are special, reserved commands in CircleCI. The example config uses both the reserved `checkout` and [`run`]({{site.baseurl}}/2.0/configuration-reference/#run) steps. Custom steps can also be defined within a job to achieve a user-specified purpose.

Even though there is no actual source code in your repo, and no actual tests
configured in your `.circleci/config.yml`, CircleCI considers your build to have
succeeded because all steps completed successfully (returned an [exit
code](https://en.wikipedia.org/wiki/Exit_status) of 0). Most projects are far
more complicated, oftentimes with multiple Docker images and multiple steps,
including a large number of tests. You can learn more about all the possible
steps one may put in a `.circleci/config.yml` file in the [Configuration
Reference]({{site.baseurl}}/2.0/configuration-reference).

### Break your build!
{: #breaking-your-build }
{:.no_toc}

In this section, you will edit the `.circleci/config.yml` file and see what happens if a build does not complete successfully.

It is possible to edit files directly on GitHub. Open the URL below in a browser, substituting
your username (or organization) and the name of your repository (replace the text with `{brackets}`). Or, if you are comfortable with Git and the command line, use your
text editor and push your changes in the terminal.

`https://github.com/{username}/{repo}/edit/circleci-project-setup/.circleci/config.yml`

Let's use the [Node orb](https://circleci.com/developer/orbs/orb/circleci/node). Replace the existing config by pasting the following code:

```yaml
version: 2.1
orbs:
  node: circleci/node@4.7.0
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


Commit your change, then return to the **Projects** page
in CircleCI. You should see a new pipeline running... and it will fail! What's going on?

The Node orb runs some common Node tasks. Because you are working with an empty
repository, running `npm run test`, a Node script, causes the configuration to
fail. To fix this, you need to set up a Node project in your
repository—a topic for another tutorial. You can view several [demo
applications]({{site.baseurl}}/2.0/examples-and-guides-overview/) that go into more detail on
setting up CircleCI with various languages and frameworks.

## Use workflows
{: #using-the-workflows-functionality }
{:.no_toc}

You do not have to use orbs to use CircleCI. The following example details how
to create a custom configuration that also uses the [workflow
feature]({{site.baseurl}}/2.0/workflows) of CircleCI.

1. Take a moment and read the comments in the code block below. Then, to see workflows in action, edit your `.circleci/config.yml` file
and copy and paste the following text into it.

   ```yaml
   version: 2
   jobs: # we now have TWO jobs, so that a workflow can coordinate them!
     one: # This is our first job.
       docker: # it uses the docker executor
         - image: cimg/ruby:2.6.8 # specifically, a docker image with ruby 2.6.8
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
         - image: cimg/ruby:3.0.2
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


1. Commit these changes to your repository and navigate back to the
    CircleCI **Pipelines** page. You should see your pipeline running.

1. Click on the running pipeline to view the workflow you have created. You
    should see that two jobs ran (or are currently running!) concurrently.

Read more about workflows in the [Orchestrating
Workflows]({{site.baseurl}}/2.0/workflows/#overview) documentation.

### Add some changes to use workspaces
{: #adding-some-changes-to-use-the-workspaces-functionality }
{:.no_toc}

Each workflow has an associated workspace which can be used to transfer files to
downstream jobs as the workflow progresses. You can use workspaces to pass along
data that is unique to this run and which is needed for downstream jobs. Try
updating `config.yml` to the following:

```yaml
version: 2
jobs:
  one:
    docker:
      - image: cimg/ruby:3.0.2
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
      - image: cimg/ruby:3.0.2
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

Learn more about this feature in the [Workspaces]({{site.baseurl}}/2.0/workspaces/) page.

### SSH into your jobs
{: #ssh-into-your-jobs}
{:.no_toc}

If you are comfortable with the terminal, you can rerun a CircleCI job with SSH enabled, then SSH directly into your jobs to troubleshoot issues.

- You will need to [add your SSH keys to your GitHub account](https://help.github.com/articles/connecting-to-github-with-ssh/).
- To enable the **Rerun Job with SSH** option, you will also need to add your SSH keys to the appropriate job. Refer to the [Adding SSH Keys to a Job]({{site.baseurl}}/2.0/add-ssh-key/#adding-ssh-keys-to-a-job) instructions.

{:.tab.switcher.Cloud}
![Rebuild With SSH]( {{ site.baseurl }}/assets/img/docs/rebuild-with-SSH_newui.png)

{:.tab.switcher.Server_3}
![Rebuild With SSH]( {{ site.baseurl }}/assets/img/docs/rebuild-with-SSH_newui.png)

{:.tab.switcher.Server_2}
![Rebuild With SSH]( {{ site.baseurl }}/assets/img/docs/rebuild-with-SSH.png)


Copy the `ssh` string from the enabling SSH section of your build. Then, paste in and execute the `ssh` command in the terminal.

Using some of the following commands, see if you can find and view the contents
of the file you created using workspaces:

```
pwd                  # print what directory, find out where you are in the file system
ls -al               # list what files and directories are in the current directory
cd <directory_name>  # change directory to the <directory_name> directory
cat <file_name>      # show me the contents of the file <file_name>
```


## Collaborating with teammates
{: #collaborating-with-teammates }

It is easy for teammates and collaborators to view and follow your projects.
Teammates can make a free CircleCI account at any time to view your pipelines,
even if they are not committing any code.

## See also
{: #see-also }
{:.no_toc}

- [Configuration Reference]({{site.baseurl}}/2.0/configuration-reference/)
- [CircleCI concepts]({{site.baseurl}}/)
- [Automate common tasks with orbs]({{site.baseurl}}/)

