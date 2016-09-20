import assert from 'assert';

fixture `Failing tests fixture`;

test('Failing test1', () => assert(false));
test('Failing test2', () => assert.strictEqual(1, 2));

