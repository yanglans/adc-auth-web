import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import { Spin } from 'antd';
import Cookies from 'js-cookie';
import { Login } from './components';
import { actions } from './redux-modules/authentication';
import { getServiceUrl } from './redux-modules/authentication/selectors';
import { httpService } from './services';
import { DEFAULT_SERVICE_URL } from './constants/url';
import handleAfterAuthSuccess from './utils/handle-after-auth-success';

const App = ({ location: { search, hash }, onSetServiceUrl }) => {
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const ticket = Cookies.get('ticket');
    const serviceSearchValue = new URLSearchParams(search).get('service');

    let serviceURL = DEFAULT_SERVICE_URL;

    if (serviceSearchValue) {
      serviceURL = `${serviceSearchValue}${hash}`;
    }

    serviceURL = encodeURIComponent(serviceURL); // 查询参数中的 service 必须编码

    onSetServiceUrl(serviceURL);

    if (serviceURL) {
      if (!ticket) {
        setLoading(false);
      } else {
        httpService
          .post('/cas/v1/ticket', {
            service: serviceURL,
            ticket,
          })
          .then((responseJson) => {
            const token = responseJson.token.value_id;

            handleAfterAuthSuccess({
              targetUrl: serviceURL,
              token,
            });
          })
          .catch(() => {
            setLoading(false);
          });
      }
    }
  }, [hash, onSetServiceUrl, search]);

  return (
    <React.Fragment>
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '30px 50px' }}>
          <Spin />
        </div>
      ) : (
        <Login />
      )}
    </React.Fragment>
  );
};
App.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }).isRequired,
  onSetServiceUrl: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  serviceUrl: getServiceUrl(state),
});

const mapDispatchToProps = dispatch => ({
  onSetServiceUrl: bindActionCreators(actions.setServiceUrl, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(App));
