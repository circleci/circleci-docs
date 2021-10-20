This directory is a placeholder for API documentation that is built from `src-api`, during our CI pipeline.

Notes:

- The `v1-reference.md` document is a legacy document.
- Visit the configuration reference and the shell script "build_api_docs" to see how the Slate documentation is generated and moved into place during the pipeline.
- We present our API documentation in versioned paths: (`api/v1...` , `api/v2` etc.); because some legacy linking and seo; we also put the latest api document at the root (ie, `circleci.com/docs/api` should point to the latest version.) 
