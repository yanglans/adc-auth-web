import PropTypes from 'prop-types';
import { formShape } from 'rc-form';
import React from 'react';
import { connect } from 'react-redux';
import {
  Row, Col, Form, Input, Icon, Button, message,
} from 'antd';
import { httpService as API } from '../../services';
import { selectors } from '../../redux-modules/authentication';
import handleAfterAuthSuccess from '../../utils/handle-after-auth-success';
import PasswordFormModal from './PasswordFormModal';
import {
  RULE_MOBILE_PHONE_NUMBER,
  RULE_REQUIRED,
  RULE_SMS_CODE,
} from '../../constants/formitem-rules';

const { Item: FormItem } = Form;

class SMSAuth extends React.Component {
  static propTypes = {
    form: formShape.isRequired,
    serviceUrl: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      smsSerialId: null,
      isAllowedFetchCode: true,
      isLoggingIn: false,
      seconds: 60,
      needCheckPassword: false,
    };
  }

  handleClosePasswordFormModal = () => {
    this.setState({
      needCheckPassword: false,
      isLoggingIn: false,
    });
  };

  startTimer = () => {
    const { isAllowedFetchCode } = this.state;
    if (isAllowedFetchCode) {
      this.setState({
        isAllowedFetchCode: false,
      });
    }
    this.timerId = setInterval(this.updateSeconds, 1000);
  };

  updateSeconds = () => {
    const { seconds: prevSeconds } = this.state;
    if (prevSeconds - 1 < 0) {
      this.stopTimer();
    } else {
      this.setState({
        isAllowedFetchCode: false,
        seconds: prevSeconds - 1,
      });
    }
  };

  stopTimer = () => {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
    this.setState({
      isAllowedFetchCode: true,
      seconds: 60,
    });
  };

  handleFetchCode = (event) => {
    event.preventDefault();
    const { form, serviceUrl } = this.props;
    form.validateFieldsAndScroll(['phone'], (fieldError) => {
      if (fieldError) return;
      const phone = form.getFieldValue('phone');

      this.setState({
        isFetchingSMS: true,
      });

      API.post('/cas/v1/login_phone', {
        phone_number: phone,
        service: serviceUrl,
      })
        .then((responseJson) => {
          this.updateSeconds();
          this.startTimer();
          this.setState({
            isFetchingSMS: false,
            isAllowedFetchCode: false,
            smsSerialId: responseJson.code && responseJson.code.serial_id,
          });
          message.success('获取验证码成功，请注意查收手机短信');
        })
        .catch((error) => {
          this.setState({
            isAllowedFetchCode: true,
            isFetchingSMS: false,
          });

          let errorMessage = '获取验证码出错';

          if (typeof error === 'string') {
            errorMessage = error;
          } else if (error && typeof error.message === 'string') {
            errorMessage = error.message;
          }

          form.setFields({
            phone: {
              value: phone,
              errors: [new Error(errorMessage)],
            },
          });
        });
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const { form, serviceUrl } = this.props;
    form.validateFields((fieldError, fieldValues) => {
      const { smsSerialId } = this.state;
      if (fieldError) return;
      if (!smsSerialId) {
        message.error('请先点击获取验证码！');
        return;
      }

      const { code } = fieldValues;

      this.setState({
        isLoggingIn: true,
      });

      API.post(`/cas/code/${fieldValues.phone}`, {
        serial_id: smsSerialId,
        code,
      })
        .then((responseJson) => {
          /**
           * 额外需要密码验证
           */
          if (responseJson.checkId) {
            this.setState({
              needCheckPassword: true,
              checkId: responseJson.checkId,
            });
          } else if (responseJson.ticket && responseJson.token) {
            const ticket = responseJson.ticket.value_id;
            const token = responseJson.token.value_id;

            handleAfterAuthSuccess({
              targetUrl: serviceUrl,
              token,
              ticket,
            });
          }
        })
        .catch((error) => {
          let errorMessage = '登录失败';

          if (typeof error === 'string') {
            errorMessage = error;
          } else if (error && typeof error.message === 'string') {
            errorMessage = error.message;
          }

          form.setFields({
            code: {
              value: code,
              errors: [new Error(errorMessage)],
            },
          });

          this.setState({
            isLoggingIn: false,
          });
        });
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;

    const {
      isFetchingSMS,
      isAllowedFetchCode,
      seconds,
      isLoggingIn,
      needCheckPassword,
      checkId,
    } = this.state;

    return (
      <>
        <Form autoComplete="off" onSubmit={this.handleSubmit} style={{ maxWidth: 300 }}>
          <FormItem>
            {getFieldDecorator('phone', {
              rules: [RULE_REQUIRED, RULE_MOBILE_PHONE_NUMBER],
            })(
              <Input
                type="number"
                placeholder="手机号"
                minLength={11}
                maxLength={11}
                prefix={<Icon type="mobile" />}
              />,
            )}
          </FormItem>
          <FormItem>
            <Row type="flex" justify="space-between">
              <Col span={12}>
                {getFieldDecorator('code', {
                  rules: [RULE_REQUIRED, RULE_SMS_CODE],
                })(
                  <Input
                    type="number"
                    placeholder="验证码"
                    maxLength={6}
                    minLength={6}
                    prefix={<Icon type="mail" />}
                  />,
                )}
              </Col>
              <Col offset={1}>
                <Button
                  disabled={!isAllowedFetchCode}
                  loading={isFetchingSMS}
                  onClick={this.handleFetchCode}
                >
                  {isAllowedFetchCode ? '获取验证码' : `${seconds}s`}
                </Button>
              </Col>
            </Row>
          </FormItem>
          <FormItem>
            <Button
              type="primary"
              htmlType="submit"
              disabled={isLoggingIn}
              loading={isLoggingIn}
              style={{ width: '100%' }}
            >
              {needCheckPassword ? '还需验证密码' : '登录'}
            </Button>
          </FormItem>
        </Form>
        {needCheckPassword && (
          <PasswordFormModal
            checkId={checkId}
            isVisible={needCheckPassword}
            onClose={this.handleClosePasswordFormModal}
          />
        )}
      </>
    );
  }
}

const WrappedSMSAuth = Form.create()(SMSAuth);

const mapStateToProps = state => ({
  serviceUrl: selectors.getServiceUrl(state),
});

export default connect(
  mapStateToProps,
  null,
)(WrappedSMSAuth);
