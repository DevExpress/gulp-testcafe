# gulp-testcafe
[![Build status](https://ci.appveyor.com/api/projects/status/gvjohww3gs65m36j?svg=true)](https://ci.appveyor.com/project/DevExpress/gulp-testcafe)

*Run TestCafe tests using Gulp.*

## Install
```sh
npm install --save-dev gulp-testcafe
```

## Usage
```js
const gulp     = require('gulp');
const testcafe = require('gulp-testcafe');

gulp.task('default', () => {
    return gulp.src('test.js')
        .pipe(testcafe({ browsers: ['chrome', 'firefox'] }));
});
```

## API
```js
testcafe(options)
```

### Options

#### browsers


*Type*: `Array`

*Default*: `[]`

*Details*: [Specifying Browsers for Test Task](https://devexpress.github.io/testcafe/documentation/using-testcafe/common-concepts/browser-support.html#specifying-browsers-for-test-task)

*Required*

Configures the test runner to run tests in the specified browsers.

#### reporters

*Type*: `String` || `Array`

*Default*: `spec`

*Details*: [Reporters](https://devexpress.github.io/testcafe/documentation/using-testcafe/common-concepts/reporters.html)

Specifies the reporter or an array of reporters. 

Reporter can be specified by reporter name, or an object with following properties: 

 * `name` - name of the reporter,
 * `file` - the path to a file where reporter's output will be redirected, 
 * `outStream` - an Writable Stream instance where reporter's output will be piped. The `file` property will be ignored if `outStream` is specified.

Examples:
```js
  "reporters": "minimal"
```
```js
   "reporters": { "name": "json", "file": "report.json" }
 ```
```js
    "reporters": { "name": "xunit", "outStream": fs.createWriteStream("report.xml") }
```
#### filter

*Type*: `function(testName, fixtureName, fixturePath)`

*Default*: `null`

*Details*: [runner.filter](https://devexpress.github.io/testcafe/documentation/using-testcafe/programming-interface/runner.html#filter)

Allows you to manually select which tests should be run.

#### screenshotsPath

*Type*: `String`

*Default*: `null`

*Details*: [Screenshots path](http://devexpress.github.io/testcafe/documentation/using-testcafe/command-line-interface.html#-s-path---screenshots-path)

The path to which the screenshots will be saved. Enables the test runner to take screenshots of the tested webpages.

#### takeScreenshotsOnFail

*Type*: `Boolean`

*Default*: `false`

*Details*: [Take screenshots on fail](http://devexpress.github.io/testcafe/documentation/using-testcafe/command-line-interface.html#-s---screenshots-on-fails)

Specifies if screenshots should be taken automatically whenever a test fails. Requires that the [screenshotsPath](#screenshotsPath) is set.

#### skipJsErrors

*Type*: `Boolean`

*Default*: `false`

*Details*: [Skip JS errors](http://devexpress.github.io/testcafe/documentation/using-testcafe/command-line-interface.html#-e---skip-js-errors)

Defines whether to continue running a test after a JavaScript error occurs on a page (`true`), or consider such a test failed (`false`).

#### quarantineMode

*Type*: `Boolean`

*Default*: `false`

Defines whether to enable the [quarantine mode](https://devexpress.github.io/testcafe/documentation/using-testcafe/programming-interface/runner.html#quarantine-mode).

#### selectorTimeout

*Type*: `Number`

*Default*: `10000`

*Details*: [Selector timeout](http://devexpress.github.io/testcafe/documentation/test-api/selecting-page-elements/selectors.html#selector-timeout)

Specifies the amount of time, in milliseconds, within which [selectors](https://devexpress.github.io/testcafe/documentation/test-api/selecting-page-elements/selectors.html) make attempts to obtain a node to be returned.

## Author
Developer Express Inc. ([https://devexpress.com](https://devexpress.com))
