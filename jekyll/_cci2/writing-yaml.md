---
layout: classic-docs
title: "Writing YAML"
short-title: "Writing YAML"
description: "How to Write YAML on CircleCI"
order: 20
---

*[Basics]({{ site.baseurl }}/2.0/basics/) > Writing YAML*

This document gives an overview of YAML,
a data serialization language used to configure CircleCI.

## Overview

[YAML](http://yaml.org) is a human-friendly data serialization standard for all programming languages.
It is a strict superset of [JSON](https://www.json.org/),
another data serialization language.
This means it can do everything JSON can... and more.

CircleCI configuration is stored in a single YAML file located at `~/.circleci/config.yml`,
where `~` is the root of your project's directory.
Since most of your work with CircleCI occurs in this file,
it is important to understand the basics of YAML formatting.

## How to Write YAML

The basic structure of a YAML file is a [map](https://en.wikipedia.org/wiki/Map_(higher-order_function))
and consists of one or more key-value pairs.

```yaml
key: value
```

You can set another key-value pair as a value
by indenting the nested key.

```yaml
key:
  another_key: "another value"
```

### Multi-line Strings

If the value is a multi-line string,
use the pipe (`|`) character to prefix it.
This is especially useful for lengthy command-line scripts.

```yaml
haiku: |
  Consider me
  As one who loved poetry
  And persimmons.
```

**Note**:
Quotes are not necessary
when using multiline strings.

### Sequences

Keys and values are not restricted to [scalars](https://softwareengineering.stackexchange.com/questions/238033/what-does-it-mean-when-data-is-scalar).
You can also map a scalar to a sequence.

```yaml
scalar:
  - never
  - gonna
  - give
  - you
  - up
```

Items in sequences can also be key-value pairs.

```yaml
simulation:
  - within: "a simulation"
  - without:
      a_glitch: "in the matrix"
```

**Note**:
Remember to properly indent a key-value pair
when it is the value of an item in a sequence.

### Defaults and Map Merging

To [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) up your `config.yml`,
you can use anchors and aliases.

```yaml
# simple anchor/alias example
```

```yaml
# merging a map
```

```yaml
default: &default
  school: hogwarts

harry:
  <<: *default
  house: gryffindor

draco:
  <<: *default
  house: slytherin
```

## See More

- Learn about the keys [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/).
- Not sure if you wrote valid YAML? Run it through [this validator](http://yaml-online-parser.appspot.com/).
- Immerse yourself in the [Official YAML Specification](http://yaml.org/spec/1.2/spec.html).
- Or just read [the important parts](https://learnxinyminutes.com/docs/yaml/).
