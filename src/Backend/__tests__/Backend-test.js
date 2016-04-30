/* global jest, describe, it, expect */

jest.unmock('../Backend.js');

describe('Backend', () => {
  describe('getUser()', () => {
    it('should get user data from storage', () => {

    });

    it('should get user data from GitHub if it\'s not in storage', () => {

    });

    it('should save user data in storage after fetching from GitHub', () => {

    });

    it('should reject the promise if the GitHub fetch fails', () => {

    });
  });

  describe('fetch()', () => {
    it('should reject the promise if there\'s no token in storage', () => {

    });

    it('should make a GET request to the passed URL', () => {

    });

    it('should make the request with the token from storage', () => {

    });

    it('should resolve the promise with parsed response JSON on success', () => {

    });

    it('should reject the promise if the response is not successful', () => {

    });
  });

  describe('getLocationItem()', () => {

  });

  describe('objectToArray()', () => {

  });

  describe('getTrackedItems()', () => {

  });

  describe('addTrackedItem()', () => {

  });

  describe('removeTrackedItem()', () => {

  });

  describe('updateTrackedItem()', () => {

  });

  describe('syncTrackedItems()', () => {

  });
});
