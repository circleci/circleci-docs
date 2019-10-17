#!/bin/bash

# commands to build the widdershins/slate api documentation.
#

build_api_v1() {
    echo "Building API v1 documentation with Slate"
    cd src-api
    bundle exec middleman build --clean
    echo "Output bundled."
    cp -R build/* /tmp/workspace/api
    echo "Output build moved to /tmp/workspace/api"
}

# Fetches the latest api spec and runs widdershins with it.
build_api_v2() {
    echo "Building API v2 documentation with Slate and Widdershins"
    cd src-api; rm -r build; rm source/index.html.md
    curl https://circleci.com/api/v2/openapi.json > openapi.json
    node node_modules/widdershins/widdershins.js --environment ../widdershins.apiv2.yml --summary openapi.json -o source/index.html.md
    bundle exec middleman build --clean
    cp -R build/* /tmp/workspace/api/v2
    echo "Output build moved to /tmp/workspace/api/v2"
}


if [ "$1" == "-v1" ]
then
	build_api_v1
elif [ "$1" == "-v2" ]
then
	build_api_v2
else
	echo "Invalid command"
fi
