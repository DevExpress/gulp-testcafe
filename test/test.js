var expect         = require('chai').expect;
var vinylFile      = require('vinyl-file');
var gulpTestCafe   = require('../');
var WritableStream = require('stream').Writable;

function createReportOutStream () {
    return {
        data: '',

        write: function (text) {
            this.data += text;
        }
    };
}


it('Should run tests', function (done) {
    var reportStream = createReportOutStream();

    var ps = gulpTestCafe({
        browsers:        ['chrome', 'firefox'],
        reportOutStream: reportStream
    });

    ps
        .once('error', done)
        .once('done', function () {
            expect(reportStream.data).contains('Chrome');
            expect(reportStream.data).contains('Firefox');
            expect(reportStream.data).contains('3 passed');
            done();
        });

    ps.write(vinylFile.readSync('test/fixtures/passing1.js'));
    ps.write(vinylFile.readSync('test/fixtures/passing2.js'));
    ps.end();
});
