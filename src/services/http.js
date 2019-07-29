import axios from 'axios';
import { message } from 'antd';

export const { protocol: URL_PROTOCOL, host: HOST } = window.location;
export const SOCKET_PROTOCOL = URL_PROTOCOL === 'https:' ? 'wss:' : 'ws:';

let baseUrl = 'http://192.168.15.7:8443';
let socketHost = '192.168.15.7:8443';

if (process.env.NODE_ENV === 'production') {
  baseUrl = '';
  socketHost = HOST;
}

export const BASE_URL = baseUrl;
export const BASE_SOCKET = `${SOCKET_PROTOCOL}//${socketHost}`;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

axiosInstance.defaults.headers.post['Content-Type'] = 'application/json';

axiosInstance.interceptors.request.use(
  (config) => {
    if (!navigator.onLine) {
      return Promise.reject(new Error('网络离线'));
    }

    return config;
  },
  error => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => {
    const { data } = response;

    if (data.status !== 0) {
      return Promise.reject(data.error || '');
    }

    return response.data;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('网络请求超时'));
    }

    if (error.response) {
      const { status } = error.response;

      if (
        error.response.data
        && error.response.data.error
        && typeof error.response.data.error.__all__ === 'string' // eslint-disable-line
      ) {
        message.error(error.response.data.error.__all__); // eslint-disable-line
      } else if (/^5\d+$/.test(`${status}`)) {
        // message.error('服务器出错了，请稍后重试！');
      }

      return Promise.reject(error);
    }

    // message.error(`${error.message}`);

    return Promise.reject(error);
  },
);

export default axiosInstance;
