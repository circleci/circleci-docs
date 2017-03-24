There are two ways to run a local development server: [install Jekyll](#install-jekyll) or [use Vagrant](#use-vagrant).

# Install Jekyll

If you already have a stable Ruby environment and feel comfortable installing dependencies, install Jekyll by following [this guide](https://jekyllrb.com/docs/installation/).

Check out the [Gemfile](Gemfile) for the Ruby version we're currently using. We recommend [RVM](https://rvm.io/) for managing multiple Ruby versions.

We also use a gem called [HTMLProofer](https://github.com/gjtorikian/html-proofer) to test links, images, and HTML. The docs site will need a passing build to be deployed, so use HTMLProofer to test everything before you push changes to GitHub.

You're also welcome to use [Bundler](http://bundler.io/) to install these gems.

## First Run
To get a local copy of our docs, run the following commands:

```bash
git clone https://github.com/circleci/circleci-docs.git
cd circleci-docs/jekyll
jekyll serve -Iw
```

Jekyll will build the site and start a web server, which can be viewed in your browser at <http://localhost:4000/docs/>. `-w` tells Jekyll to watch for changes and rebuild, while `-I` enables an incremental rebuild to speed things up.

For more info on how to use Jekyll, check out [their docs](https://jekyllrb.com/docs/usage/).

# Use Vagrant

If you don't want to install Jekyll, you can use Vagrant to set up a clean environment with all of the project's necessary dependencies.

## Prerequisites
- Vagrant: [download directly](https://www.vagrantup.com/downloads.html), `brew cask install vagrant`, or `sudo apt-get install vagrant`
- VirtualBox: [download directly](https://www.virtualbox.org/wiki/Downloads), `brew cask install virtualbox`, or `sudo apt-get install virtualbox`

## macOS Setup

Open a terminal window and follow these steps to set up your local development environment with Vagrant and Brew.

1. Install Xcode:

    `xcode-select --install`

2. Install Homebrew, a macOS package manager:

    `ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"`

3. Install Vagrant:

    `brew cask install vagrant`

4. Install VirtualBox:

    `brew cask install virtualbox`

5. Fork the `circleci-docs` repo on GitHub:

6. Clone your fork of the `circleci-docs` repo:

    `git clone https://github.com/<my_github_username>/circleci-docs.git`

7. `cd` into `circleci-docs` and start Jekyll by running `./jctl start`. The first time you run this command, Vagrant will provision the entire VM based on the contents of `boostrap.sh`. This process can take a few minutes, but it's a one-time deal.

After successful completion, Jekyll will automatically start in the VM. Vagrant will then begin forwarding port 4040, and you'll be able to view the complete documentation site at <http://localhost:4040/docs/>.

### Jekyll Controller Commands

The Jekyll Controller (`jctl`) is a bash wrapper script that talks to Jekyll & Vagrant.

- `./jctl start`: Starts Jekyll; will also start Vagrant, if not already running
- `./jctl rebuild`: Rebuilds the site
- `./jctl stop`: Shuts down entire VM (including Jekyll)
- `./jctl restart`: Stops and then starts the VM `./jctl stop && ./jctl start`

As an alternative to `jctl`, you can log directly into the VM to interact with Jekyll. Run `vagrant ssh` to enter the VM, then `cd /vagrant/jekyll` to access the repository's files. From there, you can run standard Jekyll commands with any preferred options.

# Editing Docs

Now that you have a working local environment, please follow our [Contributing Guide](CONTRIBUTING.md) to make and submit changes.
