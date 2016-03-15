# CircleCI Documentation

This is a public repository of CircleCI documentation. Contributions welcome!


## Installation
CircleCI Documentation is a [Jekyll](https://jekyllrb.com/) app that generates a static version of the documentation.

To develop you will need Ruby (we recommend using [rvm](https://rvm.io/) or similar Ruby version manager)

### Install Dependencies

With [Bundler](http://bundler.io/):

    bundle install

And if you need to work on the JS:

    npm install

### How to run a development server

    bundle exec jekyll s -IDw

Or if you want to work on JS as well or just prefer Foreman:

    foreman start

then navigate to [localhost:4000](http://localhost:4000)


### How to do a one-time build of the site(which, by default will go in the `_sites` directory)

    bundle exec jekyll build

### How to generate the search index (must be done after a jekyll build, requires node)

    bin/generate-search-idx

## TODO

- implement link page/children rendering
- figure out how to deal with styling
