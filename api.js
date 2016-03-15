(function () {

    function GitHubIssueTracker() {
        this.polling = false;
        this.token = null;
    }

    GitHubIssueTracker.prototype.alarmName = 'fetch';

    GitHubIssueTracker.prototype.getToken = function () {
        return this.token;
    };

    GitHubIssueTracker.prototype.setToken = function (token) {
        this.token = token;
    };

    GitHubIssueTracker.prototype.getPolling = function () {
        return this.polling;
    };

    GitHubIssueTracker.prototype.setPolling = function (polling) {
        return this.polling = polling;
    };

    GitHubIssueTracker.prototype.fetch = function () {
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            var json = null;

            if (xhr.readyState === 4 && xhr.status === 200) {
                json = JSON.parse(xhr.response);

                chrome.storage.local.set({
                    avatarUrl: json.avatar_url,
                    handle: json.login,
                    trackedIssues: []
                });
            }
        }

        xhr.open('GET', 'https://api.github.com/user');
        xhr.setRequestHeader('Authorization', 'token ' + this.getToken());
        xhr.send();
    };

    GitHubIssueTracker.prototype.startPolling = function () {
        chrome.alarms.create(this.alarmName, {
            delayInMinutes: 10,
            periodInMinutes: 10
        });

        chrome.alarms.onAlarm.addListener(this.fetch);

        this.setPolling(true);

        this.fetch();
    };

    GitHubIssueTracker.prototype.stopPolling = function (callback) {
        chrome.alarms.clear(this.alarmName, function () {
            this.setPolling(false);

            if (typeof callback === 'function') {
                callback();
            }
        }.bind(this));
    }

    GitHubIssueTracker.prototype.restartPolling = function () {
        this.stopPolling(function () {
            this.startPolling();
        }.bind(this));
    }

    window.issueTracker = new GitHubIssueTracker();

}());
