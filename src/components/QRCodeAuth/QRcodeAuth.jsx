import PropTypes from 'prop-types';
import uuidv4 from 'uuid/v4';
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import QRCode from 'qrcode.react';
import { Button, Spin, Icon } from 'antd';
import { selectors } from '../../redux-modules/authentication';
import { QRCODE_HOST } from '../../constants/url';
import { BASE_SOCKET } from '../../services/http';
import handleAfterAuthSuccess from '../../utils/handle-after-auth-success';
import FlySocket from '../../FlySocket';


const socketUrl = `${BASE_SOCKET}/cas/qrcode/connect/`;

const MaskForReload = styled.div.attrs({
  title: '点击刷新二维码',
})`
  cursor: pointer;
  position: absolute;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(250, 250, 250, 0.9);
  font-size: 12px;

  & > *:not(:last-child) {
    margin-bottom: 5px;
  }
`;

const MaskForRefresh = styled(MaskForReload)`
  z-index: 1;
  display: flex;
  background: transparent;
  cursor: pointer;
`;

const Container = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 128px;
  height: 128px;
  margin: 0 auto;
  margin-top:5px;
  margin-bottom: 15px;
`;

class QRCodeAuthentication extends React.Component {
  static propTypes = {
    serviceUrl: PropTypes.string,
  };

  static defaultProps = {
    serviceUrl: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      uuid: null,
      hasConnected: false,
      hasScanned: false,
      socketMessage: null,
      canRefresh: false,
      needReloadByHand: false,
      reasonForReload: '',
      hasConfirmedLogin: false,
    };
    this.ws = null;
    this.timerForClosingSocket = null;
    this.timerForCanRefresh = null;
  }

  componentDidMount() {
    this.launchSocket();
  }

  componentDidUpdate(prevProps) {
    const { ws } = this;
    const { uuid } = this.state;
    const { serviceUrl } = this.props;

    if (prevProps.serviceUrl !== serviceUrl) {
      ws.json({
        uuid,
        service: serviceUrl,
      });
    }
  }

  componentWillUnmount() {
    this.cleanupTimer();

    const { uuid } = this.state;

    if (this.ws && typeof this.ws.close === 'function') {
      this.ws.close(1000, uuid);
    }
  }

  cleanupTimer = () => {
    if (this.timerForCanRefresh) {
      clearTimeout(this.timerForCanRefresh);
      this.timerForCanRefresh = null;
    }

    if (this.timerForClosingSocket) {
      clearTimeout(this.timerForClosingSocket);
      this.timerForClosingSocket = null;
    }
  };

  launchSocket = () => {
    /**
     * 重置一些相关的状态
     */
    this.cleanupTimer();

    this.setState({
      hasConnected: false,
      canRefresh: false,
      needReloadByHand: false,
      reasonForReload: '',
    });

    const ws = new FlySocket(socketUrl, {
      maxAttempts: 1,
      onopen: () => {
        const { serviceUrl } = this.props;
        const newUUID = uuidv4();

        this.setState({
          hasConnected: true,
          uuid: newUUID,
        });

        ws.json({
          uuid: newUUID,
          service: serviceUrl,
        });

        this.startCanRefreshQRCodeTimer();
        this.startCloseSocketTimer();
      },
      onmessage: (event) => {
        this.handleMessageFromServer(JSON.parse(event.data));
      },
      onerror: () => {
        // 出错则关闭 socket 连接
        this.closeSocketConnection('连接错误');
      },
    });

    this.ws = ws;
  };

  closeSocketConnection = (reason = '') => {
    const { uuid } = this.state;

    this.cleanupTimer();

    if (this.ws && typeof this.ws.close === 'function') {
      this.ws.close(1000, uuid);
    }

    this.setState({
      hasScanned: false,
      needReloadByHand: true,
      reasonForReload: reason,
    });
  };

  /**
   * 每次新建 socket 连接 60s 后超时关闭 socket 连接
   */
  startCloseSocketTimer = () => {
    clearTimeout(this.timerForClosingSocket);
    this.timerForClosingSocket = setTimeout(() => {
      this.closeSocketConnection('连接超时');
    }, 60 * 1000);
  };

  /**
   * 每次手动点击刷新二维码3秒后，才允许再次手动点击刷新二维码
   */
  startCanRefreshQRCodeTimer = () => {
    this.setState({
      canRefresh: false,
    });

    clearTimeout(this.timerForCanRefresh);
    this.timerForCanRefresh = setTimeout(() => {
      this.setState({
        canRefresh: true,
      });

      clearTimeout(this.timerForCanRefresh);
      this.timerForCanRefresh = null;
    }, 3 * 1000);
  };

  /**
   * 手动点击以刷新二维码（在同一个 WebSocket 连接上）
   */
  tick = () => {
    this.setState({
      canRefresh: false,
    });

    const { ws } = this;
    const { uuid } = this.state;
    const { serviceUrl } = this.props;

    /**
     * 告诉服务器当前 uuid 失效
     */
    ws.json({
      uuid,
      expired: true,
    });

    /**
     * 生成新的 UUID，更新二维码，向服务器发消息
     */
    const newUUID = uuidv4();

    this.setState({
      uuid: newUUID,
    });

    ws.json({
      uuid: newUUID,
      service: serviceUrl,
    });

    /**
     * 3 秒后，才允许再次手动点击刷新二维码
     */
    this.startCanRefreshQRCodeTimer();
  };

  handleMessageFromServer = (socketMessage) => {
    const { serviceUrl } = this.props;
    const { code } = socketMessage;
    const hasScanned = code === 1;

    /**
     * 用户已通过 App 扫码
     */
    if (hasScanned) {
      /**
       * 清除超时相关的的定时器
       */
      this.cleanupTimer();

      const { user } = socketMessage;
      this.setState({
        userData: user,
      });

      /**
       * 扫码成功 60s 后，用户未进行任何操作，则关闭当前 socket 连接
       */
      this.startCloseSocketTimer();
    }

    this.setState({
      socketMessage,
      hasScanned,
    });

    if (code === 2) {
      /**
       * APP 端确认登录
       */
      this.setState({
        hasConfirmedLogin: true,
      });

      const { ticket, token } = socketMessage;
      const { userData } = this.state;

      handleAfterAuthSuccess({
        targetUrl: serviceUrl,
        token,
        ticket,
        username: userData.username,
        userId: userData.id,
      });
    } else if (code === 9) {
      /**
       * 认证过程出现异常
       */
      this.closeSocketConnection('认证异常');
    } else if (code === 8) {
      /**
       * APP 端取消登录
       */
      this.setState({
        hasScanned: false,
      });
      this.tick();
    }
  };

  render() {
    const {
      uuid,
      hasConnected,
      hasScanned,
      socketMessage,
      reasonForReload,
      needReloadByHand,
      canRefresh,
      hasConfirmedLogin,
    } = this.state;

    const { serviceUrl } = this.props;

    if (hasConfirmedLogin) {
      return (<div>认证成功，正在跳转...</div>);
    }

    if (hasScanned) {
      return (
        <div>
          <div style={{ marginBottom: 10 }}>
            {socketMessage.user.username}
            {'已扫码，请在手机APP上确认登录'}
          </div>
          <Button htmlType="button" type="primary" onClick={this.tick}>
            切换账号
          </Button>
        </div>
      );
    }

    return (
      serviceUrl && (
        <div>
          <Container>
            {!needReloadByHand && canRefresh && <MaskForRefresh onClick={this.tick} />}
            {needReloadByHand && (
              <MaskForReload onClick={this.launchSocket}>
                <Icon type="reload" style={{ fontSize: 32 }} />
                {reasonForReload && <div>{reasonForReload}</div>}
                <div>点击刷新</div>
              </MaskForReload>
            )}
            {hasConnected ? (
              <QRCode value={`${QRCODE_HOST}?id=${uuid}&service=${serviceUrl}`} />
            ) : (
              <Spin />
            )}
          </Container>
          <div>使用手机App扫码登录或扫码下载‘智信’APP</div>
        </div>
      )
    );
  }
}

const mapStateToProps = state => ({
  serviceUrl: selectors.getServiceUrl(state),
});

export default connect(
  mapStateToProps,
  null,
)(QRCodeAuthentication);
