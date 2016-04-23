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
                chrome.storage.sync.set({ user }, () => {
                  resolve(user);
                });
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
     * Gets all items currently being tracked.
     *
     * @return {Promise}
     */
    getTrackedItems() {
      return new Promise((resolve) => {
        chrome.storage.sync.get('trackedItems', (storage) => {
          const items = storage.trackedItems;

          if (typeof items === 'undefined' || Object.keys(items).length === 0) {
            resolve([]);
          }

          const itemList = Object
            .keys(items)
            .reduce((result, key) => {
              result.push({
                id: key,
                project: items[key].project,
                title: items[key].title,
                updated: items[key].updated,
                vendor: items[key].vendor,
                url: items[key].url,
              });
              return result;
            }, []);

          resolve(itemList);
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
      return new Promise((resolve) => {
        const itemType = type === 'pull' ? 'pulls' : type;

        this
          .fetch(`https://api.github.com/repos/${vendor}/${project}/${itemType}/${ticket}`)
          .then((json) => {
            chrome.storage.sync.get('trackedItems', (storage) => {
              const trackedItems = storage.trackedItems || {};
              const item = {
                project,
                title: json.title,
                type,
                updated: json.updated_at,
                url: json.html_url,
                vendor,
              };

              trackedItems[json.id] = item;

              chrome.storage.sync.set({ trackedItems }, () => {
                resolve(item);
              });
            });
          });
      });
    }

    /**
     * Removes an issue or pull request from the store.
     *
     * @param {String} id
     * @return {Promise}
     */
    removeTrackedItem(id) {
      return new Promise((resolve) => {
        chrome.storage.sync.get('trackedItems', (storage) => {
          const trackedItems = storage.trackedItems || {};

          delete trackedItems[id];

          chrome.storage.sync.set({ trackedItems }, () => {
            resolve();
          });
        });
      });
    }
  }

  window.APP = window.APP || {};
  window.APP.GitHubIssueTracker = GitHubIssueTracker;
})();
