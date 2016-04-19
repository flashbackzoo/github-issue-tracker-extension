(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const oauthToken = document.getElementById('oauth-token');
    const status = document.getElementById('status');
    const saveButton = document.getElementById('save-button');

    chrome.storage.sync.get('oauthToken', (storage) => {
      oauthToken.value = storage.oauthToken || '';
    });

    saveButton.addEventListener('click', () => {
      const value = oauthToken.value;

      setTimeout(() => {
        status.textContent = '';
      }, 2000);

      if (!value) {
        status.textContent = 'You need to specify a value.';
        return;
      }

      chrome.storage.sync.set({ oauthToken: value }, () => {
        status.textContent = 'Settings saved';
      });
    });
  });
})();
