'use strict'

const createTask = require('./gulp.d/lib/create-task')
const exportTasks = require('./gulp.d/lib/export-tasks')
const tasks = require('./gulp.d/tasks')

const buildUiTask = createTask({
  name: 'build:ui',
  desc: 'Build UI bundle',
  call: tasks.buildUi,
})

const buildApiDocsTask = createTask({
  name: 'build:api-docs',
  desc: 'Build API docs with Redocly',
  call: tasks.buildApiDocs,
})

const buildDocsTask = createTask({
  name: 'build:docs',
  desc: 'Build Antora docs and API docs',
  call: tasks.buildSite,
})

const docsPreviewTask = createTask({
  name: 'preview:docs',
  desc: 'Serve and watch docs only',
  call: tasks.docsPreview,
})

const uiPreviewTask = createTask({
  name: 'preview:ui',
  desc: 'Serve docs + watch UI changes',
  call: tasks.uiPreview,
})

module.exports = exportTasks(
  buildUiTask,
  buildApiDocsTask,
  buildDocsTask,
  docsPreviewTask,
  uiPreviewTask
)