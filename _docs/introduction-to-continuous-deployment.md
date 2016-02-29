---

title: Introduction to Continuous Deployment
layout: doc

---

Circle enables you to automatically deploy after green builds.
We have customers deploying to PaaSes such as Heroku, Engine Yard,
Google App Engine and Bluemix, hosted cloud servers (like EC2 and Rackspace),
and to private and colo servers&mdash;even behind firewalls.
Some use tools like Capistrano, Fabric, and Paver.

However you want to deploy your code, Circle makes
Continuous Deployment easy.

### Deployment syntax

Tell Circle about your deployment requirements in the `deployment`
section of your [circle.yml](/docs/configuration) file.
Within this section, you can can define custom deployment steps for each
branch, directing Circle to use specific deployment tools or custom scripts.
Deployment commands are triggered only after a successful build.

The following example will run the `deploy-to-production.sh`
script when the tests pass on the master branch and run the
`deploy-to-staging.sh` script when the tests pass on the staging branch.

<pre>
deployment:
  production: # just a label; label names are completely up to you
    branch: master
    commands:
      - ./deploy-to-production.sh
  staging:
    branch: staging
    commands:
      - ./deploy-to-staging.sh
</pre>

#### Regular Expressions
You can also use regular expressions in the `branch` property.

One example is to deploy branches matching a prefix, e.g. "feature-":

<pre>
deployment:
  development:
    branch: /feature-.*/  # branches starting with "feature-"
    commands:
      - ./deploy-feature-branch
</pre>

You could also run deployments for everything but the master branch:

<pre>
deployment:
  development:
    branch: /^((?!master).)*$/  # not the master branch
    commands:
      - ./deploy-development
</pre>



### Deploy over SSH

First you need to upload your SSH keys from your project's
**Project Settings > SSH keys** page in the Circle UI.
Circle will automatically add them to the `ssh-agent`,
so they are available for forwarding.

You can list commands or include bash scripts for SSH deployment in the
`circle.yml` file.
You can also use tools such as Capistrano or Fabric when deploying to
private servers or to EC2, Rackspace, and other cloud hosting providers.

You can use your existing Capistrano recipes, for example:

<pre>
deployment:
  production:
    branch: master
    commands:
      - bundle exec cap production deploy
</pre>

Here's an example using Fabric:

<pre>
deployment:
  production:
    branch: master
    commands:
      - fab deploy
</pre>

### Deploy to a PaaS

Circle has customers deploying to Heroku, Engine Yard, Google App Engine, Elastic Beanstalk, Dot Cloud, Nodejistu and other PaaSes. We have detailed instructions on deployment to
[Heroku](/docs/continuous-deployment-with-heroku),
[Google App Engine](/docs/deploy-google-app-engine)
and [Bluemix](/docs/deploy-bluemix).
If you'd like help setting up your deployment, please
[contact us](mailto:sayhi@circleci.com).
