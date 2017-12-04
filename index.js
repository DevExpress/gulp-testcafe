var fs             = require('fs');
var defaults       = require('lodash.defaults');
var flatten        = require('lodash.flatten');
var createTestCafe = require('testcafe');
var PluginError    = require('gulp-util').PluginError;
var through        = require('through2');

var DEFAULT_REPORTER = 'spec';

var DEFAULT_OPTS = {
    browsers:              [],
    filter:                null,
    screenshotsPath:       null,
    takeScreenshotsOnFail: false,
    reporter:             [],
    skipJsErrors:          false,
    quarantineMode:        false,
    selectorTimeout:       10000
};

module.exports = function gulpTestCafe (opts) {
    var files = [];

    opts = defaults({}, opts, DEFAULT_OPTS);

    opts.reporter = flatten([opts.reporter]);

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
        var stream   = this;
        var testcafe = null;

        createTestCafe()
            .then(function (tc) {
                testcafe = tc;

                var runner = testcafe.createRunner();

                runner
                    .src(files)
                    .browsers(opts.browsers)
                    .filter(opts.filter)
                    .screenshots(opts.screenshotsPath, opts.takeScreenshotsOnFail);

                if (opts.reportOutStream)
                    opts.reporter.push({ outStream: opts.reportOutStream });

                opts.reporter.forEach(function (reporter) {
                    var outStream = reporter.outStream;

                    if (!outStream && reporter.file)
                        outStream = fs.createWriteStream(reporter.file);

                    if (typeof reporter !== 'string')
                        reporter = reporter.name || DEFAULT_REPORTER;

                    runner.reporter(reporter, outStream);
                });

                return runner.run(opts);

            })
            .then(function (failed) {
                if (failed > 0)
                    stream.emit('error', new PluginError('gulp-testcafe', { message: failed + ' test(s) failed.' }));

                // NOTE: for testing purposes
                else
                    stream.emit('done');
            })
            .catch(function (err) {
                stream.emit('error', new PluginError('gulp-testcafe', { message: err.message }));
            })
            .then(function () {
                if (testcafe)
                    return testcafe.close();
            })
            .then(cb);
    }

    return through.obj(onFile, onStreamEnd);
};
