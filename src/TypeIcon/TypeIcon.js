import React from 'react';

function TypeIcon(props) {
  let className = null;
  let pathd = null;

  if (props.type === 'issues' && props.state === 'open') {
    className = 'type-icon--issue-open';
    pathd = 'M7 2.3c3.14 0 5.7 2.56 5.7 5.7S10.14 13.7 7 13.7 1.3 11.14 1.3 8s2.56-5.7 \
      5.7-5.7m0-1.3C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7S10.86 1 7 1z m1 3H6v5h2V4z m0 \
      6H6v2h2V10z';
  } else if (props.type === 'issues' && props.state === 'closed') {
    className = 'type-icon--issue-closed';
    pathd = 'M7 10h2v2H7V10z m2-6H7v5h2V4z m1.5 1.5l-1 1 2.5 2.5 \
      4-4.5-1-1-3 3.5-1.5-1.5zM8 13.7c-3.14 0-5.7-2.56-5.7-5.7s2.56-5.7 5.7-5.7c1.83 0 3.45 \
      0.88 4.5 2.2l0.92-0.92C12.14 2 10.19 1 8 1 4.14 1 1 4.14 1 8s3.14 7 7 7 7-3.14 7-7l-1.52 \
      1.52c-0.66 2.41-2.86 4.19-5.48 4.19z';
  } else if (props.type === 'pull') {
    if (props.state === 'open' && props.mergeable && props.mergeableState === 'clean') {
      className = 'type-icon--pull-open';
    } else if (props.state === 'open' && props.mergeable && props.mergeableState === 'dirty') {
      className = 'type-icon--pull-dirty';
    } else if (props.state === 'open' && props.mergeable && props.mergeableState === 'unstable') {
      className = 'type-icon--pull-unstable';
    } else if (props.state === 'open' && !props.mergeable) {
      className = 'type-icon--pull-unmergeable';
    } else if (props.state === 'closed' && !props.merged) {
      className = 'type-icon--pull-closed';
    } else if (props.merged) {
      className = 'type-icon--pull-merged';
    }

    pathd = 'M11 11.28c0-1.73 0-6.28 \
      0-6.28-0.03-0.78-0.34-1.47-0.94-2.06s-1.28-0.91-2.06-0.94c0 0-1.02 0-1 0V0L4 3l3 \
      3V4h1c0.27 0.02 0.48 0.11 0.69 0.31s0.3 0.42 0.31 0.69v6.28c-0.59 0.34-1 0.98-1 1.72 0 \
      1.11 0.89 2 2 2s2-0.89 2-2c0-0.73-0.41-1.38-1-1.72z m-1 2.92c-0.66 \
      0-1.2-0.55-1.2-1.2s0.55-1.2 1.2-1.2 1.2 0.55 1.2 1.2-0.55 1.2-1.2 1.2zM4 \
      3c0-1.11-0.89-2-2-2S0 1.89 0 3c0 0.73 0.41 1.38 1 1.72 0 1.55 0 5.56 0 6.56-0.59 0.34-1 \
      0.98-1 1.72 0 1.11 0.89 2 2 2s2-0.89 2-2c0-0.73-0.41-1.38-1-1.72V4.72c0.59-0.34 1-0.98 \
      1-1.72z m-0.8 10c0 0.66-0.55 1.2-1.2 1.2s-1.2-0.55-1.2-1.2 0.55-1.2 1.2-1.2 1.2 0.55 1.2 \
      1.2z m-1.2-8.8c-0.66 0-1.2-0.55-1.2-1.2s0.55-1.2 1.2-1.2 1.2 0.55 1.2 1.2-0.55 1.2-1.2 \
      1.2z';
  }

  return (
    <svg
      aria-hidden="true"
      className={className}
      height="16"
      version="1.1"
      viewBox="0 0 16 16"
      width="16"
    >
      <path d={pathd} />
    </svg>
  );
}

TypeIcon.propTypes = {
  mergeable: React.PropTypes.bool.isRequired,
  mergeableState: React.PropTypes.string.isRequired,
  merged: React.PropTypes.bool.isRequired,
  state: React.PropTypes.string.isRequired,
  type: React.PropTypes.string.isRequired,
};

export default TypeIcon;
