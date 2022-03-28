# Reusable Content 
If content is to be used in multiple locations throughout the documentation, it may be beneficial to convert the content to either of the following:

* A snippet - suitable for a section of text or code block that needs to appear in more than one location. 
* A site variable - suitable for a small amount of information, for example a version number or single word.

## Snippets
Snippets can be saved as `.md`, `.adoc`, `.html`, and should be located within `jekyll/_includes/snippets`.

To include a snippet within a page, use the following syntax:

```
{% include snippets/<my-snippet>.adoc %}
```

## Site Variables
Site variables are defined within `jekyll/_config.yml` as key value pairs: 

```yaml
my-variable-name: my-variable-value
```

### Markdown

To use the variable within a Markdown page, use the following syntax:

```
{{site.<my_variable_name>}}
```

### AsciiDoc

To include the variable in an AsciiDoc page, use the following syntax:

```
{<my_variable_name>}
```

To include the variable in a code block, use the following syntax:

```
[source,yaml,subs=attributes+]
----
version: 2.1
jobs:
  build:
    machine:
      image: {<my_variable_name>}
    resource_class: large
----
```

