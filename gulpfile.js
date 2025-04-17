// gulpfile.js

const gulp = require('gulp');
const { exec } = require('child_process');
const browserSync = require('browser-sync').create();

const antoraPlaybook = 'antora-playbook.yml'; 
const outputDir = 'build'; 

// Task: Build the Antora site
function buildSite(cb) {
  console.log('Starting Antora build...');
  exec(`npx antora ${antoraPlaybook} --log-failure-level=warn`, (err, stdout, stderr) => {
    console.log(stdout);
    if (stderr) {
      console.error(stderr);
    }
    if (err) {
      console.error('Antora build failed.', err);
      return cb(err);
    }
    console.log('Antora build completed successfully.');
    cb();
  });
}

// Task: Reload the BrowserSync server
function reloadBrowser(cb) {
  browserSync.reload();
  cb();
}

// Task: Serve the generated site and initialize BrowserSync
function serveSite(cb) {
  browserSync.init({
    server: {
      baseDir: outputDir
    },
    port: 3000,
    notify: true
  });
  cb();
}

// Task: Watch for changes in AsciiDoc files, playbook, and optionally UI files.
// When changes are detected, run the Antora build and reload the browser.
function watchFiles() {
  // Watch Antora content files and the playbook
  gulp.watch(['docs/**/*.adoc', 'docs/**/antora.yml' ,antoraPlaybook], gulp.series(buildSite, reloadBrowser));
}

// Default task: build the site, start the server, and watch for changes.
exports.default = gulp.series(buildSite, serveSite, watchFiles);
