> CircleCI Config Builder

`src-config-builder` is a React application that creates a front-end-only
application that can generate a `.circleci/config.yml` file for users.

This tool was originally intended to provider user's with tools to quickly prototype a
config and has been built with the possibility of being expanded (following some
of the patterns and tooling of our larger front-end applications.)

For now, the config builder is transplanted and run within the docs and is not
used as a part of onboarding, nor is part of any other in-app functionality.

## Regarding Development.

This project was bootstrapped with [Create React
App](https://github.com/facebook/create-react-app). The project uses typescript
and styled-components via emotion.

## Available Scripts

``` sh
npm install     # install all dependencies.
npm start       # boot the app into localhost:3000
npm build       # created a build of the app, which can be hosted in the docs.
```

Because this is a CRA app, there is an eject script. I'd recommend not touching
that button.

## Regarding Deployment.

`npm run build` creates an output folder. Based on our `package.json`'s
`homepage`  key, the app will build out relatively links as expected. Because
this is being hosted at `circleci.com/docs/config-builder` we set the homepage
to `.`.

The `build` output is moved into the `jekyll` subfolder at CI time.

