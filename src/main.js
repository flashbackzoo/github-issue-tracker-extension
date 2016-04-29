chrome.storage.sync.get('oauthToken', (storage) => {
  if (typeof storage.oauthToken === 'undefined') {
    chrome.runtime.openOptionsPage();
  }
});
