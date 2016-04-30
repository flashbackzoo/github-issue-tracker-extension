class Backend {
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
  getLocationItem() {
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
   * Converts an object to an array.
   *
   * @param {Object}
   * @return {Array}
   */
  objectToArray(obj) {
    return Object
      .keys(obj)
      .reduce((result, key) => result.concat([obj[key]]), []);
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
          return;
        }

        resolve(this.objectToArray(items));
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

            trackedItems[json.id] = Object.assign({}, trackedItems[json.id], {
              hasChanges: false,
              id: json.id,
              mergeable: json.mergeable === void 0 ? false : json.mergeable,
              mergeableState: json.mergeable_state === void 0 ? '' : json.mergeable_state,
              merged: json.merged === void 0 ? false : json.merged,
              project,
              state: json.state,
              title: json.title,
              type,
              updatedAt: json.updated_at,
              url: json.url,
              htmlUrl: json.html_url,
              vendor,
            });

            chrome.storage.sync.set({ trackedItems }, () => {
              resolve(this.objectToArray(trackedItems));
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
          resolve(this.objectToArray(trackedItems));
        });
      });
    });
  }

  /**
   * Updates a tracked item.
   *
   * @return {Promise}
   */
  updateTrackedItem(json) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get('trackedItems', (storage) => {
        const trackedItems = storage.trackedItems;

        if (
          typeof trackedItems === 'undefined' ||
          typeof trackedItems[json.id] === 'undefined'
        ) {
          reject();
        }

        trackedItems[json.id] = Object.assign({}, trackedItems[json.id], {
          hasChanges: new Date(json.updated_at) > new Date(trackedItems[json.id].updatedAt),
          mergeable: json.mergeable === void 0 ? false : json.mergeable,
          mergeableState: json.mergeable_state === void 0 ? '' : json.mergeable_state,
          merged: json.merged === void 0 ? false : json.merged,
          state: json.state,
          title: json.title,
          updatedAt: json.updated_at,
        });

        chrome.storage.sync.set({ trackedItems }, () => {
          resolve(this.objectToArray(trackedItems));
        });
      });
    });
  }

  /**
   * Syncs all tracked items with GitHub.
   *
   * @return {Promise}
   */
  syncTrackedItems() {
    return new Promise((resolve, reject) => {
      this
        .getTrackedItems()
        .then((items) => {
          if (items.length === 0) {
            resolve(items);
            return;
          }
          // Fetch data for all tracked items.
          Promise
            .all(items.map((item) => this.fetch(item.url)))
            .then((updates) => {
              // Update the store with the fetched data.
              Promise
                .all(updates.map((json) => this.updateTrackedItem(json)))
                .then((updatedItems) => {
                  resolve(updatedItems[items.length - 1]);
                });
            })
            .catch(() => {
              reject();
            });
        });
    });
  }
}

module.exports = Backend;
