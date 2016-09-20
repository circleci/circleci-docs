#!/usr/bin/env bash

sudo apt-get update
sudo apt-get -y upgrade
sudo apt-get -y install git

# Install RVM so we can run a recent version of Jekyll.
gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
\curl -sSL https://get.rvm.io | bash -s stable --ruby=2.3.1 --gems=bundler,jekyll,html-proofer
source ~/.rvm/scripts/rvm

# Install Jekyll and dependencies
cd /vagrant && bundle install
