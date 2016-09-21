module.exports = Nightwatch;

function Nightwatch(nightwatch, runner, testSettings) {
  this._instance = null;

  testSettings.output = false;
  this._instance = nightwatch.initClient(testSettings);

  this._instance.on('error', function(err) {
    runner.failOnError(err);
  });
}

Nightwatch.prototype.get = function() {
  return this._instance;
};
