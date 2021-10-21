#!/usr/bin/env bash

# this function is called when Ctrl-C is sent
function trap_ctrlc ()
{
    # perform cleanup here
    yarn stop
 
    # exit shell script with error code 2
    # if omitted, shell script will continue execution
    exit 2
}
 
# initialise trap to call trap_ctrlc function
# when signal 2 (SIGINT) is received
trap "trap_ctrlc" 2

docker-compose up --build &
yarn webpack-watch
fg # bring back the docker job so we can see the output
