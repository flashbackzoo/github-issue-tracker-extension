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
      return new Promise((resolve) => {
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
              this
                .tracker
                .addTrackedItem(item.vendor, item.project, item.type, item.ticket)
                .then((result) => {
                  this.destroyContentView();
                  this.renderContentView(result);
                });
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
    }

    /**
     * Creates an image element which displays the user's GitHub avatar.
     *
     * @return {Promise}
     */
    createProfileElement() {
      return new Promise((resolve) => {
        this
          .tracker
          .getUser()
          .then((user) => {
            const userElement = document.createElement('div');
            const avatarElement = document.createElement('img');
            const loginElement = document.createElement('p');

            userElement.className = 'user';

            avatarElement.className = 'user__avatar';
            avatarElement.src = user.avatarUrl;
            avatarElement.width = 30;

            loginElement.className = 'user__login';
            loginElement.textContent = user.login;

            userElement.appendChild(avatarElement);
            userElement.appendChild(loginElement);

            resolve(userElement);
          });
      });
    }

    /**
     * Creates a list which displays the issues / pull requests the user is currently tracking.
     *
     * @param {Array} [trackedItems]
     * @return {Promise}
     */
    createTrackedItemsListElement(trackedItems = []) {
      return new Promise((resolve) => {
        const listElement = document.createElement('ul');

        listElement.className = 'tracked-item-list';
        listElement.id = 'tracked-items';

        if (trackedItems.length === 0) {
          resolve(listElement);
          return;
        }

        trackedItems
          .sort((a, b) => new Date(b.updated) - new Date(a.updated))
          .forEach((item) => {
            const itemElement = document.createElement('li');
            const itemContainer = document.createElement('div');
            const repoElement = document.createElement('span');
            const linkElement = document.createElement('a');
            const updatedDate = new Date(item.updated);
            const updatedDay = updatedDate.getDate();
            const updatedMonth = this.monthNames[updatedDate.getMonth()];
            const updatedYear = updatedDate.getFullYear();
            const updatedElement = document.createElement('span');
            const removeButton = document.createElement('button');

            itemContainer.className = 'tracked-item-list__tracked-item__container';

            itemElement.className = 'tracked-item-list__tracked-item';

            repoElement.className = 'tracked-item-list__tracked-item__repo';
            repoElement
              .textContent = `${item.vendor} / ${item.project}`;

            linkElement.className = 'tracked-item-list__tracked-item__link';
            linkElement.href = item.url;
            linkElement.target = '_blank';
            linkElement.textContent = item.title;
            linkElement.title = 'View on GitHub';

            updatedElement.className = 'tracked-item-list__tracked-item__updated';
            updatedElement
              .textContent = `Updated: ${updatedDay} ${updatedMonth} ${updatedYear}`;

            removeButton.type = 'button';
            removeButton.className = 'tracked-item-list__tracked-item__button';
            removeButton.innerHTML = '&#10005;';
            removeButton.dataset.item = item.id;
            removeButton.title = 'Remove from list';
            removeButton.addEventListener('click', (event) => {
              this
                .tracker
                .removeTrackedItem(event.target.dataset.item)
                .then((result) => {
                  this.destroyContentView();
                  this.renderContentView(result);
                });
            });

            itemContainer.appendChild(repoElement);
            itemContainer.appendChild(linkElement);
            itemContainer.appendChild(updatedElement);

            itemElement.appendChild(itemContainer);
            itemElement.appendChild(removeButton);

            listElement.appendChild(itemElement);
          });

        resolve(listElement);
      });
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
     *
     * @param {Array} [trackedItems]
     */
    renderContentView(trackedItems = []) {
      let addButtonElement = null;
      let profileElement = null;

      this.createAddButtonElement()
        .then((element) => {
          addButtonElement = element;
          return this.createProfileElement();
        })
        .then((element) => {
          profileElement = element;
          return this.createTrackedItemsListElement(trackedItems);
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

          profileContainer.appendChild(profileElement);
          profileWrapper.appendChild(profileContainer);

          trackedItemsContainer.appendChild(trackedItemsListElement);
          trackedItemsWrapper.appendChild(trackedItemsContainer);
        });
    }
  }

  // Called when the popup is opened.
  document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get('oauthToken', (storage) => {
      const popup = new Popup(chrome.extension.getBackgroundPage().APP.tracker);

      if (typeof storage.oauthToken === 'undefined') {
        popup.renderSetupView();
      } else {
        popup
          .tracker
          .syncTrackedItems()
          .then((trackedItems) => {
            popup.renderContentView(trackedItems);
          });
      }
    });
  });
})();
