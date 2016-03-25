---
layout: classic-docs
title: The Ruby debugger gem won't build
description: What is happening when the Ruby debugger gem won't build
last_updated: Dec 20, 2013
---

The Ruby debugger gem builds native extensions and uses the
[debugger-ruby_core_source gem](https://github.com/cldwalker/debugger-ruby_core_source)
to provide the Ruby headers it needs to compile them.

Unfortunately debugger-ruby_core_source doesn't include headers for every
version of Ruby so debugger can only be used with a
[subset of Ruby versions](https://github.com/cldwalker/debugger-ruby_core_source/tree/master/lib/debugger/ruby_core_source).

You can recognise when debugger doesn't support your version of Ruby if you see a line similar to
`No source for ruby-1.9.2-p320 provided with debugger-ruby_core_source gem.`
in your `bundle install` output.

## Interaction with the CircleCI cache

Sometimes people will update their version of Ruby to a version that doesn't
work with debugger, and not experience any problems because the compiled
native extensions are still in their CircleCI cache.

Then the old cache will go away (happens periodically, or through manual
intervention), and suddenly the build doesn't work anymore.

## Solutions

There are two ways to get builds working again

*   Switch to a version of Ruby that's supported by debugger.
*   Stop using the debugger gem.

For the adventurous amongst you you can put debugger into a group in your
Gemfile and then excluding that group in your `bundle install`
command.

E.g.:

In your Gemfile:

```
gem "debugger", :groups => [:development]
```

And in your `circle.yml`

```
dependencies:
  bundler:
    without:
      - development
```

This won't work if you've specifically required debugger in your application
code, in that case you'll have to use one of the 
[supported Ruby versions](https://github.com/cldwalker/debugger-ruby_core_source/tree/master/lib/debugger/ruby_core_source).
