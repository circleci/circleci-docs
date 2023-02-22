This folder contains the build tooling we use for automatically generating
documentation for the CircleCI API v1 and v2.

API v1 currently uses [Slate](https://github.com/slatedocs/slate) to create the v1 docs. All content is managed manually from within the circleci-docs repo.

API v2 docs are created from content provided to us from the codebase in the form of a JSON file: https://circleci.com/api/v2/openapi.json, which follows the Open API 3.0 spec.

## Contributing

### I want to change something in API v1.

Go to `source/includes/*` and select the file you want to change. Push your
changes, and then the CI build will generate the new documentation.

### I want to see V1 changes locally.

Run the script locally: `./scripts/build_api_docs.sh -v1`, then the rendered output will be viewable on your local machine: `./docs-platform/__content/src-api/build/index.html`

### I want to change something in API v2?

You cannot make direct changes to the API v2 _content_ from within this repo because it is built from an **Open API spec**. The specification is generated from a backend service from within the code. You will need to speak with a team member who manages/works on the APIs to request a change.

The `snippet-enricher-cli` package adds the code example types, and then the Redoc CLI tool generates the docs from the JSON.

We can, however, make changes to the _template_ from this repo. The template for the v2 docs pages is here: https://github.com/circleci/circleci-docs/blob/master/src-api/v2/template.hbs

### I want to see V2 changes locally.

Run the script locally: `./scripts/build_api_docs.sh -v2`, then the rendered output will be viewable on your local machine: `./docs-platform/__content/src-api/index.html`


### Updating Slate

Slate is not exactly a library where you can run the `npm install` or `npm update` commands. If
Slate releases an update that we need, currently, it will require us to download
their repo again, and replace the `src` files (but don't delete our
index.html.md!)
