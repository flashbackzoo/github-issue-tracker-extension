(function () {
    var tracker = window.tracker = new window.GitHubIssueTracker();

    chrome.storage.sync.get('oauthToken', function (storage) {
        if (typeof storage.oauthToken === 'undefined') {
            return chrome.runtime.openOptionsPage();
        }

        tracker.authenticate(storage.oauthToken);
    });
}());
