(function () {
    function GitHubIssueTracker() {
        this.authenticated = false;
        this.polling = false;
        this.token = null;

        return this;
    }

    GitHubIssueTracker.prototype.authenticate = function (token) {
        var xhr = new XMLHttpRequest();

        if (this.authenticated === true) {
            return;
        }

        xhr.onreadystatechange = function () {
            var json = null;

            if (xhr.readyState === 4 && xhr.status === 200) {
                this.authenticated = true;
                this.token = token;

                json = JSON.parse(xhr.response);

                // Data used by other parts of the app. For example the popup.
                chrome.storage.sync.set({
                    avatarUrl: json.avatar_url,
                    username: json.login,
                });

                this.startPolling();
            }
        }.bind(this);

        xhr.open('GET', 'https://api.github.com/user');
        xhr.setRequestHeader('Authorization', 'token ' + token);
        xhr.send();
    };

    GitHubIssueTracker.prototype.alarmName = 'fetch';

    GitHubIssueTracker.prototype.fetch = function (url, success) {
        var xhr = new XMLHttpRequest();

        if (this.authenticated === false) {
            throw new Error('You need to authenticate before fetching data.');
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                success(JSON.parse(xhr.response));
            }
        };

        xhr.open('GET', url);
        xhr.setRequestHeader('Authorization', 'token ' + this.token);
        xhr.send();
    };

    GitHubIssueTracker.prototype.startPolling = function () {
        // if (this.polling === true) {
        //     return;
        // }
        //
        // chrome.alarms.create(this.alarmName, {
        //     delayInMinutes: 10,
        //     periodInMinutes: 10
        // });
        //
        // chrome.alarms.onAlarm.addListener(this.fetch);
        //
        // this.fetch();
        //
        // this.polling = true;
    };

    GitHubIssueTracker.prototype.stopPolling = function () {
        if (this.polling === false) {
            return;
        }

        chrome.alarms.clear(this.alarmName, function () {
            this.polling = false;

            if (typeof callback === 'function') {
                callback();
            }
        }.bind(this));
    };

    /**
     * Matches the current tab's URL against a valid GitHub issue/pull URL pattern.
     *
     * @param {Function} valid - Called if the passed URL is matches.
     * @param {Function} invalid - Called if the passed URL doesn't match.
     */
    GitHubIssueTracker.prototype.canTrackCurrentUrl = function (valid, invalid) {
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
            var url = tabs[0].url,
                parts = url.match(/^https\:\/\/github\.com\/([\w-]+\/)([\w-]+\/)(issues|pull)\/(\d+)(?:#[\w-]+)?$/);

            if (parts !== null) {
                valid({
                    project: parts[2].slice(0, -1),
                    ticket: parseInt(parts[4], 10),
                    type: parts[3],
                    vendor: parts[1].slice(0, -1),
                    url: parts[0],
                });
            } else if (typeof invalid === 'function') {
                invalid(url);
            }
        });
    };

    /**
     * Saves an issue or pull request to the store.
     *
     * @param {String} url
     */
    GitHubIssueTracker.prototype.addTrackedItem = function (vendor, project, type, ticket) {
        var itemType = type === 'pull' ? 'pulls' : type;

        this.fetch(`https://api.github.com/repos/${vendor}/${project}/${itemType}/${ticket}`, (json) => {
            chrome.storage.sync.get('trackedItems', (storage) => {
                var trackedItems = storage.trackedItems || {};

                trackedItems[json.url] = {
                    title: json.title,
                };

                chrome.storage.sync.set({ trackedItems: trackedItems });
            });
        });
    };

    /**
     * Removes an issue or pull request from the store.
     *
     * @param {String} id
     */
    GitHubIssueTracker.prototype.removeTrackedItem = function (id) {
        chrome.storage.sync.get('trackedItems', (storage) => {
            var trackedItems = storage.trackedItems || {};

            delete trackedItems[id];

            chrome.storage.sync.set({ trackedItems: trackedItems });
        });
    };

    window.GitHubIssueTracker = GitHubIssueTracker;
}());
