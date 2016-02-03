---

title: "java.lang.NoSuchMethodError: clojure.lang.KeywordLookupSite"
layout: doc
tags:
  - troubleshooting
  - clojure

---

This is caused by using jars that were AOT compiled against
1.2.1 or lower, with Clojure 1.3 or higher. The most frequent
offender is clojure-contrib, which is not compatible with
Clojure 1.3+.

If this works on your (OSX) machine but fails on CircleCI, it also
means you are running two different clojure versions at the same
time.

To determine whether you are loading two different clojure.jars,
look in lib/, and lib/dev/. If you are, fix this issue before
trying to upgrade dependencies. Typically, you'll need to add
exclusions to the dependency that requires clojure 1.2. The
dependency in your project.clj will look like:

`[org.foo/bar "1.0.0" :exclusions [org.clojure/clojure]]`

To find jars that depend on clojure 1.2, you can use the command

`lein pom && mvn dependency:tree`

To fix the KeywordLookupSite error, look at your dependencies,
and upgrade them as appropriate. The easiest way to determine
whether they work in clojure 1.3 is to a repl via
`lein repl` or `lein swank`
and start requiring libraries until you find one that doesn't compile.
