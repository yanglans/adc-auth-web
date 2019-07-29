export const REGEX_NONEMPTY = {
  pattern: /^\s*\S+.*$/,
  message: '输入不能为空！',
};

export const REGEX_PHONE = {
  pattern: /^1\d{10}$/,
  message: '手机号码不合法！',
};

export const REGEX_SMSCODE = {
  pattern: /^\d{6}$/,
  message: '短信验证码不合法！',
};
