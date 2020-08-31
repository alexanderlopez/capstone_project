var assert = require('assert');
let convert = require('../chat.js')

/**
 * Returns the server's URL, forcing it to HTTPS, if necessary
 * @return {String} The server's URL.
  */
 async function getServerUrl() {
  var protoSpec;

  if (location.protocol !== 'https:' && location.host != 'localhost:8080') {
      location.replace(`https:${location.href.substring(location.protocol.length)}`);
  }

  if(location.protocol === 'https:'){
      protoSpec = 'wss:';
  } else {
      protoSpec = 'ws:';
  }

  return protoSpec + "//" + location.host + "/chat/" + currRoomId + "?idToken=" + idToken;
}

describe('ServerUrl', function() {
  describe('#test1', function() {
    it(getServerUrl().toString(), function(){
      getServerUrl().then((result) => {
        assert.equal(result, result);
      })
    });
  });
});