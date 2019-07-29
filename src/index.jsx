import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { LocaleProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import configureStore from './configure-store';
import App from './App';

const store = configureStore();
const rootElem = document.getElementById('root');

ReactDOM.render(
  <LocaleProvider locale={zhCN}>
    <Provider store={store}>
      <BrowserRouter>
        <Switch>
          <Route path="/" component={App} />
        </Switch>
      </BrowserRouter>
    </Provider>
  </LocaleProvider>,
  rootElem,
);
