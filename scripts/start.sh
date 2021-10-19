#!/usr/bin/env bash

docker-compose up &
yarn webpack-watch
fg # bring back the docker job so we can see the output
