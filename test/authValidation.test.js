const test = require('node:test');
const assert = require('node:assert/strict');

let authValidation;

test.before(async () => {
  authValidation = await import('../src/utils/authValidation.js');
});

test('rejects a username shorter than 3 characters', () => {
  const result = authValidation.validateRegistration({
    username: 'ab',
    password: 'longenough',
    securityQuestion: 'q',
    securityAnswer: 'a',
    usernameTaken: false,
  });
  assert.equal(result.valid, false);
});

test('rejects a password shorter than 6 characters', () => {
  const result = authValidation.validateRegistration({
    username: 'validname',
    password: '123',
    securityQuestion: 'q',
    securityAnswer: 'a',
    usernameTaken: false,
  });
  assert.equal(result.valid, false);
});

test('rejects registration missing a security question/answer', () => {
  const result = authValidation.validateRegistration({
    username: 'validname',
    password: 'longenough',
    securityQuestion: '',
    securityAnswer: '',
    usernameTaken: false,
  });
  assert.equal(result.valid, false);
});

test('rejects a username that is already taken', () => {
  const result = authValidation.validateRegistration({
    username: 'validname',
    password: 'longenough',
    securityQuestion: 'q',
    securityAnswer: 'a',
    usernameTaken: true,
  });
  assert.equal(result.valid, false);
});

test('accepts a well-formed registration and trims the username', () => {
  const result = authValidation.validateRegistration({
    username: '  validname  ',
    password: 'longenough',
    securityQuestion: 'q',
    securityAnswer: 'a',
    usernameTaken: false,
  });
  assert.equal(result.valid, true);
  assert.equal(result.cleanUsername, 'validname');
});

test('validateNewPassword enforces the minimum length', () => {
  assert.equal(authValidation.validateNewPassword('12345').valid, false);
  assert.equal(authValidation.validateNewPassword('123456').valid, true);
});
