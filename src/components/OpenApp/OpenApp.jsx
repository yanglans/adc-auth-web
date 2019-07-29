import PropTypes from 'prop-types';
import React, { useState, Fragment } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Button } from 'antd';
import LaunchApp from 'callapp-lib';
import { isInWeChat } from '../../constants/user-agent';
import { selectors } from '../../redux-modules/authentication';
import { ANDROID_APP_LAUNCH_OPTIONS } from '../../constants/app-config';
import MaskImage from './images/mask.png';

const StyledContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;

const StyledButton = styled(Button)`
  width: 30vw;
  height: 40px;
  min-width: 200px;
  max-width: 400px;
`;

const MaskInWeChat = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  background-image: url(${MaskImage});
  background-position: right top;
  background-size: 100% auto;
  background-repeat: no-repeat;
`;

function OpenApp({ serviceUrl }) {
  const [appLauncher] = useState(new LaunchApp(ANDROID_APP_LAUNCH_OPTIONS));
  const handleLaunchApp = (event) => {
    event.preventDefault();
    appLauncher.open({
      path: '',
      param: {
        service: serviceUrl,
      },
    });
  };

  return (
    <Fragment>
      <StyledContainer>
        <StyledButton type="primary" onClick={handleLaunchApp}>
          在APP中打开
        </StyledButton>
      </StyledContainer>
      {isInWeChat() && <MaskInWeChat />}
    </Fragment>
  );
}

OpenApp.propTypes = {
  serviceUrl: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  serviceUrl: selectors.getServiceUrl(state),
});

export default connect(
  mapStateToProps,
  null,
)(OpenApp);
