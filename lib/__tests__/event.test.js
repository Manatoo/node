var assert = require('assert');
var manatoo = require('../index.js')(process.env.API_KEY);

describe('event', function() {
  var eventName = 'user_signup';

  it('creates a new event', function() {
    return manatoo.event.create({
      name: eventName,
    }).then(function(json) {
      assert(json.data.name === eventName);
      return json;
    });
  });
});
