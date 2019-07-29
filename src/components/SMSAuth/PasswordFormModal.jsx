import PropTypes from 'prop-types';
import { formShape } from 'rc-form';
import React from 'react';
import { connect } from 'react-redux';
import {
  Button, Form, Input, message, Modal,
} from 'antd';
import { httpService } from '../../services';
import { selectors } from '../../redux-modules/authentication';
import handleAfterAuthSuccess from '../../utils/handle-after-auth-success';
import { RULE_REQUIRED } from '../../constants/formitem-rules';

const { Item: FormItem } = Form;

class PasswordFormModal extends React.Component {
  static propTypes = {
    form: formShape.isRequired,
    onClose: PropTypes.func.isRequired,
    isVisible: PropTypes.bool.isRequired,
    checkId: PropTypes.string.isRequired,
    serviceUrl: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      isSubmitting: false,
    };
  }

  handleSubmit = (event) => {
    this.setState({
      isSubmitting: true,
    });

    event.preventDefault();
    const { form, checkId, serviceUrl } = this.props;

    form.validateFieldsAndScroll((fieldErrors, fieldValues) => {
      if (fieldErrors) return;

      const { password: passwordFieldValue } = fieldValues;

      httpService
        .post('/cas/2Factor/checkPassword', {
          password: window.btoa(unescape(encodeURIComponent(passwordFieldValue))),
          checkId,
        })
        .then((json) => {
          this.setState({
            isSubmitting: false,
          });

          if (json.ticket && json.token) {
            handleAfterAuthSuccess({
              targetUrl: serviceUrl,
              token: json.token.value_id,
              ticket: json.ticket.value_id,
            });
          }
        })
        .catch((error) => {
          message.error('登录失败！');
          this.setState({
            isSubmitting: false,
          });

          form.setFields({
            password: {
              value: passwordFieldValue,
              errors: [new Error(error)],
            },
          });
        });
    });
  };

  render() {
    const { form, isVisible, onClose } = this.props;
    const { isSubmitting } = this.state;

    return (
      <Modal
        width={500}
        footer={null}
        maskClosable
        destroyOnClose
        title="本次登录还需额外校验密码"
        visible={isVisible}
        onCancel={onClose}
      >
        <Form autoComplete="off" onSubmit={this.handleSubmit}>
          <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 10 }} label="密码">
            {form.getFieldDecorator('password', {
              initialValue: '',
              rules: [RULE_REQUIRED],
            })(<Input.Password placeholder="请输入你的密码" />)}
          </FormItem>
          <FormItem wrapperCol={{ span: 10, offset: 4 }}>
            <Button
              htmlType="submit"
              type="primary"
              style={{ width: '100%' }}
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              登录
            </Button>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

const WrappedPasswordFormModal = Form.create()(PasswordFormModal);

const mapStateToProps = state => ({
  serviceUrl: selectors.getServiceUrl(state),
});

export default connect(
  mapStateToProps,
  null,
)(WrappedPasswordFormModal);
