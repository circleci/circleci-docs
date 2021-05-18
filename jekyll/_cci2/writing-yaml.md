---
layout: classic-docs
title: "Writing YAML"
short-title: "Writing YAML"
description: "How to Write YAML on CircleCI"
order: 20
version:
- Cloud
- Server v2.x
---

This document describes the most important features of YAML for use in CircleCI configuration.

* TOC
{:toc}

## Overview
{: #overview }
{:.no_toc}

[YAML](http://yaml.org) is a human-friendly data serialization standard for all programming languages. It is a strict superset of [JSON](https://www.json.org/), another data serialization language. This means it can do everything JSON can... and more.

CircleCI configuration is stored in a single YAML file located at `~/.circleci/config.yml`, where `~` is the root of your project's directory. Since most of your work with CircleCI occurs in this file, it is important to understand the basics of YAML formatting.

## How to write YAML
{: #how-to-write-yaml }

The basic structure of a YAML file is a [hash map](https://en.wikipedia.org/wiki/Hash_table) and consists of one or more key-value pairs.

```yaml
key: value
```

You can set another key-value pair as a value by indenting the nested key.

```yaml
key:
  another_key: "another value"
```

### Multi-line strings
{: #multi-line-strings }
{:.no_toc}

If the value is a multi-line string, use the `>` character, followed by any number of lines. This is especially useful for lengthy commands.

```yaml
haiku: >
  Please consider me
  As one who loved poetry
  Oh, and persimmons.
```

**Note**: Quotes are not necessary when using multiline strings.

### Sequences
{: #sequences }
{:.no_toc}

Keys and values are not restricted to [scalars](https://softwareengineering.stackexchange.com/questions/238033/what-does-it-mean-when-data-is-scalar). You may also map a scalar to a sequence.

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

**Note**: Remember to properly indent a key-value pair when it is the value of an item in a sequence.

### Anchors and aliases
{: #anchors-and-aliases }
{:.no_toc}

To [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) up your `config.yml`, use anchors and aliases. Anchors are identified by an `&` character, and aliases by an `*` character.

```yaml
song:
  - &name Al
  - You
  - can
  - call
  - me
  - *name
```

When the above list is read by a YAML parser, the literal output looks like this.

```yaml
song:
  - Al
  - You
  - can
  - call
  - me
  - Al
```

### Merging maps
{: #merging-maps }
{:.no_toc}

Anchors and aliases work for scalar values, but to save maps or sequences, use `<<` to inject the alias.

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

You can also merge multiple maps.

```yaml
name: &harry_name
  first_name: Harry
  last_name: Potter

address: &harry_address
  street: 4, Privet Drive
  district: Little Whinging
  county: Surrey
  country: England

harry_data:
  <<: [*harry_name, *harry_address]
```

**Note**:
As mentioned in [a YAML repository issue](https://github.com/yaml/yaml/issues/35), it is possible to merge maps, but not sequences (also called arrays or lists).

For a more complex example, see [this gist](https://gist.github.com/bowsersenior/979804).

## See also
{: #see-also }

While YAML has several other features, the examples above should be enough to get you started with YAML and keep your CircleCI configuration concise. If you are hungry for more knowledge, here are a few ideas.

- For a concrete example of keys and values,
see the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/) document.
- If you are unsure whether your `config.yml` is valid YAML,
[run it through a validator](http://yaml-online-parser.appspot.com/).

CircleCI has also developed "orbs," which enable you to use pre-configured and tested packages of configuration elements that you can use in your configuration workflow. Utilizing DRY (Don't Repeat Yourself), orbs enable you to quickly and easily incorporate configuration elements (jobs, executors, commands) in your workflow. For more detailed information about orbs:

- Refer to [Orb Introduction]({{site.baseurl}}/2.0/orb-intro/), for a high-level overview of orbs.
- Refer to [Using Orbs]({{site.baseurl}}/2.0/using-orbs/), for more about how to use existing orbs.
- Refer to [Creating Orbs]({{site.baseurl}}/2.0/creating-orbs/), where you will find step-by-step instructions on how to create your own orb.
- Refer to [Reusing Config]({{site.baseurl}}/2.0/reusing-config/) for more detailed examples of reusable orbs, commands, parameters, and executors.
- For a more exhaustive overview of YAML,
Learn X in Y Minutes has [a great summary](https://learnxinyminutes.com/docs/yaml/).
