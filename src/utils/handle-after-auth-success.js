import 'url-polyfill';
import Cookies from 'js-cookie';

export default function handleAfterAuthSuccess({
  targetUrl,
  hashValue = null,
  token = null,
  ticket = null,
  username = null,
  userId = null,
}) {
  if (ticket) {
    Cookies.set('ticket', ticket, { expires: 300 });
  }

  const url = new URL(decodeURIComponent(targetUrl));

  if (hashValue) {
    url.hash = hashValue;
  }

  const { searchParams } = url;

  if (token) {
    searchParams.append('ztptoken', token);
  }
  //if (userId) {
  //  searchParams.append('adc_code', userId);
  //}

  url.search = `?${searchParams.toString()}`;

  window.location.replace(url.href);
}
