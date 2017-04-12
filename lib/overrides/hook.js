/**
 * Module dependencies.
 */

var Runnable = require('./runnable');
var create = require('lodash.create');

/**
 * Expose `Hook`.
 */

module.exports = Hook;

/**
 * Initialize a new `Hook` with the given `title` and callback `fn`.
 *
 * @param {String} title
 * @param {Function} fn
 * @api private
 */
function Hook(title, fn) {
  Runnable.call(this, title, fn);
  this.type = 'hook';
  if (this.title !== '"before each" hook') {
    var self = this;
    this.fn = fn && function() {
      var result = fn.apply(this, [self._nightwatch.api()].concat(Array.prototype.slice.call(arguments)));

      if (self._nightwatch.shouldRestartQueue()) {
        self._nightwatch.start();
      }

      return result;
    };
    this.async = fn && fn.length > 1;
    this.sync = !this.async;
  }
}

/**
 * Inherit from `Runnable.prototype`.
 */

Hook.prototype = create(Runnable.prototype, {
  constructor: Hook
});

/**
 * Get or set the test `err`.
 *
 * @param {Error} err
 * @return {Error}
 * @api public
 */
Hook.prototype.error = function(err) {
  if (!arguments.length) {
    err = this._error;
    this._error = null;
    return err;
  }

  this._error = err;
};
