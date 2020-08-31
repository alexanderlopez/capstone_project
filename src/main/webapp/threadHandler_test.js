// TODO(alicevlasov) figure out how to run tests without copying function
function hasValidCharacters(name) {
  var regex = /^[a-zA-Z0-9-_]+$/;
  return regex.test(name);
}

var assert = require('assert');

describe('#hasValidCharacters()', function() {
  const expectedOutput = true;
  const lowerCase = "abcdefghijklmnopqrstuvwxyz";
  const upperCase = lowerCase.toUpperCase();
  const numbers = "1234567890";
  const dashUnderscore = "-_";

  describe('should return false when all characters are valid', function() {
    it('should test lowercase letters are valid', function() {
      let actualOutput = hasValidCharacters(lowerCase);
      assert.equal(expectedOutput, actualOutput);
    });
    it('should test upercase letters are valid', function() {
      let actualOutput = hasValidCharacters(upperCase);
      assert.equal(expectedOutput, actualOutput);
    });
    it('should test numbers are valid', function() {
      let actualOutput = hasValidCharacters(numbers);
      assert.equal(expectedOutput, actualOutput);
    });
    it('should test dashes and underscores are valid', function() {
      let actualOutput = hasValidCharacters(dashUnderscore);
      assert.equal(expectedOutput, actualOutput);
    });
  });

  describe('should return true if there are invalid characters', function() {
    it('should test blank string is invalid', function() {
      let input = "";
      let actualOutput = hasValidCharacters(input);
      assert.notEqual(expectedOutput, actualOutput);
    });
    it ('should test spaces are invalid', function() {
      let input = "a b";
      let actualOutput = hasValidCharacters(input);
      assert.notEqual(expectedOutput, actualOutput);
    });
    it ('should test \\n are invalid', function() {
      let input = "a\na";
      let actualOutput = hasValidCharacters(input);
      assert.notEqual(expectedOutput, actualOutput);
    });
    it ('should test \\t are invalid', function() {
      let input = "12\t";
      let actualOutput = hasValidCharacters(input);
      assert.notEqual(expectedOutput, actualOutput);
    });
    it ('should test \\b are invalid', function() {
      let input = "P_\bq";
      let actualOutput = hasValidCharacters(input);
      assert.notEqual(expectedOutput, actualOutput);
    });
    it ('should test \\f are invalid', function() {
      let input = "\fpq";
      let actualOutput = hasValidCharacters(input);
      assert.notEqual(expectedOutput, actualOutput);
    });
    it ('should test \\r are invalid', function() {
      let input = "P1-\r";
      let actualOutput = hasValidCharacters(input);
      assert.notEqual(expectedOutput, actualOutput);
    });
    it ('should test non-alphanumeric characters are invalid', function() {
      let input = "~!@#$%^&*?/(+=[{<,.;";
      let actualOutput = hasValidCharacters(input);
      assert.notEqual(expectedOutput, actualOutput);
    });
    it ('should test escaped characters are invalid', function() {
      let input = "\"\'\`\\\/";
      let actualOutput = hasValidCharacters(input);
      assert.notEqual(expectedOutput, actualOutput);
    });
  });
});
