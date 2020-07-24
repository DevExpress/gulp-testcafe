var flatten        = require('lodash.flatten');
var createTestCafe = require('testcafe');
var PluginError    = require('plugin-error');
var through        = require('through2');

var DEFAULT_REPORTER = 'spec';

function prepareReporters (reporters) {
    reporters = flatten(reporters);

    reporters.forEach(function (reporter) {
        if (typeof reporter !== 'string')
            reporter.name = reporter.name || DEFAULT_REPORTER;
    });

    return reporters;
}

module.exports = function gulpTestCafe (opts) {
    opts.reporter = prepareReporters([opts.reporter]);
    opts.src      = [];

    function onFile (file, enc, cb) {
        if (file.isNull())
            cb(null, file);

        else if (file.isStream())
            cb(new PluginError('gulp-testcafe', 'Streaming is not supported.'));

        else {
            opts.src.push(file.path);
            cb(null, file);
        }
    }

    function onStreamEnd (cb) {
        var stream   = this;
        var testcafe = null;

        createTestCafe(opts)
            .then(function (tc) {
                testcafe = tc;

                var runner = testcafe.createRunner();

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
