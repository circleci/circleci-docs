---

title: What happens when you add a project?
layout: doc
tags:
  - github
  - privacy-security

---

Generally, pretty much what you'd expect if you were implementing this yourself:

*   Using the permissions you gave CircleCI when you signed up, we'll add some Github settings to your project:
    *   A **deploy key**&mdash;used to check out your project from GitHub
    *   A **service hook**&mdash;used to notify CircleCI when you push to GitHub
*   CircleCI immediately checks your code out onto our machines, infers your settings from your code, and runs your first build.
*   Our inference algorithms look through your dependencies, Gemfile, libraries, and code to figure out how to run your tests.
    For example, we might find that you have a standard Rails project using Postgres specifications and features, so we'll run:

    ```
bundle install
bundle exec rake db:schema:load
bundle exec rspec spec
bundle exec cucumber
```

*   We run your tests on a clean virtual machine every time.
This means that:

    *   Your code isn't accessible to other users
    *   We run your tests freshly each time you push

*   You can watch your tests update in real-time on [your dashboard](/).
*   We'll send you a notification when you're done.
