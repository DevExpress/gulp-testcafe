var expect         = require('chai').expect;
var vinylFile      = require('vinyl-file');
var promisifyEvent = require('promisify-event');
var gulpTestCafe   = require('../');

function createReportOutStream () {
    return {
        data: '',

        write: function (text) {
            this.data += text;
        }
    };
}


it('Should run tests', function () {
    var reportStream = createReportOutStream();

    var ps = gulpTestCafe({
        browsers:        ['chrome', 'firefox'],
        reportOutStream: reportStream
    });


    var resultsPromise = Promise.race([
        promisifyEvent(ps, 'error'),

        promisifyEvent(ps, 'done').then(function () {
            expect(reportStream.data).contains('Chrome');
            expect(reportStream.data).contains('Firefox');
            expect(reportStream.data).contains('3 passed');
        })
    ]);

    ps.write(vinylFile.readSync('test/fixtures/passing1.js'));
    ps.write(vinylFile.readSync('test/fixtures/passing2.js'));
    ps.end();

    return resultsPromise;
});

it('Should fail if tests fail', function () {
    var reportStream = createReportOutStream();

    var ps = gulpTestCafe({
        browsers:        ['chrome'],
        reportOutStream: reportStream
    });

    var resultsPromise = Promise.race([
        promisifyEvent(ps, 'error').catch(function (err) {
            expect(err.message).eql('2 test(s) failed.');
            expect(reportStream.data).contains('Chrome');
            expect(reportStream.data).contains('2/4 failed');
        }),

        promisifyEvent(ps, 'done').then(function () {
            throw new Error('Error expected');
        })
    ]);

    ps.write(vinylFile.readSync('test/fixtures/passing1.js'));
    ps.write(vinylFile.readSync('test/fixtures/failing.js'));
    ps.end();

    return resultsPromise;
});

it('Should fail if configuration is incorrect', function () {
    var reportStream = createReportOutStream();

    var ps = gulpTestCafe({
        browsers:        ['chrome'],
        reporter:        'unknown',
        reportOutStream: reportStream
    });

    var resultsPromise = Promise.race([
        promisifyEvent(ps, 'error').catch(function (err) {
            expect(err.message).eql('The provided "unknown" reporter does not exist. Check that you have specified the report format correctly.');
            expect(reportStream.data).eql('');
        }),

        promisifyEvent(ps, 'done').then(function () {
            throw new Error('Error expected');
        })
    ]);

    ps.write(vinylFile.readSync('test/fixtures/passing1.js'));
    ps.end();

    return resultsPromise;
});
