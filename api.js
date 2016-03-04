(function () {
    function GitHubIssueTracker() {}

    GitHubIssueTracker.prototype.fetch = function (oauthToken, callback) {
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200 && typeof callback === 'function') {
                callback(JSON.parse(xhr.response));
            }
        }

        xhr.open('GET', 'https://api.github.com/user');
        xhr.setRequestHeader('Authorization', 'token ' + oauthToken);
        xhr.send();
    }

    window.issueTracker = new GitHubIssueTracker();
}());
