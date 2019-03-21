<p align="center">
  <img src="https://raw.githubusercontent.com/lord/img/master/logo-slate.png" alt="Slate: API Documentation Generator" width="226">
  <br>
</p>

### Prerequisites

You're going to need:

 - **Linux or macOS** — Windows may work, but is unsupported.
 - **Ruby, version 2.3.1 or newer**
 - **Bundler** — If Ruby is already installed, but the `bundle` command doesn't work, just run `gem install bundler` in a terminal.

### Getting Set Up

**NOTE:** The original Slate repository requires that you _fork_ the repo to build your docs. Instead, we've vendored the repo into _our_ docs. To develop _our_ API locally, execute the following:

```shell
bundle install
bundle exec middleman server
```

You can now see the docs at http://localhost:4567.

### Updating Slate

Slate isn't exactly a library that you can `npm install` or `npm update`. If Slate releases an update that we need, currently, it will require us to download their repo again, and replace the src files (but don't delete our index.html.md!)