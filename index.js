var defaults       = require('lodash.defaults');
var createTestCafe = require('testcafe');
var PluginError    = require('gulp-util').PluginError;
var through        = require('through2');

var DEFAULT_OPTS = {
    filter:                null,
    browsers:              [],
    screenshotsPath:       null,
    takeScreenshotsOnFail: false,
    reporter:              'spec',
    skipJsErrors:          false,
    quarantineMode:        false,
    selectorTimeout:       10000,

    // NOTE: exposed for testing purposes
    reportOutStream: null
};

module.exports = function gulpTestCafe (opts) {
    var files = [];

    opts = defaults({}, opts, DEFAULT_OPTS);

    function onFile (file, enc, cb) {
        if (file.isNull())
            cb(null, file);

        else if (file.isStream())
            cb(new PluginError('gulp-testcafe', 'Streaming is not supported.'));

        else {
            files.push(file.path);
            cb(null, file);
        }
    }

    function onStreamEnd (cb) {
        var stream = this;

        createTestCafe()
            .then(function (testcafe) {
                var runner = testcafe.createRunner();

                return runner
                    .src(files)
                    .browsers(opts.browsers)
                    .filter(opts.filter)
                    .screenshots(opts.screenshotsPath, opts.takeScreenshotsOnFail)
                    .reporter(opts.reporter, opts.reportOutStream)
                    .run(opts);

            })
            .then(function (failed) {
                if (failed > 0) {
                    var err = new PluginError('gulp-testcafe', failed + ' test(s) failed.', {
                        showStack: false
                    });

                    stream.emit('error', err);
                }

                // NOTE: for testing purposes
                else
                    stream.emit('done');
            })
            .catch(function (err) {
                stream.emit('error', new PluginError('gulp-testcafe', err, {
                    stack:     err.stack,
                    showStack: true
                }));
            })
            .then(cb);
    }

    return through.obj(onFile, onStreamEnd);
};
