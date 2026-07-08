import { RequestClient } from '@vben/request';
import { useAccessStore } from '@vben/stores';

import { baseRequestClient } from '#/api/request';

export const externalRequestClient = new RequestClient({
  baseURL: '',
});

// 添加请求拦截器，注入token
externalRequestClient.addRequestInterceptor({
  fulfilled: async (config) => {
    const accessStore = useAccessStore();
    const token = accessStore.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
});

// 添加响应拦截器，提取data字段
externalRequestClient.addResponseInterceptor({
  fulfilled: (response) => {
    const { data: responseData, status } = response;
    const { code, data } = responseData;
    if (status >= 200 && status < 400 && code === 0) {
      return data;
    }
    throw Object.assign({}, response, { response });
  },
});

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    username?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    accessToken: string;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }

  /** 注册接口参数 */
  export interface RegisterParams {
    account: string;
    code: string;
    password: string;
    username: string;
    organizationId?: number[][];
  }

  /** 组织架构 */
  export interface Organization {
    id: number;
    code: string;
    name: string;
    level: number;
    parentId: number;
    isLeaf: boolean;
  }

  /** 地区信息 */
  export interface CompanyRegional {
    id: number;
    name: string;
  }

  /** 用户信息 */
  export interface StaffUser {
    sId: number;
    userId: string;
    realName: string;
    phoneNum: string;
    email: string;
    userName: string;
    approved: number;
    orgId: number[][];
    companyName: string;
    companyRegion: string;
    avatar: string;
    addTime: string;
  }

  /** 用户列表查询参数 */
  export interface StaffListParams {
    currentPage?: number;
    pageSize?: number;
    OrgId?: number;
    UserName?: string;
    Approved?: number;
    IsPage?: boolean;
  }

  /** 用户列表响应 */
  export interface StaffListResult {
    items: StaffUser[];
    total: number;
  }
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  const token = await externalRequestClient.post<string>(
    '/v1/auth/login',
    data,
  );
  return { accessToken: token };
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>('/auth/refresh', {
    withCredentials: true,
  });
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return baseRequestClient.post('/auth/logout', {
    withCredentials: true,
  });
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  const result = await externalRequestClient.post<{ resourceCodes: string[] }>(
    '/v1/auth/codes',
  );
  return result?.resourceCodes ?? [];
}

/**
 * 发送邮箱验证码
 */
export async function sendEmailCodeApi(email: string) {
  return externalRequestClient.get('/v1/Satff/Emailcode', {
    params: { email },
  });
}

/**
 * 校验邮箱验证码
 */
export async function checkEmailCodeApi(
  email: string,
  code: string,
  password?: string,
) {
  return externalRequestClient.get('/v1/Satff/CheckEmailCode', {
    params: { email, code, password },
  });
}

/**
 * 用户注册
 */
export async function registerApi(data: AuthApi.RegisterParams) {
  return externalRequestClient.post('/v1/Satff/Register', data);
}

/**
 * 获取所有组织架构
 */
export async function getOrganizationsApi() {
  return externalRequestClient.get<AuthApi.Organization[]>(
    '/v1/Organizationstructure/GetAllOrganizationstructure',
    { params: { isGetToken: false } },
  );
}

/**
 * 获取地区列表
 */
export async function getCompanyRegionalsApi(id?: number) {
  return externalRequestClient.get<AuthApi.CompanyRegional[]>(
    '/v1/company-regional',
    {
      params: { id: id || 0 },
    },
  );
}

/**
 * 获取用户列表
 */
export async function getStaffListApi(params: AuthApi.StaffListParams) {
  return externalRequestClient.get<AuthApi.StaffListResult>(
    '/v1/Satff/GetStaffAllByOrganizationstructure',
    { params },
  );
}

/**
 * 更新用户审核状态
 */
export async function updateStaffApi(data: Partial<AuthApi.StaffUser>) {
  return externalRequestClient.post('/v1/Satff/UpdateStaff', data);
}

/**
 * 启用/禁用用户
 */
export async function setDisableUserApi(sid: number) {
  return externalRequestClient.post('/v1/Satff/SetDisable', null, {
    params: { sid },
  });
}

/**
 * 修改密码
 */
export async function changePwdApi(data: {
  confirmNewPassword: string;
  newPassword: string;
  oldPassword: string;
}) {
  return externalRequestClient.post('/v1/Satff/ChangePwd', data);
}

/**
 * 重置密码（触发邮件/短信验证码）
 */
export async function resetPwdApi(data: {
  account: string;
  type: 'email' | 'phone';
}) {
  return externalRequestClient.post('/v1/Satff/ResetPwd', data);
}

/**
 * 发送短信验证码
 */
export async function sendPhoneCodeApi(phoneNumber: string) {
  return externalRequestClient.get(
    '/v1/VerificationCode/send-verification-code',
    { params: { phoneNumber } },
  );
}

/**
 * 手机验证码校验
 */
export async function phoneVerifyApi(data: {
  code: string;
  phoneNumber: string;
}) {
  return externalRequestClient.post('/v1/VerificationCode/verify', data);
}
