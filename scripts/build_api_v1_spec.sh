#!/bin/bash
echo "Building API v1.1 documentation with Redocly CLI"
cd src-api/api-spec-v1;
echo "Bundle api docs and remove unused components"
npx redocly bundle openapi.json --remove-unused-components --output openapi-final.json
echo "Lint API docs"
npx redocly lint openapi-final.json
echo "Build docs with redocly cli."
npx redocly build-docs openapi-final.json
