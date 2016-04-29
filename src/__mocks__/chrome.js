/* global jest */

const chrome = {
  storage: {
    sync: {
      get: jest.genMockFunction(),
      set: jest.genMockFunction(),
    },
  },
};

module.exports = chrome;
