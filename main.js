(function () {

    chrome.storage.local.get('oauthToken', function (storage) {
        if (typeof storage.oauthToken === 'undefined') {
            return chrome.runtime.openOptionsPage();
        }

        window.gitHubIssueTracker = new window.GitHubIssueTracker(storage.oauthToken);
    });

}());
