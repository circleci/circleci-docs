# CircleCI Documentation

This is a public repository of CircleCI documentation. Contributions welcome!


# Installation
CircleCI Documentation is a [Jekyll](https://jekyllrb.com/) app that generates a static version of the documentation.

To develop you will need Ruby (we recommend using [rvm](https://rvm.io/) or similar Ruby version manager)

## Install Dependencies

With [Bundler](http://bundler.io/):

    bundle install --binstubs

## How to run a development server

    ./bin/jekyll serve

then navigate to [localhost:4000](http://localhost:4000)

## How to regenerate the site (which, by default will go in the `_sites` directory)

    ./bin/jekyll build




## TODO

- implement link page/children rendering
- figure out how to deal with styling
