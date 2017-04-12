/**
 * Module dependencies.
 */

var Runnable = require('./runnable');
var create = require('lodash.create');
var _Promise;
if (Promise) {
  _Promise = Promise;
} else {
  _Promise = require('promise');
}
/**
 * Expose `Test`.
 */

module.exports = Test;

function noop() {}

/**
 * Initialize a new `Test` with the given `title` and callback `fn`.
 *
 * @api private
 * @param {String} title
 * @param {Function} fn
 */
function Test(title, fn) {
  Runnable.call(this, title);
  this.pending = !fn;
  this.type = 'test';
  if (this.pending) {
    this.fn = noop;
  } else {
    var self = this;
    this.originalAsync = fn.length > 1;

    this.fn = function() {
      var module = [];
      if (self.parent.parent.title) {
        module.push(self.parent.parent.title);
      }
      module.push(self.parent.title);
      var moduleTitle = module.join('/').toLocaleLowerCase().replace(/\s+/g, '-');

      self._nightwatch.api('currentTest', {
        name: self.title,
        module: moduleTitle
      });

      var ctx = this; // It might be different in Runnable:run
      var promises = [];

      if (self.originalAsync) {
        promises.push(new _Promise(function(resolve, reject) {
          fn.call(ctx, self._nightwatch.api(), function(err) {
            err ? reject(err) : resolve();
          });
        }));
      } else {
        var p = fn.call(ctx, self._nightwatch.api());
        if (p && typeof p.then === 'function') {
          promises.push(p);
        }
      }

      promises.push(new _Promise(function(resolve, reject) {
        self._nightwatch.once('complete', function() {
          var results = this.results();
          var err = null;
          if (results.failed > 0 || results.errors > 0) {
            err = results.lastError;
          }
          err ? reject(err) : resolve();
        });

        if (self._nightwatch.shouldRestartQueue()) {
          self._nightwatch.start();
        }
      }));

      // Fulfilled when both "complete" hook and async/promise fulfilled.
      // Reject with first encountered reason.
      return _Promise.all(promises);
    };
  }
  this.async = false;
  this.sync = true;
}

/**
 * Inherit from `Runnable.prototype`.
 */

Test.prototype = create(Runnable.prototype, {
  constructor: Test
});
