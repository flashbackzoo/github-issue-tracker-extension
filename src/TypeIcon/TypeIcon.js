import React from 'react';

function TypeIcon(props) {
  const className = ['type-icon'];

  if (props.className !== void 0) {
    className.push(props.className);
  }

  return (
    <svg
      aria-hidden="true"
      className={className.join(' ')}
      height="16"
      version="1.1"
      viewBox="0 0 14 16"
      width="14"
    >
      <path d={props.pathd} />
    </svg>
  );
}

TypeIcon.propTypes = {
  className: React.PropTypes.string,
  pathd: React.PropTypes.string.isRequired,
};

export default TypeIcon;
