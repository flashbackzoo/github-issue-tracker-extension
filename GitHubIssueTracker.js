(() => {
  class GitHubIssueTracker {
    /**
     * Gets the user's details either from storage or the GitHub API.
     *
     * @param {String} token
     * @return {Promise}
     */
    getUser() {
      return new Promise((resolve, reject) => {
        chrome.storage.sync.get('user', (storage) => {
          if (typeof storage.user === 'undefined') {
            this
              .fetch('https://api.github.com/user')
              .then((json) => {
                const user = {
                  avatarUrl: json.avatar_url,
                  login: json.login,
                };
                chrome.storage.sync.set({ user });
                resolve(user);
              })
              .catch(() => {
                reject();
              });
          } else {
            resolve(storage.user);
          }
        });
      });
    }

    /**
     * Makes an authenticated request to a GitHub API endpoint.
     *
     * @param {String} url
     */
    fetch(url) {
      return new Promise((resolve, reject) => {
        chrome.storage.sync.get('oauthToken', (storage) => {
          if (typeof storage.oauthToken === 'undefined') {
            reject();
          }

          const xhr = new XMLHttpRequest();

          xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
              resolve(JSON.parse(xhr.response));
            } else if (xhr.readyState === 4 && xhr.status !== 200) {
              reject();
            }
          };

          xhr.open('GET', url);
          xhr.setRequestHeader('Authorization', `token ${storage.oauthToken}`);
          xhr.send();
        });
      });
    }

    /**
     * Matches the current tab's URL against a valid GitHub issue/pull URL pattern.
     *
     * @return {Promise}
     */
    canTrackCurrentUrl() {
      return new Promise((resolve) => {
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
    }

    /**
     * Saves an issue or pull request to the store.
     *
     * @param {String} vendor
     * @param {String} project
     * @param {String} type
     * @param {String} ticket
     * @return {Promise}
     */
    addTrackedItem(vendor, project, type, ticket) {
      const itemType = type === 'pull' ? 'pulls' : type;

      return this
        .fetch(`https://api.github.com/repos/${vendor}/${project}/${itemType}/${ticket}`)
        .then((json) => {
          chrome.storage.sync.get('trackedItems', (storage) => {
            const trackedItems = storage.trackedItems || {};
            const message = { type: 'TRACKED_ITEM_ADD' };

            trackedItems[json.id] = {
              project,
              title: json.title,
              type,
              updated: json.updated_at,
              url: json.html_url,
              vendor,
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
        const message = { type: 'TRACKED_ITEM_REMOVE' };

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
