---
layout: classic-docs
title: RSpec is failing but CircleCI reports my tests have passed
description: What is happening when RSpec is failing but CircleCI reports my tests have passed 
last_updated: Dec 20, 2013
sitemap: false
---

CircleCI uses the exit code of each test command to determine success or
failure. A combination of bugs in Ruby and RSpec can make RSpec return an
exit code of 0 (indicating success) even when the specs have failed, tricking
us into reporting success incorrectly.

## The gory details

RSpec runs in an `at_exit` block. This makes it easy to run with
either `ruby` or `rspec`.

But this also makes RSpec susceptible to some bugs and/or incorrect
`at_exit` blocks resetting its exit code.
The major causes are:

1.  [A bug in Ruby's at_exit code](http://bugs.ruby-lang.org/issues/5218)
where exceptions thrown during at_exit cause the exit status to be reset
to 0, even if the exception is handled inside the `at_exit`
block. This bug has been difficult to truly squash and has appeared in
[several Ruby versions](https://gist.github.com/gordonsyme/8062293)
over time.

2.  [A bug in RSpec's at_exit block](https://github.com/rspec/rspec-core/pull/569)
which masks non-zero exit codes by ignoring the value of `$!`.

3.  `at_exit` blocks added by the code under test which don't
propagate the exit status properly.

## How to fix

You should be able to reproduce the problem either locally or via SSH into a
build machine:
`bundle exec rspec some-failing-test` followed by `echo
$?` to show the exit code.

The first thing to do is to upgrade your Ruby patchset and/or your RSpec
version to make sure you have the fixes for the above bugs.

After that, with RSpec, the most common source of incorrect exit statuses is
`at_exit` blocks which either call `exit` and fail to
propagate the previous exit status, or throw exceptions. Do you have any
`at_exit` code that might be breaking?

You can use this pattern to preserve non-zero exit codes if you do need to
call `exit` from your `at_exit` blocks:

```
at_exit do
  new_exit_status = cleanup_code arg1, arg2
  exit new_exit_status unless $!
end
```
