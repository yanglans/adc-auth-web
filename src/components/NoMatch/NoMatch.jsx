import PropTypes from 'prop-types';
import React from 'react';

const NoMatch = ({ location }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '300px',
      textAlign: 'center',
    }}
  >
    <h3>
      路由
      <code>{location.pathname}</code>
      {'未定义'}
    </h3>
  </div>
);

NoMatch.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
};

export default NoMatch;
