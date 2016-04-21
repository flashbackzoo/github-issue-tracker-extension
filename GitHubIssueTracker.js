(() => {
  class GitHubIssueTracker {
    constructor() {
      this.alarmName = 'fetch';
      this.authenticated = false;
      this.polling = false;
      this.token = null;
    }

    authenticate(token) {
      const xhr = new XMLHttpRequest();

      if (this.authenticated === true) {
        return;
      }

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          this.authenticated = true;
          this.token = token;

          const json = JSON.parse(xhr.response);

          // Data used by other parts of the app. For example the popup.
          chrome.storage.sync.set({
            avatarUrl: json.avatar_url,
            username: json.login,
          });

          this.startPolling();
        }
      };

      xhr.open('GET', 'https://api.github.com/user');
      xhr.setRequestHeader('Authorization', `token ${token}`);
      xhr.send();
    }

    fetch(url, success) {
      const xhr = new XMLHttpRequest();

      if (this.authenticated === false) {
        throw new Error('You need to authenticate before fetching data.');
      }

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          success(JSON.parse(xhr.response));
        }
      };

      xhr.open('GET', url);
      xhr.setRequestHeader('Authorization', `token ${this.token}`);
      xhr.send();
    }

    startPolling() {
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
    }

    stopPolling() {
      if (this.polling === false) {
        return;
      }

      chrome.alarms.clear(this.alarmName, () => {
        this.polling = false;
      });
    }

    /**
     * Matches the current tab's URL against a valid GitHub issue/pull URL pattern.
     *
     * @return {Promise}
     */
    canTrackCurrentUrl() {
      const promise = new Promise((resolve) => {
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
          const url = tabs[0].url;
          const parts = url
            .match(/^https:\/\/github\.com\/([\w-]+\/)([\w-]+\/)(issues|pull)\/(\d+)(?:#[\w-]+)?$/);
          const result = parts !== null
            ? {
              project: parts[2].slice(0, -1),
              ticket: parseInt(parts[4], 10),
              type: parts[3],
              vendor: parts[1].slice(0, -1),
              url: parts[0],
            }
            : null;

          resolve(result);
        });
      });

      return promise;
    }

    /**
     * Saves an issue or pull request to the store.
     *
     * @param {String} url
     */
    addTrackedItem(vendor, project, type, ticket) {
      const itemType = type === 'pull' ? 'pulls' : type;

      this.fetch(`https://api.github.com/repos/${vendor}/${project}/${itemType}/${ticket}`, (json) => {
        chrome.storage.sync.get('trackedItems', (storage) => {
          const trackedItems = storage.trackedItems || {};
          const message = { type: 'TRACKED_ITEM_ADD' };

          trackedItems[json.id] = {
            title: json.title,
            url: json.html_url,
          };

          chrome.storage.sync.set({ trackedItems }, () => {
            chrome.runtime.sendMessage(message);
          });
        });
      });
    }

    /**
     * Removes an issue or pull request from the store.
     *
     * @param {String} id
     */
    removeTrackedItem(id) {
      chrome.storage.sync.get('trackedItems', (storage) => {
        const trackedItems = storage.trackedItems || {};
        const message = {
          type: 'TRACKED_ITEM_REMOVE',
          payload: '',
        };

        delete trackedItems[id];

        chrome.storage.sync.set({ trackedItems }, () => {
          chrome.runtime.sendMessage(message);
        });
      });
    }
  }

  window.APP = window.APP || {};
  window.APP.GitHubIssueTracker = GitHubIssueTracker;
})();
