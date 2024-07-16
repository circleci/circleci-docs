# Pages CSV

Convenience script for exporting pages data into a CSV file.

## Usage
Update to the glob library to fix CVEs requires usage of node v16 or higher.

### Quickstart

If you have `node` & `yarn` already installed on your machine, make sure to install the required dependencies:

``` sh
yarn install
```

To run the export job:

```sh
yarn export
```

This will create a `pages.csv` file that you can then import in Google Spreadsheet if you wish to do so.
