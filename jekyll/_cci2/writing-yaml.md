---
layout: classic-docs
title: "Writing YAML"
short-title: "Writing YAML"
description: "How to Write YAML on CircleCI"
order: 20
---

*[Basics]({{ site.baseurl }}/2.0/basics/) > Writing YAML*

This document gives an overview of the YAML data serialization language,
which is used in CircleCI configuration files.

## Overview

YAML is a [human-friendly data serialization standard](http://yaml.org/) for all programming languages.
It is a strict superset of [JSON](https://www.json.org/), another data serialization language.
This means that it can do everything that JSON can... and more.

CircleCI configuration is stored in a single YAML file,
located at `~/.circleci/config.yml`,
where `~` is the root of your project's directory.
Since most of your work with CircleCI occurs in this file,
it is important to understand the basics of YAML formatting.

## How to Write YAML

Tee basic structure of a YAML file is a [map](https://en.wikipedia.org/wiki/Map_(higher-order_function)).
You might also call this a _dictionary_, _hash_, or _object_.

Very generally, a YAML file consists of key-value pairs:

```yaml
key: value
```

### Scalar Types

### Collection Types

### Default Values and Map Merging

## See More
