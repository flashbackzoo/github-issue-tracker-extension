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
        var tracker = chrome.extension.getBackgroundPage().tracker,
            profile = document.getElementById('profile'),
            actions = document.getElementById('actions'),
            issues = document.getElementById('issues'),
            addButton = document.createElement('button');

        addButton.type = 'button';
        addButton.textContent = 'Add';

        addButton.addEventListener('click', function (event) {
            tracker.canTrackCurrentUrl(function (item) {
                tracker.addTrackedItem(item.vendor, item.project, item.type, item.ticket);
            });
        });

        tracker.canTrackCurrentUrl(function () {
            actions.appendChild(addButton);
        }, function () {
            addButton.disabled = true;
            actions.appendChild(addButton);
        });

        chrome.storage.sync.get('avatarUrl', function (storage) {
            var profileImage;

            if (typeof storage.avatarUrl === 'undefined') {
                return;
            }

            profileImage = document.createElement('img');
            profileImage.src = storage.avatarUrl;
            profileImage.width = 40;

            profile.appendChild(profileImage);
        });

        chrome.storage.sync.get('username', function (storage) {
            var profileHandle;

            if (typeof storage.handle === 'undefined') {
                return;
            }

            profileHandle = document.createElement('p');
            profileHandle.textContent = storage.handle;

            profile.appendChild(profileHandle);
        });

        chrome.storage.sync.get('trackedItems', function (storage) {
            var trackedItems = storage.trackedItems,
                noIssuesMessage,
                issuesList,
                issuesListItem,
                index;

            if (typeof trackedItems === 'undefined' || Object.keys(trackedItems).length === 0) {
                noIssuesMessage = document.createElement('p');
                noIssuesMessage.textContent = "You're not tracking any issues.";

                issues.appendChild(noIssuesMessage);
            } else {
                issuesList = document.createElement('ul');

                Object.keys(trackedItems).forEach((key) => {
                    issuesListItem = document.createElement('li');
                    issuesListItem.textContent = trackedItems[key].title;

                    issuesList.appendChild(issuesListItem);
                });

                issues.appendChild(issuesList);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        chrome.storage.sync.get('oauthToken', function (storage) {
            if (typeof storage.oauthToken === 'undefined') {
                return showSetupContent();
            }

            showAppContent();
        })
    });
}());
