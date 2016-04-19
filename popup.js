(() => {
  class Popup {
    constructor(tracker) {
      this.tracker = tracker;
    }

    /**
     * Renders the setup view.
     */
    renderSetupView() {
      const profile = document.getElementById('profile');
      const message = document.createElement('p');
      const link = document.createElement('a');

      message.textContent = 'You need to create a GitHub OAuth token. ';

      link.href = '#';
      link.textContent = 'Options';
      link.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
      });

      message.appendChild(link);

      profile.appendChild(message);
    }

    /**
     * Creates a button which adds items to the tracker.
     *
     * @return {Promise}
     */
    createAddButtonElement() {
      const promise = new Promise((resolve) => {
        const addButtonElement = document.createElement('button');

        addButtonElement.type = 'button';
        addButtonElement.textContent = 'Add';
        addButtonElement.addEventListener('click', () => {
          this.tracker.canTrackCurrentUrl()
            .then((item) => {
              if (item === null) {
                return;
              }
              this.tracker.addTrackedItem(item.vendor, item.project, item.type, item.ticket);
            });
        });

        return this.tracker.canTrackCurrentUrl()
          .then((item) => {
            if (item === null) {
              addButtonElement.disabled = true;
            }
            resolve(addButtonElement);
          });
      });

      return promise;
    }

    /**
     * Creates an image element which displays the user's GitHub avatar.
     *
     * @return {Promise}
     */
    createAvatarElement() {
      const promise = new Promise((resolve) => {
        chrome.storage.sync.get('avatarUrl', (storage) => {
          if (typeof storage.avatarUrl === 'undefined') {
            resolve(null);
          }

          const avatarElement = document.createElement('img');

          avatarElement.src = storage.avatarUrl;
          avatarElement.width = 40;

          resolve(avatarElement);
        });
      });

      return promise;
    }

    /**
     * Creates a paragraph element which displays the user's GitHub handle.
     *
     * @return {Promise}
     */
    createUsernameElement() {
      const promise = new Promise((resolve) => {
        chrome.storage.sync.get('username', (storage) => {
          if (typeof storage.handle === 'undefined') {
            resolve(null);
          }

          const usernameElement = document.createElement('p');

          usernameElement.textContent = storage.handle;

          resolve(usernameElement);
        });
      });

      return promise;
    }

    /**
     * Creates a list which displays the issues / pull requests the user is currently tracking.
     *
     * @return {Promise}
     */
    createTrackedItemsListElement() {
      const promise = new Promise((resolve) => {
        chrome.storage.sync.get('trackedItems', (storage) => {
          const trackedItems = storage.trackedItems;

          if (typeof trackedItems === 'undefined' || Object.keys(trackedItems).length === 0) {
            const noIssuesMessage = document.createElement('p');

            noIssuesMessage.textContent = "You're not tracking any issues.";

            resolve(noIssuesMessage);
          } else {
            const issuesList = document.createElement('ul');

            Object.keys(trackedItems).forEach((key) => {
              const issuesListItem = document.createElement('li');
              const removeButton = document.createElement('button');

              issuesListItem.textContent = trackedItems[key].title;

              removeButton.type = 'button';
              removeButton.textContent = 'Remove';
              removeButton.dataset.url = key;
              removeButton.addEventListener('click', (event) => {
                this.tracker.removeTrackedItem(event.target.dataset.url);
              });

              issuesListItem.appendChild(removeButton);
              issuesList.appendChild(issuesListItem);
            });

            resolve(issuesList);
          }
        });
      });

      return promise;
    }

    /**
     * Renders the main content view.
     */
    renderContentView() {
      let addButtonElement = null;
      let avatarElement = null;
      let usernameElement = null;

      this.createAddButtonElement()
        .then((element) => {
          addButtonElement = element;
          return this.createAvatarElement();
        })
        .then((element) => {
          avatarElement = element;
          return this.createUsernameElement();
        })
        .then((element) => {
          usernameElement = element;
          return this.createTrackedItemsListElement();
        })
        .then((trackedItemsListElement) => {
          const actionsWrapper = document.getElementById('actions');
          const profileWrapper = document.getElementById('profile');
          const trackedItemsWrapper = document.getElementById('tracked-items');

          actionsWrapper.appendChild(addButtonElement);

          if (avatarElement !== null) {
            profileWrapper.appendChild(avatarElement);
          }

          if (usernameElement !== null) {
            profileWrapper.appendChild(usernameElement);
          }

          trackedItemsWrapper.appendChild(trackedItemsListElement);
        });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const popup = new Popup(chrome.extension.getBackgroundPage().APP.tracker);

    chrome.storage.sync.get('oauthToken', (storage) => {
      if (typeof storage.oauthToken === 'undefined') {
        popup.renderSetupView();
        return;
      }

      popup.renderContentView();
    });

    chrome.runtime.onMessage.addListener((message) => {
      console.log(message);
    });
  });
})();
