var expect         = require('chai').expect;
var stub = require('sinon').stub;
var vinylFile      = require('vinyl-file');
var promisifyEvent = require('promisify-event');
var gulpTestCafe   = require('../');

var runner = require('testcafe/lib/runner');

function createReportOutStream () {
    return {
        data: '',

        write: function (text) {
            this.data += text;
        },

        end: function () {
        }
    };
}

it('Should run tests', function () {
    var reportStream = createReportOutStream();

    var ps = gulpTestCafe({
        browsers: ['chrome', 'firefox'],
        reporter: { output: reportStream }
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
        browsers: ['chrome'],
        reporter: { output: reportStream }
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
        browsers: ['chrome'],
        reporter: { name: 'unknown', output: reportStream },
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

it('Should use multiple reporters', function () {
    var reportStream1 = createReportOutStream();
    var reportStream2 = createReportOutStream();

    var ps = gulpTestCafe({
        browsers: ['chrome', 'firefox'],
        reporter: [{ output: reportStream1 }, { name: 'json', output: reportStream2 }]
    });

    var resultsPromise = Promise.race([
        promisifyEvent(ps, 'error'),

        promisifyEvent(ps, 'done').then(function () {
            expect(reportStream1.data).contains('Chrome');
            expect(reportStream1.data).contains('Firefox');
            expect(reportStream1.data).contains('3 passed');

            expect(reportStream2.data).contains('Chrome');
            expect(reportStream2.data).contains('Firefox');
            expect(reportStream2.data).contains('"passed": 3');
        })
    ]);

    ps.write(vinylFile.readSync('test/fixtures/passing1.js'));
    ps.write(vinylFile.readSync('test/fixtures/passing2.js'));
    ps.end();

    return resultsPromise;
});

describe('Smoke test', function () {
    before(function () {
        var throwConfig = function () {
            var err = new Error(JSON.stringify(this.configuration.getOptions()));

            throw err;
        };

        stub(runner.prototype, '_validateRunOptions').callsFake(throwConfig);
    });

    after(function () {
        runner.prototype._validateRunOptions.restore();
    });

    it('Should set all the configuration properties', function () {
        var config = {
            browsers: ['chrome'],
            reporter: {
                output: {
                    data:  '',
                    write: '',
                    end:   ''
                }
            },
            allowMultipleWindows: true,
            retryTestPages:       true,
            screenshots:          {
                path:        './custom-screenshots',
                takeOnFails: true,
                pathPattern: '${DATE}_${TIME}/test-${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.png'
            },
            takeScreenshotsOnFails: true,
            disableScreenshots:     true,
            videoPath:              './custom-video',
            videoOptions:           {
                singleFile:  true,
                failedOnly:  true,
                pathPattern: '${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.mp4'
            },
            videoEncodingOptions: {
                r:      20,
                aspect: '4:3'
            },
            quarantineMode:     true,
            debugMode:          true,
            debugOnFail:        true,
            skipJsErrors:       true,
            skipUncaughtErrors: true,
            filter:             {
                test:        'test name filter',
                testGrep:    'test grep filter',
                fixture:     'fixture name filter',
                fixtureGrep: 'fixture grep filter',
                testMeta:    {
                    device: 'test meta device'
                },
                fixtureMeta: {
                    device: 'fixture meta device'
                }
            },
            appCommand:       ';',
            appInitDelay:     1000,
            concurrency:      2,
            selectorTimeout:  5000,
            assertionTimeout: 2000,
            pageLoadTimeout:  2000,
            speed:            0.9,
            clientScripts:    [],
            port1:            3001,
            port2:            3002,
            hostname:         'localhost',
            proxy:            'proxy',
            proxyBypass:      'proxyBypass',
            ssl:              {
                pfx:                '',
                rejectUnauthorized: true
            },
            developmentMode:    true,
            qrCode:             true,
            stopOnFirstFail:    true,
            tsConfigPath:       'tsConfigPath',
            disablePageCaching: true,
            disablePageReloads: true,
            color:              true,
            noColor:            true
        };

        var ps = gulpTestCafe(config);

        var resultsPromise = Promise.race([
            promisifyEvent(ps, 'error').catch(function (err) {
                expect(JSON.parse(err.message)).eql(config);
            }),

            promisifyEvent(ps, 'done').then(function () {
                throw new Error('Error expected');
            })
        ]);

        ps.write(vinylFile.readSync('test/fixtures/passing1.js'));
        ps.end();

        return resultsPromise;
    });
});
