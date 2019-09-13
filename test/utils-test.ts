import { fromCallback, subscribe } from '../src';

QUnit.config.testTimeout = 500;

QUnit.module('callbackToAsyncIterator', function(hooks) {
  let iterator: AsyncIterableIterator<number>;

  hooks.beforeEach(function() {
    iterator = fromCallback(async callback => {
      for (const i of [1, 2, 3, 4]) {
        callback(i);
      }
    });
  });

  QUnit.test('yield 4 values', async function(assert) {
    let count = 0;
    for await (const i of iterator) {
      count++;
      if (i === 4) {
        iterator.return && iterator.return();
      }
    }
    assert.equal(count, 4);
  });

  QUnit.test('early return', async function(assert) {
    let count = 0;
    for await (const i of iterator) {
      count++;
      if (i === 3) {
        iterator.return && iterator.return();
      }
    }
    assert.equal(count, 3);
  });

  QUnit.test('subscribe', function(assert) {
    assert.expect(1);

    let count = 0;
    const done = assert.async();
    const unsubscribe = subscribe(iterator, i => {
      count++;
      if (i === 4) {
        assert.equal(count, 4);
        unsubscribe();
        done();
      }
    });
  });
});
