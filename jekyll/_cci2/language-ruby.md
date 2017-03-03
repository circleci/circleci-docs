---
layout: classic-docs2
title: "Language Guide: Ruby"
short-title: "Ruby"
categories: [languages-and-tools]
order: 5
---

This guide should help get you started with a Ruby project on CircleCI 2.0. This walkthrough will be pretty thorough and will explain why we need each piece of configuration. If you’re just looking for a sample `config.yml` file, then just skip to the end.

If you want to follow along, fork our [example Rails app](https://github.com/circleci/cci-demo-rails) and add the project through CircleCI. Once you've done that, create an empty `.circleci/config.yml` in your project’s root.

Enough talk, let’s get started!

---

We always start with the version.

```yaml
version: 2
```

Next, we have a `jobs` key. Each job represents a phase in your Build-Test-Deploy process. Our sample app only needs a `build` job, so everything else is going to live under that key.

In each job, we have the option of specifying a `working_directory`. In this sample config, we’ll name it after the project in our home directory.

```yaml
version: 2
jobs:
  build:
    working_directory: ~/cci-demo-rails
```

This path will be used as the default working directory for the rest of the `job` unless otherwise specified.

Directly beneath `working_directory`, we can specify container images for the build under a `docker` key.

```yaml
version: 2
jobs:
  build:
    working_directory: ~/cci-demo-rails
    docker:
      - image: ruby:2.3
```

Normally, you’d also specify a database (DB) image here, but our app is using SQLite. SQLite is _so_ light that Rails will install it during setup, which means we don’t need to specify a DB image.

Now we’ll add several `steps` within the `build` job.

First we check out the codebase.

In our second step, we install NodeJS because Docker’s Ruby image doesn’t include it. This command will also install any tools/headers required to build native gems.

```yaml
version: 2
jobs:
  working_directory: ~/cci-demo-rails
  build:
    docker:
      - image: ruby:2.3
    steps:
      - checkout
      - run:
          name: Install System Dependencies
          command: apt-get update -qq && apt-get install -y build-essential nodejs
```

Now we have to install our actual dependencies for the project.

```yaml
...
      - run:
          name: Install Ruby Dependencies
          command: bundle install
```

Next, set up the DB.

```yaml
      - run:
          name: Create DB
          command: bundle exec rake db:create db:schema:load --trace
```

Run our migrations.

```yaml
      - run:
          name: DB Migrations
          command: bundle exec rake db:migrate
```

Finally, run our tests.

```yaml
      - run:
          name: Run Tests
          command: bundle exec rake test
```

And we're done! Let's see the whole `config.yml`:

```yaml
version: 2
jobs:
  build:
    docker:
      - image: ruby:2.3
    working_directory: ~/cci-demo-rails
    steps:
      - checkout
      - run:
          name: Install System Dependencies
          command: apt-get update -qq && apt-get install -y build-essential nodejs
      - run:
          name: Install Ruby Dependencies
          command: bundle install
      - run:
          name: Create DB
          command: bundle exec rake db:create db:schema:load --trace
      - run:
          name: DB Migrations
          command: bundle exec rake db:migrate
      - run:
          name: Run Tests
          command: bundle exec rake test
```

Nice! You just set up CircleCI for a Rails app. Check out our project’s corresponding build on CircleCI [here](https://circleci.com/gh/circleci/cci-demo-rails).

If you have any questions, head over to our [community forum](https://discuss.circleci.com/) for support from us and other users.
