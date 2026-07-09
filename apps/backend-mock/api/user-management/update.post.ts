import { MOCK_USER_LIST } from '~/utils/mock-data';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const user = MOCK_USER_LIST.find((item) => item.id === body.id);
  if (user) {
    user.nickname = body.nickname;
    user.gender = body.gender;
    user.orgId = body.orgId;
    user.orgName = body.orgName || user.orgName;
    user.email = body.email || user.email;
    user.phone = body.phone || user.phone;
  }
  return useResponseSuccess(user);
});
