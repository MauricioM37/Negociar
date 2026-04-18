const base = require('@my-turbo/config/jest/base.cjs');

/** @type {import('jest').Config} */
module.exports = {
  ...base,
  rootDir: '.',
  testEnvironment: 'node'
};
