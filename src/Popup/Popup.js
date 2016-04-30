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

  getItemTypeIcon(type) {
    const icons = {
      issues: 'M7 2.3c3.14 0 5.7 2.56 5.7 5.7S10.14 13.7 7 13.7 1.3 11.14 1.3 8s2.56-5.7 \
        5.7-5.7m0-1.3C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7S10.86 1 7 1z m1 3H6v5h2V4z m0 \
        6H6v2h2V10z',
      pull: 'M11 11.28c0-1.73 0-6.28 \
        0-6.28-0.03-0.78-0.34-1.47-0.94-2.06s-1.28-0.91-2.06-0.94c0 0-1.02 0-1 0V0L4 3l3 \
        3V4h1c0.27 0.02 0.48 0.11 0.69 0.31s0.3 0.42 0.31 0.69v6.28c-0.59 0.34-1 0.98-1 1.72 0 \
        1.11 0.89 2 2 2s2-0.89 2-2c0-0.73-0.41-1.38-1-1.72z m-1 2.92c-0.66 \
        0-1.2-0.55-1.2-1.2s0.55-1.2 1.2-1.2 1.2 0.55 1.2 1.2-0.55 1.2-1.2 1.2zM4 \
        3c0-1.11-0.89-2-2-2S0 1.89 0 3c0 0.73 0.41 1.38 1 1.72 0 1.55 0 5.56 0 6.56-0.59 0.34-1 \
        0.98-1 1.72 0 1.11 0.89 2 2 2s2-0.89 2-2c0-0.73-0.41-1.38-1-1.72V4.72c0.59-0.34 1-0.98 \
        1-1.72z m-0.8 10c0 0.66-0.55 1.2-1.2 1.2s-1.2-0.55-1.2-1.2 0.55-1.2 1.2-1.2 1.2 0.55 1.2 \
        1.2z m-1.2-8.8c-0.66 0-1.2-0.55-1.2-1.2s0.55-1.2 1.2-1.2 1.2 0.55 1.2 1.2-0.55 1.2-1.2 \
        1.2z',
    };

    if (icons[type] === void 0) {
      return null;
    }

    return <TypeIcon pathd={icons[type]} />;
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
                .sort((a, b) => new Date(b.updated) - new Date(a.updated))
                .map((item) => {
                  const updated = new Date(item.updated);
                  const updatedDay = updated.getDate();
                  const updatedMonth = this.monthNames[updated.getMonth()];
                  const updatedYear = updated.getFullYear();
                  const typeIcon = this.getItemTypeIcon(item.type);

                  return (
                    <li className="tracked-item-list__tracked-item" key={item.id}>
                      <span className="tracked-item-list__tracked-item__container">
                        <span className="tracked-item-list__tracked-item__repo">
                          {`${item.vendor} / ${item.project}`}
                        </span>
                        {typeIcon}
                        <a
                          className="tracked-item-list__tracked-item__link"
                          href={item.url}
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
                       x
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
