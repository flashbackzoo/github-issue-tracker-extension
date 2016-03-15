(function () {
    chrome.storage.local.get('oauthToken', function (storage) {
        if (typeof storage.oauthToken === 'undefined') {
            return chrome.runtime.openOptionsPage();
        }

        window.issueTracker.setToken(storage.oauthToken);
        window.issueTracker.startPolling();
    });
}());
