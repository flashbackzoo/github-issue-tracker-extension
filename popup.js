(() => {
  class Popup {
    constructor(tracker) {
      this.monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];

      this.tracker = tracker;
    }

    /**
     * Renders the setup view.
     */
    renderSetupView() {
      const profileWrapperElement = document.getElementById('profile-wrapper');
      const sectionContainerElement = document.createElement('div');
      const messageElement = document.createElement('p');
      const linkElement = document.createElement('a');

      sectionContainerElement.className = 'setup-container';

      messageElement.className = 'setup-message';
      messageElement
        .textContent = 'First you need to create a GitHub OAuth token in ';

      linkElement.href = '#';
      linkElement.textContent = 'options';
      linkElement.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
      });

      messageElement.appendChild(linkElement);
      sectionContainerElement.appendChild(messageElement);
      profileWrapperElement.appendChild(sectionContainerElement);
    }

    /**
     * Creates a button which adds items to the tracker.
     *
     * @return {Promise}
     */
    createAddButtonElement() {
      const promise = new Promise((resolve) => {
        const addButtonWrapperElement = document.createElement('div');
        const addButtonElement = document.createElement('button');
        const addDescriptionElement = document.createElement('span');

        addButtonWrapperElement.className = 'add-button-wrapper';

        addButtonElement.className = 'add-button';
        addButtonElement.type = 'button';
        addButtonElement.textContent = 'Add to list';
        addButtonElement.addEventListener('click', () => {
          this.tracker.canTrackCurrentUrl()
            .then((item) => {
              if (item === null) {
                return;
              }
              this.tracker.addTrackedItem(item.vendor, item.project, item.type, item.ticket);
            });
        });

        addDescriptionElement.className = 'add-button-description';

        return this.tracker.canTrackCurrentUrl()
          .then((item) => {
            if (item === null) {
              addDescriptionElement
                .textContent = 'Visit a GitHub issue or pull request URL to track it.';
              addButtonElement.disabled = true;
            } else {
              addDescriptionElement.textContent = item.url;
            }

            addButtonWrapperElement.appendChild(addButtonElement);
            addButtonWrapperElement.appendChild(addDescriptionElement);

            resolve(addButtonWrapperElement);
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

          avatarElement.className = 'avatar';
          avatarElement.src = storage.avatarUrl;
          avatarElement.width = 30;

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
          if (typeof storage.username === 'undefined') {
            resolve(null);
          }

          const usernameElement = document.createElement('p');

          usernameElement.className = 'username';
          usernameElement.textContent = storage.username;

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
          const listElement = document.createElement('ul');

          listElement.className = 'tracked-item-list';
          listElement.id = 'tracked-items';

          if (typeof trackedItems === 'undefined' || Object.keys(trackedItems).length === 0) {
            resolve(listElement);
          } else {
            Object.keys(trackedItems).forEach((key) => {
              const itemElement = document.createElement('li');
              const itemContainer = document.createElement('div');
              const repoElement = document.createElement('span');
              const linkElement = document.createElement('a');
              const updatedDate = new Date(trackedItems[key].updated);
              const updatedDay = updatedDate.getDate();
              const updatedMonth = this.monthNames[updatedDate.getMonth()];
              const updatedYear = updatedDate.getFullYear();
              const updatedElement = document.createElement('span');
              const removeButton = document.createElement('button');

              itemContainer.className = 'tracked-item-list__tracked-item__container';

              itemElement.className = 'tracked-item-list__tracked-item';

              repoElement.className = 'tracked-item-list__tracked-item__repo';
              repoElement
                .textContent = `${trackedItems[key].vendor} / ${trackedItems[key].project}`;

              linkElement.className = 'tracked-item-list__tracked-item__link';
              linkElement.href = trackedItems[key].url;
              linkElement.target = '_blank';
              linkElement.textContent = trackedItems[key].title;
              linkElement.title = 'View on GitHub';

              updatedElement.className = 'tracked-item-list__tracked-item__updated';
              updatedElement
                .textContent = `Updated: ${updatedDay} ${updatedMonth} ${updatedYear}`;

              removeButton.type = 'button';
              removeButton.className = 'tracked-item-list__tracked-item__button';
              removeButton.innerHTML = '&#10005;';
              removeButton.dataset.item = key;
              removeButton.title = 'Remove from list';
              removeButton.addEventListener('click', (event) => {
                this.tracker.removeTrackedItem(event.target.dataset.item);
              });

              itemContainer.appendChild(repoElement);
              itemContainer.appendChild(linkElement);
              itemContainer.appendChild(updatedElement);

              itemElement.appendChild(itemContainer);
              itemElement.appendChild(removeButton);

              listElement.appendChild(itemElement);
            });

            resolve(listElement);
          }
        });
      });

      return promise;
    }

    /**
     * Destroys DOM elements created by the `Popup.renderContentView` method.
     */
    destroyContentView() {
      const profileWrapper = document.getElementById('profile-wrapper');
      const actionsWrapper = document.getElementById('actions-wrapper');
      const trackedItemsWrapper = document.getElementById('tracked-items-wrapper');

      while (profileWrapper.firstChild) {
        profileWrapper.removeChild(profileWrapper.firstChild);
      }

      while (actionsWrapper.firstChild) {
        actionsWrapper.removeChild(actionsWrapper.firstChild);
      }

      while (trackedItemsWrapper.firstChild) {
        trackedItemsWrapper.removeChild(trackedItemsWrapper.firstChild);
      }
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
          const actionsWrapper = document.getElementById('actions-wrapper');
          const profileWrapper = document.getElementById('profile-wrapper');
          const trackedItemsWrapper = document.getElementById('tracked-items-wrapper');
          const actionsContainer = document.createElement('div');
          const profileContainer = document.createElement('div');
          const trackedItemsContainer = document.createElement('div');

          actionsContainer.className = 'actions-container';
          profileContainer.className = 'profile-container';
          trackedItemsContainer.className = 'tracked-items-container';

          actionsContainer.appendChild(addButtonElement);
          actionsWrapper.appendChild(actionsContainer);

          if (avatarElement !== null) {
            profileContainer.appendChild(avatarElement);
          }

          if (usernameElement !== null) {
            profileContainer.appendChild(usernameElement);
          }

          profileWrapper.appendChild(profileContainer);

          trackedItemsContainer.appendChild(trackedItemsListElement);
          trackedItemsWrapper.appendChild(trackedItemsContainer);
        });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const popup = new Popup(chrome.extension.getBackgroundPage().APP.tracker);

    // Render a view based on whether or not an OAuth token is set.
    chrome.storage.sync.get('oauthToken', (storage) => {
      // If no OAuth token is set render the setup view.
      if (typeof storage.oauthToken === 'undefined') {
        popup.renderSetupView();
        return;
      }

      // If an OAuth token is set but authentication hasn't happened,
      // authenticate then render the content view.
      if (popup.tracker.authenticated === false) {
        popup.tracker.authenticate(storage.oauthToken)
          .then(() => {
            popup.renderContentView();
          });
        return;
      }

      // The user has an OAuth token and has authenticated.
      popup.renderContentView();
    });

    // Update the tracked items list when an item is added or removed.
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type !== 'TRACKED_ITEM_ADD' && message.type !== 'TRACKED_ITEM_REMOVE') {
        return;
      }

      popup.destroyContentView();
      popup.renderContentView();
    });
  });
})();
