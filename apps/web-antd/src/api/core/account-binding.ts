import { externalRequestClient } from '#/api/core/auth';

export namespace AccountBindingApi {
  /** 发送绑定验证码 */
  export interface SendCodeParams {
    account: string;
    purpose: string;
    type: 'email' | 'phone';
  }

  /** 验证密码 */
  export interface VerifyPwdParams {
    password: string;
  }

  /** 首次绑定 */
  export interface BindParams {
    account: string;
    code: string;
    type: 'email' | 'phone';
  }

  /** 换绑 */
  export interface RebindParams {
    account: string;
    code: string;
    type: 'email' | 'phone';
    verifyToken: string;
  }

  /** 解绑 */
  export interface UnbindParams {
    type: 'email' | 'phone';
    verifyToken: string;
  }
}

/**
 * 发送绑定验证码
 */
export async function sendBindCodeApi(data: AccountBindingApi.SendCodeParams) {
  return externalRequestClient.post('/v1/account-binding/send-code', data);
}

/**
 * 验证登录密码，获取一次性身份Token
 */
export async function verifyPasswordApi(
  data: AccountBindingApi.VerifyPwdParams,
) {
  return externalRequestClient.post<string>(
    '/v1/account-binding/verify-password',
    data,
  );
}

/**
 * 首次绑定手机/邮箱
 */
export async function bindAccountApi(data: AccountBindingApi.BindParams) {
  return externalRequestClient.post('/v1/account-binding/bind', data);
}

/**
 * 换绑手机/邮箱
 */
export async function rebindAccountApi(data: AccountBindingApi.RebindParams) {
  return externalRequestClient.post('/v1/account-binding/rebind', data);
}

/**
 * 解绑手机/邮箱
 */
export async function unbindAccountApi(data: AccountBindingApi.UnbindParams) {
  return externalRequestClient.post('/v1/account-binding/unbind', data);
}
