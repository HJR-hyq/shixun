import { MOCK_USER_LIST } from '~/utils/mock-data';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const id = Number(query.id);
  const user = MOCK_USER_LIST.find((item) => item.id === id);
  if (user) {
    // In a real app, this would trigger a password reset email/SMS
    return useResponseSuccess({ message: '密码已重置', account: user.account });
  }
  return useResponseError('用户不存在');
});
