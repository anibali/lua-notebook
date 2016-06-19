const gulp = require('gulp');
const gutil = require('gulp-util');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const watchify = require('watchify');
const clean = require('gulp-clean');
const concat = require('gulp-concat');
const babelify = require('babelify');
const concatCss = require('gulp-concat-css');
const merge = require('ordered-merge-stream');

// List of npm modules to bundle separately from our application code
const libs = [
  'brace',
  'brace/mode/lua',
  'brace/theme/monokai',
  'whatwg-fetch',
  'react-ace',
  'react',
  'react-dom',
  'redux',
  'react-redux',
  'lodash'
];

// Information about where project files are located
const paths = {
  scriptEntryPoint: 'src/client.js',
  styles: 'src/styles/**/*.css',
  vendorStyles: [
    'vendor/font-awesome/css/font-awesome.css',
    'vendor/darkly/bootstrap.min.css'
    // require.resolve('bootstrap/dist/css/bootstrap.css')
  ]
};

// Error handler
function onError(error) {
  gutil.log(error.stack);
  this.emit('end');
}

// Task to remove all build outputs
gulp.task('clean', () => {
  return gulp.src('dist', { read: false })
    .pipe(clean());
});

// Task to remove style outputs
gulp.task('cleanStyles', () => {
  return gulp.src('dist/css', { read: false })
    .pipe(clean());
});

// Task to remove script outputs
gulp.task('cleanScripts', () => {
  return gulp.src('dist/js/app.*', { read: false })
    .pipe(clean());
});

// Task to remove vendor script outputs
gulp.task('cleanVendorScripts', () => {
  return gulp.src('dist/js/vendor.*', { read: false })
    .pipe(clean());
});

// Task to bundle up styles
gulp.task('styles', ['cleanStyles'], () => {
  return merge([gulp.src(paths.vendorStyles), gulp.src(paths.styles)])
    .pipe(concatCss('app.css'))
    .on('error', onError)
    .pipe(gulp.dest('dist/css/'));
});

// Task to bundle up vendor scripts (dependencies)
gulp.task('vendorScripts', ['cleanVendorScripts'], () => {
  // Stream for processing npm dependencies
  return browserify({ debug: true })
    .require(libs)
    .bundle()
    .on('error', onError)
    .pipe(source('vendor.js'))
    .pipe(buffer())
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('dist/js'));
});

// Helper function for bundling application scripts
function bundleScripts(shouldWatch) {
  // Options for the browserify bundler
  const opts = {
    entries: [paths.scriptEntryPoint],
    debug: true,
    plugin: [],
    // These properties are used by watchify for caching
    cache: {},
    packageCache: {}
  };

  // Use the watchify plugin when we want to watch for file changes
  if(shouldWatch) opts.plugin.push(watchify);

  // Create the bundler
  const bundler = browserify(opts)
    .transform([babelify, { sourceMap: true }])
    .external(libs);

  // This function returns a stream which produces the final bundled output
  // from the bundler object
  const rebundle = () => {
    return bundler.bundle()
      .on('error', onError)
      .pipe(source('app.js'))
      .pipe(buffer())
      .pipe(gulp.dest('dist/js'));
  };

  // Rebundle when watchify detects a change
  bundler.on('update', () => {
    gutil.log('Rebundling...');
    rebundle().on('end', () => gutil.log('Finished rebundling.'));
  });

  // Return bundling stream (mostly for when `shouldWatch` is false)
  return rebundle();
}

// Task to bundle up application scripts
gulp.task('scripts', ['cleanScripts'], () => {
  return bundleScripts(false);
});

// Task to watch files and automatically bundle when changes occur
gulp.task('watch', () => {
  bundleScripts(true);
  gulp.watch(paths.styles, ['styles']);
});

// Task to perform a one-shot bundling of assets
gulp.task('build', ['styles', 'scripts', 'vendorScripts']);

// Default task bundles up everything and then starts watch
gulp.task('default', ['watch', 'build']);
