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

*Values*: [Specifying Browsers for Test Task](https://devexpress.github.io/testcafe/documentation/using-testcafe/common-concepts/browser-support.html#specifying-browsers-for-test-task)

*Required*

Configures the test runner to run tests in the specified browsers.

#### reporter

*Type*: `String`

*Default*: `spec`

*Values*: [Reporters](https://devexpress.github.io/testcafe/documentation/using-testcafe/common-concepts/reporters.html)

Specifies the reporter.

#### filter

*Type*: `function(testName, fixtureName, fixturePath)`

*Default*: `null`

Allows you to manually select which tests should be run.

#### screenshotsPath

*Type*: `String`

*Default*: `null`

The path to which the screenshots will be saved. Enables the test runner to take screenshots of the tested webpages.

#### takeScreenshotsOnFail

*Type*: `Boolean`

*Default*: `false`

Specifies if screenshots should be taken automatically whenever a test fails.

#### skipJsErrors

*Type*: `Boolean`

*Default*: `false`

Defines whether to continue running a test after a JavaScript error occurs on a page (`true`), or consider such a test failed (`false`).

#### quarantineMode

*Type*: `Boolean`

*Default*: `false`

Defines whether to enable the [quarantine mode](https://devexpress.github.io/testcafe/documentation/using-testcafe/programming-interface/runner.html#quarantine-mode).

#### selectorTimeout

*Type*: `Number`

*Default*: `10000`

Specifies the amount of time, in milliseconds, within which selectors make attempts to obtain a node to be returned.

## Author
Developer Express Inc. ([https://devexpress.com](https://devexpress.com))
