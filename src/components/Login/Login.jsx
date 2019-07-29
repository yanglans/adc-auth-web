import React from 'react';
import device from 'current-device';
import { Tabs } from 'antd';
import Bqrcode from '../Bqrcode/Bqrcode';
import QRCodeAuth from '../QRCodeAuth';
import OpenApp from '../OpenApp';
import LogoImage from './images/logo.png';

const { TabPane } = Tabs;

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTabKey: 'qrcode',
    };
  }

  handleTabToggle = (activeTabKey) => {
    this.setState({
      activeTabKey,
    });
  };

  render() {
    const { activeTabKey } = this.state;

    return (
      <div
        style={{
          minHeight: '100vh',
          paddingTop: '200px',
          width: '100%',
          height: '100%',
        }}
      >
        <div
          style={{
            height: 50,
            marginBottom: 30,
            background: `url(${LogoImage}) center center / 282px 100% no-repeat `,
          }}
        />
        <h1 style={{ textAlign: 'center' }}>应用统一登录系统</h1>
        {device.mobile() ? (
          <OpenApp />
        ) : (
          <Tabs
            defaultActiveKey="qrcode"
            activeKey={activeTabKey}
            size="large"
            onChange={this.handleTabToggle}
            style={{
              maxWidth: 300,
              margin: '0 auto',
            }}
          >
            <TabPane key="qrcode" tab="二维码登录" style={{ textAlign: 'center' }}>
              {activeTabKey === 'qrcode' && <QRCodeAuth />}
            </TabPane>
            <TabPane key="sms" tab="企业微信登录">
              { activeTabKey === 'sms' && <Bqrcode /> }
            </TabPane>
          </Tabs>
        )}
      </div>
    );
  }
}

export default Login;
