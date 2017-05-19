# 1. Local Development with Docker (recommended)

The recommended way to work on the CircleCI docs locally is to use Docker.

1. Install Docker for you platform: <https://docs.docker.com/engine/installation/>
2. Clone the CircleCI docs repo: `git clone https://github.com/circleci/circleci-docs.git`
3. `cd` into the directory where you cloned the docs
4. run `docker-compose up`
5. The docs site will now be running on <http://localhost:4000/docs/>

**Note:** If you want to submit a pull request to update the docs, you'll need to [make a fork](https://github.com/circleci/circleci-docs#fork-destination-box) of this repo and clone your version in step 2 above. Then when you push your changes to your fork you can submit a pull request to us.

## Editing and Contributing

Now that you have a working local environment, please follow our [Contributing Guide](CONTRIBUTING.md) to make and submit changes.

# 2. Local Development with Ruby and Bundler (alternative to Docker)

If you already have a stable Ruby environment (currently Ruby 2.3.3) and feel comfortable installing dependencies, install Jekyll by following [this guide](https://jekyllrb.com/docs/installation/).

Check out the [Gemfile](Gemfile) for the Ruby version we're currently using. We recommend [RVM](https://rvm.io/) for managing multiple Ruby versions.

We also use a gem called [HTMLProofer](https://github.com/gjtorikian/html-proofer) to test links, images, and HTML. The docs site will need a passing build to be deployed, so use HTMLProofer to test everything before you push changes to GitHub.

You're welcome to use [Bundler](http://bundler.io/) to install these gems.

## First Run

To get a local copy of our docs, run the following commands:

```bash
git clone https://github.com/circleci/circleci-docs.git
cd circleci-docs/jekyll
jekyll serve -Iw
```

Jekyll will build the site and start a web server, which can be viewed in your browser at <http://localhost:4000/docs/>. `-w` tells Jekyll to watch for changes and rebuild, while `-I` enables an incremental rebuild to keep things efficient.

For more info on how to use Jekyll, check out [their docs](https://jekyllrb.com/docs/usage/).

## Editing and Contributing

Now that you have a working local environment, please follow our [Contributing Guide](CONTRIBUTING.md) to make and submit changes.
