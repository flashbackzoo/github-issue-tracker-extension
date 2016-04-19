(() => {
  const tracker = window.APP.tracker = new window.APP.GitHubIssueTracker();

  chrome.storage.sync.get('oauthToken', (storage) => {
    if (typeof storage.oauthToken === 'undefined') {
      chrome.runtime.openOptionsPage();
      return;
    }

    tracker.authenticate(storage.oauthToken);
  });
})();
