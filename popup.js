(function () {

    function showSetupContent() {
        var profile = document.getElementById('profile'),
            message = document.createElement('p'),
            link = document.createElement('a');

        message.textContent = 'You need to create a GitHub OAuth token. ';

        link.href = 'javascript:void(0)';
        link.textContent = 'Options';
        link.addEventListener('click', function () {
            chrome.runtime.openOptionsPage()
        });

        message.appendChild(link);

        profile.appendChild(message);
    }

    function showAppContent() {
        var profile = document.getElementById('profile'),
            actions = document.getElementById('actions');
            issues = document.getElementById('issues'),
            addButton = document.createElement('button');

        addButton.type = 'button';
        addButton.textContent = 'Add';

        actions.appendChild(addButton);

        chrome.storage.local.get('avatarUrl', function (storage) {
            var profileImage;

            if (typeof storage.avatarUrl === 'undefined') {
                return;
            }

            profileImage = document.createElement('img');
            profileImage.src = storage.avatarUrl;
            profileImage.width = 40;

            profile.appendChild(profileImage);
        });

        chrome.storage.local.get('handle', function (storage) {
            var profileHandle;

            if (typeof storage.handle === 'undefined') {
                return;
            }

            profileHandle = document.createElement('p');
            profileHandle.textContent = storage.handle;

            profile.appendChild(profileHandle);
        });

        chrome.storage.local.get('issues', function (storage) {
            var trackedIssues,
                noIssuesMessage,
                issuesList,
                issuesListItem,
                index;

            if (typeof storage.trackedIssues === 'undefined' || storage.trackedIssues.length === 0) {
                noIssuesMessage = document.createElement('p');
                noIssuesMessage.textContent = "You're not tracking any issues.";

                issues.appendChild(noIssuesMessage);
            } else {
                issuesList = document.createElement('ul');

                for (index = 0; index < storage.issues.length; index += 1) {
                    issuesListItem = document.createElement('li');
                    issuesListItem.textContent = index;

                    issuesList.appendChild(issuesListItem);
                }

                issues.appendChild(issuesList);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        chrome.storage.local.get('oauthToken', function (storage) {
            if (typeof storage.oauthToken === 'undefined') {
                return showSetupContent();
            }

            showAppContent();
        })
    });
}());
