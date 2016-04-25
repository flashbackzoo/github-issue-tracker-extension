(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const oauthToken = document.getElementById('oauth-token');
    const statusWrapperElement = document.getElementById('status-wrapper');
    const statusContainerElement = document.createElement('p');
    const saveButton = document.getElementById('save-button');

    saveButton.className = 'save-button';

    statusContainerElement.className = 'status-container';

    chrome.storage.sync.get('oauthToken', (storage) => {
      oauthToken.value = storage.oauthToken || '';
    });

    saveButton.addEventListener('click', () => {
      const value = oauthToken.value;

      if (!value) {
        statusContainerElement.className = 'status-container--bad';
        statusContainerElement.textContent = 'You need to enter an OAuth token.';
      } else {
        chrome.storage.sync.set({ oauthToken: value }, () => {
          statusContainerElement.className = 'status-container--good';
          statusContainerElement
            .textContent = 'Saved. Now you can start tracking GitHub issues and Pull Requests.';
        });
      }

      statusWrapperElement.appendChild(statusContainerElement);
    });
  });
})();
