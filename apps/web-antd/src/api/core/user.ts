import type { UserInfo } from '@vben/types';

import { externalRequestClient } from '#/api/core/auth';

interface StaffInfo {
  sId: number;
  userId: string;
  realName: string;
  phoneNum: string;
  email: string;
  userName: string;
  avatar: string;
  roles: number[];
  orgs: { id: number; name: string }[];
}

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  const staff = await externalRequestClient.get<StaffInfo>('/v1/auth/userinfo');
  const userInfo: UserInfo = {
    avatar: staff?.avatar || '',
    realName: staff?.realName || staff?.userName || '',
    userId: staff?.userId || String(staff?.sId || ''),
    username: staff?.userName || '',
    roles: (staff?.roles || []).map(String),
    email: staff?.email || '',
    phoneNum: staff?.phoneNum || '',
    desc: '',
    homePath: '/',
    token: '',
  };
  return userInfo;
}
