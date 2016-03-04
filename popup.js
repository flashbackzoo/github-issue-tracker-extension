(function () {
    document.addEventListener('DOMContentLoaded', function () {
        var profile = document.getElementById('profile'),
            issues = document.getElementById('issues');

        chrome.storage.local.get('avatarUrl', function (item) {
            var profileImage;

            if (typeof item.avatarUrl === 'undefined') {
                return;
            }

            profileImage = document.createElement('img');
            profileImage.src = item.avatarUrl;
            profileImage.width = 40;

            profile.appendChild(profileImage);
        });

        chrome.storage.local.get('handle', function (item) {
            var profileHandle;

            if (typeof item.handle === 'undefined') {
                return;
            }

            profileHandle = document.createElement('p');
            profileHandle.textContent = item.handle;

            profile.appendChild(profileHandle);
        });

        chrome.storage.local.get('issues', function (item) {
            var trackedIssues,
                noIssuesMessage,
                issuesList,
                issuesListItem,
                index;

            if (typeof item.trackedIssues === 'undefined' || item.trackedIssues.length === 0) {
                noIssuesMessage = document.createElement('p');
                noIssuesMessage.textContent = "You're not tracking any issues.";

                issues.appendChild(noIssuesMessage);
            } else {
                issuesList = document.createElement('ul');

                for (index = 0; index < item.issues.length; index += 1) {
                    issuesListItem = document.createElement('li');
                    issuesListItem.textContent = index;

                    issuesList.appendChild(issuesListItem);
                }

                issues.appendChild(issuesList);
            }
        });
    });
}());
