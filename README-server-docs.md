# CircleCI Server Documentation

Server documentation is written in ASCIIDOC and built for the web and PDF using ASCIIDOCTOR + Jekyll and PDF plugins.

## Document Structure
Server documentation is provided in two formats - html on the main CircleCI docs site generated with Jekyll, showing the current docs, and also PDFs of our Operations and Installation guides are provided for each feature release.

Each topic is written in a separate `.adoc` file, and for the purposes of PDF generation there are master `.adoc` files for the ops guide (`_ops-guide.adoc`) and the installation guide (`_aws-install.adoc`) that combine the separate topics using: `include::jekyll/_cci2/overview.adoc[]` etc.

Master asciidoc files that are **only** used for creating PDFs have an `_` at the start of the filenames to prevent Jekyll from converting them to HTML for the main site.

## Build PDFs locally

To be able to build the PDFs locally you will need to install Asciidoctor-PDF - Instructions [here](https://github.com/asciidoctor/asciidoctor-pdf#install-the-published-gem)

Then, from the top of the circleci-docs directory, run:

```
./scripts/build_pdfs_local.sh
```

You will then find the PDFs in: `releases/tmp`

This script is run as part of the CCI build everytime you push a commit, then the PDFs can be found in the build artifacts, accessible from the CircleCI UI.

## Some notes about formatting

### Using code blocks in numbered steps
In order to keep numbered steps flowing correctly when code blocks are used inside steps, use the `+` on the line before the block starts to indicate the block is part of the step above:

```
1. Step one
2. Step two involves some code
+
[source, shell]
----
some code
----
3. Step three is still in number order
```

### Style tables correctly for the Jekyll site
In order to make tables display correctly in the web version of Server docs, assign them with the `.table` and `.table-striped` classes:

```
[.table.table-striped]
[cols=3*, options="header", stripes=even]
|===
|column 1
|column 2
|comuln 3

|column 1 row 1
|column 2 row 1
|column 3 row 1

|column 1 row 2
|column 2 row 2
|column 3 row 2
|===
```

### Inter-document cross refs
Cross references should be made in the form: `<<overview#services-machine,Services Machine>>` where `overview` is the name of the file the destination is in, `services-machine` is the anchor heading, and `Services Machine` is what to display in the prose.

This is a little trickier when cross referencing between the install and ops guides as the xref needs to work for the PDF, where they are two separate docs as well as the Jekyll site where you will be dealing with two regular pages as with any xref. So in this instance reference the URL of the Jekyll version, so instead of using the `<<>>` described above, use a normal link URL[text to display].
