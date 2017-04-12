var create = require('lodash.create');
var MochaRunnable = require('../runnable');

module.exports = Runnable;

function Runnable(title, fn) {
  MochaRunnable.call(this, title);
  var self = this;
  this.fn = fn && function() {
    return fn.apply(this, [self._nightwatch.api()].concat(Array.prototype.slice.call(arguments)));
  };
  this.async = fn && fn.length > 1;
  this.sync = !this.async;
  this._timeout = 20000;
}

Runnable.prototype = create(MochaRunnable.prototype, {
  constructor: Runnable
});

Runnable.prototype.setNightwatchClient = function(client) {
  this._nightwatch = client;
  this._nightwatch.clearGlobalResult();
  return this;
};
