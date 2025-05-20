---
layout: classic-docs
title: Rake giving ActionFailed errors
description: Rake giving ActionFailed errors
last_updated: Feb 3, 2013
sitemap: false
---

Sometimes in Rails projects you can see Rake throw ActionFailed errors
which simply do not make sense. For example:

```
** Invoke ts:start (first_time)
** Invoke environment
** Execute ts:start
Started searchd successfully (pid: 35322).
invalid option: --trace
Test::Unit automatic runner.
Usage: /home/ubuntu/.rvm/rubies/ruby-2.2.1/bin/rake [options] [--
untouched arguments]

Deprecated options:

export RAILS_ENV="test"
export RACK_ENV="test"
bundle exec rake db:create db:schema:load ts:configure ts:index ts:start
--trace
 returned exit code 1
```

If you are using `Test::Unit`, it may be the problem.

Test::Unit installs an `at_exit` handler that will automatically try to
run the tests when the Ruby process exits. Basically, as soon as you
require 'test/unit' it installs this handler.
So, it processes the CLI args when it runs at the Ruby VM exit. This is why
Rake runs fine, then you get a help message explaining Test::Unit's CLI
args.

## Solution

The best solution is to find out what's being loaded during your Rake
tasks that require `test/unit`. We don’t think it’s a common practice,
so we would suggest questioning whether you really need to require
`test/unit` in those tasks. You could potentially be using symbols from
`test/unit` even without requiring it in the code—please check that as
well.

## Workaround

If you really need to require `test/unit`, we suggest following the
fix that has been suggested [in this blog
post](http://www.jonathanleighton.com/articles/2012/stop-test-unit-autorun/)—
monkey-patching `Test::Unit` to disable this behavior. You can
add the following code to your Rakefile, under the `test` task:

```
# Rakefile
require 'test/unit'

class Test::Unit::Runner
  @@stop_auto_run = true
end

class FooTest < Test::Unit::TestCase
  def test_foo
    assert true
  end
end

Test::Unit::Runner.new.run(ARGV)
```
