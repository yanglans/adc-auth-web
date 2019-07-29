import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Redirect } from 'react-router-dom';
import { Alert } from 'antd';
import { selectors } from '../../redux-modules/authentication';

const AboutMe = ({ serviceUrl, location }) => {
  const { state } = location;

  if (state && state.user && state.user.username) {
    return <Alert message={`${state.user.username}，登录成功！`} type="success" />;
  }

  return <Redirect to={`/login?service=${serviceUrl}`} />;
};

AboutMe.propTypes = {
  serviceUrl: PropTypes.string,
  location: PropTypes.shape({
    state: PropTypes.shape({
      user: PropTypes.object,
    }),
  }).isRequired,
};

AboutMe.defaultProps = {
  serviceUrl: '',
};

const mapStateToProps = state => ({
  serviceUrl: selectors.getServiceUrl(state),
});

export default connect(
  mapStateToProps,
  null,
)(withRouter(AboutMe));
