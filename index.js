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
    reporter:              [],
    skipJsErrors:          false,
    quarantineMode:        false,
    assertionTimeout:      3000,
    pageLoadTimeout:       3000,
    selectorTimeout:       10000,
    proxy:                 '',
    hostname:              '',
    ports:                 [],
    speed:                 1,
    concurrency:           0,
    app:                   '',
    appInitDelay:          1000,
    debugMode:             false,
    debugOnFail:           false
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

        createTestCafe(opts.hostname, opts.ports[0], opts.ports[1])
            .then(function (tc) {
                testcafe = tc;

                var runner = testcafe.createRunner();

                runner
                    .src(files)
                    .browsers(opts.browsers)
                    .filter(opts.filter)
                    .screenshots(opts.screenshotsPath, opts.takeScreenshotsOnFail);

                opts.reporter.forEach(function (reporter) {
                    if (typeof reporter === 'string')
                        runner.reporter(reporter);
                    else {
                        runner.reporter(
                            reporter.name || DEFAULT_REPORTER,
                            reporter.file ? fs.createWriteStream(reporter.file) : reporter.outStream
                        );
                    }
                });

                if (opts.concurrency)
                    runner.concurrency(opts.concurrency);

                if (opts.app)
                    runner.startApp(opts.app, opts.appInitDelay);

                if (opts.proxy)
                    runner.useProxy(opts.proxy);

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
