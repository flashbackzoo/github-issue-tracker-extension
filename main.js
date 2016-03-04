(function () {
    function success(json) {
        chrome.storage.local.set({
            avatarUrl: json.avatar_url,
            handle: json.login,
            trackedIssues: []
        });
    }

    function fetch() {
        chrome.storage.local.get('oauthToken', function (storage) {
            window.issueTracker.fetch(storage.oauthToken, success);
        });
    }

    // Fetch updates on a timeout.
    chrome.alarms.create('fetch', {
        delayInMinutes: 10,
        periodInMinutes: 10
    });

    chrome.alarms.onAlarm.addListener(fetch);

    fetch();
}());
