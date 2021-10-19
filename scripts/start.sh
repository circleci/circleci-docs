#!/usr/bin/env bash

docker-compose up &
yarn webpack-watch
fg
