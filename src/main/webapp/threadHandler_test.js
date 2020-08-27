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
  const validCharacters = lowerCase+upperCase+numbers+dashUnderscore;
  const invalidCharacters = "~!@#$%^&*?/()+=[]{}<>,.;\"\'\`\\\/\t\n\b\f\r";

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

  describe('should return true when all characters are invalid', function() {
    it('should test blank string is invalid', function() {
      let input = "";
      let actualOutput = hasValidCharacters(input);
      assert.notEqual(expectedOutput, actualOutput);
    });

    [...invalidCharacters].forEach(function(c) {
      it(`should test ${c} is invalid`, function() {
        let actualOutput = hasValidCharacters(c);
        assert.notEqual(expectedOutput, actualOutput);
      });
    });
  });

  describe('should check mixed strings correctly', function() {
    let charTypes = [validCharacters, invalidCharacters];
    const INVALID = 1;
    // Test 10 times
    for (var i = 0; i < 11; i++) {
      // choose string length between 2 and 4
      let strLength = Math.floor(2+Math.random()*3);

      let testStr = "";
      let hasInvalidChar = false;
      for (var c = 0; c < strLength; c++) {
        // choose to add a valid or invalid character
        let charType = Math.round(Math.random());

        // determine if this string contains any invalid chars
        hasInvalidChar = hasInvalidChar || charType == INVALID;

        // pick a random character of the chosen type
        let charOptions = charTypes[charType];
        let randomCharIndex = Math.floor(Math.random()*charOptions.length);
        testStr += charOptions.charAt(randomCharIndex);
      }

      // test resulting string
      if (hasInvalidChar) {
        it (`should test ${testStr} is invalid`, function() {
          assert.notEqual(expectedOutput, hasValidCharacters(testStr));
        });
      } else {
        it (`should test ${testStr} is valid`, function() {
          assert.equal(expectedOutput, hasValidCharacters(testStr));
        });
      }
    }
  });
});
