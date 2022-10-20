This folder contains the build tooling we use for automatically generating
documentation for the CircleCI API v1 and v2. 

API v1 currently uses [Slate](https://github.com/slatedocs/slate) to create the v1 docs. All content is managed manually from within the circleci-docs repo.

API v2 docs are created from content provided to use from the codebase in the form of a JSON file: https://circleci.com/api/v2/openapi.json, this follows the open API 3.0 spec. We use the "snippet-enricher-cli" tool to add the code exmple types we want to include, and then the Redocly CLI tool to generate the docs from the JSON. The template for the v2 docs is here: `../src-api/v2/template.hbs` and we can edit the template for the code samples here: https://github.com/circleci/circleci-docs/blob/master/src-api/openapi-patch.json

with a spec (that follows the Open API Spec) generated from the CircleCI code
base.

## Contributing

### I want to change something in API v1.

Go to source/includes/* and select the file you want to change. Push your
changes, and then the CI build will generate the new documentation.

### I want to see V1 changes locally.

You will need to follow Slate's local development process. Most of the following content
is parroted from their docs. You will need:

 - **Linux or macOS**
 - **Ruby, version 2.3.1 or newer**
 - **Bundler** — If Ruby is already installed, but the `bundle` command does not
   work, run `gem install bundler` in a terminal window.

**NOTE:** The original Slate repository requires that you _fork_ the repo to
build your docs. Instead, we have vendored the repo into _our_ docs. To develop
_our_ API locally, execute the following command:

```shell
bundle install
bundle exec middleman server
```

You can now see the docs at http://localhost:4567.

### I want to change something in API v2?

You cannot make direct changes to the API v2 content from within this repo because it is
built from a **spec** (Using Open API). The specification is generated from a backend
service, from within the code; you will need to speak with a team member who
manages/works on our APIs and ask them to make a change.

We can make changes to the templates from this repo.

### I want to see V2 changes locally.

Run the script locally: `./scripts/build_api_docs.sh -v2`

then the rendered output will be viewable on your local machine: `./docs-platform/__content/src-api/index.html` 


### Updating Slate

Slate is not exactly a library where you can run the `npm install` or `npm update` commands. If
Slate releases an update that we need, currently, it will require us to download
their repo again, and replace the `src` files (but don't delete our
index.html.md!)
