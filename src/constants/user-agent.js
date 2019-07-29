const WECHAT_AGENT_IDENTIFIER = 'mmweb';
const WECHAT_WORK_AGENT_IDENTIFIER = 'wxwork';
const DING_TALK_AGENT_IDENTIFIER = 'dingtalk';
const QQ_AGENT_IDENTIFIER = 'qq/';

export const USERAGENT = window.navigator.userAgent.toLowerCase();

export function isInWeChat() {
  return USERAGENT.includes(WECHAT_AGENT_IDENTIFIER);
}

export function isInWeChartWork() {
  return USERAGENT.includes(WECHAT_WORK_AGENT_IDENTIFIER);
}

export function isInDingTalk() {
  return USERAGENT.includes(DING_TALK_AGENT_IDENTIFIER);
}

export function isInQQ() {
  return USERAGENT.includes(QQ_AGENT_IDENTIFIER);
}

/**
 * 用于跳转打开App提供给app使用的
 * @returns {*}
 */
export function getUAIdentifier() {
  if (isInWeChat()) {
    return 'MMWEB';
  }

  if (isInWeChartWork()) {
    return 'wxwork';
  }

  if (isInQQ()) {
    return 'QQ';
  }

  if (isInDingTalk()) {
    return 'DingTalk';
  }

  return null;
}





