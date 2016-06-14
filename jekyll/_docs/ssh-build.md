---
layout: classic-docs
title: SSH access to builds
categories: [troubleshooting]
description: SSH access to builds
---

Often the best way to troubleshoot problems is to ssh into a
running or finished build to look at log files, running processes,
and so on.

You can do that with CircleCI!

There are two ways to enable remote SSH access, depending on whether you want
to create a new build or ssh to an existing one.

To enable SSH access for a running build, go to the 'Debug via SSH' tab and
click the 'Enable SSH for this build' button.

![]({{ site.baseurl }}/assets/img/docs/ssh-build-button-current.png)

To start a fresh build with SSH enabled, for example if you want to debug a
build that has already finished, click the 'with ssh' button alongside
'Rebuild':

![]({{ site.baseurl }}/assets/img/docs/ssh-build-button-rebuild.png)

In either case, host and port information will be available in the 'Debug via
SSH tab':

![]({{ site.baseurl }}/assets/img/docs/ssh-build-details.png)

Now you can ssh to the running build (using the same ssh key
that you use for GitHub) to perform whatever troubleshooting
you need to.

**Your build commands will run as usual, with the exception of deployment**,
which will be skipped unless it has already started.  Commands run via ssh can
affect deployment and make it unpredictable.  Also, in most cases when there is
a reason to debug a build, the issue would itself prevent deployment from going
as expected.

After the build commands run, the build output will show another
special section labeled 'Wait for SSH', which repeats the host and
port information.

The build VM will remain available for **30 minutes after the build finishes running**
and then automatically shut down. (Or you can cancel it.)

#### Parallelism and SSH Builds

If your build has parallel steps, we launch more than one VM
to perform them. Thus, you'll see more than one 'Enable SSH' and
'Wait for SSH' section in the build output.

#### Debugging: "Permission denied (publickey)"

If you run into permission troubles trying to ssh to your build, try
these things:

##### Ensure that you can authenticate with github

GitHub makes it very easy to test that your keys are setup as expected.
Just run:

```
$ ssh git@github.com
```

and you should see:

```
Hi :username! You've successfully authenticated...
```

If you _don't_ see output like that, you need to start by
[troubleshooting your ssh keys with github](https://help.github.com/articles/error-permission-denied-publickey).

##### Ensure that you're authenticating as the correct user

If you have multiple github accounts, double-check that you are
authenticated as the right one! Again, using github's ssh service,
run ssh git@github.com and look at the output:

```
Hi :username! You've successfully authenticated...
```

In order to ssh to a circle build, the username must be one which has
access to the project being built!

If you're authenticating as the wrong user, you can probably resolve this
by offering a different ssh key with `ssh -i`. See the next section if
you need a hand figuring out which key is being offered.

##### Ensure your build started after you added key to github

You won't be able to log in to builds that started before you added your key to github. Even if those builds are still waiting for you to ssh. You have to restart the build.

##### Ensure that you're offering the correct key to circle

If you've verified that you can authenticate with github as the correct
user, but you're still getting "Permission denied" from CircleCI, you
may be offering the wrong credentials to us. (This can happen for
several reasons, depending on your ssh configuration.)

Figure out which key is being offered to github that authenticates you, by
running:

```
$ ssh -v git@github.com
```

In the output, look for a sequence like this:

```
debug1: Offering RSA public key: /Users/me/.ssh/id_rsa_github
<...>
debug1: Authentication succeeded (publickey).
```

This sequence indicates that the key /Users/me/.ssh/id_rsa_github is the one which
github accepted.

Next, run the ssh command for your circle build, but add the -v flag.
In the output, look for one or more lines like this:

```
debug1: Offering RSA public key: ...
```

Make sure that the key which github accepted (in our
example, /Users/me/.ssh/id_rsa_github) was also offered to CircleCI.

If it was not offered, you can specify it via the -i command-line
argument to ssh. For example:

```
$ ssh -i /Users/me/.ssh/id_rsa_github -p 64784 ubuntu@54.224.97.243
```

##### Nope, still broken

Drat! Well, [contact us](mailto:sayhi@circleci.com) and we'll try to help.
