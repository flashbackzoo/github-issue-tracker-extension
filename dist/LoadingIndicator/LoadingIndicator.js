const React = require('react');

function LoadingIndicator(props = { showText: false }) {
  return (
    <div className="loading-indicator">
      <div className="loading-indicator__bar loading-indicator__bar--first"></div>
      <div className="loading-indicator__bar loading-indicator__bar--second"></div>
      <div className="loading-indicator__bar loading-indicator__bar--third"></div>
      <div className="loading-indicator__bar loading-indicator__bar--fourth"></div>
      <div className="loading-indicator__bar loading-indicator__bar--fifth"></div>
      {props.showText &&
        <p>Updating</p>
      }
    </div>
  );
}

module.exports = LoadingIndicator;
