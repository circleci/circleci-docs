---
layout: classic-docs
title: rake db:schema:load fails
description: rake db:schema:load fails
last_updated: Feb 3, 2013
sitemap: false
---

If your build fails during the `rake db:create db:schema:load`
step, there is usually a straightforward fix.

## Identifying the problem

Usually, this error looks like

```
** Invoke db:create (first_time)
** Invoke db:load_config (first_time)
** Execute db:load_config
** Invoke rails_env (first_time)
** Execute rails_env
** Execute db:create
** Invoke db:schema:load (first_time)
** Invoke environment (first_time)
** Execute environment
rake aborted!
PG::Error: ERROR:  relation "users" does not exist
LINE 4:              WHERE a.foo = '"users"'::regclass
                              ^
SELECT a.attname, format_type(a.atttypid, a.atttypmod), d.adsrc, a.attnotnull
      FROM pg_attribute a LEFT JOIN pg_attrdef d
        ON a.attrelid = d.adrelid AND a.attnum = d.adnum
     WHERE a.attrelid = '"users"'::regclass
       AND a.attnum > 0 AND NOT a.attisdropped
     ORDER BY a.attnum
/home/ubuntu/FooBar/vendor/bundle/ruby/1.9.1/gems/activerecord-3.2.6/lib/active_record/connection_adapters/postgresql_adapter.rb:1151:in `async_exec'
```

## Understanding ActiveRecord Introspection

ActiveRecord works by introspecting the database schema.
ActiveRecord models rely on the schema being already loaded in the database to work.

This error occurs because ActiveRecord models are being used before the
schema is loaded. On CircleCI, every build runs in a clean VM, so at the
start of the build, your database doesn't exist yet.

## The Solution

The solution is to make sure that
**no ActiveRecord models are loaded during rake db:schema:load**.
There are many ways to trigger this bug, but the two most common are

*   calling class methods on ActiveRecord code during rails configuration,
*   requiring test code (such as spec/factories.rb) at file scope.

You should only require test code running tests (not while
loading config/environment.rb), and code that instantiates
models or calls class methods on models should be moved into
initializers. As a happy side-effect, your rails boot time
should decrease!

## Identifying the Source

If you have this problem, how do you figure out what line is responsible? By reading the stacktrace!

```
.../activerecord-3.2.6/lib/active_record/connection_adapters/postgresql_adapter.rb:1151:in `async_exec'

  .../activerecord-3.2.6/lib/active_record/base.rb:482:in `initialize'

  vendor/bundle/ruby/1.9.1/gems/factory_girl-4.1.0/lib/factory_girl/decorator/new_constructor.rb:9:in `new'

  vendor/bundle/ruby/1.9.1/gems/factory_girl-4.1.0/lib/factory_girl/factory_runner.rb:23:in `block in run'

spec/factories.rb:3:in `<top (required)>'

  vendor/bundle/ruby/1.9.1/gems/railties-3.2.6/lib/rails/railtie/configurable.rb:30:in `method_missing'

config/environment.rb:5:in `<top (required)>'

  vendor/bundle/ruby/1.9.1/gems/activesupport-3.2.6/lib/active_support/dependencies.rb:251:in `require'

  vendor/bundle/ruby/1.9.1/gems/activesupport-3.2.6/lib/active_support/dependencies.rb:251:in `block in require'</div>
```

Here, we can see that `config/environment.rb` loads, which then
requires `spec/factories.rb` which load,
`FactoryGirl`, which loads `ActiveRecord`.
The solution then, is to refactor the code in such
a way that spec/factories.rb isn't loaded unless tests are
actually run.

The idiomatic way to do this is by putting that code in
[initializer files](http://guides.rubyonrails.org/configuring.html#using-initializer-files),
which are only run once the complete application is loaded.
