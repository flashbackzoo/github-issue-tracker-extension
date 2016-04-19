(() => {
  function showSetupContent() {
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

  function showAppContent() {
    const tracker = chrome.extension.getBackgroundPage().APP.tracker;
    const profile = document.getElementById('profile');
    const actions = document.getElementById('actions');
    const issues = document.getElementById('issues');
    const addButton = document.createElement('button');

    addButton.type = 'button';
    addButton.textContent = 'Add';

    addButton.addEventListener('click', () => {
      tracker.canTrackCurrentUrl((item) => {
        tracker.addTrackedItem(item.vendor, item.project, item.type, item.ticket);
      });
    });

    tracker.canTrackCurrentUrl(() => {
      actions.appendChild(addButton);
    }, () => {
      addButton.disabled = true;
      actions.appendChild(addButton);
    });

    chrome.storage.sync.get('avatarUrl', (storage) => {
      if (typeof storage.avatarUrl === 'undefined') {
        return;
      }

      const profileImage = document.createElement('img');

      profileImage.src = storage.avatarUrl;
      profileImage.width = 40;

      profile.appendChild(profileImage);
    });

    chrome.storage.sync.get('username', (storage) => {
      if (typeof storage.handle === 'undefined') {
        return;
      }

      const profileHandle = document.createElement('p');

      profileHandle.textContent = storage.handle;

      profile.appendChild(profileHandle);
    });

    chrome.storage.sync.get('trackedItems', (storage) => {
      const trackedItems = storage.trackedItems;

      if (typeof trackedItems === 'undefined' || Object.keys(trackedItems).length === 0) {
        const noIssuesMessage = document.createElement('p');

        noIssuesMessage.textContent = "You're not tracking any issues.";

        issues.appendChild(noIssuesMessage);
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
            tracker.removeTrackedItem(event.target.dataset.url);
          });

          issuesListItem.appendChild(removeButton);
          issuesList.appendChild(issuesListItem);
        });

        issues.appendChild(issuesList);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get('oauthToken', (storage) => {
      if (typeof storage.oauthToken === 'undefined') {
        showSetupContent();
        return;
      }

      showAppContent();
    });

    chrome.runtime.onMessage.addListener((message) => {
      console.log(message);
    });
  });
})();
