import React from 'react';
import ReactDOM from 'react-dom';
import Backend from '../Backend/Backend';
import LoadingIndicator from '../LoadingIndicator/LoadingIndicator';
import TypeIcon from '../TypeIcon/TypeIcon';

class Popup extends React.Component {
  constructor(props) {
    super(props);

    this.monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    this.state = {
      addingItem: false,
      hasToken: false,
      locationItem: null,
      syncing: true,
      trackedItems: [],
      user: null,
    };

    props.chrome.storage.sync.get('oauthToken', (result) => {
      this.setState({ hasToken: typeof result.oauthToken !== 'undefined' });
    });

    props.backend.getUser().then((user) => {
      this.setState({ user });
    });

    props.backend.getLocationItem().then((locationItem) => {
      this.setState({ locationItem });
    });

    props.backend.syncTrackedItems().then((trackedItems) => {
      this.setState({ syncing: false, trackedItems });
    });

    this.handleOptionsLinkClick = this.handleOptionsLinkClick.bind(this);
    this.handleAddButtonClick = this.handleAddButtonClick.bind(this);
    this.handleRemoveButtonClick = this.handleRemoveButtonClick.bind(this);
  }

  handleOptionsLinkClick() {
    this.props.chrome.runtime.openOptionsPage();
  }

  handleAddButtonClick() {
    if (this.state.locationItem === null) {
      return;
    }

    this.props.backend
      .addTrackedItem(
        this.state.locationItem.vendor,
        this.state.locationItem.project,
        this.state.locationItem.type,
        this.state.locationItem.ticket
      )
      .then((trackedItems) => {
        this.setState({
          addingItem: false,
          trackedItems,
        });
      });

    this.setState({ addingItem: true });
  }

  handleRemoveButtonClick(event) {
    this.props.backend
      .removeTrackedItem(event.target.dataset.id)
      .then((trackedItems) => {
        this.setState({ trackedItems });
      });
  }

  renderSetupView() {
    return (
      <div className="setup-container">
        <p className="setup-message">
          First you need to create a GitHub OAuth token in
           <a href="#" onClick={this.handleOptionsLinkClick}>options</a>.
        </p>
      </div>
    );
  }

  renderContentView() {
    return (
      <div className="popup">
        {this.state.user &&
          <div className="profile-container">
            <div className="user">
              <img
                className="user__avatar"
                alt={this.state.user.login}
                src={this.state.user.avatarUrl}
                width="30"
              />
              <p className="user__login">{this.state.user.login}</p>
            </div>
          </div>
        }

        <div className="actions-container">
          <div className="add-button-wrapper">
            <button
              className="add-button"
              type="button"
              disabled={this.state.locationItem === null || this.state.addingItem}
              onClick={this.handleAddButtonClick}
            >
              {this.state.addingItem &&
                <LoadingIndicator />
              }
              {!this.state.addingItem &&
                <span>Add to list</span>
              }
            </button>
            {this.state.locationItem &&
              <p className="add-button-description">
                {this.state.locationItem.url}
              </p>
            }
            {!this.state.locationItem &&
              <p className="add-button-description">
                Visit a GitHub issue or pull request URL to track it.
              </p>
            }
          </div>
        </div>

        {this.state.syncing &&
          <div className="tracked-items-container">
            <LoadingIndicator showText />
          </div>
        }

        {!this.state.syncing && this.state.trackedItems.length > 0 &&
          <div className="tracked-items-container">
            <ul className="tracked-item-list">
              {this.state.trackedItems
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                .map((item) => {
                  const updated = new Date(item.updatedAt);
                  const updatedDay = updated.getDate();
                  const updatedMonth = this.monthNames[updated.getMonth()];
                  const updatedYear = updated.getFullYear();
                  const containerClass = item.hasChanges
                    ? 'tracked-item-list__tracked-item__container--changes'
                    : 'tracked-item-list__tracked-item__container';

                  return (
                    <li className="tracked-item-list__tracked-item" key={item.id}>
                      <span className={containerClass}>
                        <span className="tracked-item-list__tracked-item__repo">
                          {`${item.vendor} / ${item.project}`}
                        </span>
                        <TypeIcon
                          mergeable={item.mergeable}
                          mergeableState={item.mergeableState}
                          merged={item.merged}
                          state={item.state}
                          type={item.type}
                        />
                        <a
                          className="tracked-item-list__tracked-item__link"
                          href={item.htmlUrl}
                          target="_blank"
                          title="View on GitHub"
                        >
                          {item.title}
                        </a>
                        <span className="tracked-item-list__tracked-item__updated">
                          {`Updated: ${updatedDay} ${updatedMonth} ${updatedYear}`}
                        </span>
                      </span>
                      <button
                        className="tracked-item-list__tracked-item__button"
                        title="Remove from list"
                        type="button"
                        data-id={item.id}
                        onClick={this.handleRemoveButtonClick}
                      >
                       {String.fromCharCode(215)}
                      </button>
                    </li>
                  );
                })
              }
            </ul>
          </div>
        }
      </div>
    );
  }

  render() {
    return this.state.hasToken
      ? this.renderContentView()
      : this.renderSetupView();
  }
}

Popup.propTypes = {
  backend: React.PropTypes.object.isRequired,
  chrome: React.PropTypes.object.isRequired,
};

// Called when the popup is opened.
document.addEventListener('DOMContentLoaded', () => {
  const props = {
    backend: new Backend(),
    chrome,
  };

  ReactDOM.render(<Popup {...props} />, document.getElementById('popup-view'));
});
