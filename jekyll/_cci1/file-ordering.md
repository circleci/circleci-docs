---
layout: classic-docs
title: File-ordering bugs on Linux systems
categories: [troubleshooting]
description: Dealing with file-ordering bugs on Linux systems
last_updated: Feb 2, 2013
sitemap: false
---

If your tests work on your local machine, but fail randomly on CircleCI, the most likely culprit is the dreaded file-ordering bug.
Fortunately, if you understand your code base and your tests, fixing your tests can be quite simple.

## How file-ordering affects tests

Many tests libraries, including RSpec, load all the test files in a certain directory, and then run them.
This means that not only will tests be run in a different order than you're used to locally, but also that different parts of your application will be loaded in a different order.

On macOS, directory contents are always ordered the same, due to macOS' HFS+ file system.
On Linux machines however, directory contents do not have a defined order.

This means that repeated runs on macOS systems will have the same order, but
that repeated runs on Linux systems may not. This explains why a revision's tests will sometimes fail on CircleCI, only to pass when retried.

## Why these tests fail

So why do tests fail when they are run in different orders?
Two major reasons: application code is loaded in a different order, or tests are not sufficiently independent.

### Loading application code in a different order

Test code loads application code in order to test it.
If you always run `aardvark.rb` before `bunny.rb`
then `bunny.rb` might rely on code loaded by
`aardvark.rb`.
If you run `bunny.rb` first, the code it needs won't have been loaded.
Here's a fine example of this, extracted from customer tests:

```
Failure/Error: token = ApiTokenGenerator.generate(@user.id)
  NameError:
    uninitialized constant ApiTokenGenerator::Seed
    # ./vendor/bundle/ruby/1.9.1/gems/rake-0.9.2.2/lib/rake/ext/module.rb:36:in `const_missing'
    # ./app/controllers/api_token_generator.rb:5:in `generate'
```

This particular error can be fixed by ensuring that `ApiTokenGenerator::Seed`
has been declared before it is used, typically by adding a `require`
call to `api_token_generator.rb`.

Another manifestation of this bug in Rails looks like this:

```
/home/ubuntu/circle/app/models/action.rb:1:in `<top (required)>': superclass mismatch for class Action (TypeError)
from /home/ubuntu/circle/vendor/bundle/ruby/1.9.1/gems/activesupport-3.2.6/lib/active_support/dependencies.rb:251:in `require'
from /home/ubuntu/circle/vendor/bundle/ruby/1.9.1/gems/activesupport-3.2.6/lib/active_support/dependencies.rb:251:in `block in require'
```

This usually happens when a model and another class have the same name.
When the model is initialized first, everything works, because the second use simply reopens the class.
When the model is initialized second, you get a _superclass mismatch_.
Solve this by renaming the non-model.

### Tests are not sufficiently independent

If you have two tests that are always run one after the other, you might not realize that the second test depends on some initialization in the first test.
If the tests are in the same file, this is often benign.
If the tests are in different files, then they might end up run in the wrong order, and they will fail.

These _test-ordering_ bugs typically manifest as tests which sometimes pass and sometimes fail.
This distinguishes them from _application loading-order_ bugs because the application actually loads and starts running tests.

The fix here is to remove the test inter-dependencies.
They are a bad idea.
Tests should always be idempotent, where possible.

## Reproducing the bugs?

The hardest part of fixing the bugs is reproducing the errors.
The goal is to get a short command that you can run on your local machine which reproduces the error.

For **test-ordering** bugs, use your test suite's commands to run only a minimal set of tests, or just the failing test.
Often, it will fail by itself because it depends on another test's results.
If this doesn't isolate it, the bug may be that another test leaves state behind, which interferes with the failing test.
Another way to expose the problem is by using your test suite's random-ordering functionality, such as `RSpec`'s `--order`.

For **application load-ordering** bugs, restricting the files which are loaded can help expose the issue.
Many test suites such as `RSpec` let you list test files to be loaded on the command-line.
This will allow you to just load the code which a test _thinks_ it needs, often pointing to an overlooked dependency.

Finally, if you still can't do reduce the test case, CircleCI's SSH feature is a useful way to debug the error on our actual virtual machines.
It will create a machine, start the tests running, and let you SSH in to debug.
