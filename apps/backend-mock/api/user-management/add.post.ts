import { MOCK_USER_LIST } from '~/utils/mock-data';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const newUser = {
    id: MOCK_USER_LIST.length + 1,
    nickname: body.nickname,
    account: body.account,
    gender: body.gender || '保密',
    orgId: body.orgId,
    orgName: body.orgName || '',
    email: body.email || '',
    phone: body.phone || '',
    createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    status: '同意',
  };
  MOCK_USER_LIST.push(newUser);
  return useResponseSuccess(newUser);
});
