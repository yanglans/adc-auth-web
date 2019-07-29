import React from 'react';
import {
  message
} from 'antd';
import styled from 'styled-components';
import axios from 'axios';
import Cookies from 'js-cookie';
import 'url-polyfill';

const Container = styled.div `
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;

function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}
const userAgent = navigator.userAgent;
if (userAgent.indexOf('wxwork') > -1) {
  const encodeUrl = encodeURIComponent(window.location.href);
  const newUrl =
    `"https://open.weixin.qq.com/connect/oauth2/authorize?appid=wwb35f55c062f8a1ee&redirect_uri=${encodeUrl}&response_type=code&scope=snsapi_base&state=&connect_redirect=1#wechat_redirect"`;
    console.log("如果userAgent存在的URL："+ newUrl)
      window.location.replace(newUrl);
}
const codetext = getQueryVariable("code")
const service = getQueryVariable("service") || 'https://sso.avlyun.org/main.html'
console.log(codetext);
console.log(service);
  if ( codetext ) {
    // const post_url = 'http://192.168.15.7:8443/cas/login_wx_qrcode'
    const post_url = '/cas/login_wx_qrcode'
    axios
      .post(post_url, {
        service: service,
        wx_code: codetext,
      })
      .then(function (res) {
        console.log("接口数据：");
        console.log(res);
        if (res.data.status === 0) {
          const token = res.data.token.value_id;
          const ticket = res.data.ticket.value_id;
          if (ticket) {
            Cookies.set('ticket', ticket, {
              expires: 300
            });
          }
          if (token) {
            const url = new URL(decodeURIComponent(window.location.href));
            const searchParams = new URLSearchParams(window.location.search);
            searchParams.append('ztptoken', token);
            url.search = `?${searchParams.toString()}`;
            console.log("跳转的URL：" + url.href);
            window.location.replace(url.href);
          }
        }
        else{
          message.warning(res.data.error);
        }
      })
      .catch(function (error) {
        message.warning(error);
      });
  }

class WrappedBqrcode extends React.Component {
  componentDidMount() {
      window.WwLogin({
        id: 'wx_reg',
        appid: 'wwb35f55c062f8a1ee',
        agentid: '1000002',
        redirect_uri: encodeURIComponent(window.location.href.replace('http://localhost:2222', 'https://sso.avlyun.org')),
        state: '3828293919281',
        href: 'data:text/css;base64,LmltcG93ZXJCb3ggLnFyY29kZSB7CiAgd2lkdGg6IDE2MHB4Cn0KLmltcG93ZXJCb3ggLndhaXRpbmcgLndycF9jb2RlIHsKICBtYXJnaW4tdG9wOiAtMTBweCAhaW1wb3J0YW50Cn0KCi5pbXBvd2VyQm94IC50aXRsZSB7CiAgZGlzcGxheTogbm9uZTsKfQoKLmltcG93ZXJCb3ggLmluZm8gewogIHdpZHRoOiAyMDBweDsKfQojd3hfZGVmYXVsdF90aXB7CiAgcGFkZGluZzogMCAwICFpbXBvcnRhbnQ7Cn0KLmltcG93ZXJCb3ggLnN0YXR1c3sKICBtYXJnaW4tdG9wOiAwICFpbXBvcnRhbnQ7CiAgdGV4dC1hbGlnbjogY2VudGVyOwp9Cgo=',
      });
  }
  render() {
    return ( <div>
      <Container>
      <div id = "wx_reg" > </div>
      </Container>
      </div>
    );
  }
}

export default WrappedBqrcode;
