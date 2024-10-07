---
layout: enterprise
section: enterprise
title: "Export/Import Project Settings"
category: [resources]
order: 0
description: "How to import and export project settings in CircleCI Enterprise."
hide: true
sitemap: false
---

## Exporting/Importing Project Settings

If you are running a legacy version of CircleCI Enterprise you can export the project settings and import them into your new instance.

The process involves running [a script]({{site.baseurl}}/assets/code/project_import_export.clj) on the old instance to export settings then importing those settings on the new instance.

### Exporting settings

1. ssh into a builder box for the old install, and save the [project_import_export.clj]({{site.baseurl}}/assets/code/project_import_export.clj) file there.

2. start a repl connected to the circle process  
 `lein repl :connect 6005`

3. load the file:  
 `=> (load-file "project_import_export.clj")`

4. (option A) to export all projects:  
`=> (export-settings "projects.json")`

4. (option B) to export some projects:  
`=> (export-settings "projects.json" ["https://github.com/org-name/repo-1" "https://github.com/org-name/etcetera"])`

5. scp your projects.json file out

### Importing settings

1. ssh into a builder box on the new install, and save the [project_import_export.clj]({{site.baseurl}}/assets/code/project_import_export.clj) file there.

3. scp in the projects.json file you made in the above export process

3. start a repl connected to the circle process  
 `lein repl :connect 6005`

4. load the file:  
`=> (load-file "project_import_export.clj")`

5. import the settings:  
`=> (import-settings "projects.json")`
