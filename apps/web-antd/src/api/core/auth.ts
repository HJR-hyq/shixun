import { RequestClient } from '@vben/request';
import { useAccessStore } from '@vben/stores';

import { baseRequestClient, requestClient } from '#/api/request';

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

// ==================== 组织管理 ====================

export namespace OrganizationApi {
  export interface Organization {
    id: number;
    name: string;
    parentId: number;
    level: number;
    isLeaf: boolean;
    orderNum: number;
    createTime: string;
    updateTime: string;
    operator: string;
    children?: Organization[];
  }

  export interface AddOrganizationParams {
    name: string;
    parentId: number;
  }

  export interface UpdateOrganizationParams {
    id: number;
    name: string;
  }
}

/**
 * 获取组织树
 */
export async function getOrganizationTreeApi() {
  return requestClient.get<OrganizationApi.Organization[]>('/organization');
}

/**
 * 添加组织
 */
export async function addOrganizationApi(
  data: OrganizationApi.AddOrganizationParams,
) {
  return requestClient.post('/organization/add', data);
}

/**
 * 编辑组织
 */
export async function updateOrganizationApi(
  data: OrganizationApi.UpdateOrganizationParams,
) {
  return requestClient.post('/organization/update', data);
}

/**
 * 删除组织
 */
export async function deleteOrganizationApi(id: number) {
  return requestClient.post('/organization/delete', null, { params: { id } });
}

// ==================== 用户管理（新） ====================

export namespace UserManageApi {
  export interface UserItem {
    id: number;
    staffId: number;
    nickname: string;
    realName: string;
    account: string;
    userName: string;
    gender: string;
    sex: null | string;
    orgId: number;
    orgName: string;
    email: string;
    phone: string;
    phoneNum: null | string;
    createTime: string;
    addtime: string;
    status: string;
    approved: number;
    operator?: string;
  }

  export interface UserListParams {
    orgId?: number;
    nickname?: string;
    status?: string;
    currentPage?: number;
    pageSize?: number;
  }

  export interface UserListResult {
    items: UserItem[];
    total: number;
  }

  export interface AddUserParams {
    nickname: string;
    account: string;
    gender: string;
    orgId: number;
    email?: string;
    phone?: string;
  }

  export interface UpdateUserParams {
    id: number;
    nickname: string;
    gender: string;
    orgId: number;
    email?: string;
    phone?: string;
  }
}

/**
 * 获取用户列表（按组织筛选）
 */
export async function getUserManageListApi(
  params: UserManageApi.UserListParams,
) {
  return externalRequestClient.get<UserManageApi.UserListResult>(
    '/v1/Satff/GetStaffAllByOrganizationstructure',
    { params },
  );
}

/**
 * 添加用户
 */
export async function addUserManageApi(data: UserManageApi.AddUserParams) {
  return externalRequestClient.post('/v1/Satff/AddStaff', data);
}

/**
 * 编辑用户
 */
export async function updateUserManageApi(
  data: UserManageApi.UpdateUserParams,
) {
  return externalRequestClient.post('/v1/Satff/UpdateStaff', data);
}

/**
 * 删除用户
 */
export async function deleteUserManageApi(id: number) {
  return externalRequestClient.post('/v1/Satff/DeleteStaff', null, {
    params: { id },
  });
}

/**
 * 重置用户密码
 */
export async function resetUserPasswordApi(id: number) {
  return externalRequestClient.post('/v1/Satff/ResetPassword', null, {
    params: { id },
  });
}
