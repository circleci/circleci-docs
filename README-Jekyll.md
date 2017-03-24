# Using Jekyll for Local Development

If you already have a stable Ruby environment and feel comfortable installing dependencies, install Jekyll by following [this guide](https://jekyllrb.com/docs/installation/).

Check out the [Gemfile](Gemfile) for the Ruby version we're currently using. We recommend [RVM](https://rvm.io/) for managing multiple Ruby versions.

We also use a gem called [HTMLProofer](https://github.com/gjtorikian/html-proofer) to test links, images, and HTML. The docs site will need a passing build to be deployed, so use HTMLProofer to test everything before you push changes to GitHub.

You're also welcome to use [Bundler](http://bundler.io/) to install these gems.

## First Run
To get a local copy of our docs, run the following commands:

```bash
git clone https://github.com/circleci/circleci-docs.git
cd circleci-docs/jekyll
jekyll serve -Iw
```

Jekyll will build the site and start a web server, which can be viewed in your browser at <http://localhost:4000/docs/>. `-w` tells Jekyll to watch for changes and rebuild, while `-I` enables an incremental rebuild to keep things efficient.

For more info on how to use Jekyll, check out [their docs](https://jekyllrb.com/docs/usage/).

## Editing Docs

Now that you have a working local environment, please follow our [Contributing Guide](CONTRIBUTING.md) to make and submit changes.
