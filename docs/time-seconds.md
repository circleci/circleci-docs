---

title: Time-based results are a few seconds off
layout: doc
tags:
  - troubleshooting
  - time-and-date

---

While one-day variations are your responsibility, differences of a second or so are probably bugs in your CI server, and should not happen on CircleCI.

This sort of bugs happen on slow computers running time-sensitive tests.
Even if you don't explicitly have time-sensitive tests, Selenium and other browser-based tests often rely on implicit timeouts.
For example, if some button hasn't appeared in 3 seconds, tests start to fail.

CircleCI is not susceptible to this kind of bug.
CircleCI is really really fast, even without parallelism, and so this kind of error should never happen.

If you do see timeouts, increase the timeout parameter to see if it goes away.
If it does go away, **and the tests work on your local machine,**
this is very possibly a bug with CircleCI.

Another cause of this bug is a rendering problem.
CircleCI may not use the same exact browser as you use locally (this, of course, is a good thing), so it may catch a rendering bug that you don't.
Check out [CircleCI's program versions](/docs/environment#browsers)
to see if this is the case.
