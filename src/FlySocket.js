function noop() {}

const closeEventCodesNoRequireReconnect = [1e3, 1001, 1005];

export default function FlySocket(url, opts = {}) {
  const options = {
    timeout: 1e3,
    maxAttempts: Infinity,
    protocols: [],
    onopen: noop,
    onmessage: noop,
    onclose: noop,
    onmaxium: noop,
    ...opts,
  };

  let ws = null;
  const $ = {};

  let count = 0; // 计数器
  let timerForReconnection = null;
  let timerForWaittingConnection = null;

  const waitForConnection = (fn, interval = 1000) => {
    if (ws && ws.readyState === 1) {
      fn();
      clearTimeout(timerForWaittingConnection);
      timerForWaittingConnection = null;
    } else if (ws && ws.readyState === 0) {
      timerForWaittingConnection = setTimeout(() => {
        waitForConnection(fn, interval);
      }, interval);
    }
  };

  $.open = function open() {
    ws = new WebSocket(url, options.protocols);

    ws.onmessage = options.onmessage;

    ws.onopen = function onopen(event) {
      options.onopen(event);
      count = 0;
    };

    ws.onclose = function onclose(event) {
      const { code } = event;
      if (!closeEventCodesNoRequireReconnect.includes(code)) {
        $.reconnect(event);
      }

      options.onclose(event);
    };

    ws.onerror = function onerror(event) {
      if (event && event.code === 'ECONNREFUSED') {
        $.reconnect(event);
      } else {
        options.onerror(event);
      }
    };
  };

  $.reconnect = function reconnect(event) {
    if (timerForReconnection && count + 1 < options.maxAttempts) {
      clearTimeout(timerForReconnection);
      timerForReconnection = setTimeout(() => {
        options.onreconnect(event);
        $.open();
      }, options.timeout);
    } else {
      clearTimeout(timerForReconnection);
      timerForReconnection = null;

      options.onmaxium(event);
    }
  };

  $.json = function json(data) {
    $.send(JSON.stringify(data));
  };

  $.send = function send(data) {
    waitForConnection(() => {
      ws.send(data);
    });
  };

  $.close = function close(code = 1e3, reason) {
    if (timerForReconnection) {
      clearTimeout(timerForReconnection);
      timerForReconnection = null;
    }

    if (ws && typeof ws.close === 'function') {
      ws.close(code, reason);
    }
  };

  $.open(); // init

  return $;
}
