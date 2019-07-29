export const RULE_REQUIRED = {
  required: true,
  message: '不能为空！',
};

export const RULE_POSITIVE_INTEGER = {
  pattern: /^[1-9]\d*$/,
  message: '请输入正整数！',
};

export const RULE_MOBILE_PHONE_NUMBER = {
  pattern: /^1\d{10}$/,
  message: '手机号码不合法！',
};

export const RULE_SMS_CODE = {
  pattern: /^\d{6}$/,
  message: '短信验证码不合法！',
};
