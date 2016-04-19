(() => {
  const tracker = window.tracker = new window.GitHubIssueTracker();

  chrome.storage.sync.get('oauthToken', (storage) => {
    if (typeof storage.oauthToken === 'undefined') {
      chrome.runtime.openOptionsPage();
      return;
    }

    tracker.authenticate(storage.oauthToken);
  });
})();
