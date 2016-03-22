(function () {

    function GitHubIssueTracker(token) {
        var xhr = new XMLHttpRequest();

        if (typeof token === 'undefined') {
            throw new Error('You need to construct GitHubIssueTracker with a token.');
        }

        this.polling = false;
        this.subscriptionsUrl = null;
        this.token = token;

        xhr.onreadystatechange = function () {
            var json = null;

            if (xhr.readyState === 4 && xhr.status === 200) {
                json = JSON.parse(xhr.response);

                // Data used by other parts of the app. For example the popup.
                chrome.storage.local.set({
                    avatarUrl: json.avatar_url,
                    trackedIssues: [],
                    username: json.login
                });

                this.subscriptionsUrl = json.subscriptions_url;

                this.startPolling();
            }
        }.bind(this);

        xhr.open('GET', 'https://api.github.com/user');
        xhr.setRequestHeader('Authorization', 'token ' + this.token);
        xhr.send();
    }

    GitHubIssueTracker.prototype.alarmName = 'fetch';

    GitHubIssueTracker.prototype.fetch = function () {
        console.log('fetch ' + this.subscriptionsUrl);
    };

    GitHubIssueTracker.prototype.startPolling = function () {
        chrome.alarms.create(this.alarmName, {
            delayInMinutes: 10,
            periodInMinutes: 10
        });

        chrome.alarms.onAlarm.addListener(this.fetch);

        this.fetch();

        this.polling = true;
    };

    GitHubIssueTracker.prototype.stopPolling = function () {
        chrome.alarms.clear(this.alarmName, function () {
            this.polling = false;

            if (typeof callback === 'function') {
                callback();
            }
        }.bind(this));
    }

    window.GitHubIssueTracker = GitHubIssueTracker;

}());
